package main

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// A canned Last.fm album.search body exercising every filter branch:
//   - "Kind of Blue"  -> usable (kept)
//   - "No Cover"       -> has mbid but blank medium cover -> dropped
//   - "No Mbid"        -> has cover but empty mbid        -> dropped
//   - "Few Images"     -> fewer than 3 image sizes        -> dropped
//   - "Don't Stop"     -> usable; single quote stripped from name
const cannedBody = `{
  "results": {
    "albummatches": {
      "album": [
        {
          "name": "Kind of Blue",
          "artist": "Miles Davis",
          "mbid": "mbid-1",
          "image": [
            {"#text": "small.jpg", "size": "small"},
            {"#text": "medium.jpg", "size": "medium"},
            {"#text": "large.jpg", "size": "large"}
          ]
        },
        {
          "name": "No Cover",
          "artist": "Nobody",
          "mbid": "mbid-2",
          "image": [
            {"#text": "small.jpg", "size": "small"},
            {"#text": "medium.jpg", "size": "medium"},
            {"#text": "", "size": "large"}
          ]
        },
        {
          "name": "No Mbid",
          "artist": "Anonymous",
          "mbid": "",
          "image": [
            {"#text": "small.jpg", "size": "small"},
            {"#text": "medium.jpg", "size": "medium"},
            {"#text": "large.jpg", "size": "large"}
          ]
        },
        {
          "name": "Few Images",
          "artist": "Sparse",
          "mbid": "mbid-4",
          "image": [
            {"#text": "small.jpg", "size": "small"}
          ]
        },
        {
          "name": "Don't Stop",
          "artist": "O'Jays",
          "mbid": "mbid-5",
          "image": [
            {"#text": "small.jpg", "size": "small"},
            {"#text": "medium.jpg", "size": "medium"},
            {"#text": "large5.jpg", "size": "large"}
          ]
        }
      ]
    }
  }
}`

func newUpstream(t *testing.T, body string, status int) *httptest.Server {
	t.Helper()
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if got := r.URL.Query().Get("album"); got == "" {
			t.Errorf("expected album query param, got empty")
		}
		w.WriteHeader(status)
		if _, err := w.Write([]byte(body)); err != nil {
			t.Fatalf("write upstream body: %v", err)
		}
	}))
	t.Cleanup(srv.Close)
	return srv
}

func TestSearchNormalizesAndFilters(t *testing.T) {
	upstream := newUpstream(t, cannedBody, http.StatusOK)
	client := NewClient("test-key", upstream.URL)

	albums, err := client.Search(context.Background(), "blue")
	if err != nil {
		t.Fatalf("Search returned error: %v", err)
	}

	if len(albums) != 2 {
		t.Fatalf("expected 2 usable albums, got %d: %+v", len(albums), albums)
	}

	first := albums[0]
	if first.ID != "mbid-1" || first.Name != "Kind of Blue" || first.Artist != "Miles Davis" {
		t.Errorf("unexpected first album: %+v", first)
	}
	if first.Image != "large.jpg" {
		t.Errorf("expected the image[2] cover, got %q", first.Image)
	}

	second := albums[1]
	if second.Name != "Dont Stop" {
		t.Errorf("expected single quote stripped from name, got %q", second.Name)
	}
	if second.Artist != "OJays" {
		t.Errorf("expected single quote stripped from artist, got %q", second.Artist)
	}
}

func TestNormalizeDedupesByMBID(t *testing.T) {
	// Last.fm can return several matches sharing one mbid (e.g. "pink floyd").
	img := []lastFmImage{
		{Text: "s.jpg", Size: "small"},
		{Text: "m.jpg", Size: "medium"},
		{Text: "l.jpg", Size: "large"},
	}
	matches := []lastFmMatch{
		{Name: "First", Artist: "A", MBID: "dup", Image: img},
		{Name: "Second", Artist: "B", MBID: "dup", Image: img},
	}

	albums := normalize(matches)
	if len(albums) != 1 {
		t.Fatalf("expected 1 album after dedupe, got %d: %+v", len(albums), albums)
	}
	if albums[0].Name != "First" {
		t.Errorf("expected the first match kept, got %q", albums[0].Name)
	}
}

func TestSearchEmptyMatches(t *testing.T) {
	body := `{"results":{"albummatches":{"album":[]}}}`
	client := NewClient("test-key", newUpstream(t, body, http.StatusOK).URL)

	albums, err := client.Search(context.Background(), "zzz")
	if err != nil {
		t.Fatalf("Search returned error: %v", err)
	}
	if len(albums) != 0 {
		t.Fatalf("expected empty result, got %+v", albums)
	}
}

func TestSearchUpstreamError(t *testing.T) {
	client := NewClient("test-key", newUpstream(t, "boom", http.StatusInternalServerError).URL)

	if _, err := client.Search(context.Background(), "blue"); err == nil {
		t.Fatal("expected error on upstream 500, got nil")
	}
}

func newTestServer(t *testing.T, client *Client) *Server {
	t.Helper()
	srv, err := NewServer(client)
	if err != nil {
		t.Fatalf("NewServer: %v", err)
	}
	return srv
}

func TestSearchHandlerReturnsJSON(t *testing.T) {
	upstream := newUpstream(t, cannedBody, http.StatusOK)
	srv := newTestServer(t, NewClient("test-key", upstream.URL))

	req := httptest.NewRequest(http.MethodGet, "/api/search?q=blue", nil)
	rec := httptest.NewRecorder()
	srv.Routes().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
	if ct := rec.Header().Get("Content-Type"); ct != "application/json; charset=utf-8" {
		t.Errorf("unexpected content type: %q", ct)
	}

	var albums []Album
	if err := json.Unmarshal(rec.Body.Bytes(), &albums); err != nil {
		t.Fatalf("decode handler JSON: %v", err)
	}
	if len(albums) != 2 {
		t.Fatalf("expected 2 albums in JSON, got %d: %+v", len(albums), albums)
	}
	if albums[0].ID != "mbid-1" || albums[1].Name != "Dont Stop" {
		t.Errorf("unexpected handler payload: %+v", albums)
	}
}

func TestSearchHandlerEmptyTerm(t *testing.T) {
	srv := newTestServer(t, NewClient("test-key", "http://unused.invalid"))

	req := httptest.NewRequest(http.MethodGet, "/api/search?q=", nil)
	rec := httptest.NewRecorder()
	srv.Routes().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for empty term, got %d", rec.Code)
	}

	var albums []Album
	if err := json.Unmarshal(rec.Body.Bytes(), &albums); err != nil {
		t.Fatalf("decode empty-term JSON: %v", err)
	}
	if len(albums) != 0 {
		t.Errorf("expected empty array for empty term, got %+v", albums)
	}
}

func TestSearchHandlerUpstreamFailureIs502(t *testing.T) {
	upstream := newUpstream(t, "boom", http.StatusInternalServerError)
	srv := newTestServer(t, NewClient("test-key", upstream.URL))

	req := httptest.NewRequest(http.MethodGet, "/api/search?q=blue", nil)
	rec := httptest.NewRecorder()
	srv.Routes().ServeHTTP(rec, req)

	if rec.Code != http.StatusBadGateway {
		t.Fatalf("expected 502 on upstream failure, got %d", rec.Code)
	}
}

func TestIndexServesShell(t *testing.T) {
	srv := newTestServer(t, NewClient("test-key", "http://unused.invalid"))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()
	srv.Routes().ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 for index, got %d", rec.Code)
	}
	body := rec.Body.String()
	for _, want := range []string{`id="mainContainer"`, `id="searchResults"`, `/static/app.js`} {
		if !strings.Contains(body, want) {
			t.Errorf("index shell missing %q", want)
		}
	}
}

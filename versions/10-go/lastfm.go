package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const defaultAPIRoot = "https://ws.audioscrobbler.com/2.0/"

// Album is the normalized shape sent to the browser. It mirrors what the SPA
// versions produce client-side: a stable id, single-quote-stripped name/artist,
// and the medium (image[2]) cover URL.
type Album struct {
	ID     string `json:"id"`
	Name   string `json:"name"`
	Artist string `json:"artist"`
	Image  string `json:"image"`
}

// The decode structs below capture only the Last.fm fields this app uses.
type lastFmImage struct {
	Text string `json:"#text"`
	Size string `json:"size"`
}

type lastFmMatch struct {
	Name   string        `json:"name"`
	Artist string        `json:"artist"`
	MBID   string        `json:"mbid"`
	Image  []lastFmImage `json:"image"`
}

type lastFmResponse struct {
	Results struct {
		AlbumMatches struct {
			Album []lastFmMatch `json:"album"`
		} `json:"albummatches"`
	} `json:"results"`
}

// Client proxies Last.fm's album.search endpoint. The API key it holds is
// server-side only and never reaches the browser.
type Client struct {
	apiKey  string
	apiRoot string
	http    *http.Client
}

// NewClient wires a Client with a 10s request timeout. An empty apiRoot falls
// back to the real Last.fm endpoint; tests pass an httptest URL instead.
func NewClient(apiKey, apiRoot string) *Client {
	if apiRoot == "" {
		apiRoot = defaultAPIRoot
	}
	return &Client{
		apiKey:  apiKey,
		apiRoot: apiRoot,
		http:    &http.Client{Timeout: 10 * time.Second},
	}
}

// Search proxies album.search, decodes the response, then normalizes + filters
// it. The context lets the caller bound the outbound request.
func (c *Client) Search(ctx context.Context, term string) ([]Album, error) {
	q := url.Values{
		"method":  {"album.search"},
		"album":   {term},
		"api_key": {c.apiKey},
		"format":  {"json"},
		"limit":   {"20"},
	}
	reqURL := c.apiRoot + "?" + q.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("last.fm request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("last.fm returned status %d", resp.StatusCode)
	}

	var decoded lastFmResponse
	if err := json.NewDecoder(resp.Body).Decode(&decoded); err != nil {
		return nil, fmt.Errorf("decode last.fm response: %w", err)
	}

	return normalize(decoded.Results.AlbumMatches.Album), nil
}

// normalize keeps only usable matches and reduces them to the client shape.
func normalize(matches []lastFmMatch) []Album {
	albums := make([]Album, 0, len(matches))
	// Last.fm can return several matches sharing one mbid (e.g. "pink floyd");
	// dedupe by id (keep first, preserving order) so client render keys stay unique.
	seen := make(map[string]bool)
	for _, m := range matches {
		if !isUsable(m) {
			continue
		}
		if seen[m.MBID] {
			continue
		}
		seen[m.MBID] = true
		albums = append(albums, Album{
			ID:     m.MBID,
			Name:   stripQuotes(m.Name),
			Artist: stripQuotes(m.Artist),
			Image:  m.Image[2].Text,
		})
	}
	return albums
}

// isUsable reports whether a match has a stable id (mbid) and a medium-sized
// cover (image[2]['#text']) — the same gate the SPA versions apply.
func isUsable(m lastFmMatch) bool {
	return m.MBID != "" && len(m.Image) > 2 && m.Image[2].Text != ""
}

func stripQuotes(s string) string {
	return strings.ReplaceAll(s, "'", "")
}

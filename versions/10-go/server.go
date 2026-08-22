package main

import (
	"context"
	"embed"
	"encoding/json"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"strings"
	"time"
)

//go:embed templates/index.html
var templateFS embed.FS

//go:embed static
var staticFS embed.FS

// Server holds the wired dependencies for the HTTP handlers: the Last.fm proxy
// client and the parsed index template. Static assets are served straight from
// the embedded FS.
type Server struct {
	client *Client
	index  *template.Template
}

// NewServer parses the embedded template and returns a ready Server.
func NewServer(client *Client) (*Server, error) {
	index, err := template.ParseFS(templateFS, "templates/index.html")
	if err != nil {
		return nil, err
	}
	return &Server{client: client, index: index}, nil
}

// Routes builds the mux using Go 1.22 method+path patterns. "/{$}" matches only
// the exact root so it never shadows the static or api handlers.
func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /{$}", s.handleIndex)
	mux.HandleFunc("GET /api/search", s.handleSearch)

	staticSub, err := fs.Sub(staticFS, "static")
	if err != nil {
		// Unreachable in practice: the path is a compile-time embed constant.
		log.Fatalf("mount static FS: %v", err)
	}
	mux.Handle("GET /static/", http.StripPrefix("/static/", http.FileServerFS(staticSub)))

	return mux
}

// handleIndex renders the DOM shell (mirroring the vanilla version's markup).
func (s *Server) handleIndex(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := s.index.Execute(w, nil); err != nil {
		http.Error(w, "template error", http.StatusInternalServerError)
	}
}

// handleSearch proxies Last.fm and returns already-normalized JSON. An empty
// term yields an empty list (the SPA versions don't search on empty input);
// an upstream failure surfaces as 502.
func (s *Server) handleSearch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	term := strings.TrimSpace(r.URL.Query().Get("q"))
	if term == "" {
		writeJSON(w, http.StatusOK, []Album{})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	albums, err := s.client.Search(ctx, term)
	if err != nil {
		log.Printf("search %q failed: %v", term, err)
		writeJSON(w, http.StatusBadGateway, map[string]string{
			"error": "Upstream Last.fm request failed",
		})
		return
	}

	writeJSON(w, http.StatusOK, albums)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("encode response: %v", err)
	}
}

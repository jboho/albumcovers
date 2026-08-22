package main

import (
	"bufio"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	// Best-effort load of a local .env so `go run .` works after copying
	// .env.example; real environment variables always win.
	loadDotEnv(".env")

	apiKey := os.Getenv("LASTFM_API_KEY")
	if apiKey == "" {
		log.Fatal("LASTFM_API_KEY is not set. Copy .env.example to .env and add a key, " +
			"or run: LASTFM_API_KEY=... go run .")
	}

	client := NewClient(apiKey, os.Getenv("LASTFM_API_ROOT"))
	srv, err := NewServer(client)
	if err != nil {
		log.Fatalf("init server: %v", err)
	}

	addr := ":8080"
	if p := os.Getenv("PORT"); p != "" {
		addr = ":" + p
	}

	log.Printf("albumcovers listening on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, srv.Routes()); err != nil {
		log.Fatal(err)
	}
}

// loadDotEnv parses KEY=VALUE lines from path and sets any variable not already
// present in the environment. A missing file is not an error — the key may be
// provided another way. This keeps the app stdlib-only (no dotenv dependency).
func loadDotEnv(path string) {
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, found := strings.Cut(line, "=")
		if !found {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if _, exists := os.LookupEnv(key); !exists {
			os.Setenv(key, value)
		}
	}
}

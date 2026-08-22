# 10 — Go (stdlib backend)

The same album-search app, but full-stack: a Go standard-library HTTP server
proxies Last.fm, and the browser gets an already-normalized JSON feed. This is
the first version where the **Last.fm API key never reaches the client** — it
lives server-side and is read from the environment.

## Stack

| Concern | This version |
|---------|--------------|
| Language / runtime | Go 1.22+ (built and tested on 1.26), standard library only |
| HTTP router | `net/http` `http.ServeMux` with Go 1.22 method+path patterns (`GET /api/search`, `GET /{$}`) |
| HTML shell | `html/template` (`ParseFS` over an embedded template) |
| Static assets | `//go:embed` + `http.FileServerFS` — CSS/JS shipped inside the binary |
| Upstream call | `http.Client{Timeout: 10s}` + `http.NewRequestWithContext` (per-request `context.WithTimeout`) |
| JSON | `encoding/json` (decode Last.fm structs, encode a clean `Album` slice) |
| Tests | `go test` + `net/http/httptest` (canned upstream server) |
| Client behavior | plain vanilla JS (`static/app.js`) adapted from version 01 to call the local API |

No third-party dependencies — `go.mod` has zero `require` lines.

## Idioms showcased

- **Small, focused structs.** Private `lastFm*` decode structs capture only the
  fields consumed; a single exported `Album` struct is the client-facing shape.
- **Explicit error handling with wrapping** (`fmt.Errorf("...: %w", err)`) at
  each fallible step (build request, do request, non-200, decode).
- **Context propagation.** The handler derives a 10s `context.WithTimeout` from
  the request context and threads it into the outbound Last.fm call, so a slow
  upstream (or a disconnected client) cancels the proxy request.
- **A constructor that wires the mux** (`NewServer` → `Routes()`), keeping
  handlers as methods on a struct that holds their dependencies.
- **Single static binary.** `//go:embed templates/index.html` and
  `//go:embed static` bake the shell, stylesheet, and client JS into the
  compiled binary — `go build` produces one file you can copy and run anywhere,
  no asset directory required.

## The security contrast

Versions 01–09's SPAs put the API key in client-reachable config (`config.js`,
`VITE_LASTFM_API_KEY`, etc.) — it ships to the browser by design. Here the flow
inverts:

```
browser ──GET /api/search?q=term──▶ Go server ──album.search + api_key──▶ Last.fm
        ◀──── normalized JSON ─────            ◀──── raw JSON ────────────
```

The key is read once at startup via `os.Getenv("LASTFM_API_KEY")`, held on the
server-side `Client`, and injected into the outbound query only. The browser
sees `/api/search` and normalized `[]Album` — never the key. (Verified: grepping
the served HTML and JS for the key returns zero hits.)

## Setup

Requires **Go 1.22+**.

```
cp .env.example .env      # then edit .env and set a real LASTFM_API_KEY
go run .                  # http://localhost:8080  (reads .env automatically)
```

`.env` is gitignored (root `**/.env` plus a local `.gitignore`). If you'd rather
not use a file, pass the key inline:

```
LASTFM_API_KEY=your_key_here go run .
```

Get a key at https://www.last.fm/api/account/create.

### Build the single binary

```
go build -o albumcovers .     # one self-contained file (templates + assets embedded)
LASTFM_API_KEY=your_key ./albumcovers
```

### Test

```
go build ./...
go test ./...
go test -v ./...              # per-test detail
```

Tests stand up an `httptest.Server` returning a canned Last.fm body, point the
`Client` at it, and assert the normalize/filter rules (drops items missing an
`mbid` or a medium cover, drops items with fewer than three image sizes, strips
single quotes from name/artist) plus the `/api/search` handler's JSON output,
empty-term behavior, 502-on-upstream-failure, and the index shell.

## Configuration

| Variable | Default | Purpose |
|----------|---------|---------|
| `LASTFM_API_KEY` | *(required)* | Server-side Last.fm key. Startup fails fast if unset. |
| `LASTFM_API_ROOT` | `https://ws.audioscrobbler.com/2.0/` | Override the upstream (tests inject an httptest URL here). |
| `PORT` | `8080` | Listen port. |

## Endpoints

- `GET /` — renders the DOM shell via `html/template` (mirrors version 01's markup).
- `GET /api/search?q=<term>` — proxies Last.fm and returns `[]Album` as JSON.
  Empty/blank term → `[]` with 200; upstream failure → 502 with a small JSON error body.
- `GET /static/*` — CSS and client JS served from the embedded FS.

## Assigned port

**8080** (override with `PORT`).

## Client behavior

`static/app.js` is adapted from version 01's `album-searcher.js`. The only
functional change is the data source: it fetches the local `/api/search`
(already-normalized JSON) instead of calling Last.fm directly with an API key.
Everything else matches the other versions — search on Enter or the Go! button,
loading + error states, the "No results were found. Please try another search"
message, click-to-reveal card overlays, add/remove, dedupe by id, the counter
bar (`counter-active`), the full-screen list drawer (`list-active` + body
`no-scroll` + scroll-to-top, auto-collapsing when the list empties), and
persistence under `localStorage` key `albumList`.

## Deviations

- **`add`/disable at 10.** Follows version 05's behavior: once the list holds 10
  albums the Add button renders `disabled` with the label "List Full", rather
  than version 01's post-click `alert()`.
- **localStorage payload.** Stores the list as an array of album objects (the
  normalized shape), not version 01's array of JSON strings. The key
  (`albumList`) is the same; each version is self-contained, so cross-version
  storage interop is not a goal.
- **Result-click handling** uses event delegation with `closest()` (like the
  React versions) instead of version 01's `pointer-events` toggling — more
  robust regardless of which element within a card receives the click.
- **`.env` loading** is a tiny stdlib helper (`loadDotEnv`, ~15 lines) rather
  than a dotenv dependency, keeping the module import-free. Real environment
  variables always take precedence over `.env` values.

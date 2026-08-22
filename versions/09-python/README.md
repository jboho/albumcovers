# 09 — Python (FastAPI backend)

The same "Top 10 Favorite Album List Builder", but full-stack. Instead of a SPA
calling Last.fm from the browser, a **FastAPI** backend proxies the Last.fm
call server-side, normalizes/filters the results, and serves a thin client that
talks only to this app's own `/api/search`.

## Stack

| Concern | This version |
|---------|--------------|
| Language / runtime | Python 3.11+ |
| Web framework | FastAPI (`APIRouter`, `Depends`, `response_model`) |
| ASGI server | uvicorn |
| Upstream HTTP | httpx `AsyncClient` (async, shared, 10s timeout) |
| Templating | Jinja2 (`index.html` shell mirrors v01) |
| Config | pydantic-settings `BaseSettings` (`LASTFM_API_KEY` from env/.env) |
| Models | Pydantic `Album` model |
| Tests | pytest + pytest-asyncio + respx (upstream mocked) |
| Client | vanilla JS adapted from v01, list/counter/drawer/localStorage intact |

## Idioms showcased

- **Lifespan-managed shared client** — one `httpx.AsyncClient` created in the
  `lifespan` handler and closed on shutdown; every request reuses its connection
  pool via a `Depends(get_http_client)` dependency reading `app.state`.
- **`response_model=list[Album]`** — FastAPI validates/serializes the normalized
  output; the `Album` Pydantic model is the single source of the client shape.
- **`Depends(get_settings)`** — cached `Settings` injected into the route; the key
  is read once from the environment.
- **Async throughout** — `async def` endpoint, `await client.get(...)`.
- **Router + package layout** — `app/api.py` (router), `app/models.py`,
  `app/settings.py`, `app/main.py` (app + lifespan + static mount).

## Security contrast (the whole point of this version)

The SPA versions (01, 02, 04, 05, 07) call
`https://ws.audioscrobbler.com/2.0/?...&api_key=<KEY>` **directly from the
browser**, so the API key ships to every client (v01 via `config.js`, v05 via a
`VITE_`-prefixed build-time var). Anyone can read it in DevTools.

Here the key lives **server-side only**:

- `LASTFM_API_KEY` is read via pydantic-settings from the environment / a
  gitignored `.env` — never bundled, never templated into HTML.
- The browser calls `GET /api/search?q=<term>`; the FastAPI handler injects the
  key when it calls Last.fm and returns already-normalized JSON.
- `static/app.js` contains no key, no Last.fm URL. The served shell has no
  `api_key` anywhere (asserted in `tests/test_api.py::test_index_serves_shell`).

## Architecture

- `GET /` — Jinja2-rendered DOM shell (same ids/classes as v01, so it looks
  identical), loads `/static/styles.css` (copied verbatim from v01) and
  `/static/app.js`.
- `GET /api/search?q=<term>` — async proxy to Last.fm's `album.search`.
  Keeps only items with an `mbid` **and** a medium cover (`image[2]['#text']`);
  normalizes to `{id, name, artist, image}` with single quotes stripped from
  name/artist. Empty term → `[]`; upstream error → `502`.
- `static/` — served via `StaticFiles` mount at `/static`.

Normalize/filter matches the reference exactly (see
`versions/05-react-modern/src/lib/lastfm.ts`): the medium cover is `image[2]`,
and `name`/`artist` have `'` stripped.

## Setup / run / test

Assigned port: **8000**.

```bash
cd versions/09-python
python3 -m venv .venv
.venv/bin/pip install -e ".[test]"

cp .env.example .env          # then put a real key in LASTFM_API_KEY
# get a key at https://www.last.fm/api/account/create

# run
.venv/bin/uvicorn app.main:app --port 8000 --reload
# open http://127.0.0.1:8000

# test (upstream Last.fm mocked with respx — no network, no key needed)
.venv/bin/python -m pytest -v
```

`LASTFM_API_KEY` is loaded automatically from `.env` by pydantic-settings, or
you can export it in the environment (`LASTFM_API_KEY=... uvicorn ...`). `.env`
is covered by the root `.gitignore` (`**/.env`) and is never committed.

## Behavior parity with the other versions

Search on Enter or the Go! button; loading spinner; error state; the exact
"No results were found. Please try another search" text on zero matches;
click-to-reveal overlay (`.album-slide` gains `active`); Add To List filters the
album out of visible results, dedupes by id, and caps at 10 — the remaining Add
buttons then render disabled as "List Full", matching the other versions;
per-item Remove; counter bar reveals only when the list is non-empty
(`counter-active`); "View Your List" / "Hide List" toggles the full-screen
drawer (`list-active` + body `no-scroll` + scroll to top) and auto-collapses when
the list empties; the list persists under `localStorage['albumList']` as an array
of `{id,name,artist,image}` objects (same shape as the SPA versions) and
rehydrates on load.

## Deviations

- The client no longer normalizes/filters (`normalizeData` and the
  `image[2]['#text']`/`mbid` guards from v01 are gone) — the server already
  returns clean, normalized `{id,name,artist,image}` objects, so
  `generateSearchResults` consumes them directly.
- `config.js` (v01's in-browser key) is intentionally absent.

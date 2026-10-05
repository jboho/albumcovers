<!-- markdownlint-disable MD033 MD041 -->

<h1 align="center">Album Covers</h1>

<p align="center">
  <strong>One small app, built ten ways: vanilla JS, four React eras, Svelte, Vue, Preact, Python and Go</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/implementations-10-228bff.svg" alt="10 implementations" />
  <img src="https://img.shields.io/badge/React-16%20%E2%86%92%2019-61DAFB?logo=react&logoColor=black" alt="React 16 to 19" />
  <img src="https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white" alt="Svelte 5" />
  <img src="https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white" alt="Vue 3" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white" alt="Python 3.11+" />
  <img src="https://img.shields.io/badge/Go-1.22-00ADD8?logo=go&logoColor=white" alt="Go 1.22" />
</p>

<p align="center">
  <sub>A golden set · same features, same behavior · one stack per folder</sub>
</p>

---

## Overview

**albumcovers** is the same small app implemented across eras and stacks: search [Last.fm](https://www.last.fm/api) for albums, build a Top 10 list, and persist it locally. Lining the versions up makes it easy to compare patterns side by side, and the set doubles as fixture material for eval work.

| Topic            | Links                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| **License**      | [MIT](LICENSE)                                                          |
| **Versions**     | [`versions/`](versions) · one self-contained folder each                |
| **Last.fm key**  | [Create an API account](https://www.last.fm/api/account/create) (free)  |

## Versions

### React, era by era

| #   | Version                                                                                      | Status  |
| --- | -------------------------------------------------------------------------------------------- | ------- |
| 01  | [Vanilla JS](versions/01-vanilla-js)                                                         | Working |
| 02  | [React, functional + Redux (pre-hooks)](versions/02-react-legacy-redux)                      | Working |
| 03  | [React, classes + lifecycle methods](versions/03-react-classes)                              | Working |
| 04  | [React, functional + hooks](versions/04-react-hooks)                                         | Working |
| 05  | [React, modern (Vite + React 19 + TS + TanStack Query + Zustand)](versions/05-react-modern)  | Working |

### Same app, other stacks

| #   | Version                                                                       | Status  |
| --- | ----------------------------------------------------------------------------- | ------- |
| 06  | [Svelte 5 (runes)](versions/06-svelte)                                        | Working |
| 07  | [Vue 3 (Composition API + Pinia)](versions/07-vue)                            | Working |
| 08  | [Preact (signals)](versions/08-preact)                                        | Working |
| 09  | [Python (FastAPI)](versions/09-python) — API call moved server-side           | Working |
| 10  | [Go (stdlib, single binary)](versions/10-go) — API call moved server-side     | Working |

## Features

Every version implements the same behavior, so differences come from the stack, not the spec:

- **Album search** — Query Last.fm's `album.search` and show matching covers.
- **Top 10 list** — Add albums to a ranked list of up to ten.
- **Local persistence** — The list survives a reload.
- **Unique ports** — Each version runs on its own port, so several can run side by side.
- **Two security models** — The SPA versions (01–08) call Last.fm directly from the browser. The full-stack versions (09–10) move that call server-side so the API key never reaches the client.

## Requirements

- **A Last.fm API key** — every version needs one ([create an account](https://www.last.fm/api/account/create)).
- **[Node.js](https://nodejs.org/)** — 22 for versions 03–08, 16 for version 02 (each folder has an `.nvmrc` for `nvm use` / `fnm`). Version 01 only needs a static file server.
- **[Python](https://www.python.org/)** 3.11+ — version 09.
- **[Go](https://go.dev/)** 1.22+ — version 10.

## Quick start

```bash
git clone https://github.com/jboho/albumcovers.git
cd albumcovers/versions/05-react-modern
npm install
cp .env.example .env    # set VITE_LASTFM_API_KEY
npm run dev             # http://localhost:5175
```

Each version is self-contained, with its own dependencies and its own README. The table below lists how to start each one; the version README covers testing, building, and the fixes needed to get it running on current tooling.

| #   | Key goes in                              | Run                                                    | URL                     |
| --- | ---------------------------------------- | ------------------------------------------------------ | ----------------------- |
| 01  | `config.js` (from `config.example.js`)   | `python3 -m http.server 8934`                          | `http://localhost:8934` |
| 02  | `.env` → `REACT_APP_LASTFM_API_KEY`      | `npm install && npm start`                             | `http://localhost:4444` |
| 03  | `.env` → `VITE_LASTFM_API_KEY`           | `npm install && npm run dev`                           | `http://localhost:5173` |
| 04  | `.env` → `VITE_LASTFM_API_KEY`           | `npm install && npm run dev`                           | `http://localhost:5174` |
| 05  | `.env` → `VITE_LASTFM_API_KEY`           | `npm install && npm run dev`                           | `http://localhost:5175` |
| 06  | `.env` → `VITE_LASTFM_API_KEY`           | `npm install && npm run dev`                           | `http://localhost:5176` |
| 07  | `.env` → `VITE_LASTFM_API_KEY`           | `npm install && npm run dev`                           | `http://localhost:5177` |
| 08  | `.env` → `VITE_LASTFM_API_KEY`           | `npm install && npm run dev`                           | `http://localhost:5178` |
| 09  | `.env` → `LASTFM_API_KEY`                | see [09 README](versions/09-python) (venv + uvicorn)   | `http://127.0.0.1:8000` |
| 10  | `.env` → `LASTFM_API_KEY`                | `go run .`                                             | `http://localhost:8080` |

`.env` and `config.js` are gitignored. In the Vite versions, `VITE_LASTFM_API_KEY` is bundled into the browser JavaScript, so don't deploy one of them with a key you want to keep private; use version 09 or 10 for that.

## Provenance

Versions 01 and 02 started as a real 2019 portfolio project (`jboho/albumcovers-react`) rather than being written from scratch: 01 is the original vanilla-JS implementation that predated the React rewrite, and 02 is that React rewrite. Neither had ever been fully wired up and run end-to-end; see each version's README for what was actually broken and what was fixed to get there.

## License

Published under the [MIT License](LICENSE).

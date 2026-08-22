# Album Covers — a golden set

The same small app (search Last.fm, build a Top 10 album list, persist it
locally) implemented across eras and stacks, for comparing patterns side by
side and as fixture material for eval work.

## Versions

### React, era by era

| # | Version | Status |
|---|---------|--------|
| 01 | [Vanilla JS](versions/01-vanilla-js) | Working |
| 02 | [React, functional + Redux (pre-hooks)](versions/02-react-legacy-redux) | Working |
| 03 | [React, classes + lifecycle methods](versions/03-react-classes) | Working |
| 04 | [React, functional + hooks](versions/04-react-hooks) | Working |
| 05 | [React, modern (Vite + React 19 + TS + TanStack Query + Zustand)](versions/05-react-modern) | Working |

### Same app, other stacks

| # | Version | Status |
|---|---------|--------|
| 06 | [Svelte 5 (runes)](versions/06-svelte) | Working |
| 07 | [Vue 3 (Composition API + Pinia)](versions/07-vue) | Working |
| 08 | [Preact (signals)](versions/08-preact) | Working |
| 09 | [Python (FastAPI)](versions/09-python) — API call moved server-side | Working |
| 10 | [Go (stdlib, single binary)](versions/10-go) — API call moved server-side | Working |

Each version is self-contained — its own dependencies, its own README with
setup/run instructions. See each version's README for the specific quirks and
fixes that went into getting it running on current tooling.

The SPA versions (01–08) call Last.fm directly from the browser; the two
full-stack versions (09–10) move that call server-side so the API key never
reaches the client.

## Provenance

Versions 01 and 02 started as a real 2019 portfolio project
(`jboho/albumcovers-react`) rather than being written from scratch: 01 is the
original vanilla-JS implementation that predated the React rewrite, and 02 is
that React rewrite. Neither had ever been fully wired up and run end-to-end —
see each version's README for what was actually broken and what was fixed to
get there.

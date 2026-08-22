# 05 — React (modern)

The same album-search app rebuilt with current React idioms (early 2026): Vite +
React 19 + TypeScript, with server state and client state deliberately split
across two purpose-built libraries instead of one Redux store.

## Stack

| Concern | This version | Contrast with 02 (Redux) |
|---------|--------------|--------------------------|
| Build/dev | Vite 8, ESM, HMR | Create React App / webpack 4 |
| Language | TypeScript (strict) | plain JS |
| Server state (search) | TanStack Query (`useQuery`) | `redux-thunk` + hand-rolled PENDING/SUCCESS/REJECTED actions |
| Client state (the list) | Zustand + `persist` middleware | Redux slice + custom localStorage subscription |
| Search input | React 19 form `action` (uncontrolled) | `document.getElementById(...).value` |
| Overlay show/hide | component-local `useState` | direct `classList` DOM mutation |
| Tests | Vitest + Testing Library | Jest + Enzyme |

The two-library split is the point: album search is **server state** (fetched,
cached, invalidatable — TanStack Query owns it, and caches by search term so
re-running a search is instant) while the Top 10 list is **client state**
(owned by the app, persisted locally — Zustand's `persist` middleware replaces
the pre-hooks version's manual localStorage wiring and rehydrates on load).

## Setup

Requires **Node 22** (see `.nvmrc`); any Node 20.19+/22.12+ satisfies Vite 8.

```
nvm use
npm install
cp .env.example .env    # fill in a real VITE_LASTFM_API_KEY
npm run dev             # http://localhost:5175
npm test                # Vitest (store, Last.fm client, App integration)
npm run typecheck
```

Get a key at https://www.last.fm/api/account/create. `.env` is gitignored; Vite
only exposes vars prefixed `VITE_` to client code.

## What's fixed vs. version 02

The pre-hooks version left the counter bar and "View Your List" drawer as a known
gap — static text, list always visible. Here both are wired reactively off the
store: the counter bar slides in only when the list is non-empty (`counter-active`),
the toggle opens the full-screen drawer (`list-active` + body `no-scroll`), and the
drawer auto-collapses when the list empties. Search results already in the list are
filtered out, and the Add button disables at 10, matching the original vanilla
behavior.

Styling is the same precompiled stylesheet used across the other versions, imported
globally, so the app looks identical era-to-era — only the implementation changes.

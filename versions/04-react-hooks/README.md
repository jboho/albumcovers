# 04 — React (functional + hooks)

The same album-search app built with the React idioms that dominated the
~2019–2021 hooks era: Vite + React 19 + **plain JavaScript**, with global state
handled by `useReducer` + Context and data fetching done by hand inside a custom
hook. It sits deliberately one step below version 05 — no TypeScript, no
TanStack Query, no Zustand.

## Stack

| Concern | This version (04) | Contrast with 05 (modern) |
|---------|-------------------|---------------------------|
| Build/dev | Vite 8, ESM, HMR | same |
| Language | plain JavaScript (JSX) | TypeScript (strict) |
| Server state (search) | custom `useAlbumSearch` — manual `fetch` + `useState`/`useEffect`/`AbortController` | TanStack Query (`useQuery`) |
| Client state (the list) | `useReducer` + Context provider | Zustand + `persist` middleware |
| Persistence | `useEffect` → `localStorage`, lazy `useReducer` initializer on mount | Zustand `persist` middleware |
| Search input | controlled input (`useState`) + form `onSubmit` | React 19 form `action` (uncontrolled) |
| Overlay show/hide | component-local `useState` | same |
| Tests | Vitest + Testing Library + jsdom | same |

## Idioms showcased

- **Functional components + hooks only** — no classes anywhere.
- **`useReducer` + Context as the Redux alternative.** `AlbumListContext`
  exposes `{ topAlbumList, addAlbum, removeAlbum }`; the reducer
  (`albumListReducer`) is pure and exported, caps the list at 10, and dedupes by
  id on add. This is the canonical hooks-era answer to "global state without
  Redux."
- **Hand-rolled data fetching.** `useAlbumSearch(term)` runs `fetch` in a
  `useEffect`, tracks `{ albums, loading, error }` with `useState`, and cancels
  the in-flight request with an `AbortController` on cleanup so a stale response
  can't clobber a newer one. Version 05 replaces all of this with TanStack Query.
- **Persistence by effect.** A `useEffect` syncs the list to `localStorage` on
  every change, and the `useReducer` lazy initializer reads it back once on
  mount (the third `init` argument) — the manual counterpart to Zustand's
  `persist`.
- **`useState` for per-card overlay** and **`useMemo`** to filter already-added
  albums out of the visible results.

## Pure modules (unit-tested directly)

- `src/lib/lastfm.js` — `isUsable`, `normalizeAlbum`, `normalizeAlbums`,
  `buildSearchUrl`. Keeps a Last.fm match only if it has an `mbid` and a
  medium-sized cover (`image[2]['#text']`); normalizes to
  `{ id, name, artist, image }` with single quotes stripped from name/artist.
- `src/store/AlbumListContext.jsx` — exports the pure `albumListReducer`.

## Setup

Requires **Node 22** (see `.nvmrc`); any Node 20.19+/22.12+ satisfies Vite 8.

```
nvm use
npm install
cp .env.example .env    # fill in a real VITE_LASTFM_API_KEY
npm run dev             # http://localhost:5174
npm test                # Vitest (lastfm lib, reducer, App integration)
npm run build
```

Get a key at https://www.last.fm/api/account/create. `.env` is gitignored; Vite
only exposes vars prefixed `VITE_` to client code.

**Assigned dev port: 5174.**

## Behavior parity

Behaviorally identical to versions 01 and 05: search on Enter or the Go! button;
loading and error states; "No results were found. Please try another search" on
zero matches; click-to-reveal card overlay with Add To List + close button;
adding filters the album out of the visible results, dedupes by id, and caps at
10 (button shows "List Full" and disables when full); the counter bar reveals
only when the list is non-empty (`counter-active`); "View Your List" / "Hide
List" toggles the full-screen drawer (`list-active` + body `no-scroll` + scroll
to top) and it auto-collapses when the list empties; per-item Remove; the list
persists under the `albumList` localStorage key and rehydrates on load.

Styling is the same precompiled `styles.css` shared across every version and the
same class names / ids, so the app looks identical era-to-era — only the
implementation changes.

## Deviations / notes

- **Plain JS, so no `npm run typecheck`** (the 05 script has one; there is no
  type layer here). Verification is `npm run build` + `npm test`.
- `build` is just `vite build` (no `tsc -b` step, since there is no TypeScript).
- The search input is controlled (`useState`) rather than uncontrolled — this is
  the era-appropriate choice and the deliberate contrast with 05's React 19 form
  action. Both handle Enter and button click.
- No `zustand`/`redux`/`@tanstack/react-query` dependencies by design; the only
  runtime dependency beyond React is `clsx`.

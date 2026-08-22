# 03 — React (classes + lifecycle)

The same album-search app built the way React was written circa **2016–2018**:
class components, `this.state`/`this.setState`, classic lifecycle methods, and
prop drilling from a single top-level container. No hooks anywhere.

## Stack

| Concern | This version |
|---------|--------------|
| Build/dev | Vite (latest) + `@vitejs/plugin-react` |
| Language | **Plain JavaScript** (`.jsx`, no TypeScript) |
| Components | Class components only (`React.Component` / `React.PureComponent`) |
| State | One top-level `App` class; passed down via props + callbacks |
| Server state (search) | `fetch` in a class method with an instance `AbortController` |
| Client state (the list) | `this.state.topAlbumList` + manual `localStorage` in lifecycle |
| Prop validation | `prop-types` package |
| Tests | Vitest + Testing Library + jsdom |

## Idioms showcased

- **Class components only.** Every component `extends React.Component` (or
  `PureComponent` for the pure presentational ones: `ListCounter`, `Album`).
- **Constructor + `this.state`.** `App` initializes state in its constructor.
- **Updater-function `setState`.** Add/remove/toggle all use
  `this.setState((prev) => ...)` because the next state derives from the prior.
- **Classic lifecycle methods** (the still-supported ones):
  - `componentDidMount` — hydrate `topAlbumList` from `localStorage`.
  - `componentDidUpdate` — persist the list when it changes; auto-collapse the
    drawer when the list empties; sync the `no-scroll` body class + scroll-to-top
    when the drawer toggles.
  - `componentWillUnmount` — abort any in-flight fetch and clean up the body class.
  - No removed/unsafe lifecycles (`componentWillMount`, `componentWillReceiveProps`,
    `componentWillUpdate`).
- **Arrow-field handlers** for binding (`handleAdd = () => {...}`) instead of
  `.bind(this)` in the constructor.
- **`AbortController` on the instance** — aborted before each new search and in
  `componentWillUnmount`.
- **Per-card overlay reveal** lives in `SearchResultAlbum`, a small class holding
  `this.state.active`.
- **No Redux, no Context, no hooks** — deliberately era-simple prop drilling.

## Testable logic extracted

Pure, framework-free modules so the interesting logic is unit-tested directly:

- `src/lib/lastfm.js` — `normalizeSearchResponse(json)` (filter unusable matches +
  normalize), plus `isUsable`, `normalize`, and the `searchAlbums` fetch wrapper.
- `src/lib/listLogic.js` — `addAlbum` (caps at 10, dedupes by id, never mutates)
  and `removeAlbum` (by id).

## Setup

Requires **Node 22** (see `.nvmrc`); any Node 20.19+/22.12+ satisfies Vite 8.

```
nvm use
command npm install          # note: `command ` bypasses this machine's npm wrapper
cp .env.example .env         # fill in a real VITE_LASTFM_API_KEY
npm run dev                  # http://localhost:5173
npm test                     # Vitest (lastfm + listLogic units)
npm run build                # production build to dist/
```

Get a key at https://www.last.fm/api/account/create. `.env` is gitignored (root
`.gitignore` ignores `**/.env`); Vite only exposes vars prefixed `VITE_` to
client code — the key is never hardcoded in source.

**Assigned dev port: 5173.**

## Behavior parity

Matches the behavioral gold standard (version 05) exactly: search on Enter or the
Go! button; loading + error states; `No results were found. Please try another
search` on zero matches; click-to-reveal result overlays with Add / close;
albums already in the list are filtered out of results; add dedupes by id and
caps at 10 (button shows "List Full" + disabled when full); a counter bar that
reveals only when the list is non-empty (`counter-active`); a "View Your
List"/"Hide List" drawer toggle (`list-active` + body `no-scroll` + scroll to
top) that auto-collapses when the list empties; per-item Remove; persistence
under the `albumList` localStorage key with rehydration on load.

## How it contrasts with the other React versions

| | 02 (legacy Redux) | **03 (this — classes)** | 05 (modern) |
|--|--|--|--|
| Language | plain JS | plain JS | TypeScript |
| Components | classes + Redux `connect` | **plain class components** | function components + hooks |
| Global state | Redux store + thunks | **top-level class + prop drilling** | Zustand + TanStack Query |
| Search state | redux-thunk actions | **`fetch` in a class method** | TanStack Query `useQuery` |
| List persistence | custom store subscription | **`localStorage` in `componentDidUpdate`** | Zustand `persist` middleware |
| Overlay reveal | — | **child class `this.state.active`** | component-local `useState` |
| Tests | Jest + Enzyme | **Vitest + Testing Library** | Vitest + Testing Library |

The point of this version is the middle era: React's component model without any
of the state-management libraries or hooks — everything is one container class
threading state down through props.

## Deliberate deviations

- **`localStorage` stores the album objects directly** (a JSON array), matching
  version 05, rather than the original vanilla version's array-of-JSON-strings.
  The key (`albumList`) is unchanged, so the look and behavior are identical.
- Error text follows version 05 (the failing request's message) rather than the
  original vanilla `Search failed. Please try again.` string, to keep the golden
  set's behavioral standard consistent.
- `StrictMode` is enabled (React 16.3+, era-appropriate). Its dev-only
  double-invocation of the constructor/render and simulated mount cycle is
  harmless here — hydration is idempotent and no fetch is in flight at mount.

# 08 — Preact + Signals

The same "Top 10 Favorite Album List Builder" rebuilt on **Preact** with
**`@preact/signals`** as the state layer. Same precompiled stylesheet, same DOM
shape, same behaviors as every other version — the differentiator is that all
app state lives in signals rather than a store library, a hook, or Context.

## Stack

| Concern | This version | Contrast with 05 (React modern) |
|---------|--------------|---------------------------------|
| Runtime | Preact 10 (~4 kB) | React 19 + React DOM |
| Build/dev | Vite 8 + `@preact/preset-vite` | Vite 8 + `@vitejs/plugin-react` |
| Language | TypeScript (strict), `jsxImportSource: "preact"` | TypeScript (strict), `jsx: react-jsx` |
| List (client state) | a single `signal<Album[]>` + `effect()` persistence | Zustand + `persist` middleware |
| Search (server state) | plain `signal`s (`results`/`loading`/`error`) + `AbortController` | TanStack Query `useQuery` |
| Derived views | `computed()` (visible results, count, isFull) | `useMemo` + store selectors |
| Overlay show/hide | component-local `useState` (preact/hooks) | component-local `useState` |
| Tests | Vitest + `@testing-library/preact` + jsdom | Vitest + Testing Library (React) |

## The signals idiom (why this version exists)

State is not owned by a provider or a store instance — it is a set of module-level
reactive values that any component or module can import and read:

- **`src/store/albumStore.ts`** — the Top 10 list is one `signal<Album[]>`,
  initialized from `localStorage` and persisted by a single `effect()` (from
  `@preact/signals-core`) that auto-subscribes to the signal. No manual
  subscribe/unsubscribe, no `persist` middleware. All list mutation logic
  (cap at 10, dedupe by id, remove) lives in this one module. `listCount` and
  `isListFull` are `computed()` derivations.
- **`src/store/search.ts`** — search state is three signals plus a `runSearch()`
  fetch function that cancels the in-flight request with an `AbortController`.
  `visibleResults` is a `computed()` that subtracts the already-added ids from the
  raw results — no selector wiring, it just recomputes when either signal changes.
- Components read `signal.value` directly in JSX; `@preact/signals` subscribes the
  component to exactly the signals it touches. `SearchResultAlbum` keeps its
  click-to-reveal overlay in a local `useState` (preact/hooks).

Pure, testable transforms (`isUsable`, `normalize`, `normalizeMatches`) are
extracted into **`src/lib/lastfm.ts`**.

## Behaviors (identical to v05 / the vanilla original)

Search on Enter or the Go! button; loading spinner and error alert; the
`No results were found. Please try another search` message on zero matches;
click-to-reveal overlay (`album-slide` gets `active`) with a close button and
Add To List; added albums are filtered out of the results, deduped by id, and the
button shows `List Full` / disables at 10; the counter bar reveals only when the
list is non-empty (`counter-active`); `View Your List` / `Hide List` toggles the
full-screen drawer (`list-active` + body `no-scroll` + scroll to top) and it
auto-collapses when the list empties; Remove per list item; persisted under the
`albumList` localStorage key and rehydrated on load.

## Setup

Requires **Node 22** (see `.nvmrc`).

```
nvm use
npm install
cp .env.example .env    # fill in a real VITE_LASTFM_API_KEY
npm run dev             # http://localhost:5178
npm test                # Vitest (lastfm transforms, list-signal, App)
npm run build           # tsc -b && vite build
npm run typecheck       # tsc -b --noEmit
```

Get a key at https://www.last.fm/api/account/create. `.env` is gitignored (the
repo root ignores `**/.env`); Vite only exposes `VITE_`-prefixed vars to client code.

**Assigned dev port: 5178.**

## Verification

```
$ npm run build
tsc -b && vite build
✓ 21 modules transformed.
dist/assets/index-*.css  223.66 kB │ gzip: 164.92 kB
dist/assets/index-*.js    26.97 kB │ gzip:  10.47 kB
✓ built in 290ms

$ npx vitest run
 Test Files  3 passed (3)
      Tests  16 passed (16)
```

## Deviations

- **No server-state cache.** Where v05 uses TanStack Query (caching by search
  term, so re-running a search is instant), this version fetches fresh each time
  via `runSearch()`. Signals cover reactivity; caching was out of scope, and
  in-flight requests are cancelled with `AbortController` so a rapid re-search
  never lands stale results.
- **`hasSearched` signal.** v05 keys the "No results" message off TanStack
  Query's fetch lifecycle; without a query library, this version tracks an
  explicit `hasSearched` signal so the message shows only after a real search
  that returned zero matches (not on first paint).
- Search input is uncontrolled and read from the form on submit (native
  Enter/click submission) rather than React 19's form `action` prop.

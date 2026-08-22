# 07 — Vue 3

The same "Top 10 Favorite Album List Builder" rebuilt with Vue 3 idioms: Vite +
Vue 3 + TypeScript, Composition API with `<script setup>` throughout, Pinia for
the persisted list, and a hand-rolled composable for search. Same behavior and
same precompiled stylesheet as every other version — only the framework changes.

## Stack

| Concern | This version |
|---------|--------------|
| Build/dev | Vite 8 + `@vitejs/plugin-vue` |
| Language | TypeScript (strict), type-checked with `vue-tsc` |
| Components | Single-file components, `<script setup lang="ts">` |
| Client state (the list) | Pinia setup-store (`defineStore` with `ref`/`watch`) |
| Persistence | manual `watch(list, …)` → `localStorage`, rehydrated on store creation |
| Server state (search) | `useAlbumSearch` composable — `ref`/`computed` + manual `fetch` with `AbortController` |
| Overlay show/hide | component-local `ref` + `:class` binding |
| Tests | Vitest + `@vue/test-utils` (jsdom) |

## Idioms showcased

- **Composition API + `<script setup lang="ts">`** in every component — props via
  `defineProps<…>()`, events via `defineEmits<…>()`, no Options API.
- **Pinia setup store** (`src/store/useAlbumStore.ts`): a `ref` list with
  `addAlbum`/`removeAlbum` actions that dedupe by `id` and cap at `MAX_LIST_SIZE`
  (10). A `watch(topAlbumList, …, { deep: true })` mirrors the list to
  `localStorage` under key `albumList`; `loadInitial()` reads it back on store
  creation. `storeToRefs` keeps reactivity when destructuring in components.
- **Search composable** (`src/composables/useAlbumSearch.ts`): returns
  `{ albums, loading, error, hasSearched, search }`. Each `search()` aborts the
  previous in-flight request via `AbortController`, so stale responses never win.
- **Template directives**: `v-for` with `:key`, `v-if`/`v-else-if`, `@click`
  (with `.stop`/`.prevent` modifiers), `:class` object syntax, `v-model` on the
  search input.
- **`computed` for derived state**: filtered (not-yet-added) results in
  `SearchResults.vue`, the "List Full" flag, and the counter label.
- **Pure, testable core** (`src/lib/lastfm.ts`): `isUsable`, `normalize`, and
  `parseSearchResponse` are extracted from the fetch so they unit-test without a
  network or DOM.

## Behavior (matches the gold standard, v05)

- Search on Enter or the Go! button; loading spinner and error alert states.
- `No results were found. Please try another search` on zero matches.
- Result cards reveal an overlay on click (`.album-slide` gets `active`), with a
  close button and an **Add To List** button.
- Adding filters that album out of the visible results, dedupes by `id`, and caps
  the list at 10 — the Add button then reads **List Full** and is disabled.
- Counter bar appears only when the list is non-empty (`#mainContainer` gets
  `counter-active`); **View Your List** / **Hide List** toggles the full-screen
  drawer (`list-active` + body `no-scroll` + scroll to top) and it auto-collapses
  when the list empties.
- Per-item **Remove** in the drawer; the list persists under `localStorage` key
  `albumList` and rehydrates on load.

Only Last.fm matches with an `mbid` **and** a medium (`image[2]`) cover are kept;
names and artists have single quotes stripped, matching the original normalizer.

## Contrast with the React versions

- **State split**: v05 (React) splits server state (TanStack Query) from client
  state (Zustand + `persist` middleware). Here Pinia owns the list and a
  hand-rolled composable owns search — no query-cache library, so a repeated
  search refetches rather than serving from cache. Persistence is a manual
  `watch` rather than middleware.
- **Reactivity model**: React re-renders top-down from `useState`/props; Vue
  tracks fine-grained reactive `ref`/`computed` dependencies and updates only
  what changed. The overlay toggle is a local `ref` + `:class` here vs. `useState`
  + `clsx` in React — both replace the vanilla version's direct `classList`
  mutation.
- **Input handling**: v05 uses a React 19 uncontrolled form `action`; this
  version uses `v-model` + `@submit.prevent`.
- **Templates vs. JSX**: logic lives in `<template>` directives (`v-for`,
  `v-if`) rather than JS `.map()`/`&&` inside JSX.

## Setup

Requires **Node 22** (see `.nvmrc`); any Node 20.19+/22.12+ satisfies Vite 8.

```
nvm use
npm install               # in this shell, prefix with `command`: command npm install
cp .env.example .env      # fill in a real VITE_LASTFM_API_KEY
npm run dev               # http://localhost:5177
npm test                  # Vitest (lastfm lib, Pinia store, SearchResults component)
npm run typecheck         # vue-tsc -b --noEmit
npm run build             # vue-tsc -b && vite build
```

Get a key at https://www.last.fm/api/account/create. `.env` is gitignored (both
the local `.gitignore` and the repo root's `**/.env`); Vite only exposes vars
prefixed `VITE_` to client code, so the key is never hardcoded.

**Assigned dev port:** 5177.

## Deviations

- No query-caching layer (TanStack Query has no first-class Vue-idiomatic parallel
  used here); the composable refetches each search. Correctness (abort of stale
  requests) is preserved via `AbortController`.
- Search state lives in the composable instantiated in `App.vue` and is passed to
  `SearchResults` as props (keeping that component presentational), rather than
  each component reaching into a shared hook as in the React version.
- `vue-tsc` (not plain `tsc`) performs type-checking so `.vue` SFCs are covered.

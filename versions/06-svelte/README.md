# 06 — Svelte 5 (runes)

The same "Top 10 Favorite Album List Builder" rebuilt with **Svelte 5** and its
runes reactivity model: Vite + Svelte 5 + TypeScript. State lives in plain
`.svelte.ts` modules driven by `$state`/`$derived`/`$effect` rather than in a
component tree of hooks and external state libraries.

## Stack

| Concern | This version | Contrast with 05 (React modern) |
|---------|--------------|---------------------------------|
| Build/dev | Vite 8, ESM, HMR | same |
| UI runtime | Svelte 5 (compiled, no virtual DOM) | React 19 (virtual DOM) |
| Language | TypeScript (strict), `svelte-check` | TypeScript (strict), `tsc -b` |
| Reactivity | runes: `$state`, `$derived`, `$effect` | `useState`/`useEffect`/`useMemo` |
| Client state (the list) | rune class in `src/lib/albums.svelte.ts` + `$effect` persistence | Zustand + `persist` middleware |
| Server state (search) | rune class in `src/lib/search.svelte.ts` + `AbortController` | TanStack Query (`useQuery`) |
| Search input | `bind:value` + form `onsubmit` | React 19 uncontrolled form `action` |
| Overlay show/hide | component-local `$state` + `class:` directive | component-local `useState` + `clsx` |
| Tests | Vitest (pure core) | Vitest + Testing Library |

## Idioms showcased

- **Runes everywhere** — no `export let`, no legacy `$store` auto-subscriptions.
  `$state` for mutable state, `$derived` for computed values (the counter label,
  the filtered visible-results list), `$effect` for DOM side effects (body
  `no-scroll`, scroll-to-top) and for auto-collapsing the drawer when the list
  empties.
- **Rune modules, not stores** — list and search state are exported class
  instances from `.svelte.ts` files, imported directly by any component. The
  list store rehydrates from `localStorage` in its constructor and mirrors every
  change back via a rooted `$effect` (`$effect.root`), so persistence is
  reactive rather than hand-wired.
- **Pure core split out for testing** — `src/lib/listCore.ts` (cap/dedupe/remove,
  storage parse) and `src/lib/lastfm.ts` (`isUsable`/`normalize`/`normalizeMatches`)
  are plain TS with zero runes, so Vitest exercises them without the Svelte
  compiler. The `.svelte.ts` shells are thin.
- **Component syntax** — `$props()` for inputs, `{#if}/{:else if}/{:else}` and
  `{#each … (key)}` blocks, `class:` directives (`counter-active`, `list-active`,
  `active`), and Svelte 5 event props (`onclick`, `onsubmit`, `onkeydown`).
- **Cancellable search** — each `search.run()` aborts the previous in-flight
  request via `AbortController` so stale responses never overwrite fresh ones.

## Behavior parity

Matches version 05 exactly: search on Enter or the Go! button; loading and error
states; `No results were found. Please try another search` on zero matches;
click-to-reveal result overlay (`.album-slide` gains `active`) with a close
button and Add To List; adding filters that album out of the visible results,
dedupes by id, and caps at 10 (buttons switch to `List Full` + disabled when
full); the counter bar reveals only when the list is non-empty
(`#mainContainer.counter-active`); `View Your List` / `Hide List` toggles the
full-screen drawer (`#mainContainer.list-active` + body `no-scroll` + scroll to
top) and it auto-collapses when the list empties; Remove per list item; the list
persists under `localStorage` key `albumList` and rehydrates on load.

Styling is the shared `styles.css` used across every version (copied to
`src/styles.css`, imported globally in `src/main.ts`), so the app looks identical
era-to-era — only the implementation changes.

## Setup

Requires **Node 22** (see `.nvmrc`); any Node 20.19+/22.12+ satisfies Vite 8.

```
nvm use
npm install
cp .env.example .env    # fill in a real VITE_LASTFM_API_KEY
npm run dev             # http://localhost:5176
npm run build           # production build to dist/
npm run check           # svelte-check (typecheck + Svelte diagnostics)
npm test                # Vitest (pure list core + Last.fm normalize/filter)
```

Get a key at https://www.last.fm/api/account/create. `.env` is gitignored (root
`.gitignore` ignores `**/.env`); Vite only exposes vars prefixed `VITE_` to
client code.

**Assigned dev port: 5176.**

## Deviations / notes

- **Tests target the pure core, not the runes modules.** Testing a `.svelte.ts`
  module directly requires compiling runes under Vitest (the
  `vitest-plugin-svelte` browser/JSDOM setup). Per the brief, the list logic
  lives in a plain-TS core (`listCore.ts`) that is unit-tested there instead;
  `albums.svelte.ts` is a thin reactive wrapper over it. Same split for search:
  `lastfm.ts` normalize/filter is tested; the fetch wiring is exercised by the
  parent's live E2E.
- **No `tsc` in the build.** Svelte projects typecheck with `svelte-check` (which
  understands `.svelte` files) rather than `tsc -b`; `npm run build` is
  `vite build` alone, and `npm run check` is the typecheck gate.
- **`role="button"` + `onkeydown` on the result tile.** The reveal-on-click tile
  is a `<div>` (its styling depends on the `.album-slide` class); keyboard
  handling and an ARIA role were added so it is genuinely accessible and
  `svelte-check` reports zero a11y warnings — a small improvement over the
  click-only `<div>` in the React version.
```

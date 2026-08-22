# 02 — React (pre-hooks, functional components + Redux)

React 16.12 with `react-redux`/`connect`/`mapDispatchToProps`, `redux-thunk` for
the async search call, and plain functional components (`memo`, no classes, no
hooks — this era predates hooks as a component-local-state pattern even though
the React version technically supports them).

## Setup

Requires **Node 16.20.2** (see `.nvmrc`) — react-scripts 3.3.0 / webpack 4 don't
run on Node 17+ (OpenSSL 3 breaks webpack's `createHash('md4')` calls), and Jest
24's resolver can't handle `node:`-prefixed built-in imports pulled in by newer
transitive deps, so this version is pinned to an older Node line rather than
patched around indefinitely.

```
nvm use
npm install
cp .env.example .env   # fill in a real REACT_APP_LASTFM_API_KEY
npm start               # http://localhost:4444
npm test
```

## What was actually broken in this scaffold

This was a portfolio code sample, not a finished app — it had never been run
end-to-end. Fixed while wiring it up:

- `src/index.js` never wrapped `<App>` in `<Provider store={store}>` — no
  component could reach the Redux store.
- `src/reducers/index.js` re-exported a `import * as session` namespace object
  as the root reducer instead of calling `combineReducers({ session })` —
  `createStore` would have thrown immediately.
- `SearchResults`/`AlbumList` passed `data={album}` to `<Album>`, which
  destructures `{ album }` — every list item would have crashed on `undefined`.
- `Album.js` imported `removeAlbum` and called it directly as a plain function
  instead of dispatching it — the thunk action creator would fire and do nothing.
- `persistence/store.js` checked `constants.FETCH_ALBUMS_SUCCESS`, but that
  constant lives in `actions/types.js` — `constants.js` only ever exported
  `API_ROOT`, so the comparison never matched and nothing ever persisted.
- `fetchAlbums`/reducer had no real Last.fm fetch or `ADD_ALBUM`/`REMOVE_ALBUM`
  handling — both were stubbed with commented-out code from what looks like an
  unrelated auth-flow boilerplate (`/user/authenticate`, `avatar`, `photoURL`
  fields that make no sense for an album list).
- There was no component for the "search result, click to reveal an Add To
  List overlay" markup — only the "Your List, Remove" variant existed. Added
  `SearchResultAlbum.js` alongside the existing `Album.js`.
- `App.js` imported `../scss/index.scss` directly, but react-scripts 3.3.0
  predates CRA's built-in Sass support (added in react-scripts 4.0) — this
  would never have compiled. Now imports the precompiled `../index.css`,
  matching what `npm run build:css`/`watch:css` actually produce.
- `node-sass`/`node-sass-chokidar` don't build on modern Node (Python 2 syntax
  in node-gyp's version check); swapped for `sass` (dart-sass, no native build).
- `react-dev-utils` and `cheerio` (transitive, via `chai-enzyme`) both float on
  loose semver ranges that have since drifted to versions incompatible with
  this pinned `react-scripts`/`jest`; pinned via `overrides` to versions from
  roughly this app's era.

Not fixed, left as a known gap: `toggleListButton` and the `albumCounter` count
text are static — the original component tree never wired up the
`counter-active`/`list-active` overlay-toggle behavior that the vanilla version
has, and the React layout renders the list section always-visible instead. Not
required for functional parity on search/add/remove/persist, but worth a look
before treating this as a finished reference.

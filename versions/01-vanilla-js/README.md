# 01 — Vanilla JS

The original implementation: no framework, no build step. A single IIFE module
(`album-searcher.js`) that queries the Last.fm API, renders markup via template
strings, and persists your list to `localStorage`.

## Run it

1. Copy `config.example.js` to `config.js` and add a real Last.fm API key
   (get one at https://www.last.fm/api/account/create). `config.js` is gitignored.
2. Serve the folder statically, e.g.:

   ```
   python3 -m http.server 8934
   ```
3. Open http://localhost:8934/

## Notes

- This file was never actually wired to an HTML page in the original repo — it
  sat in `public/` as dead code left over from before the React rewrite. The
  `index.html` here is new; the JS logic itself is otherwise untouched.
- The Last.fm API key was previously hardcoded in plaintext in `album-searcher.js`.
  It's now read from `config.js` instead.

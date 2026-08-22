import { useEffect, useState } from 'react';
import { buildSearchUrl, normalizeAlbums, MissingApiKeyError } from '../lib/lastfm';

/**
 * Server state for album search, done by hand: useState for the three flags,
 * useEffect to fire the request when the term changes, and an AbortController to
 * cancel the in-flight fetch on cleanup so a stale response can't overwrite a
 * newer one. The modern version (05) hands all of this to TanStack Query.
 */
export function useAlbumSearch(term) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!term) {
      setAlbums([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
        if (!apiKey) throw new MissingApiKeyError();

        const response = await fetch(buildSearchUrl(term, apiKey), { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Last.fm request failed with ${response.status}`);
        }

        const json = await response.json();
        const matches = json?.results?.albummatches?.album ?? [];
        setAlbums(normalizeAlbums(matches));
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError(err);
        setAlbums([]);
      } finally {
        // A cancelled request already has its state superseded by the next run.
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    run();

    return () => controller.abort();
  }, [term]);

  return { albums, loading, error };
}

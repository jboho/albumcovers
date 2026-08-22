import { ref } from 'vue';
import { searchAlbums } from '../lib/lastfm';
import type { Album } from '../types';

/**
 * Server state for album search. A manual fetch with AbortController cancels an
 * in-flight request when a newer search starts, so results never arrive out of
 * order. Returns reactive refs plus a `search` action.
 */
export function useAlbumSearch() {
  const albums = ref<Album[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasSearched = ref(false);

  let controller: AbortController | null = null;

  async function search(term: string): Promise<void> {
    const trimmed = term.trim();
    if (!trimmed) return;

    controller?.abort();
    controller = new AbortController();

    loading.value = true;
    error.value = null;
    hasSearched.value = true;

    try {
      albums.value = await searchAlbums(trimmed, controller.signal);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      error.value = err instanceof Error ? err.message : 'Search failed. Please try again.';
      albums.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { albums, loading, error, hasSearched, search };
}

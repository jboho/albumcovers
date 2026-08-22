import { signal, computed } from '@preact/signals';
import { searchAlbums } from '../lib/lastfm';
import { topAlbumList } from './albumStore';
import type { Album } from '../types';

/**
 * Search is "server state" held in plain signals: results, loading, and error
 * are three signals updated by runSearch(). The v05 version leaned on TanStack
 * Query for caching; here the differentiator is that a computed() derives the
 * visible list from two signals (results + the user's list) with no selector
 * boilerplate and no re-render plumbing.
 */
export const searchResults = signal<Album[]>([]);
export const searchLoading = signal(false);
export const searchError = signal<string | null>(null);
export const hasSearched = signal(false);

/** Results minus anything already added to the Top 10 list. */
export const visibleResults = computed<Album[]>(() => {
  const listed = new Set(topAlbumList.value.map((a) => a.id));
  return searchResults.value.filter((a) => !listed.has(a.id));
});

let controller: AbortController | null = null;

export async function runSearch(term: string): Promise<void> {
  const trimmed = term.trim();
  if (!trimmed) return;

  controller?.abort();
  const myController = new AbortController();
  controller = myController;

  searchLoading.value = true;
  searchError.value = null;
  hasSearched.value = true;

  try {
    const albums = await searchAlbums(trimmed, myController.signal);
    if (myController.signal.aborted) return;
    searchResults.value = albums;
  } catch (err) {
    if (myController.signal.aborted || (err as Error).name === 'AbortError') return;
    searchError.value = (err as Error).message;
    searchResults.value = [];
  } finally {
    if (controller === myController) searchLoading.value = false;
  }
}

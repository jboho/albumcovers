import type { Album } from './types';
import { searchAlbums } from './lastfm';

/**
 * Rune-based server-state holder for album search. Each run cancels the
 * previous in-flight request via AbortController, so a fast typist's stale
 * results never clobber the latest ones.
 */
export class AlbumSearch {
  results = $state<Album[]>([]);
  loading = $state(false);
  error = $state<string | null>(null);
  searched = $state(false);

  #controller: AbortController | null = null;

  async run(term: string): Promise<void> {
    const trimmed = term.trim();
    if (!trimmed) return;

    this.#controller?.abort();
    const controller = new AbortController();
    this.#controller = controller;

    this.loading = true;
    this.error = null;

    try {
      const albums = await searchAlbums(trimmed, controller.signal);
      if (controller.signal.aborted) return;
      this.results = albums;
      this.searched = true;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      this.error = err instanceof Error ? err.message : 'Search failed. Please try again.';
    } finally {
      if (this.#controller === controller) this.loading = false;
    }
  }
}

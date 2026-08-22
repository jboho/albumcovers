import type { Album } from './types';
import {
  MAX_LIST_SIZE,
  STORAGE_KEY,
  addAlbum,
  removeAlbum,
  parseStoredList,
} from './listCore';

export { MAX_LIST_SIZE };

/**
 * Rune-based client store for the user's Top 10 list. `$state` makes `items`
 * deeply reactive; a `$effect` (rooted so it can live outside a component)
 * mirrors every change to localStorage, and the constructor rehydrates from it.
 * The add/remove/cap/dedupe rules live in the pure `listCore` module so they
 * stay testable without the Svelte compiler.
 */
class AlbumListStore {
  items = $state<Album[]>([]);

  constructor() {
    if (typeof localStorage === 'undefined') return;

    this.items = parseStoredList(localStorage.getItem(STORAGE_KEY));

    $effect.root(() => {
      $effect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      });
    });
  }

  get count(): number {
    return this.items.length;
  }

  get isFull(): boolean {
    return this.items.length >= MAX_LIST_SIZE;
  }

  has(id: string): boolean {
    return this.items.some((a) => a.id === id);
  }

  add(album: Album): void {
    this.items = addAlbum(this.items, album);
  }

  remove(id: string): void {
    this.items = removeAlbum(this.items, id);
  }
}

export const albumList = new AlbumListStore();

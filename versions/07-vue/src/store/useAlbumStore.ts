import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Album } from '../types';

export const MAX_LIST_SIZE = 10;
const STORAGE_KEY = 'albumList';

/** Read the persisted list on store creation; tolerate absent/corrupt storage. */
function loadInitial(): Album[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as Album[]) : [];
  } catch {
    return [];
  }
}

/**
 * Client state for the user's Top 10 list. Setup-store form: a `ref` holds the
 * list, a `watch` mirrors it to localStorage (replacing the vanilla version's
 * manual updateLocalStorage calls), and it rehydrates from storage on creation.
 */
export const useAlbumStore = defineStore('albums', () => {
  const topAlbumList = ref<Album[]>(loadInitial());

  function addAlbum(album: Album): void {
    const isFull = topAlbumList.value.length >= MAX_LIST_SIZE;
    const alreadyIn = topAlbumList.value.some((a) => a.id === album.id);
    if (isFull || alreadyIn) return;
    topAlbumList.value.push(album);
  }

  function removeAlbum(id: string): void {
    topAlbumList.value = topAlbumList.value.filter((a) => a.id !== id);
  }

  watch(
    topAlbumList,
    (list) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      } catch {
        /* storage unavailable (private mode / quota) — non-fatal */
      }
    },
    { deep: true },
  );

  return { topAlbumList, addAlbum, removeAlbum };
});

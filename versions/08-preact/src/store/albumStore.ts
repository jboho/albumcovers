import { signal, computed } from '@preact/signals';
import { effect } from '@preact/signals-core';
import type { Album } from '../types';

export const MAX_LIST_SIZE = 10;
const STORAGE_KEY = 'albumList';

/**
 * The Top 10 list lives in a single signal. This replaces the Redux slice (v02)
 * and the Zustand store (v05): reactivity is fine-grained and framework-agnostic,
 * so the same signal drives components, computed views, and the persistence
 * effect below with no store/provider wiring.
 */
function loadInitial(): Album[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Album[]) : [];
  } catch {
    return [];
  }
}

export const topAlbumList = signal<Album[]>(loadInitial());

export const listCount = computed(() => topAlbumList.value.length);
export const isListFull = computed(() => topAlbumList.value.length >= MAX_LIST_SIZE);

/** All mutation logic for the list lives here: cap at 10, dedupe by id. */
export function addAlbum(album: Album): void {
  const list = topAlbumList.value;
  if (list.length >= MAX_LIST_SIZE) return;
  if (list.some((a) => a.id === album.id)) return;
  topAlbumList.value = [...list, album];
}

export function removeAlbum(id: string): void {
  topAlbumList.value = topAlbumList.value.filter((a) => a.id !== id);
}

// Persist on every change. The effect subscribes to the signal automatically —
// no manual subscribe/unsubscribe like the pre-hooks version needed.
effect(() => {
  const list = topAlbumList.value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode / quota) — non-fatal */
  }
});

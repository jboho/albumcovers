import type { Album } from './types';

export const MAX_LIST_SIZE = 10;
export const STORAGE_KEY = 'albumList';

/**
 * Pure list operations, kept free of any runes so Vitest can exercise the cap,
 * dedupe, and remove rules without the Svelte compiler. The `.svelte.ts` store
 * is a thin reactive shell over these.
 */
export function addAlbum(list: Album[], album: Album): Album[] {
  if (list.length >= MAX_LIST_SIZE) return list;
  if (list.some((a) => a.id === album.id)) return list;
  return [...list, album];
}

export function removeAlbum(list: Album[], id: string): Album[] {
  return list.filter((a) => a.id !== id);
}

/** Rehydrate a persisted list, tolerating missing or malformed storage. */
export function parseStoredList(raw: string | null): Album[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Album[]) : [];
  } catch {
    return [];
  }
}

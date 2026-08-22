import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Album } from '../types';

export const MAX_LIST_SIZE = 10;

interface AlbumStore {
  topAlbumList: Album[];
  addAlbum: (album: Album) => void;
  removeAlbum: (id: string) => void;
}

/**
 * Client state for the user's Top 10 list. Mirrors the Redux slice from the
 * pre-hooks version, but the persist middleware replaces that version's
 * hand-rolled localStorage subscription — the list rehydrates automatically.
 */
export const useAlbumStore = create<AlbumStore>()(
  persist(
    (set, get) => ({
      topAlbumList: [],
      addAlbum: (album) => {
        const { topAlbumList } = get();
        const isFull = topAlbumList.length >= MAX_LIST_SIZE;
        const alreadyIn = topAlbumList.some((a) => a.id === album.id);
        if (isFull || alreadyIn) return;
        set({ topAlbumList: [...topAlbumList, album] });
      },
      removeAlbum: (id) =>
        set((state) => ({
          topAlbumList: state.topAlbumList.filter((a) => a.id !== id),
        })),
    }),
    {
      name: 'albumList',
      partialize: (state) => ({ topAlbumList: state.topAlbumList }),
    },
  ),
);

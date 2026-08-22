import { createContext, useContext, useEffect, useReducer } from 'react';

export const MAX_LIST_SIZE = 10;
export const STORAGE_KEY = 'albumList';

/**
 * Pure reducer for the Top 10 list. Exported so it can be unit-tested without
 * mounting a provider. Caps at MAX_LIST_SIZE and dedupes by id on add.
 */
export function albumListReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const isFull = state.length >= MAX_LIST_SIZE;
      const alreadyIn = state.some((a) => a.id === action.album.id);
      if (isFull || alreadyIn) return state;
      return [...state, action.album];
    }
    case 'remove':
      return state.filter((a) => a.id !== action.id);
    default:
      return state;
  }
}

/**
 * Lazy initializer (useReducer's third arg): read the persisted list from
 * localStorage exactly once, on mount. Guards against malformed JSON.
 */
export function initAlbumList() {
  try {
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

const AlbumListContext = createContext(null);

export function AlbumListProvider({ children }) {
  const [topAlbumList, dispatch] = useReducer(albumListReducer, undefined, initAlbumList);

  // Sync every change back to localStorage. Replaces the pre-hooks version's
  // hand-rolled updateLocalStorage() calls scattered through the render path.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(topAlbumList));
    } catch {
      // storage unavailable (private mode / quota) — non-fatal
    }
  }, [topAlbumList]);

  const value = {
    topAlbumList,
    addAlbum: (album) => dispatch({ type: 'add', album }),
    removeAlbum: (id) => dispatch({ type: 'remove', id }),
  };

  return <AlbumListContext.Provider value={value}>{children}</AlbumListContext.Provider>;
}

export function useAlbumList() {
  const ctx = useContext(AlbumListContext);
  if (!ctx) {
    throw new Error('useAlbumList must be used within an AlbumListProvider');
  }
  return ctx;
}

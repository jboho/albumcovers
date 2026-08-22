import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAlbumStore, MAX_LIST_SIZE } from '../store/useAlbumStore';
import type { Album } from '../types';

const mk = (id: string): Album => ({
  id,
  name: `name-${id}`,
  artist: `artist-${id}`,
  image: `img-${id}`,
});

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe('useAlbumStore', () => {
  it('adds an album', () => {
    const store = useAlbumStore();
    store.addAlbum(mk('1'));
    expect(store.topAlbumList).toHaveLength(1);
  });

  it('ignores a duplicate id', () => {
    const store = useAlbumStore();
    const a = mk('1');
    store.addAlbum(a);
    store.addAlbum(a);
    expect(store.topAlbumList).toHaveLength(1);
  });

  it(`caps the list at ${MAX_LIST_SIZE}`, () => {
    const store = useAlbumStore();
    for (let i = 0; i < MAX_LIST_SIZE + 5; i++) {
      store.addAlbum(mk(String(i)));
    }
    expect(store.topAlbumList).toHaveLength(MAX_LIST_SIZE);
  });

  it('removes by id', () => {
    const store = useAlbumStore();
    store.addAlbum(mk('1'));
    store.addAlbum(mk('2'));
    store.removeAlbum('1');
    expect(store.topAlbumList.map((a) => a.id)).toEqual(['2']);
  });

  it('persists the list to localStorage under the "albumList" key', async () => {
    const store = useAlbumStore();
    store.addAlbum(mk('1'));
    // watch flushes on the next microtask/tick
    await Promise.resolve();
    await new Promise((r) => setTimeout(r, 0));
    expect(localStorage.getItem('albumList')).toContain('"id":"1"');
  });

  it('rehydrates the list from localStorage on creation', () => {
    localStorage.setItem('albumList', JSON.stringify([mk('9')]));
    setActivePinia(createPinia());
    const store = useAlbumStore();
    expect(store.topAlbumList.map((a) => a.id)).toEqual(['9']);
  });
});

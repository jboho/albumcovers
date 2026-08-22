import { describe, it, expect, beforeEach } from 'vitest';
import { useAlbumStore, MAX_LIST_SIZE } from '../store/useAlbumStore';
import type { Album } from '../types';

const mk = (id: string): Album => ({ id, name: `name-${id}`, artist: `artist-${id}`, image: `img-${id}` });

beforeEach(() => {
  localStorage.clear();
  useAlbumStore.setState({ topAlbumList: [] });
});

describe('useAlbumStore', () => {
  it('adds an album', () => {
    useAlbumStore.getState().addAlbum(mk('1'));
    expect(useAlbumStore.getState().topAlbumList).toHaveLength(1);
  });

  it('ignores a duplicate id', () => {
    const a = mk('1');
    useAlbumStore.getState().addAlbum(a);
    useAlbumStore.getState().addAlbum(a);
    expect(useAlbumStore.getState().topAlbumList).toHaveLength(1);
  });

  it(`caps the list at ${MAX_LIST_SIZE}`, () => {
    for (let i = 0; i < MAX_LIST_SIZE + 5; i++) {
      useAlbumStore.getState().addAlbum(mk(String(i)));
    }
    expect(useAlbumStore.getState().topAlbumList).toHaveLength(MAX_LIST_SIZE);
  });

  it('removes by id', () => {
    useAlbumStore.getState().addAlbum(mk('1'));
    useAlbumStore.getState().addAlbum(mk('2'));
    useAlbumStore.getState().removeAlbum('1');
    expect(useAlbumStore.getState().topAlbumList.map((a) => a.id)).toEqual(['2']);
  });

  it('persists the list to localStorage under the "albumList" key', () => {
    useAlbumStore.getState().addAlbum(mk('1'));
    expect(localStorage.getItem('albumList')).toContain('"id":"1"');
  });
});

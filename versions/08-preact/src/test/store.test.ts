import { describe, it, expect, beforeEach } from 'vitest';
import {
  topAlbumList,
  addAlbum,
  removeAlbum,
  listCount,
  isListFull,
  MAX_LIST_SIZE,
} from '../store/albumStore';
import type { Album } from '../types';

const mk = (id: string): Album => ({
  id,
  name: `name-${id}`,
  artist: `artist-${id}`,
  image: `img-${id}`,
});

beforeEach(() => {
  localStorage.clear();
  topAlbumList.value = [];
});

describe('album list signal', () => {
  it('adds an album and exposes it through the count computed', () => {
    addAlbum(mk('1'));
    expect(topAlbumList.value).toHaveLength(1);
    expect(listCount.value).toBe(1);
  });

  it('ignores a duplicate id', () => {
    const a = mk('1');
    addAlbum(a);
    addAlbum(a);
    expect(topAlbumList.value).toHaveLength(1);
  });

  it(`caps the list at ${MAX_LIST_SIZE} and flips isListFull`, () => {
    for (let i = 0; i < MAX_LIST_SIZE + 5; i++) addAlbum(mk(String(i)));
    expect(topAlbumList.value).toHaveLength(MAX_LIST_SIZE);
    expect(isListFull.value).toBe(true);
    addAlbum(mk('overflow'));
    expect(topAlbumList.value).toHaveLength(MAX_LIST_SIZE);
  });

  it('removes by id', () => {
    addAlbum(mk('1'));
    addAlbum(mk('2'));
    removeAlbum('1');
    expect(topAlbumList.value.map((a) => a.id)).toEqual(['2']);
  });

  it('persists the list to localStorage under the "albumList" key', () => {
    addAlbum(mk('1'));
    expect(localStorage.getItem('albumList')).toContain('"id":"1"');
  });
});

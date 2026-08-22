import { describe, it, expect } from 'vitest';
import { addAlbum, removeAlbum, parseStoredList, MAX_LIST_SIZE } from '../lib/listCore';
import type { Album } from '../lib/types';

const mk = (id: string): Album => ({
  id,
  name: `name-${id}`,
  artist: `artist-${id}`,
  image: `img-${id}`,
});

describe('addAlbum', () => {
  it('appends a new album', () => {
    expect(addAlbum([], mk('1'))).toHaveLength(1);
  });

  it('ignores a duplicate id', () => {
    const list = addAlbum([], mk('1'));
    expect(addAlbum(list, mk('1'))).toBe(list);
  });

  it(`caps the list at ${MAX_LIST_SIZE}`, () => {
    let list: Album[] = [];
    for (let i = 0; i < MAX_LIST_SIZE + 5; i++) list = addAlbum(list, mk(String(i)));
    expect(list).toHaveLength(MAX_LIST_SIZE);
  });

  it('does not mutate the input list', () => {
    const list = [mk('1')];
    addAlbum(list, mk('2'));
    expect(list).toHaveLength(1);
  });
});

describe('removeAlbum', () => {
  it('removes by id', () => {
    const list = [mk('1'), mk('2')];
    expect(removeAlbum(list, '1').map((a) => a.id)).toEqual(['2']);
  });

  it('leaves the list unchanged for an unknown id', () => {
    const list = [mk('1')];
    expect(removeAlbum(list, 'nope').map((a) => a.id)).toEqual(['1']);
  });
});

describe('parseStoredList', () => {
  it('returns an empty array for null', () => {
    expect(parseStoredList(null)).toEqual([]);
  });

  it('returns an empty array for malformed JSON', () => {
    expect(parseStoredList('{not json')).toEqual([]);
  });

  it('returns an empty array when the stored value is not an array', () => {
    expect(parseStoredList('{"id":"1"}')).toEqual([]);
  });

  it('rehydrates a stored array', () => {
    const stored = JSON.stringify([mk('1')]);
    expect(parseStoredList(stored)).toEqual([mk('1')]);
  });
});

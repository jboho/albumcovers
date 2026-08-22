import { describe, it, expect } from 'vitest';
import { addAlbum, removeAlbum, MAX_LIST_SIZE } from '../lib/listLogic';

const mk = (id) => ({ id, name: `name-${id}`, artist: `artist-${id}`, image: `img-${id}` });

describe('addAlbum', () => {
  it('appends to a new array without mutating the input', () => {
    const list = [mk('1')];
    const next = addAlbum(list, mk('2'));
    expect(next).toHaveLength(2);
    expect(list).toHaveLength(1);
    expect(next).not.toBe(list);
  });

  it('dedupes by id', () => {
    const list = addAlbum([mk('1')], mk('1'));
    expect(list).toHaveLength(1);
  });

  it(`caps the list at ${MAX_LIST_SIZE}`, () => {
    let list = [];
    for (let i = 0; i < MAX_LIST_SIZE + 5; i++) {
      list = addAlbum(list, mk(String(i)));
    }
    expect(list).toHaveLength(MAX_LIST_SIZE);
  });
});

describe('removeAlbum', () => {
  it('removes the matching id', () => {
    const list = [mk('1'), mk('2')];
    expect(removeAlbum(list, '1').map((a) => a.id)).toEqual(['2']);
  });

  it('is a no-op for an unknown id', () => {
    const list = [mk('1')];
    expect(removeAlbum(list, 'nope')).toHaveLength(1);
  });
});

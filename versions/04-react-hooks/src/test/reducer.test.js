import { describe, it, expect } from 'vitest';
import { albumListReducer, MAX_LIST_SIZE } from '../store/AlbumListContext';

const mk = (id) => ({ id, name: `name-${id}`, artist: `artist-${id}`, image: `img-${id}` });

describe('albumListReducer', () => {
  it('adds an album', () => {
    const state = albumListReducer([], { type: 'add', album: mk('1') });
    expect(state).toHaveLength(1);
    expect(state[0].id).toBe('1');
  });

  it('ignores a duplicate id', () => {
    const once = albumListReducer([], { type: 'add', album: mk('1') });
    const twice = albumListReducer(once, { type: 'add', album: mk('1') });
    expect(twice).toHaveLength(1);
  });

  it(`caps the list at ${MAX_LIST_SIZE}`, () => {
    let state = [];
    for (let i = 0; i < MAX_LIST_SIZE + 5; i++) {
      state = albumListReducer(state, { type: 'add', album: mk(String(i)) });
    }
    expect(state).toHaveLength(MAX_LIST_SIZE);
  });

  it('removes by id', () => {
    let state = albumListReducer([], { type: 'add', album: mk('1') });
    state = albumListReducer(state, { type: 'add', album: mk('2') });
    state = albumListReducer(state, { type: 'remove', id: '1' });
    expect(state.map((a) => a.id)).toEqual(['2']);
  });

  it('returns the same reference for an unknown action', () => {
    const start = [mk('1')];
    expect(albumListReducer(start, { type: 'noop' })).toBe(start);
  });
});

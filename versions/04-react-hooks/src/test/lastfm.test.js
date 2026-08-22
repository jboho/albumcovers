import { describe, it, expect } from 'vitest';
import { isUsable, normalizeAlbum, normalizeAlbums, buildSearchUrl } from '../lib/lastfm';

const img = (text) => ({ '#text': text, size: 'x' });
const match = (over = {}) => ({
  name: 'Kind of Blue',
  artist: 'Miles Davis',
  mbid: 'm1',
  image: [img('s'), img('m'), img('L')],
  ...over,
});

describe('isUsable', () => {
  it('accepts a match with an id and a medium cover', () => {
    expect(isUsable(match())).toBe(true);
  });

  it('rejects a match without an mbid', () => {
    expect(isUsable(match({ mbid: '' }))).toBe(false);
  });

  it('rejects a match without a medium cover', () => {
    expect(isUsable(match({ image: [img('s'), img('m'), img('')] }))).toBe(false);
  });
});

describe('normalizeAlbum', () => {
  it('maps to the app shape and strips single quotes', () => {
    const normalized = normalizeAlbum(match({ name: "Kind o' Blue", artist: "O'Jays" }));
    expect(normalized).toEqual({ id: 'm1', name: 'Kind o Blue', artist: 'OJays', image: 'L' });
  });
});

describe('normalizeAlbums', () => {
  it('filters out unusable matches and normalizes the rest', () => {
    const albums = normalizeAlbums([
      match(),
      match({ mbid: '' }),
      match({ image: [img('s'), img('m'), img('')] }),
    ]);
    expect(albums).toEqual([{ id: 'm1', name: 'Kind of Blue', artist: 'Miles Davis', image: 'L' }]);
  });

  it('returns an empty array for nullish input', () => {
    expect(normalizeAlbums(undefined)).toEqual([]);
    expect(normalizeAlbums(null)).toEqual([]);
  });

  it('dedupes matches sharing an mbid, keeping the first', () => {
    const albums = normalizeAlbums([
      match({ name: 'First', mbid: 'dup' }),
      match({ name: 'Second', mbid: 'dup' }),
    ]);
    expect(albums).toHaveLength(1);
    expect(albums[0].name).toBe('First');
  });
});

describe('buildSearchUrl', () => {
  it('encodes the term and key into the album.search query', () => {
    const url = buildSearchUrl('miles davis', 'test-key');
    expect(url.searchParams.get('method')).toBe('album.search');
    expect(url.searchParams.get('album')).toBe('miles davis');
    expect(url.searchParams.get('api_key')).toBe('test-key');
    expect(url.searchParams.get('format')).toBe('json');
    expect(url.searchParams.get('limit')).toBe('20');
  });
});

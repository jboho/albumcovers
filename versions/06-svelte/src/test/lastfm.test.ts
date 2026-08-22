import { describe, it, expect } from 'vitest';
import { normalizeMatches, isUsable, normalize } from '../lib/lastfm';
import type { LastFmAlbumMatch } from '../lib/types';

const img = (text: string) => ({ '#text': text, size: 'x' });

const match = (over: Partial<LastFmAlbumMatch>): LastFmAlbumMatch => ({
  name: 'Album',
  artist: 'Artist',
  mbid: 'id',
  image: [img('s'), img('m'), img('L')],
  ...over,
});

describe('isUsable', () => {
  it('keeps matches with an id and a medium cover', () => {
    expect(isUsable(match({}))).toBe(true);
  });

  it('drops matches without an mbid', () => {
    expect(isUsable(match({ mbid: '' }))).toBe(false);
  });

  it('drops matches without a medium cover', () => {
    expect(isUsable(match({ image: [img('s'), img('m'), img('')] }))).toBe(false);
  });
});

describe('normalize', () => {
  it('maps mbid to id and strips single quotes from name and artist', () => {
    const album = normalize(
      match({ name: "Kind o' Blue", artist: "Miles' Davis", mbid: '1', image: [img('s'), img('m'), img('L')] }),
    );
    expect(album).toEqual({ id: '1', name: 'Kind o Blue', artist: 'Miles Davis', image: 'L' });
  });
});

describe('normalizeMatches', () => {
  it('filters unusable matches and normalizes the rest', () => {
    const albums = normalizeMatches([
      match({ name: "Kind o' Blue", artist: 'Miles Davis', mbid: '1' }),
      match({ name: 'No MBID', mbid: '' }),
      match({ name: 'No Cover', mbid: '2', image: [img('s'), img('m'), img('')] }),
    ]);
    expect(albums).toEqual([{ id: '1', name: 'Kind o Blue', artist: 'Miles Davis', image: 'L' }]);
  });

  it('returns an empty array for no matches', () => {
    expect(normalizeMatches([])).toEqual([]);
  });

  it('dedupes matches sharing an mbid, keeping the first', () => {
    const albums = normalizeMatches([
      match({ name: 'First', mbid: 'dup' }),
      match({ name: 'Second', mbid: 'dup' }),
    ]);
    expect(albums).toHaveLength(1);
    expect(albums[0].name).toBe('First');
  });
});

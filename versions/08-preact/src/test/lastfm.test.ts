import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchAlbums,
  normalizeMatches,
  isUsable,
  normalize,
  MissingApiKeyError,
} from '../lib/lastfm';
import type { LastFmAlbumMatch } from '../types';

const img = (text: string) => ({ '#text': text, size: 'x' });
const match = (over: Partial<LastFmAlbumMatch>): LastFmAlbumMatch => ({
  name: 'n',
  artist: 'a',
  mbid: 'id',
  image: [img('s'), img('m'), img('L')],
  ...over,
});

describe('isUsable', () => {
  it('keeps matches with an id and a medium cover', () => {
    expect(isUsable(match({}))).toBe(true);
  });

  it('drops matches missing an mbid', () => {
    expect(isUsable(match({ mbid: '' }))).toBe(false);
  });

  it('drops matches missing the medium cover url', () => {
    expect(isUsable(match({ image: [img('s'), img('m'), img('')] }))).toBe(false);
  });
});

describe('normalize', () => {
  it('maps mbid -> id, keeps the third image, and strips single quotes', () => {
    const out = normalize(match({ name: "Kind o' Blue", artist: "O'Brien", mbid: '7' }));
    expect(out).toEqual({ id: '7', name: 'Kind o Blue', artist: 'OBrien', image: 'L' });
  });
});

describe('normalizeMatches', () => {
  it('filters unusable matches then normalizes the rest', () => {
    const out = normalizeMatches([
      match({ name: "Kind o' Blue", artist: 'Miles Davis', mbid: '1' }),
      match({ mbid: '' }),
      match({ mbid: '2', image: [img('s'), img('m'), img('')] }),
    ]);
    expect(out).toEqual([{ id: '1', name: 'Kind o Blue', artist: 'Miles Davis', image: 'L' }]);
  });

  it('dedupes matches sharing an mbid, keeping the first', () => {
    const out = normalizeMatches([
      match({ name: 'First', mbid: 'dup' }),
      match({ name: 'Second', mbid: 'dup' }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('First');
  });
});

describe('searchAlbums', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_LASTFM_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('drops matches without an id or medium cover and normalizes the rest', async () => {
    const payload = {
      results: {
        albummatches: {
          album: [
            match({ name: "Kind o' Blue", artist: 'Miles Davis', mbid: '1' }),
            match({ mbid: '' }),
            match({ mbid: '2', image: [img('s'), img('m'), img('')] }),
          ],
        },
      },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200 }),
    );

    const albums = await searchAlbums('blue');
    expect(albums).toEqual([{ id: '1', name: 'Kind o Blue', artist: 'Miles Davis', image: 'L' }]);
  });

  it('returns an empty array when the API reports no matches', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ results: { albummatches: { album: [] } } }), { status: 200 }),
    );
    await expect(searchAlbums('zzz')).resolves.toEqual([]);
  });

  it('throws when the API key is missing', async () => {
    vi.stubEnv('VITE_LASTFM_API_KEY', '');
    await expect(searchAlbums('x')).rejects.toBeInstanceOf(MissingApiKeyError);
  });

  it('throws on a non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));
    await expect(searchAlbums('x')).rejects.toThrow(/500/);
  });
});

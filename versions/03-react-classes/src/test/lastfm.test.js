import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  normalizeSearchResponse,
  isUsable,
  searchAlbums,
  MissingApiKeyError,
} from '../lib/lastfm';

const img = (text) => ({ '#text': text, size: 'x' });

const match = (over = {}) => ({
  name: 'Kind of Blue',
  artist: 'Miles Davis',
  mbid: '1',
  image: [img('s'), img('m'), img('L')],
  ...over,
});

describe('isUsable', () => {
  it('requires both an mbid and a medium (image[2]) cover', () => {
    expect(isUsable(match())).toBe(true);
    expect(isUsable(match({ mbid: '' }))).toBe(false);
    expect(isUsable(match({ image: [img('s'), img('m'), img('')] }))).toBe(false);
    expect(isUsable(match({ image: [img('s')] }))).toBe(false);
  });
});

describe('normalizeSearchResponse', () => {
  it('drops unusable matches and normalizes the rest (single-quotes stripped)', () => {
    const json = {
      results: {
        albummatches: {
          album: [
            match({ name: "Kind o' Blue", artist: "Mile's Davis", mbid: '1' }),
            match({ name: 'No MBID', mbid: '' }),
            match({ name: 'No Cover', mbid: '2', image: [img('s'), img('m'), img('')] }),
          ],
        },
      },
    };

    expect(normalizeSearchResponse(json)).toEqual([
      { id: '1', name: 'Kind o Blue', artist: 'Miles Davis', image: 'L' },
    ]);
  });

  it('returns an empty array for a payload with no matches', () => {
    expect(normalizeSearchResponse({ results: { albummatches: { album: [] } } })).toEqual([]);
  });

  it('returns an empty array for a malformed payload', () => {
    expect(normalizeSearchResponse({})).toEqual([]);
    expect(normalizeSearchResponse(null)).toEqual([]);
  });

  it('dedupes matches sharing an mbid, keeping the first', () => {
    const json = {
      results: {
        albummatches: {
          album: [match({ name: 'First', mbid: 'dup' }), match({ name: 'Second', mbid: 'dup' })],
        },
      },
    };
    const albums = normalizeSearchResponse(json);
    expect(albums).toHaveLength(1);
    expect(albums[0].name).toBe('First');
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

  it('fetches, then normalizes the response', async () => {
    const json = { results: { albummatches: { album: [match()] } } };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(json), { status: 200 }),
    );

    await expect(searchAlbums('blue')).resolves.toEqual([
      { id: '1', name: 'Kind of Blue', artist: 'Miles Davis', image: 'L' },
    ]);
  });

  it('throws MissingApiKeyError when the key is absent', async () => {
    vi.stubEnv('VITE_LASTFM_API_KEY', '');
    await expect(searchAlbums('x')).rejects.toBeInstanceOf(MissingApiKeyError);
  });

  it('throws on a non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 500 }));
    await expect(searchAlbums('x')).rejects.toThrow(/500/);
  });
});

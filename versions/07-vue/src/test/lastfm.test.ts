import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  searchAlbums,
  parseSearchResponse,
  normalize,
  isUsable,
  MissingApiKeyError,
} from '../lib/lastfm';
import type { LastFmAlbumMatch } from '../types';

const img = (text: string) => ({ '#text': text, size: 'x' });
const match = (over: Partial<LastFmAlbumMatch> = {}): LastFmAlbumMatch => ({
  name: 'Album',
  artist: 'Artist',
  mbid: '1',
  image: [img('s'), img('m'), img('L')],
  ...over,
});

describe('isUsable', () => {
  it('rejects a match with no mbid', () => {
    expect(isUsable(match({ mbid: '' }))).toBe(false);
  });

  it('rejects a match with no medium cover', () => {
    expect(isUsable(match({ image: [img('s'), img('m'), img('')] }))).toBe(false);
  });

  it('accepts a match with an id and cover', () => {
    expect(isUsable(match())).toBe(true);
  });
});

describe('normalize', () => {
  it('maps mbid to id and strips single quotes from name and artist', () => {
    const out = normalize(match({ name: "Kind o' Blue", artist: "O'Jays", mbid: '42' }));
    expect(out).toEqual({ id: '42', name: 'Kind o Blue', artist: 'OJays', image: 'L' });
  });
});

describe('parseSearchResponse', () => {
  it('drops unusable matches and normalizes the rest', () => {
    const albums = parseSearchResponse({
      results: {
        albummatches: {
          album: [
            match({ name: "Kind o' Blue", artist: 'Miles Davis', mbid: '1' }),
            match({ name: 'No MBID', mbid: '' }),
            match({ name: 'No Cover', mbid: '2', image: [img('s'), img('m'), img('')] }),
          ],
        },
      },
    });
    expect(albums).toEqual([{ id: '1', name: 'Kind o Blue', artist: 'Miles Davis', image: 'L' }]);
  });

  it('returns an empty array when there are no matches', () => {
    expect(parseSearchResponse({ results: { albummatches: { album: [] } } })).toEqual([]);
  });

  it('returns an empty array for a malformed payload', () => {
    expect(parseSearchResponse({})).toEqual([]);
  });

  it('dedupes matches sharing an mbid, keeping the first', () => {
    const albums = parseSearchResponse({
      results: {
        albummatches: {
          album: [match({ name: 'First', mbid: 'dup' }), match({ name: 'Second', mbid: 'dup' })],
        },
      },
    });
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

  it('fetches, filters and normalizes', async () => {
    const payload = {
      results: { albummatches: { album: [match({ name: 'A', mbid: '1' })] } },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200 }),
    );
    await expect(searchAlbums('a')).resolves.toEqual([
      { id: '1', name: 'A', artist: 'Artist', image: 'L' },
    ]);
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

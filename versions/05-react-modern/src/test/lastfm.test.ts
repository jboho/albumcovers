import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchAlbums, MissingApiKeyError } from '../lib/lastfm';

const img = (text: string) => ({ '#text': text, size: 'x' });

beforeEach(() => {
  vi.stubEnv('VITE_LASTFM_API_KEY', 'test-key');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('searchAlbums', () => {
  it('drops matches without an id or medium cover and normalizes the rest', async () => {
    const payload = {
      results: {
        albummatches: {
          album: [
            { name: "Kind o' Blue", artist: 'Miles Davis', mbid: '1', image: [img('s'), img('m'), img('L')] },
            { name: 'No MBID', artist: 'x', mbid: '', image: [img('s'), img('m'), img('L')] },
            { name: 'No Cover', artist: 'y', mbid: '2', image: [img('s'), img('m'), img('')] },
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

  it('dedupes matches sharing an mbid, keeping the first', async () => {
    const payload = {
      results: {
        albummatches: {
          album: [
            { name: 'First', artist: 'x', mbid: 'dup', image: [img('s'), img('m'), img('L')] },
            { name: 'Second', artist: 'y', mbid: 'dup', image: [img('s'), img('m'), img('L')] },
          ],
        },
      },
    };
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(payload), { status: 200 }),
    );
    const albums = await searchAlbums('dup');
    expect(albums).toHaveLength(1);
    expect(albums[0].name).toBe('First');
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

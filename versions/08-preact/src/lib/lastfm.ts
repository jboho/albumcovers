import type { Album, LastFmAlbumMatch, LastFmSearchResponse } from '../types';

const API_ROOT = 'https://ws.audioscrobbler.com/2.0/';

export class MissingApiKeyError extends Error {
  constructor() {
    super('VITE_LASTFM_API_KEY is not set. Copy .env.example to .env and add a key.');
    this.name = 'MissingApiKeyError';
  }
}

/** A Last.fm match is usable only if it has a stable id and a medium-sized cover. */
export const isUsable = (a: LastFmAlbumMatch): boolean =>
  Boolean(a.mbid && a.image?.[2]?.['#text']);

export const normalize = (a: LastFmAlbumMatch): Album => ({
  id: a.mbid,
  name: a.name.replace(/'/g, ''),
  artist: a.artist.replace(/'/g, ''),
  image: a.image[2]['#text'],
});

/** Pure transform from raw matches to the display-ready, deduped-by-shape album list. */
export const normalizeMatches = (matches: LastFmAlbumMatch[]): Album[] => {
  const albums = matches.filter(isUsable).map(normalize);
  // Last.fm can return several matches sharing one mbid (e.g. "pink floyd");
  // dedupe by id (keep first) so Preact render keys stay unique.
  const seen = new Set<string>();
  return albums.filter((album) => {
    if (seen.has(album.id)) return false;
    seen.add(album.id);
    return true;
  });
};

export async function searchAlbums(term: string, signal?: AbortSignal): Promise<Album[]> {
  const apiKey = import.meta.env.VITE_LASTFM_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();

  const url = new URL(API_ROOT);
  url.search = new URLSearchParams({
    method: 'album.search',
    album: term,
    api_key: apiKey,
    format: 'json',
    limit: '20',
  }).toString();

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Last.fm request failed with ${response.status}`);
  }

  const json = (await response.json()) as LastFmSearchResponse;
  const matches = json.results?.albummatches?.album ?? [];
  return normalizeMatches(matches);
}

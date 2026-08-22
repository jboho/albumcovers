export const API_ROOT = 'https://ws.audioscrobbler.com/2.0/';

export class MissingApiKeyError extends Error {
  constructor() {
    super('VITE_LASTFM_API_KEY is not set. Copy .env.example to .env and add a key.');
    this.name = 'MissingApiKeyError';
  }
}

/** A Last.fm match is usable only if it has a stable id and a medium-sized cover. */
export function isUsable(album) {
  return Boolean(album && album.mbid && album.image && album.image[2] && album.image[2]['#text']);
}

export function normalizeAlbum(album) {
  return {
    id: album.mbid,
    name: album.name.replace(/'/g, ''),
    artist: album.artist.replace(/'/g, ''),
    image: album.image[2]['#text'],
  };
}

/** Filter out unusable matches and normalize the rest. Pure — unit-tested. */
export function normalizeAlbums(matches) {
  const albums = (matches || []).filter(isUsable).map(normalizeAlbum);
  // Last.fm can return several matches sharing one mbid (e.g. "pink floyd");
  // dedupe by id (keep first) so React render keys stay unique.
  const seen = new Set();
  return albums.filter((album) => {
    if (seen.has(album.id)) return false;
    seen.add(album.id);
    return true;
  });
}

export function buildSearchUrl(term, apiKey) {
  const url = new URL(API_ROOT);
  url.search = new URLSearchParams({
    method: 'album.search',
    album: term,
    api_key: apiKey,
    format: 'json',
    limit: '20',
  }).toString();
  return url;
}

import * as types from './types';
import { API_ROOT, LASTFM_API_KEY } from '../constants';

const normalizeAlbum = album => ({
  id: album.mbid,
  name: album.name.replace(/'/g, ''),
  artist: album.artist.replace(/'/g, ''),
  image: album.image[2] && album.image[2]['#text'],
});

export const fetchAlbums = searchTerm => dispatch => {
  dispatch({ type: types.FETCH_ALBUMS_PENDING });
  const query = `${API_ROOT}?method=album.search&album=${searchTerm}&api_key=${LASTFM_API_KEY}&format=json&limit=20`;
  return fetch(query)
    .then(response => response.json())
    .then(rawJson => {
      const matches = rawJson.results.albummatches.album;
      const normalized = matches
        .filter(album => album.mbid && album.image[2] && album.image[2]['#text'])
        .map(normalizeAlbum);
      // Last.fm can return several matches sharing one mbid (e.g. "pink floyd");
      // dedupe by id (keep first) so React render keys stay unique.
      const seen = new Set();
      const albums = normalized.filter(album => {
        if (seen.has(album.id)) return false;
        seen.add(album.id);
        return true;
      });
      dispatch({ type: types.FETCH_ALBUMS_SUCCESS, payload: albums });
    })
    .catch(err => {
      dispatch({ type: types.FETCH_ALBUMS_REJECTED, payload: { message: err.message } });
    });
};

export const addAlbum = album => ({ type: types.ADD_ALBUM, payload: { album } });

export const removeAlbum = id => ({ type: types.REMOVE_ALBUM, payload: { id } });

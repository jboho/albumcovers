export interface Album {
  id: string;
  name: string;
  artist: string;
  image: string;
}

/** Shape of a single album match as returned by the Last.fm album.search endpoint. */
export interface LastFmAlbumMatch {
  name: string;
  artist: string;
  mbid: string;
  image: { '#text': string; size: string }[];
}

export interface LastFmSearchResponse {
  results?: {
    albummatches?: {
      album?: LastFmAlbumMatch[];
    };
  };
}

import { useMemo } from 'react';
import { useAlbumSearch } from '../hooks/useAlbumSearch';
import { useAlbumList } from '../store/AlbumListContext';
import { SearchResultAlbum } from './SearchResultAlbum';

export function SearchResults({ term }) {
  const { albums, loading, error } = useAlbumSearch(term);
  const { topAlbumList } = useAlbumList();

  const listedIds = useMemo(() => new Set(topAlbumList.map((a) => a.id)), [topAlbumList]);
  const visible = useMemo(
    () => albums.filter((a) => !listedIds.has(a.id)),
    [albums, listedIds],
  );

  return (
    <section id="searchResults" className="album-search-results">
      {loading && (
        <span className="loading">
          <span className="loader" />
        </span>
      )}

      {error && <p className="alert">{error.message}</p>}

      {!loading && !error && term && albums.length === 0 && (
        <p className="alert">No results were found. Please try another search</p>
      )}

      {visible.map((album) => (
        <SearchResultAlbum key={album.id} album={album} />
      ))}
    </section>
  );
}

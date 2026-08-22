import { useMemo } from 'react';
import { useAlbumSearch } from '../hooks/useAlbumSearch';
import { useAlbumStore } from '../store/useAlbumStore';
import { SearchResultAlbum } from './SearchResultAlbum';

interface SearchResultsProps {
  term: string;
}

export function SearchResults({ term }: SearchResultsProps) {
  const { data, isFetching, isError, error } = useAlbumSearch(term);
  const topAlbumList = useAlbumStore((s) => s.topAlbumList);

  const listedIds = useMemo(() => new Set(topAlbumList.map((a) => a.id)), [topAlbumList]);
  const visible = (data ?? []).filter((a) => !listedIds.has(a.id));

  return (
    <section id="searchResults" className="album-search-results">
      {isFetching && (
        <span className="loading">
          <span className="loader" />
        </span>
      )}

      {isError && <p className="alert">{(error as Error).message}</p>}

      {!isFetching && !isError && data?.length === 0 && (
        <p className="alert">No results were found. Please try another search</p>
      )}

      {visible.map((album) => (
        <SearchResultAlbum key={album.id} album={album} />
      ))}
    </section>
  );
}

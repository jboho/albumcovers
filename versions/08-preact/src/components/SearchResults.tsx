import {
  searchLoading,
  searchError,
  searchResults,
  visibleResults,
  hasSearched,
} from '../store/search';
import { SearchResultAlbum } from './SearchResultAlbum';

export function SearchResults() {
  const loading = searchLoading.value;
  const error = searchError.value;
  // "No results" only after a real search that returned zero raw matches —
  // mirrors v05, which keys the message off the fetched (not filtered) length.
  const noResults =
    hasSearched.value && !loading && !error && searchResults.value.length === 0;

  return (
    <section id="searchResults" className="album-search-results">
      {loading && (
        <span className="loading">
          <span className="loader" />
        </span>
      )}

      {error && <p className="alert">{error}</p>}

      {noResults && <p className="alert">No results were found. Please try another search</p>}

      {visibleResults.value.map((album) => (
        <SearchResultAlbum key={album.id} album={album} />
      ))}
    </section>
  );
}

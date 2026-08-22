import React from 'react';
import PropTypes from 'prop-types';
import SearchResultAlbum from './SearchResultAlbum';
import { albumShape } from './albumShape';

export default class SearchResults extends React.Component {
  render() {
    const { results, loading, error, hasSearched, listedIds, isFull, onAdd } = this.props;
    const visible = results.filter((a) => !listedIds.has(a.id));

    return (
      <section id="searchResults" className="album-search-results">
        {loading && (
          <span className="loading">
            <span className="loader" />
          </span>
        )}

        {!loading && error && <p className="alert">{error}</p>}

        {!loading && !error && hasSearched && results.length === 0 && (
          <p className="alert">No results were found. Please try another search</p>
        )}

        {!loading &&
          !error &&
          visible.map((album) => (
            <SearchResultAlbum key={album.id} album={album} isFull={isFull} onAdd={onAdd} />
          ))}
      </section>
    );
  }
}

SearchResults.propTypes = {
  results: PropTypes.arrayOf(albumShape).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  hasSearched: PropTypes.bool.isRequired,
  listedIds: PropTypes.instanceOf(Set).isRequired,
  isFull: PropTypes.bool.isRequired,
  onAdd: PropTypes.func.isRequired,
};

SearchResults.defaultProps = {
  error: null,
};

import React, { memo } from 'react';
import { connect } from 'react-redux';
import SearchResultAlbum from './SearchResultAlbum';

const SearchResults = ({ cachedResults }) => (
  <section id="searchResults" className="album-search-results">
    {cachedResults.map(album => <SearchResultAlbum key={album.id} album={album} />)}
  </section>
);

const mapStateToProps = state => ({
  cachedResults: state.session.cachedResults,
});

export default connect(mapStateToProps)(memo(SearchResults));

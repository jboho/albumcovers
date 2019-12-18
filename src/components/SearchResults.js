import React, { memo } from 'react';
import Album from './Album';

const SearchResults = props => (
  <section id="searchResults" className="album-search-results">
    {props.albumList.map(album => <Album key={album.id} data={album} />)}
  </section>
);

export default memo(SearchResults);

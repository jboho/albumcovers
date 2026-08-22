import React from 'react';
import { connect } from 'react-redux';
import '../index.css';

import AlbumList from '../components/AlbumList';
import SearchResults from '../components/SearchResults';
import { fetchAlbums } from '../actions';

const handleSearch = onSearch => () => {
  const { value } = document.getElementById('searchAlbumCovers');
  value.trim() && onSearch(value.trim());
};

const handleKeyDown = onSearch => e => {
  e.key === 'Enter' && handleSearch(onSearch)();
};

const App = ({ onSearch }) => (
  <div id="mainContainer" className="container">
    <section id="albumCounter" className="album-list-counter">You have selected <span className="count">1 album</span>.
      <button type="button" id="toggleListButton" className="button button-sm button-neutral">View Your List</button>
    </section>
    <section className="main">
      <div className="explainer">
        <h1>Top <span className="brand-primary">10</span> Favorite Album List Builder</h1>
        <p className="lead">Create your own Top 10 List of the all-time greatest albums by beginning with your search below.</p>
      </div>
      <div className="search-group">
        <input
          type="search"
          className="search-input"
          id="searchAlbumCovers"
          name="searchAlbumCovers"
          placeholder="Enter an album or artist name ..."
          onKeyDown={handleKeyDown(onSearch)}
        />
        <span className="search-group-btn">
          <button className="button button-primary" id="searchButton" type="button" onClick={handleSearch(onSearch)}>Go!</button>
        </span>
      </div>
    </section>

    <SearchResults />

    <AlbumList />
  </div>
);

const mapDispatchToProps = dispatch => ({
  onSearch: searchTerm => dispatch(fetchAlbums(searchTerm)),
});

export default connect(null, mapDispatchToProps)(App);

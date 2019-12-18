import React from 'react';
import '../scss/index.scss';

import AlbumList from '../components/AlbumList';

const App = () => {
  return (
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
          />
          <span className="search-group-btn">
            <button className="button button-primary" id="searchButton" type="button">Go!</button>
          </span>
        </div>
      </section>

      <section id="searchResults" className="album-search-results">

      </section>

      <AlbumList />

    </div>
  );
};

export default App;

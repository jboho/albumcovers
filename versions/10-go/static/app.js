'use strict';

// Client for the Go-backed build. Search hits the LOCAL /api/search endpoint,
// which returns already-normalized {id, name, artist, image} objects — the
// Last.fm API key lives server-side and never reaches this file. All list,
// counter, drawer, and localStorage behavior matches the other versions.
const AlbumSearcher = (function () {
  const MAX_LIST_SIZE = 10;
  const STORAGE_KEY = 'albumList';

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  const module = {
    // elements
    mainContainer:    document.querySelector('#mainContainer'),
    albumCounter:     document.querySelector('#albumCounter'),
    albums:           document.querySelector('#searchResults'),
    search:           document.querySelector('#searchAlbumCovers'),
    searchButton:     document.querySelector('#searchButton'),
    toggleListButton: document.querySelector('#toggleListButton'),
    listWrapper:      document.querySelector('#listWrapper'),

    // state
    topAlbumList: [],     // array of {id, name, artist, image}
    cachedResults: [],    // last search results (already normalized by server)
    cachedSearchTerm: '',

    hasStorage: (function () {
      try {
        window.localStorage.setItem('__probe__', '1');
        window.localStorage.removeItem('__probe__');
        return true;
      } catch (e) {
        return false;
      }
    }()),

    // setup

    hydrate: function () {
      if (!this.hasStorage) return;
      try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(stored) && stored.length > 0) {
          this.topAlbumList = stored;
        }
      } catch (e) {
        // Corrupt storage: start clean rather than crash.
      }
    },

    addListeners: function () {
      this.albums.addEventListener('click', (e) => this.onResultsClick(e), false);
      this.listWrapper.addEventListener('click', (e) => this.onListClick(e), false);
      this.search.addEventListener('keydown', (e) => this.keyHandler(e), false);
      this.searchButton.addEventListener('click', () => this.searchButtonHandler(), false);
      this.toggleListButton.addEventListener('click', () => this.toggleAlbumList(), false);
    },

    reset: function () {
      this.mainContainer.classList.remove('counter-active', 'list-active');
      document.body.classList.remove('no-scroll');
      this.toggleListButton.innerHTML = 'View Your List';
    },

    // overlay reveal / result interactions

    onResultsClick: function (e) {
      const addButton = e.target.closest('.add-to-list');
      if (addButton) {
        e.stopPropagation();
        if (!addButton.disabled) this.addAlbumToList(addButton);
        return;
      }
      const closeButton = e.target.closest('.close-button, .close-content');
      if (closeButton) {
        e.stopPropagation();
        const slide = closeButton.closest('.album-slide');
        if (slide) slide.classList.remove('active');
        return;
      }
      const slide = e.target.closest('.album-slide');
      if (slide) slide.classList.add('active');
    },

    onListClick: function (e) {
      const removeButton = e.target.closest('.remove-from-list');
      if (removeButton) this.removeAlbumFromList(removeButton.id);
    },

    // list mutations

    addAlbumToList: function (button) {
      if (this.topAlbumList.length >= MAX_LIST_SIZE) return;
      const album = JSON.parse(button.getAttribute('data-album'));
      if (this.isAlbumInList(album.id)) return;
      this.topAlbumList.push(album);
      this.render();
    },

    removeAlbumFromList: function (id) {
      this.topAlbumList = this.topAlbumList.filter((album) => album.id !== id);
      this.render();
    },

    isAlbumInList: function (id) {
      return this.topAlbumList.some((album) => album.id === id);
    },

    // counter + drawer

    updateListCounter: function () {
      if (!this.topAlbumList.length) {
        this.reset();
        return;
      }
      const counterText = this.albumCounter.querySelector('.count');
      this.mainContainer.classList.add('counter-active');
      counterText.innerHTML =
        this.topAlbumList.length === 1 ? '1 album' : `${this.topAlbumList.length} albums`;
    },

    toggleAlbumList: function () {
      if (this.mainContainer.classList.contains('list-active')) {
        this.mainContainer.classList.remove('list-active');
        this.toggleListButton.innerHTML = 'View Your List';
        document.body.classList.remove('no-scroll');
      } else {
        setTimeout(() => window.scrollTo(0, 0), 300);
        this.mainContainer.classList.add('list-active');
        this.toggleListButton.innerHTML = 'Hide List';
        document.body.classList.add('no-scroll');
      }
    },

    // DOM writers

    generateAlbumList: function () {
      const markup = this.topAlbumList.map((album) => `
        <div class="flex-item">
          <div class="album-slide">
            <img class="album-image" src="${escapeHtml(album.image)}" alt="${escapeHtml(album.name)}" />
            <div class="album-info below">
              <div class="album-info-box">
                <h4>${escapeHtml(album.name)}</h4>
                <p class="artist">${escapeHtml(album.artist)}</p>
                <button class="remove-from-list button button-secondary button-small" id="${escapeHtml(album.id)}">Remove</button>
              </div>
            </div>
          </div>
        </div>`);
      this.listWrapper.innerHTML = markup.join('');
    },

    generateSearchResults: function () {
      const isFull = this.topAlbumList.length >= MAX_LIST_SIZE;
      const markup = this.cachedResults
        .filter((album) => !this.isAlbumInList(album.id))
        .map((album) => {
          const data = escapeHtml(JSON.stringify(album));
          return `
            <div class="flex-item">
              <div class="album-slide">
                <img class="album-image" src="${escapeHtml(album.image)}" alt="${escapeHtml(album.name)}" />
                <div class="album-info overlay">
                  <a class="close-button"><span class="icon close-content"></span></a>
                  <div class="album-info-box">
                    <h4>${escapeHtml(album.name)}</h4>
                    <p class="artist">${escapeHtml(album.artist)}</p>
                    <button class="add-to-list button button-secondary" data-album="${data}" id="${escapeHtml(album.id)}"${isFull ? ' disabled' : ''}>${isFull ? 'List Full' : 'Add To List'}</button>
                  </div>
                </div>
              </div>
            </div>`;
        });
      this.albums.innerHTML = markup.join('');
    },

    // search

    keyHandler: function (e) {
      if (e.key === 'Enter') {
        const term = this.search.value;
        if (term) this.findAlbums(term);
      }
    },

    searchButtonHandler: function () {
      const term = this.search.value;
      if (term) this.findAlbums(term);
    },

    findAlbums: function (searchTerm) {
      this.cachedSearchTerm = searchTerm;
      this.albums.innerHTML = '<span class="loading"><span class="loader"></span></span>';

      fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`)
        .then((response) => {
          if (!response.ok) throw new Error(`search failed with ${response.status}`);
          return response.json();
        })
        .then((results) => {
          if (!Array.isArray(results) || results.length === 0) {
            this.albums.innerHTML =
              '<p class="alert">No results were found. Please try another search</p>';
            this.cachedResults = [];
            return;
          }
          this.cachedResults = results;
          this.generateSearchResults();
        })
        .catch((err) => {
          this.albums.innerHTML = '<p class="alert">Search failed. Please try again.</p>';
          console.error(err);
        });
    },

    // storage + render

    updateLocalStorage: function () {
      if (!this.hasStorage) return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.topAlbumList));
    },

    render: function () {
      this.updateListCounter();
      this.updateLocalStorage();
      this.generateAlbumList();
      if (this.cachedResults.length) this.generateSearchResults();
    },

    init: function () {
      this.hydrate();
      this.addListeners();
      this.updateListCounter();
      this.generateAlbumList();
    },
  };

  return module;
}());

AlbumSearcher.init();

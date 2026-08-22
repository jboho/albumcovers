'use strict';

// Adapted from versions/01-vanilla-js/album-searcher.js. The ONLY behavioral
// change is data fetching: search now hits the local FastAPI proxy at
// /api/search, which returns albums already normalized + filtered as JSON.
// The Last.fm API key lives server-side only and never reaches this file.

const AlbumSearcher = (function () {

  var module = {

    // constants and elements

    SEARCH_ENDPOINT:   '/api/search',
    mainContainer:     document.querySelector('#mainContainer'),
    albumCounter:      document.querySelector('#albumCounter'),
    albums:            document.querySelector('#searchResults'),
    search:            document.querySelector('#searchAlbumCovers'),
    searchButton:      document.querySelector('#searchButton'),
    searchInput:       document.querySelector('#searchAlbumCovers'),
    toggleListButton:  document.querySelector('#toggleListButton'),
    listWrapper:       document.querySelector('#listWrapper'),

    // state

    topAlbumList: [],
    cachedResults: [],
    cachedSearchTerm: '',

    // helpers

    findParent: (el, className) => {
      while ((el = el.parentElement) && !el.classList.contains(className));
      return el;
    },

    hasStorage: (function () {
      if (typeof localStorage === 'object') {
        try {
          localStorage.setItem('localStorage', 1);
          localStorage.removeItem('localStorage');
        }
        catch (e) {
          return false;
        }
      } else {
        return false;
      }
      return true;
    }()),

    // setup methods

    hydrate: function () {
      if (!this.hasStorage) {
        return null;
      }
      const storedData = JSON.parse(window.localStorage.getItem('albumList'));
      if (Array.isArray(storedData) && storedData.length > 0) {
        this.topAlbumList = storedData;
      }
    },

    addListeners: function () {
      this.listWrapper.addEventListener('click', e => this.removeAlbumFromList(e), false);
    },

    removeListeners: function () {
      this.albums.removeEventListener('click', e => this.showAlbumInfo(e), false);
      this.listWrapper.removeEventListener('click', e => this.removeAlbumFromList(e), false);
    },

    reset: function () {
      this.mainContainer.classList.remove('counter-active', 'list-active');
      document.body.classList.remove('no-scroll');
      this.toggleListButton.innerHTML = 'View Your List';
    },

    // album info handlers

    showAlbumInfo: function (e) {
      e.stopPropagation();
      this.albums.style.pointerEvents = 'none';
      const { target } = e;
      target.classList.add('active');
      const closeButton = target.querySelector('.close-content');
      if (!closeButton.getAttribute('data-bound')) {
        closeButton.addEventListener('click', e => this.hideAlbumInfo(e), false);
        closeButton.setAttribute('data-bound', true);
      }
      const addAlbumButton = target.querySelector('.add-to-list');
      if (!addAlbumButton.getAttribute('data-bound')) {
        addAlbumButton.addEventListener('click', e => this.addAlbumToList(e), false);
        addAlbumButton.setAttribute('data-bound', true);
      }
    },

    hideAlbumInfo: function (e) {
      e.stopPropagation();
      this.albums.style.pointerEvents = 'auto';
      const closeButton = e.target;
      const albumSlide = this.findParent(closeButton, 'album-slide');
      albumSlide.classList.remove('active');
    },

    // list methods

    addAlbumToList: function (e) {
      e.stopPropagation();
      const { target } = e;
      this.albums.style.pointerEvents = 'auto';
      // List is full; the Add buttons already render disabled ("List Full").
      if (this.topAlbumList.length >= 10) return;
      const album = JSON.parse(target.getAttribute('data-album'));
      this.topAlbumList.push(album);
      this.render();
    },

    removeAlbumFromList: function (e) {
      const { target: { id } } = e;
      this.topAlbumList = this.topAlbumList.filter(album => album.id !== id);
      if (this.cachedSearchTerm) {
        this.findAlbums(this.cachedSearchTerm);
      }
      this.render();
    },

    updateListCounter: function () {
      if (this.topAlbumList.length) {
        const counterText = this.albumCounter.querySelector('.count');
        this.mainContainer.classList.add('counter-active');
        counterText.innerHTML = this.topAlbumList.length === 1 ?
          '1 album' : `${this.topAlbumList.length} albums`;
      } else {
        this.reset();
      }
    },

    toggleAlbumList: function () {
      if (mainContainer.classList.contains('list-active')) {
        mainContainer.classList.remove('list-active');
        toggleListButton.innerHTML = 'View Your List';
        document.body.classList.remove('no-scroll');
      } else {
        setTimeout(() => { window.scrollTo(0,0); }, 300);
        mainContainer.classList.add('list-active');
        toggleListButton.innerHTML = 'Hide List';
        document.body.classList.add('no-scroll');
      }
    },

    // write to DOM

    generateAlbumList: function () {
      if (!this.topAlbumList.length) return;
      let albumArr = [];
      this.topAlbumList.map(albumObj => {
        albumArr.push (
          `<div class="flex-item">
              <div class="album-slide">
                <img class="album-image" src='${albumObj.image}'>
                <div class="album-info below">
                  <div class="album-info-box">
                    <h4>${albumObj.name}</h4>
                    <p class="artist">${albumObj.artist}</p>
                    <button class="remove-from-list button button-secondary button-small" id="${albumObj.id}">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          `
        );
      });
      this.listWrapper.innerHTML = albumArr.join('');
    },

    generateSearchResults: function () {
      if (!this.cachedResults.length) { return null; }
      // Match the other versions: once the list holds 10, the Add buttons on
      // any remaining results render disabled as "List Full".
      const isFull = this.topAlbumList.length >= 10;
      const addButton = dataString => isFull
        ? `<button class="add-to-list button button-secondary" disabled>List Full</button>`
        : `<button class="add-to-list button button-secondary" data-album='${dataString}'>Add To List</button>`;
      let albumArr = [];
      this.cachedResults.map(album => {
        // The server already normalized + filtered (id + medium cover guaranteed).
        const dataString = JSON.stringify(album);
        !this.isAlbumInList(album.id) && albumArr.push (
          `<div class="flex-item">
            <div class="album-slide">
              <img class="album-image" src="${album.image}" />
              <div class="album-info overlay">
                <a class="close-button"><span class="icon close-content"></span></a>
                <div class="album-info-box">
                  <h4>${album.name}</h4>
                  <p class="artist">${album.artist}</p>
                  ${addButton(dataString)}
                </div>
              </div>
            </div>
          </div>`
        );
      })
      this.albums.innerHTML = albumArr.join('');
      this.albums.addEventListener('click', e => this.showAlbumInfo(e), false);
    },

    // search & data methods

    keyHandler: function (e) {
      e.stopPropagation();
      const { value } = document.querySelector('#searchAlbumCovers');
      if (e.key === 'Enter') {
        this.findAlbums(value);
      }
    },

    searchButtonHandler: function (e) {
      e.stopPropagation();
      const { value } = document.querySelector('#searchAlbumCovers');
      value && this.findAlbums(value);
    },

    updateLocalStorage: function () {
      if (!this.hasStorage) return null;
      window.localStorage.setItem('albumList', JSON.stringify(this.topAlbumList));
    },

    isAlbumInList: function (id) {
      if (!id || !this.topAlbumList.length) return false;
      return this.topAlbumList.some(album => album.id === id);
    },

    findAlbums: function (searchTerm) {
      this.cachedSearchTerm = searchTerm;
      this.albums.innerHTML = '<span class="loading"><span class="loader"></span></span>';
      this.albums.removeEventListener('click', e => this.showAlbumInfo(e), false);
      const query = `${this.SEARCH_ENDPOINT}?q=${encodeURIComponent(searchTerm)}`;
      fetch(query)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Search request failed with ${response.status}`);
          }
          return response.json();
        })
        .then(albums => {
          if (!albums.length) {
            this.albums.innerHTML = '<p class="alert">No results were found. Please try another search</p>';
            return;
          }
          this.cachedResults = albums;
          this.generateSearchResults();
        })
        .catch(err => {
          this.albums.innerHTML = '<p class="alert">Search failed. Please try again.</p>';
          console.log(err);
        });
    },

    render: function () {
      this.updateListCounter();
      this.updateLocalStorage();
      this.generateAlbumList();
      this.generateSearchResults();
    },

    init: function () {
      this.hydrate();
      this.addListeners();
      this.updateListCounter();
      this.generateAlbumList();
      this.search.addEventListener('keydown', function (e) { this.keyHandler(e) }.bind(this), false);
      this.searchButton.addEventListener('click', function (e) { this.searchButtonHandler(e) }.bind(this), false);
      this.toggleListButton.addEventListener('click', function (e) { this.toggleAlbumList(e) }.bind(this), false);
    }
  }

  return module;

}());

AlbumSearcher.init();

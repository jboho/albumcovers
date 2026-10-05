'use strict';

const AlbumSearcher = (function () {

  // Last.fm metadata is user-contributed; escape it before it reaches innerHTML.
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  var module = {

    // constants and elements

    API_ROOT:          'http://ws.audioscrobbler.com/2.0/',
    API_KEY:           window.ALBUM_SEARCHER_CONFIG && window.ALBUM_SEARCHER_CONFIG.apiKey,
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
      const { target, target: { id } } = e;
      this.albums.style.pointerEvents = 'auto';
      if (this.topAlbumList.length === 10) {
        // TODO -- modal or something here
        alert('This should be a better alert, but you already have 10 items in your list.');
        return;
      }
      const data = target.getAttribute('data-album');
      this.topAlbumList.push(data);
      // old -- if we kept the item around we'd use this:
      target.disabled = true;
      target.innerHTML = 'Album Added';
      // end ol
      this.render();
    },

    removeAlbumFromList: function (e) {
      const { target, target: { id } } = e;
      const newState = [];
      this.topAlbumList.map((album) => {
        const albumObj = JSON.parse(album);
        albumObj.id !== id ?
          newState.push(album) : null;
      })
      this.topAlbumList = newState;
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
      this.topAlbumList.map(album => {
        const albumObj = JSON.parse(album);
        albumArr.push (
          `<div class="flex-item">
              <div class="album-slide">
                <img class="album-image" src="${escapeHtml(albumObj.image)}">
                <div class="album-info below">
                  <div class="album-info-box">
                    <h4>${escapeHtml(albumObj.name)}</h4>
                    <p class="artist">${escapeHtml(albumObj.artist)}</p>
                    <button class="remove-from-list button button-secondary button-small" id="${escapeHtml(albumObj.id)}">Remove</button>
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
      let albumArr = [];
      // Last.fm can return several matches sharing one mbid (e.g. "pink floyd");
      // dedupe by mbid (keep first) so render ids and cards stay unique.
      const seen = new Set();
      const uniqueResults = this.cachedResults.filter(album => {
        if (!album.mbid) return true;
        if (seen.has(album.mbid)) return false;
        seen.add(album.mbid);
        return true;
      });
      uniqueResults.map(album => {
        if(album.image[2]['#text'] && album.mbid) {
          const data = this.normalizeData(album);
          const dataString = JSON.stringify(data);
          !this.isAlbumInList(album.mbid) && albumArr.push (
            `<div class="flex-item">
              <div class="album-slide">
                <img class="album-image" src="${escapeHtml(album.image[2]['#text'])}" />
                <div class="album-info overlay">
                  <a class="close-button"><span class="icon close-content"></span></a>
                  <div class="album-info-box">
                    <h4>${escapeHtml(album.name)}</h4>
                    <p class="artist">${escapeHtml(album.artist)}</p>
                    <button class="add-to-list button button-secondary" data-album="${escapeHtml(dataString)}" id="${escapeHtml(album.mbid)}">Add To List</button>
                  </div>
                </div>
              </div>
            </div>`
          );
        }
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

    normalizeData: function (album) {
      if (!album) return;
      let newDataObj = {};
      let returnedObj = {};
      newDataObj.id = album.mbid;
      newDataObj.name = album.name.replace(/'/g, '');
      newDataObj.artist = album.artist.replace(/'/g, '');
      newDataObj.image = album.image[2]['#text'];
      return newDataObj;
    },

    updateLocalStorage: function () {
      if (!this.hasStorage) return null;
      window.localStorage.setItem('albumList', JSON.stringify(this.topAlbumList));
    },

    isAlbumInList: function (id) {
      if (!id || !this.topAlbumList.length) return false;
      const val = this.topAlbumList.filter(album => JSON.parse(album).id === id);
      return !!val.length;
    },

    findAlbums: function (searchTerm) {
      this.cachedSearchTerm = searchTerm;
      this.albums.innerHTML = '<span class="loading"><span class="loader"></span></span>';
      this.albums.removeEventListener('click', e => this.showAlbumInfo(e), false);
      let query = `${this.API_ROOT}?method=album.search&album=${searchTerm}&api_key=${this.API_KEY}&format=json&limit=20`;
      fetch(query)
        .then(response => {
          response.json()
            .then(rawJson => {
              if (!rawJson.results.albummatches.album.length) {
                this.albums.innerHTML = '<p class="alert">No results were found. Please try another search</p>';
                return;
              }
              this.cachedResults = rawJson.results.albummatches.album;
              this.generateSearchResults();
            })
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

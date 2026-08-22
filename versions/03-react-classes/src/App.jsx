import React from 'react';
import ListCounter from './components/ListCounter';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import AlbumList from './components/AlbumList';
import { searchAlbums } from './lib/lastfm';
import { addAlbum, removeAlbum, MAX_LIST_SIZE } from './lib/listLogic';

const STORAGE_KEY = 'albumList';

/**
 * Top-level container. All state lives here and flows down via props +
 * callbacks (no Context/Redux). The in-flight search is tracked on the instance
 * so it can be aborted before a new search and on unmount.
 */
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topAlbumList: [],
      results: [],
      loading: false,
      error: null,
      hasSearched: false,
      listOpen: false,
    };
    this.controller = null;
  }

  componentDidMount() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(stored) && stored.length > 0) {
        this.setState({ topAlbumList: stored });
      }
    } catch {
      // Corrupt/unavailable storage — start with an empty list.
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.topAlbumList !== this.state.topAlbumList) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.topAlbumList));
      } catch {
        // Storage unavailable (private mode / quota) — skip persistence.
      }
      if (this.state.topAlbumList.length === 0 && this.state.listOpen) {
        this.setState({ listOpen: false });
        return;
      }
    }

    if (prevState.listOpen !== this.state.listOpen) {
      document.body.classList.toggle('no-scroll', this.state.listOpen);
      if (this.state.listOpen) window.scrollTo(0, 0);
    }
  }

  componentWillUnmount() {
    if (this.controller) this.controller.abort();
    document.body.classList.remove('no-scroll');
  }

  handleSearch = (term) => {
    if (this.controller) this.controller.abort();
    this.controller = new AbortController();
    this.setState({ loading: true, error: null });

    searchAlbums(term, this.controller.signal)
      .then((albums) => {
        this.setState({ results: albums, loading: false, hasSearched: true });
      })
      .catch((err) => {
        if (err && err.name === 'AbortError') return;
        this.setState({ error: err.message, loading: false, hasSearched: true });
      });
  };

  handleAdd = (album) => {
    this.setState((prev) => ({
      topAlbumList: addAlbum(prev.topAlbumList, album, MAX_LIST_SIZE),
    }));
  };

  handleRemove = (id) => {
    this.setState((prev) => ({
      topAlbumList: removeAlbum(prev.topAlbumList, id),
    }));
  };

  handleToggleList = () => {
    this.setState((prev) => ({ listOpen: !prev.listOpen }));
  };

  render() {
    const { topAlbumList, results, loading, error, hasSearched, listOpen } = this.state;
    const count = topAlbumList.length;
    const isFull = count >= MAX_LIST_SIZE;
    const listedIds = new Set(topAlbumList.map((a) => a.id));

    const containerClass = ['container', count > 0 && 'counter-active', listOpen && 'list-active']
      .filter(Boolean)
      .join(' ');

    return (
      <div id="mainContainer" className={containerClass}>
        <ListCounter count={count} listOpen={listOpen} onToggle={this.handleToggleList} />

        <section className="main">
          <div className="explainer">
            <h1>
              Top <span className="brand-primary">10</span> Favorite Album List Builder
            </h1>
            <p className="lead">
              Create your own Top 10 List of the all-time greatest albums by beginning with your
              search below.
            </p>
          </div>
          <SearchBar onSearch={this.handleSearch} />
        </section>

        <SearchResults
          results={results}
          loading={loading}
          error={error}
          hasSearched={hasSearched}
          listedIds={listedIds}
          isFull={isFull}
          onAdd={this.handleAdd}
        />

        <AlbumList albums={topAlbumList} onRemove={this.handleRemove} />
      </div>
    );
  }
}

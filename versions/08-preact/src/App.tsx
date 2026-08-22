import { useEffect, useState } from 'preact/hooks';
import clsx from 'clsx';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { AlbumList } from './components/AlbumList';
import { ListCounter } from './components/ListCounter';
import { listCount } from './store/albumStore';

export function App() {
  const [listOpen, setListOpen] = useState(false);
  const count = listCount.value;

  // No album means nothing to show, so collapse the drawer if the list empties.
  useEffect(() => {
    if (count === 0) setListOpen(false);
  }, [count]);

  // Sync the two DOM side effects of opening the full-screen drawer.
  useEffect(() => {
    document.body.classList.toggle('no-scroll', listOpen);
    if (listOpen) window.scrollTo({ top: 0 });
    return () => document.body.classList.remove('no-scroll');
  }, [listOpen]);

  return (
    <div
      id="mainContainer"
      className={clsx('container', count > 0 && 'counter-active', listOpen && 'list-active')}
    >
      <ListCounter count={count} listOpen={listOpen} onToggle={() => setListOpen((o) => !o)} />

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
        <SearchBar />
      </section>

      <SearchResults />

      <AlbumList />
    </div>
  );
}

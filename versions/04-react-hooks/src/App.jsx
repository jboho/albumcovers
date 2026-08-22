import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { SearchBar } from './components/SearchBar';
import { SearchResults } from './components/SearchResults';
import { AlbumList } from './components/AlbumList';
import { ListCounter } from './components/ListCounter';
import { useAlbumList } from './store/AlbumListContext';

export function App() {
  const [term, setTerm] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const { topAlbumList } = useAlbumList();
  const count = topAlbumList.length;

  // Nothing to show when the list empties, so collapse the drawer.
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
        <SearchBar onSearch={setTerm} />
      </section>

      <SearchResults term={term} />

      <AlbumList />
    </div>
  );
}

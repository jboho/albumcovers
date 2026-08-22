import { useState } from 'react';

/**
 * Controlled input inside a form: onSubmit fires on both Enter and the Go!
 * button (type="submit"), covering the two entry points the vanilla version
 * wired up by hand. The modern version (05) uses a React 19 form action instead.
 */
export function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = value.trim();
    if (term) onSearch(term);
  };

  return (
    <form className="search-group" onSubmit={handleSubmit}>
      <input
        type="search"
        name="q"
        className="search-input"
        placeholder="Enter an album or artist name ..."
        aria-label="Search for an album or artist"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <span className="search-group-btn">
        <button className="button button-primary" type="submit">
          Go!
        </button>
      </span>
    </form>
  );
}

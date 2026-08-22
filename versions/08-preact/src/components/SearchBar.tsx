import { runSearch } from '../store/search';

/**
 * Uncontrolled input read from the form on submit — search fires on the Go!
 * button or the Enter key (native form submission), matching the vanilla app.
 */
export function SearchBar() {
  const onSubmit = (e: Event) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const term = String(new FormData(form).get('q') ?? '').trim();
    if (term) void runSearch(term);
  };

  return (
    <form className="search-group" onSubmit={onSubmit}>
      <input
        type="search"
        name="q"
        className="search-input"
        placeholder="Enter an album or artist name ..."
        aria-label="Search for an album or artist"
      />
      <span className="search-group-btn">
        <button className="button button-primary" type="submit">
          Go!
        </button>
      </span>
    </form>
  );
}

interface SearchBarProps {
  onSearch: (term: string) => void;
}

/**
 * React 19 form action: the submit handler receives the FormData directly, so
 * the input stays uncontrolled — no useState/ref for the field, and React
 * resets it after each search.
 */
export function SearchBar({ onSearch }: SearchBarProps) {
  const submit = (formData: FormData) => {
    const term = String(formData.get('q') ?? '').trim();
    if (term) onSearch(term);
  };

  return (
    <form className="search-group" action={submit}>
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

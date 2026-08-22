interface ListCounterProps {
  count: number;
  listOpen: boolean;
  onToggle: () => void;
}

export function ListCounter({ count, listOpen, onToggle }: ListCounterProps) {
  const label = count === 1 ? '1 album' : `${count} albums`;

  return (
    <section id="albumCounter" className="album-list-counter">
      You have selected <span className="count">{label}</span>.
      <button type="button" className="button button-sm button-neutral" onClick={onToggle}>
        {listOpen ? 'Hide List' : 'View Your List'}
      </button>
    </section>
  );
}

<script lang="ts">
  let { onSearch }: { onSearch: (term: string) => void } = $props();

  let term = $state('');

  function submit(event: SubmitEvent) {
    event.preventDefault();
    const value = term.trim();
    if (value) onSearch(value);
  }
</script>

<form class="search-group" onsubmit={submit}>
  <input
    type="search"
    class="search-input"
    bind:value={term}
    placeholder="Enter an album or artist name ..."
    aria-label="Search for an album or artist"
  />
  <span class="search-group-btn">
    <button class="button button-primary" type="submit">Go!</button>
  </span>
</form>

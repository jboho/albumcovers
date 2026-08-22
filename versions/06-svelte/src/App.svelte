<script lang="ts">
  import { albumList } from './lib/albums.svelte';
  import { AlbumSearch } from './lib/search.svelte';
  import SearchBar from './components/SearchBar.svelte';
  import SearchResults from './components/SearchResults.svelte';
  import AlbumList from './components/AlbumList.svelte';
  import ListCounter from './components/ListCounter.svelte';

  const search = new AlbumSearch();

  let listOpen = $state(false);
  const count = $derived(albumList.count);

  // Nothing to show once the list empties, so collapse the drawer.
  $effect(() => {
    if (count === 0) listOpen = false;
  });

  // Sync the two DOM side effects of opening the full-screen drawer.
  $effect(() => {
    document.body.classList.toggle('no-scroll', listOpen);
    if (listOpen) window.scrollTo({ top: 0 });
    return () => document.body.classList.remove('no-scroll');
  });
</script>

<div
  id="mainContainer"
  class="container"
  class:counter-active={count > 0}
  class:list-active={listOpen}
>
  <ListCounter {count} {listOpen} onToggle={() => (listOpen = !listOpen)} />

  <section class="main">
    <div class="explainer">
      <h1>Top <span class="brand-primary">10</span> Favorite Album List Builder</h1>
      <p class="lead">
        Create your own Top 10 List of the all-time greatest albums by beginning with your search
        below.
      </p>
    </div>
    <SearchBar onSearch={(term) => search.run(term)} />
  </section>

  <SearchResults {search} />

  <AlbumList />
</div>

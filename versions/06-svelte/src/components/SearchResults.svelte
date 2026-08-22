<script lang="ts">
  import type { AlbumSearch } from '../lib/search.svelte';
  import { albumList } from '../lib/albums.svelte';
  import SearchResultAlbum from './SearchResultAlbum.svelte';

  let { search }: { search: AlbumSearch } = $props();

  // Albums already on the Top 10 list drop out of the results, matching vanilla.
  const visible = $derived(search.results.filter((a) => !albumList.has(a.id)));
</script>

<section id="searchResults" class="album-search-results">
  {#if search.loading}
    <span class="loading"><span class="loader"></span></span>
  {:else if search.error}
    <p class="alert">{search.error}</p>
  {:else if search.searched && search.results.length === 0}
    <p class="alert">No results were found. Please try another search</p>
  {:else}
    {#each visible as album (album.id)}
      <SearchResultAlbum {album} />
    {/each}
  {/if}
</section>

<script lang="ts">
  import { albumList } from '../lib/albums.svelte';
  import Album from './Album.svelte';
</script>

<section class="album-list">
  <h1 class="text-center">Your List</h1>
  <div id="listWrapper" class="album-list-wrapper">
    {#each albumList.items as album (album.id)}
      <Album {album} />
    {/each}
  </div>
</section>

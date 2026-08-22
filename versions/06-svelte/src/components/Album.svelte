<script lang="ts">
  import type { Album } from '../lib/types';
  import { albumList } from '../lib/albums.svelte';

  let { album }: { album: Album } = $props();
</script>

<div class="flex-item">
  <div class="album-slide">
    <img class="album-image" alt={album.name} src={album.image} />
    <div class="album-info below">
      <div class="album-info-box">
        <h4>{album.name}</h4>
        <p class="artist">{album.artist}</p>
        <button
          type="button"
          class="remove-from-list button button-secondary button-small"
          onclick={() => albumList.remove(album.id)}
        >
          Remove
        </button>
      </div>
    </div>
  </div>
</div>

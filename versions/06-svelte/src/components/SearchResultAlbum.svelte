<script lang="ts">
  import type { Album } from '../lib/types';
  import { albumList } from '../lib/albums.svelte';

  let { album }: { album: Album } = $props();

  let active = $state(false);
</script>

<div class="flex-item">
  <div
    class="album-slide"
    class:active
    role="button"
    tabindex="0"
    onclick={() => (active = true)}
    onkeydown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        active = true;
      }
    }}
  >
    <img class="album-image" alt={album.name} src={album.image} />
    <div class="album-info overlay">
      <button
        type="button"
        class="close-button"
        aria-label="Close album details"
        onclick={(event) => {
          event.stopPropagation();
          active = false;
        }}
      >
        <span class="icon close-content"></span>
      </button>
      <div class="album-info-box">
        <h4>{album.name}</h4>
        <p class="artist">{album.artist}</p>
        <button
          type="button"
          class="add-to-list button button-secondary"
          disabled={albumList.isFull}
          onclick={(event) => {
            event.stopPropagation();
            albumList.add(album);
          }}
        >
          {albumList.isFull ? 'List Full' : 'Add To List'}
        </button>
      </div>
    </div>
  </div>
</div>

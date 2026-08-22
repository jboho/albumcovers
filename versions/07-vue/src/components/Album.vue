<script setup lang="ts">
import { useAlbumStore } from '../store/useAlbumStore';
import type { Album } from '../types';

const props = defineProps<{ album: Album }>();

const store = useAlbumStore();

function remove(): void {
  store.removeAlbum(props.album.id);
}
</script>

<template>
  <div class="flex-item">
    <div class="album-slide">
      <img class="album-image" :alt="album.name" :src="album.image" />
      <div class="album-info below">
        <div class="album-info-box">
          <h4>{{ album.name }}</h4>
          <p class="artist">{{ album.artist }}</p>
          <button
            type="button"
            class="remove-from-list button button-secondary button-small"
            @click="remove"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

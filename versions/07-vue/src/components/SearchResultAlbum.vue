<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAlbumStore, MAX_LIST_SIZE } from '../store/useAlbumStore';
import type { Album } from '../types';

const props = defineProps<{ album: Album }>();

const store = useAlbumStore();
const active = ref(false);
const isFull = computed(() => store.topAlbumList.length >= MAX_LIST_SIZE);

function close(): void {
  active.value = false;
}

function add(): void {
  store.addAlbum(props.album);
}
</script>

<template>
  <div class="flex-item">
    <div class="album-slide" :class="{ active }" @click="active = true">
      <img class="album-image" :alt="album.name" :src="album.image" />
      <div class="album-info overlay">
        <button
          type="button"
          class="close-button"
          aria-label="Close album details"
          @click.stop="close"
        >
          <span class="icon close-content"></span>
        </button>
        <div class="album-info-box">
          <h4>{{ album.name }}</h4>
          <p class="artist">{{ album.artist }}</p>
          <button
            type="button"
            class="add-to-list button button-secondary"
            :disabled="isFull"
            @click.stop="add"
          >
            {{ isFull ? 'List Full' : 'Add To List' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

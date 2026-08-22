<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAlbumStore } from '../store/useAlbumStore';
import type { Album } from '../types';
import SearchResultAlbum from './SearchResultAlbum.vue';

const props = defineProps<{
  albums: Album[];
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
}>();

const store = useAlbumStore();
const { topAlbumList } = storeToRefs(store);

const listedIds = computed(() => new Set(topAlbumList.value.map((a) => a.id)));
const visible = computed(() => props.albums.filter((a) => !listedIds.value.has(a.id)));
const noResults = computed(
  () => props.hasSearched && !props.loading && !props.error && props.albums.length === 0,
);
</script>

<template>
  <section id="searchResults" class="album-search-results">
    <span v-if="loading" class="loading">
      <span class="loader"></span>
    </span>

    <p v-else-if="error" class="alert">{{ error }}</p>

    <p v-else-if="noResults" class="alert">
      No results were found. Please try another search
    </p>

    <SearchResultAlbum v-for="album in visible" :key="album.id" :album="album" />
  </section>
</template>

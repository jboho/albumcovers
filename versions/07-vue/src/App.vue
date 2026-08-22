<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAlbumStore } from './store/useAlbumStore';
import { useAlbumSearch } from './composables/useAlbumSearch';
import SearchBar from './components/SearchBar.vue';
import SearchResults from './components/SearchResults.vue';
import AlbumList from './components/AlbumList.vue';
import ListCounter from './components/ListCounter.vue';

const store = useAlbumStore();
const { topAlbumList } = storeToRefs(store);
const count = computed(() => topAlbumList.value.length);

const { albums, loading, error, hasSearched, search } = useAlbumSearch();

const listOpen = ref(false);

// No album means nothing to show, so collapse the drawer if the list empties out.
watch(count, (n) => {
  if (n === 0) listOpen.value = false;
});

// Sync the two DOM side effects of opening the full-screen drawer.
watch(listOpen, (open) => {
  document.body.classList.toggle('no-scroll', open);
  if (open) window.scrollTo({ top: 0 });
});
</script>

<template>
  <div
    id="mainContainer"
    class="container"
    :class="{ 'counter-active': count > 0, 'list-active': listOpen }"
  >
    <ListCounter :count="count" :list-open="listOpen" @toggle="listOpen = !listOpen" />

    <section class="main">
      <div class="explainer">
        <h1>Top <span class="brand-primary">10</span> Favorite Album List Builder</h1>
        <p class="lead">
          Create your own Top 10 List of the all-time greatest albums by beginning with your
          search below.
        </p>
      </div>
      <SearchBar @search="search" />
    </section>

    <SearchResults
      :albums="albums"
      :loading="loading"
      :error="error"
      :has-searched="hasSearched"
    />

    <AlbumList />
  </div>
</template>

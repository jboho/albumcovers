<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAlbumStore } from '../store/useAlbumStore';
import Album from './Album.vue';

const store = useAlbumStore();
const { topAlbumList } = storeToRefs(store);
</script>

<template>
  <section class="album-list">
    <h1 class="text-center">Your List</h1>
    <div id="listWrapper" class="album-list-wrapper">
      <Album v-for="album in topAlbumList" :key="album.id" :album="album" />
    </div>
  </section>
</template>

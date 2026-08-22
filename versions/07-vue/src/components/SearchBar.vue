<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{ search: [term: string] }>();

const term = ref('');

function submit(): void {
  const value = term.value.trim();
  if (value) emit('search', value);
}
</script>

<template>
  <form class="search-group" @submit.prevent="submit">
    <input
      v-model="term"
      type="search"
      name="q"
      class="search-input"
      placeholder="Enter an album or artist name ..."
      aria-label="Search for an album or artist"
    />
    <span class="search-group-btn">
      <button class="button button-primary" type="submit">Go!</button>
    </span>
  </form>
</template>

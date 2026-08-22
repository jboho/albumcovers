<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ count: number; listOpen: boolean }>();
const emit = defineEmits<{ toggle: [] }>();

const label = computed(() => (props.count === 1 ? '1 album' : `${props.count} albums`));
</script>

<template>
  <section id="albumCounter" class="album-list-counter">
    You have selected <span class="count">{{ label }}</span
    >.
    <button type="button" class="button button-sm button-neutral" @click="emit('toggle')">
      {{ listOpen ? 'Hide List' : 'View Your List' }}
    </button>
  </section>
</template>

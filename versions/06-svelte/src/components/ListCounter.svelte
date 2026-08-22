<script lang="ts">
  let {
    count,
    listOpen,
    onToggle,
  }: { count: number; listOpen: boolean; onToggle: () => void } = $props();

  const label = $derived(count === 1 ? '1 album' : `${count} albums`);
</script>

<section id="albumCounter" class="album-list-counter">
  You have selected <span class="count">{label}</span>.
  <button type="button" class="button button-sm button-neutral" onclick={onToggle}>
    {listOpen ? 'Hide List' : 'View Your List'}
  </button>
</section>

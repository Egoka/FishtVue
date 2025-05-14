<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <em :class="props.class">
    <slot />
  </em>
</template>

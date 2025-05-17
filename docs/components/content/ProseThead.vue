<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <thead :class="['text-neutral-700 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800', props.class]">
    <slot />
  </thead>
</template>

<script setup lang="ts">
  defineProps<{ class?: string }>()
</script>

<template>
  <blockquote class="border-s-4 border-neutral-300 dark:border-neutral-700 ps-4 italic">
    <slot />
  </blockquote>
</template>

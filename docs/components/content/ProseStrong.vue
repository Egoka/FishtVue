<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <strong :class="['text-neutral-700 dark:text-neutral-300', props.class]">
    <slot />
  </strong>
</template>

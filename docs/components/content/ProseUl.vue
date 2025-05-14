<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <ul :class="['list-disc ps-6 my-5 marker:text-neutral-300 dark:marker:text-neutral-700', props.class]">
    <slot />
  </ul>
</template>

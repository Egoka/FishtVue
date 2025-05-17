<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <tbody :class="['text-neutral-700 dark:text-neutral-400', props.class]">
    <slot />
  </tbody>
</template>

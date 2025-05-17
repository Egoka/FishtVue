<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <p :class="['my-5 leading-7 text-pretty text-neutral-700 dark:text-neutral-400 mt-4', props.class]">
    <slot />
  </p>
</template>

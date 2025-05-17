<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <ol :class="['list-decimal ps-6 my-5', props.class]">
    <slot />
  </ol>
</template>

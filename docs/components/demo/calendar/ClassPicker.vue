<script setup lang="ts">
  const date = ref()
</script>

<template>
  <Calendar classPicker="custom-calendar-picker-class" v-model="date"> </Calendar>
</template>

<style scoped>
  :deep(.custom-calendar-picker-class) {
    padding: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 10%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>

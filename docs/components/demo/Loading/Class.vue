<script setup lang="ts"></script>

<template>
  <Loading :size="50" class="custom-class rounded-lg border border-theme-300 dark:border-theme-800" />
</template>

<style scoped>
  .custom-class {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
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

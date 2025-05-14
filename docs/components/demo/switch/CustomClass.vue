<script setup lang="ts">
  const isChecked = ref(false)
</script>

<template>
  <Switch class="custom-switch-class" v-model="isChecked"> </Switch>
</template>

<style scoped>
  .custom-switch-class {
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

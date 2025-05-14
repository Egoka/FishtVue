<script setup lang="ts">
  import { groupsMenuMini } from "~/components/demo/menu/dataForExamples"
</script>

<template>
  <Menu class="custom-class" :groups="groupsMenuMini()"> </Menu>
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

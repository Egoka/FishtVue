<script setup lang="ts">

import {groupHorizontal} from "~/components/demo/menu/dataForExamples";
</script>

<template>
  <Menu
      :selected="true"
      :styles="{ activeRows: 'custom-active-rows-class', selectedRows: 'custom-selected-rows-class' }"
      :groups="groupHorizontal()">
  </Menu>
</template>

<style scoped>
:deep(.custom-active-rows-class){
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 20%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
:deep(.custom-selected-rows-class){
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
</style>
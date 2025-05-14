<script setup lang="ts">
  import { groupsMenuMini } from "~/components/demo/menu/dataForExamples"
</script>

<template>
  <Menu :groups="groupsMenuMini()">
    <template #item="{ data }">
      <span class="w-full p-4 text-center">{{ data.title }}</span>
    </template>
  </Menu>
</template>

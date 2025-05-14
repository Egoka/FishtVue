<script setup lang="ts">
  import { groupsMenu } from "~/components/demo/menu/dataForExamples"
</script>

<template>
  <Menu :groups="groupsMenu()" icons></Menu>
</template>

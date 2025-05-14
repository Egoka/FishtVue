<script setup lang="ts">
  import { groupsMenuSubmenuMini } from "~/components/demo/menu/dataForExamples"
</script>

<template>
  <Menu :paramsWindowMenu="{ eventOpen: 'click' }" :groups="groupsMenuSubmenuMini()"> </Menu>
</template>

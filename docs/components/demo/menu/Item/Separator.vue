<script setup lang="ts">
  import { groupsMenuSeparatorMini } from "~/components/demo/menu/dataForExamples"
</script>

<template>
  <Menu :separator="{ isVisible: true, icon: 'chevron-down' }" :groups="groupsMenuSeparatorMini()"> </Menu>
</template>

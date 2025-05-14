<script setup lang="ts">
  import { groupSeparator } from "~/components/demo/menu/dataForExamples"
</script>

<template>
  <Menu :groups="groupSeparator()" class="w-36"></Menu>
</template>

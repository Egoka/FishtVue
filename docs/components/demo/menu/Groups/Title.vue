<script setup lang="ts">
  import { groupTitle } from "~/components/demo/menu/dataForExamples"
</script>

<template>
  <Menu :groups="groupTitle()" class="w-36"></Menu>
</template>

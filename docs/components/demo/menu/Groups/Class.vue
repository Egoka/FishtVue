<script setup lang="ts">
  import { groupClass } from "~/components/demo/menu/dataForExamples"
</script>

<template>
  <Menu :groups="groupClass()" class="w-36"></Menu>
</template>

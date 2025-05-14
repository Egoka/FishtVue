<script setup lang="ts">
  const date = ref()
</script>

<template>
  <Calendar :paramsFixWindow="{ position: 'bottom-left', marginPx: 10 }" v-model="date"> </Calendar>
</template>

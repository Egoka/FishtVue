<script setup lang="ts">
  const date = ref()
</script>

<template>
  <Calendar isNotCloseOnDateChange v-model="date"> </Calendar>
</template>

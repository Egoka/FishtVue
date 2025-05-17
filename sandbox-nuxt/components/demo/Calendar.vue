<script setup lang="ts">
  const selectedDate = ref()
</script>

<template>
  <Calendar label="Event" v-model="selectedDate" />
</template>

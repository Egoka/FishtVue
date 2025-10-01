<script setup lang="ts">
  import { ref } from "vue"
  import Calendar from "fishtvue/calendar/Calendar.vue"
  const selectedDate = ref()
</script>

<template>
  <Calendar label="Event" v-model="selectedDate" />
</template>

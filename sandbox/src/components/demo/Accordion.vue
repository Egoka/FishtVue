<script setup lang="ts">
  import { ref } from "vue"
  import Accordion from "fishtvue/accordion/Accordion.vue"

  const dataSource = ref([
    {
      title: "Warm-up Exercises",
      subtitle: "Preparing your body for workout"
    },
    {
      title: "Strength Training",
      subtitle: "Building muscle and endurance"
    },
    {
      title: "Cardio Workouts",
      subtitle: "Improving cardiovascular health"
    },
    {
      title: "Cool Down Routine",
      subtitle: "Helping your body recover"
    },
    {
      title: "Nutrition Tips",
      subtitle: "Fueling your workouts"
    }
  ])
</script>
<template>
  <Accordion :dataSource="dataSource" :multiple="true" />
</template>

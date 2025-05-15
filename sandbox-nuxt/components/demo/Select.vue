<script setup lang="ts">
  const data = ref([
    "apple",
    "banana",
    "orange",
    "grape",
    "mango",
    "pineapple",
    "strawberry",
    "watermelon",
    "peach",
    "kiwi"
  ])
  const selectedValues = ref()
</script>

<template>
  <Select label="Fruits" :dataSelect="data" v-model="selectedValues" />
</template>

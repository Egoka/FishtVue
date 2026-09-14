<script setup lang="ts">
  import { ref } from "vue"
  import Select from "fishtvue/select/Select.vue"

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
  <Select label="Fruits" :options="data" v-model="selectedValues" :fixWindowProps="{ strategy: 'fixed' }" />
</template>

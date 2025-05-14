<script setup lang="ts">
  const selectedItem = ref()
</script>

<template>
  <Select
    :dataSelect="[
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' },
      { id: 3, name: 'Cherry' }
    ]"
    keySelect="id"
    valueSelect="name"
    v-model="selectedItem" />
</template>

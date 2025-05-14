<script setup lang="ts">
  const isChecked = ref(false)
</script>

<template>
  <Switch disabled v-model="isChecked" />
  <Switch disabled switchingType="switch" v-model="isChecked" />
</template>

<style scoped></style>

<script setup lang="ts">
  const value = ref("")
</script>

<template>
  <Input maskInput="number" :lengthInteger="7" :lengthDecimal="2" v-model="value" />
</template>

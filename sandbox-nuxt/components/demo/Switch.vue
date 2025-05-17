<script setup lang="ts">
  const isChecked = ref(false)
</script>

<template>
  <Switch label="Enable notifications" v-model="isChecked" switchingType="switch" />
</template>

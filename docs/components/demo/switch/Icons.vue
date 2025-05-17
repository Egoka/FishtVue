<script setup lang="ts">
  const isChecked = ref(false)
</script>

<template>
  <Switch iconActive="lucide:sun" iconInactive="lucide:moon-star" switchingType="switch" v-model="isChecked" />
</template>

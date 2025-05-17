<script setup lang="ts">
  const isCheckedCheckbox = ref()
  const isCheckedSwitch = ref()
</script>

<template>
  <Switch switchingType="checkbox" v-model="isCheckedCheckbox" />
  <Switch switchingType="switch" v-model="isCheckedSwitch" />
</template>

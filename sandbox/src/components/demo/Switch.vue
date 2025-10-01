<script setup lang="ts">
  import { ref } from "vue"
  import Switch from "fishtvue/switch/Switch.vue"
  const isChecked = ref(false)
</script>

<template>
  <Switch label="Enable notifications" v-model="isChecked" switchingType="switch" />
</template>

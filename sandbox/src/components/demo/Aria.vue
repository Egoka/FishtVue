<script setup lang="ts">
  import { ref } from "vue"
  import Aria from "fishtvue/aria/Aria.vue"
  const value = ref("")
</script>

<template>
  <Aria label="Message" v-model="value"></Aria>
</template>

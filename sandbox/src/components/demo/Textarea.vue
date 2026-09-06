<script setup lang="ts">
  import { ref } from "vue"
  import Textarea from "fishtvue/textarea/Textarea.vue"
  const value = ref("")
</script>

<template>
  <Textarea label="Message" v-model="value"></Textarea>
</template>

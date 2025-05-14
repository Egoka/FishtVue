<script setup lang="ts">
  const content = ref<string>("<h1>Content</h1>")
</script>

<template>
  <TextEditor v-model="content"></TextEditor>
</template>

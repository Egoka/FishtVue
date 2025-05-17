<script setup lang="ts">
  const content = ref<string>("<h1>Content</h1>")
</script>

<template>
  <TextEditor :paramsTextEditor="{ content: '<p>Hello, world!</p>', contentType: 'html' }" v-model="content">
  </TextEditor>
</template>

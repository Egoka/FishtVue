<script setup lang="ts">
  const content = ref<string>("<h1>Content</h1>")
</script>

<template>
  <TextEditor :paramsTextEditor="{ readOnly: true }" v-model="content"> </TextEditor>
</template>

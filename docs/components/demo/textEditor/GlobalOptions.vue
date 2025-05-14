<script setup lang="ts">
  const content = ref<string>("<h1>Content</h1>")
</script>

<template>
  <TextEditor
    :paramsTextEditor="{ globalOptions: { modules: { history: { delay: 2000, maxStack: 500 } } } }"
    v-model="content">
  </TextEditor>
</template>

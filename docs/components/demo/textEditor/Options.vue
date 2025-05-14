<script setup lang="ts">
  const content = ref<string>("<h1>Content</h1>")
</script>

<template>
  <TextEditor
    :paramsTextEditor="{
      options: {
        debug: 'info',
        placeholder: 'Compose an epic...'
      }
    }"
    v-model="content">
  </TextEditor>
</template>

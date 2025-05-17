<script setup lang="ts">
  const contentBubble = ref<string>("<h1>Content</h1>")
  const contentSnow = ref<string>("<h1>Content</h1>")
</script>

<template>
  <TextEditor label="Bubble" theme="bubble" v-model="contentBubble" />
  <TextEditor label="Snow" theme="snow" v-model="contentSnow" />
</template>

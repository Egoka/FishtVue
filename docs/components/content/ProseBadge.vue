<script setup lang="ts">
  defineProps<{
    class?: any
  }>()
</script>

<template>
  <Badge mode="primary" class="rounded-full">
    <slot mdc-unwrap="p" />
  </Badge>
</template>

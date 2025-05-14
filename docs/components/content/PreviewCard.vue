<script setup lang="ts">
  const props = defineProps<{
    class: string
  }>()
  const classes = ref<Record<"root", string>>({
    root: "px-4 py-1 border rounded-b-md border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 dark:text-white"
  })
</script>

<template>
  <div :class="[classes.root, props.class]">
    <slot mdc-unwrap="p" />
  </div>
</template>

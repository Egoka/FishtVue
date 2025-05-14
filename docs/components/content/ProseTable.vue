<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
  const classes = ref<Record<"root" | "base", string>>({
    root: "relative my-5 overflow-x-auto",
    base: "w-full border-separate border-spacing-0 rounded-sm"
  })
</script>

<template>
  <div :class="[classes.root, props.class]">
    <table :class="classes.base">
      <slot />
    </table>
  </div>
</template>

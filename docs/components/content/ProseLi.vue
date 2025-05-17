<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <li :class="['my-1.5 ps-1.5 leading-7 [&>ul]:my-0 text-neutral-700 dark:text-neutral-400', props.class]">
    <slot />
  </li>
</template>

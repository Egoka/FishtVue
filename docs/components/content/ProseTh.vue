<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <th
    :class="[
      'py-3 px-4',
      'font-semibold text-sm text-left',
      'border-e border-b first:border-s border-t',
      'border-neutral-200 dark:border-neutral-700',
      props.class
    ]">
    <slot />
  </th>
</template>

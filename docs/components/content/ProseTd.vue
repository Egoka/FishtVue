<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <td
    :class="[
      'py-3 px-4',
      'text-sm text-left align-top',
      'bg-neutral-100 dark:bg-neutral-900',
      'border-e border-b first:border-s border-neutral-200 dark:border-neutral-800',
      '[&_code]:text-xs/5 [&_p]:my-0 [&_p]:leading-6 [&_ul]:my-0 [&_ol]:my-0 [&_ul]:ps-4.5 [&_ol]:ps-4.5 [&_li]:leading-6 [&_li]:my-0.5',
      props.class
    ]">
    <slot />
  </td>
</template>

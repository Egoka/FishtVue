<script setup lang="ts">
  const props = defineProps<{
    class?: string
  }>()
</script>

<template>
  <tr
    :class="[
      '[&:first-child>th:first-child]:rounded-tl-sm',
      '[&:first-child>th:last-child]:rounded-tr-sm',
      '[&:last-child>td:first-child]:rounded-bl-sm',
      '[&:last-child>td:last-child]:rounded-br-sm',
      props.class
    ]">
    <slot />
  </tr>
</template>

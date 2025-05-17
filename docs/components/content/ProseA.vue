<script setup lang="ts">
  defineProps<{
    href?: string
    target?: "_blank" | "_parent" | "_self" | "_top" | (string & object) | null | undefined
    class?: any
  }>()
</script>

<template>
  <NuxtLink
    :href="href"
    :target="target"
    class="text-theme-500 dark:text-theme-400 border-b border-transparent hover:border-theme-500 dark:hover:border-theme-400 font-medium focus-visible:outline-theme-500 dark:focus-visible:outline-theme-400 [&>code]:border-dashed hover:[&>code]:border-theme-500 dark:hover:[&>code]:border-theme-400 hover:[&>code]:text-theme-500 dark:hover:[&>code]:text-theme-400 transition-colors [&>code]:transition-colors">
    <slot />
  </NuxtLink>
</template>

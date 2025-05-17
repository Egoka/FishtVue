<script setup lang="ts">
  import { cn } from "#imports"

  const props = defineProps<{
    class?: string | string[]
  }>()
  const {
    site: { publisherLink }
  } = useAppConfig()
</script>

<template>
  <footer
    :class="cn('w-screen px-8 md:px-28 py-8 max-w-screen-xl mx-auto justify-center sm:justify-end flex', props.class)">
    <div class="flex text-neutral-500 dark:text-neutral-400 text-xs">
      <AppLogo class="size-4 fill-neutral-500 dark:fill-neutral-400 mr-2" />
      <div>
        © 2025 <strong>FishtVue</strong> by
        <a :href="publisherLink" target="_blank" rel="noopener noreferrer">Egoka</a>
      </div>
    </div>
  </footer>
</template>

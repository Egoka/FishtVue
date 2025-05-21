<script setup lang="ts">
  const { site } = useAppConfig()
  const classes = ref<string[]>([
    "dark:text-neutral-100 text-neutral-900",
    "bg-neutral-100 dark:bg-neutral-900",
    "selection:bg-theme-300 selection:text-theme-900 dark:selection:bg-theme-900 dark:selection:text-theme-200",
    "transition-colors"
  ])
  useHead({
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${site.title} – ${titleChunk}` : site.title
    }
  })
</script>
<template>
  <Body :class="classes">
    <NuxtLoadingIndicator color="var(--color-theme-500)" />
    <NuxtRouteAnnouncer />
    <AppMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </AppMain>
  </Body>
</template>

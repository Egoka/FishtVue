<script setup lang="ts">
  const { site } = useAppConfig()
  const localePath = useLocalePath()

  function goHome() {
    if (window.location.pathname === localePath("/")) {
      window.location.reload()
    } else {
      navigateTo(localePath("/"))
    }
  }
</script>

<template>
  <NuxtLink :to="localePath('/')" class="flex items-center gap-3 cursor-pointer">
    <AppLogo class="w-6 md:w-7 fill-neutral-600 dark:fill-neutral-400" />
    <span class="font-asap font-bold tracking-wide text-2xl md:text-3xl text-neutral-600 dark:text-neutral-200">{{
      site.title
    }}</span>
  </NuxtLink>
</template>

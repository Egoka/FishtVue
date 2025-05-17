<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const localePath = useLocalePath()
  const { t } = useI18n()

  function toPath(path: any) {
    navigateTo(localePath(path))
  }
</script>

<template>
  <div
    class="relative isolate overflow-hidden mt-10 mb-20 bg-neutral-100 dark:bg-neutral-900 border-y border-theme-400/10 dark:border-theme-800/20">
    <div
      class="w-full max-w-7xl mx-auto flex flex-col lg:grid px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16">
      <div class="">
        <h2
          class="text-3xl sm:text-4xl text-pretty tracking-tight font-bold text-highlighted text-center text-stone-800 dark:text-neutral-300">
          {{ t("start.CTA.title") }}
        </h2>
        <div class="text-base sm:text-lg text-center text-balance text-muted mt-6 text-stone-600 dark:text-neutral-400">
          {{ t("start.CTA.subtitle") }}
        </div>
        <div class="mt-8 flex flex-wrap gap-x-6 gap-y-3 justify-center">
          <Button
            icon="chevron-right"
            size="md"
            mode="outline"
            color="theme"
            class="font-semibold bg-neutral-100 dark:bg-neutral-900"
            @click="toPath('/components/components')">
            {{ t("start.intro.exploreComponent") }}
          </Button>
        </div>
      </div>
      <div
        class="absolute rounded-full bg-theme-400 dark:bg-theme-700 blur-[250px] size-40 sm:size-50 transform -translate-x-1/2 left-1/2 -translate-y-80" />
      <LazyDocStarsBg />
    </div>
  </div>
</template>

<style scoped></style>

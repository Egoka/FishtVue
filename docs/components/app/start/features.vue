<script setup lang="ts">
  import { features, type Features } from "~/components/app/start/dataExemple"
  const localePath = useLocalePath()

  const { t } = useI18n()
  function open(item: Features) {
    if (!item?.link) return
    navigateTo(localePath(item?.link))
  }
</script>

<template>
  <section class="landing-features py-20">
    <div class="text-center px-8 font-bold text-3xl">{{ t("start.features.title") }}</div>
    <p class="text-center px-8 mt-6 font-medium text-xl text-stone-600 dark:text-stone-400">
      {{ t("start.features.subtitle") }}
    </p>
    <div class="mt-16 px-4 max-w-5xl mx-auto">
      <div class="grid gap-8 md:grid-cols-2">
        <div
          v-for="feature in features()"
          :key="feature.title"
          :class="[feature?.link ? 'cursor-pointer' : '']"
          class="group flex items-start gap-5 rounded-xl p-6 bg-gray-200/50 hover:bg-stone-200/50 dark:bg-stone-900/50 dark:hover:bg-stone-950/50 transition-all duration-500"
          @click="open(feature)">
          <div v-if="feature.icon" class="flex-shrink-0 mt-1">
            <AppIcons :icon="feature.icon" :class="`${feature.iconColor} text-4xl`" />
          </div>
          <div>
            <div class="font-semibold text-lg mb-1">{{ feature.title }}</div>
            <div class="text-stone-600 dark:text-stone-400 font-medium">{{ feature.description }}</div>
          </div>
          <div v-if="feature?.link" class="relative right-3">
            <AppIcons
              icon="uim:arrow-up-right"
              class="absolute size-5 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0"></AppIcons>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

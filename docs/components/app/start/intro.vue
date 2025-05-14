<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const localePath = useLocalePath()
  const { t } = useI18n()

  function toPath(path: any) {
    navigateTo(localePath(path))
  }
</script>

<template>
  <section>
    <div class="grid justify-items-center gap-8 p-5 px-3 sm:px-4 md:gap-10 md:px-8">
      <div class="mt-20 px-5 grid w-full max-w-4xl justify-items-center gap-[inherit]">
        <div class="flex flex-col items-center gap-4">
          <h1
            class="font-asap sm:leading-22 text-center text-4xl font-bold sm:text-6xl sm:font-extrabold md:text-7xl text-foreground text-stone-800 dark:text-neutral-300">
            {{ t("start.intro.title") }}
            <br />
            <span class="font-asap text-theme-900 dark:text-theme-300">{{ t("start.intro.name") }}</span>
          </h1>
        </div>
        <p
          class="font-asap max-w-[720px] text-pretty text-center text-lg md:text-xl md:leading-8 lg:leading-9 lg:text-2xl text-stone-600 dark:text-stone-400">
          {{ t("start.intro.description") }}
        </p>
      </div>
      <div class="mb-20 flex max-w-[calc(100%-2rem)] flex-wrap items-center justify-center gap-4">
        <Button color="theme" size="lg" class="font-semibold" @click="toPath('/gettingstarted/introduction')">
          {{ t("start.intro.getStarted") }}
        </Button>
        <Button
          icon="chevron-right"
          size="lg"
          mode="outline"
          class="font-semibold bg-neutral-100 dark:bg-neutral-900"
          @click="toPath('/components/components')">
          {{ t("start.intro.exploreComponent") }}
        </Button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  import { useScroll } from "@vueuse/core"

  const { locale } = useI18n()
  const { data: navigation, refresh } = useAsyncData(`navigation-${locale.value}`, () =>
    queryCollectionNavigation(locale.value, ["icon", "name"])
  )
  watch(
    () => locale.value,
    async () => await refresh()
  )
  // Get from Top height
  const { arrivedState } = useScroll(globalThis.window)
  const { top } = toRefs(arrivedState)
</script>

<template>
  <AppHeader />
  <div class="max-w-[1440px] w-full h-full grow">
    <div class="w-full">
      <DocBackground />
      <main class="flex flex-col md:flex-row">
        <aside
          v-if="navigation?.length"
          class="hidden md:block w-[13rem] flex-shrink-0 p-2 py-8 sticky top-[67px] lg:top-[83px] top h-full overflow-y-auto"
          :class="[
            top ? 'bg-transparent backdrop-blur-0' : 'bg-neutral-100/60 dark:bg-neutral-900/60',
            'transition-all duration-500',
            'max-h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)]'
          ]">
          <DocSidebar :items="navigation ?? []" />
          <div class="h-6 w-full" />
        </aside>
        <slot />
      </main>
    </div>
  </div>
</template>

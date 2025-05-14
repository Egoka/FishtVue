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
      <div
        class="-z-1 w-full h-max absolute top-0 left-0 inset-0 pointer-events-none flex justify-center overflow-hidden">
        <div class="w-[108rem] flex-none flex justify-end h-screen">
          <div
            class="fixed z-1 rounded-full bg-theme-600 dark:bg-theme-800 blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-0 -translate-y-80">
            <div
              class="absolute z-1 rounded-full bg-theme-600 dark:bg-theme-800 blur-[300px] size-60 sm:size-80 transform -translate-x-1/2 left-0 -translate-y-80"></div>
          </div>
          <ClientOnly>
            <Doc039 />
          </ClientOnly>
        </div>
      </div>

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

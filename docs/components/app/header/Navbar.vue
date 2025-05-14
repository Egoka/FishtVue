<script setup lang="ts">
  import { useRoute } from "vue-router"
  import { useI18n } from "vue-i18n"
  import { useScroll, useBreakpoints, breakpointsTailwind } from "@vueuse/core"

  const route = useRoute()
  const { locale } = useI18n()
  const { theme } = useAppConfig()
  const { data: navigation } = await useAsyncData(`navigation-${locale.value}`, () =>
    queryCollectionNavigation(locale.value, ["icon", "name"])
  )
  const isSidebarOpen = ref(false)
  watch(
    () => route.path,
    () => {
      isSidebarOpen.value = false
    }
  )
  const { arrivedState } = useScroll(globalThis.window)
  const { top } = toRefs(arrivedState)

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isDesktop = breakpoints.greaterOrEqual("md") // ≥768px
</script>

<template>
  <nav class="hidden md:flex items-center">
    <AppSearch />
    <AppThemeToggle />
    <AppLocaleSwitch />
    <NuxtLink
      v-for="link in theme.socialLinks"
      :key="link.link"
      :to="link.link"
      :aria-label="link.icon"
      target="_blank"
      class="w-9 h-9 bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center rounded-lg text-xl flex-shrink-0">
      <AppIcons :icon="`simple-icons:${link.icon}`" />
    </NuxtLink>
  </nav>
  <div class="md:hidden flex flex-row gap-2">
    <AppSearch v-if="!isDesktop" />
    <Button
      mode="outline"
      @click="isSidebarOpen = true"
      class="m-0 px-2"
      :class="[!top ? 'border-transparent bg-neutral-50 dark:bg-neutral-900' : 'border-neutral-200']">
      <AppIcons icon="lucide:menu" class="text-lg text-neutral-800 dark:text-neutral-200 iconify iconify--lucide" />
    </Button>
    <Dialog
      v-model="isSidebarOpen"
      position="left"
      close-button
      without-margin
      class="bg-white dark:bg-neutral-900 h-screen border border-neutral-200 dark:border-neutral-700 rounded-none !pt-16">
      <div class="flex items-center justify-around mx-8">
        <AppThemeToggle />
        <AppLocaleSwitch />
      </div>
      <Separator class="my-2" :gradient="5"></Separator>
      <div class="h-full overflow-y-auto max-h-[calc(100vh-8rem)]">
        <DocSidebar :items="navigation ?? []" class="overflow-auto" />
      </div>
    </Dialog>
  </div>
</template>

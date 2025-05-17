<script setup lang="ts">
  import { useScroll } from "@vueuse/core"

  const { arrivedState } = useScroll(globalThis.window)
  const { top } = toRefs(arrivedState)
  const classHeader = computed(() => [
    "w-full py-2 lg:py-4 sticky top-0 z-100 transition-all duration-500 md:h-full text-neutral-600 dark:text-neutral-400",
    top.value
      ? "bg-transparent backdrop-blur-0"
      : "bg-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/40"
  ])
</script>

<template>
  <header :class="classHeader">
    <div class="max-w-[1440px] flex items-center justify-between mx-auto px-6">
      <div class="w-full justify-between md:justify-normal flex items-center gap-8">
        <AppHeaderTitle />
      </div>
      <AppHeaderNavbar />
    </div>
  </header>
</template>

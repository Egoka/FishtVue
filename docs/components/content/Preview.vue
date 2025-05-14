<script setup lang="ts">
  import { cn } from "#imports"
  import { process } from "std-env"

  const props = defineProps<{
    class?: string
    noMobile?: boolean
  }>()

  function useDevice() {
    const userAgent = process.client ? navigator.userAgent.toLowerCase() : ""
    const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone|opera mini|silk/i.test(userAgent)
    return {
      isMobile
    }
  }

  const isMobile = ref(props.noMobile && useDevice().isMobile)
  const classes = ref({
    root:
      "flex flex-col justify-center items-center overflow-auto " +
      "rounded-sm w-full relative my-4 p-2 sm:p-8 gap-4 " +
      "border border-neutral-200 dark:border-neutral-700 " +
      "bg-neutral-100/70 dark:bg-neutral-900/70"
  })
</script>

<template>
  <div v-if="!isMobile" :class="cn(classes.root, props.class)">
    <slot />
  </div>
</template>

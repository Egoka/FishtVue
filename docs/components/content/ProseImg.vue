<script setup lang="ts">
  import { computed } from "vue"
  import { joinURL, withLeadingSlash, withTrailingSlash } from "ufo"
  import FDialog from "fishtvue/dialog"
  import { useRuntimeConfig } from "#imports"

  const props = defineProps<{
    src: string
    alt: string
    name: string
    width?: string | number
    height?: string | number
    w?: string | number
    h?: string | number
    class?: any
  }>()

  const isOpenDialogImg = ref(false)
  const width = computed(() => {
    const res = props.w ?? props.width
    return typeof res === "number" ? `${res}px` : res
  })
  const height = computed(() => {
    const res = props.h ?? props.height
    return typeof res === "number" ? `${res}px` : res
  })
  const refinedSrc = computed(() => {
    if (props.src?.startsWith("/") && !props.src.startsWith("//")) {
      const _base = withLeadingSlash(withTrailingSlash(useRuntimeConfig().app.baseURL))
      if (_base !== "/" && !props.src.startsWith(_base)) {
        return joinURL(_base, props.src)
      }
    }
    return props.src
  })
</script>

<template>
  <div>
    <NuxtImg
      :src="refinedSrc"
      :alt="alt"
      :width="width"
      :height="height"
      class="rounded-sm cursor-pointer"
      :class="props.class"
      @click="isOpenDialogImg = true" />
    <Dialog
      v-model:model-value="isOpenDialogImg"
      position="center"
      notAnimate
      class="p-0 w-screen max-w-[80vw] sm:max-w-[80vw]">
      <NuxtImg :src="refinedSrc" :alt="alt" class="rounded-sm max-w-[80vw] sm:max-w-[80vw]" :class="props.class" />
    </Dialog>
  </div>
</template>

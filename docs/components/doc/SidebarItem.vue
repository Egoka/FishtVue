<script setup lang="ts">
  import { watch } from "vue"
  import { useCurrentElement } from "@vueuse/core"
  import type { ContentNavigationItem } from "@nuxt/content"
  import { useRoute } from "#vue-router"

  const localePath = useLocalePath()
  const route = useRoute()
  const props = defineProps<{ item: ContentNavigationItem }>()
  const isActiveLink = computed(() => route.path.includes(props.item.path))
  const elRef = useCurrentElement()

  watch(
    isActiveLink,
    () => {
      if (isActiveLink.value && elRef.value && elRef.value instanceof HTMLElement)
        elRef.value?.scrollIntoView({ block: "center" })
    },
    { immediate: true }
  )
</script>

<template>
  <div
    class="flex items-center text-sm text-neutral-600 hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 rounded-lg m-1"
    :class="{
      'is-active !bg-theme-600/10 !text-theme-600 dark:!bg-theme-300/10 dark:!text-theme-300 font-semibold':
        isActiveLink
    }">
    <NuxtLink :to="localePath(item?.path)" class="truncate h-[2.15rem] px-4 leading-[2.15rem] w-full">{{
      item.name ?? item.title
    }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
  import { useScroll } from "@vueuse/core"
  import { useRoute } from "#vue-router"
  import { useI18n } from "vue-i18n"
  import { computed } from "vue"
  const { locale } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()
  defineProps<{ tabMenuItems: Record<"title" | "path", string>[] | undefined }>()
  // Get from Top height
  const { arrivedState } = useScroll(globalThis.window)
  const { top } = toRefs(arrivedState)
  const path = computed(() => route.path.replace(`/${locale.value}`, "") ?? "/")
</script>

<template>
  <div
    v-if="tabMenuItems && tabMenuItems?.length > 1"
    class="flex w-max max-w-full m-2 p-2 pt-0 rounded-xl transition-all duration-500"
    :class="[top ? 'bg-transparent backdrop-blur-0' : 'bg-neutral-100 dark:bg-neutral-900']">
    <ul
      class="flex gap-2 list-none m-0 overflow-auto p-0 relative bg-transparent dark:bg-transparent border-b border-b-neutral-200 dark:border-b-neutral-700">
      <li v-for="item in tabMenuItems" :key="item.path" class="relative z-10 content-end">
        <NuxtLink :to="localePath(item.path)" :aria-label="item.title">
          <Button
            class="uppercase bg-transparent dark:bg-transparent rounded-none m-0 ring-0"
            :class="[item.path === path ? 'border-b-2 border-theme-500 font-bold' : '']">
            {{ item.title }}
          </Button>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<style scoped></style>

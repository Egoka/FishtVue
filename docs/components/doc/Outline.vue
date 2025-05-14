<script setup lang="ts">
  import { ref } from "vue"
  import { useI18n } from "vue-i18n"
  import type { TocLink } from "~/app.config"
  import { isClient } from "@vueuse/core"

  defineProps<{ headers: TocLink[] | undefined }>()
  const { t } = useI18n()

  const container = ref()
  const marker = ref()
  useActiveAnchor(container, marker)
  onMounted(() => (isClient ? getHeaders([2, 3]) : undefined))
</script>

<template>
  <nav ref="container" class="block relative not-prose">
    <div
      ref="marker"
      class="outline-marker absolute left-0 opacity-0 h-[18px] w-[2px] bg-theme-600 dark:bg-theme-400 transition-[top,opacity] ease-in-out duration-300 rounded-full -translate-y-1" />
    <div
      id="doc-outline-aria-label"
      aria-level="2"
      class="text-neutral-800 dark:text-neutral-200 font-bold text-sm mb-2 trunc"
      role="heading">
      {{ t("onPage") }}
    </div>
    <div class="border-l border-neutral-200 dark:border-neutral-700">
      <DocOutlineItem :headers="headers" :root="true" />
    </div>
  </nav>
</template>

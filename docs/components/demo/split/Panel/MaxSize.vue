<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-28 flex justify-center items-center font-semibold text-xl' }"
    :panels="[
      { name: 'left', size: 50, maxSize: 60 }, // Cannot exceed 60%
      { name: 'right', size: 50, minSize: 40, maxSize: 50 } // `maxSize` will equal `minSize` (40%)
    ]">
    <template #left="{ size }">
      <div>{{ t("title.leftPanel") }}</div>
      <div class="absolute bottom-0 right-0 p-2 font-extralight text-base text-neutral-700 dark:text-neutral-500">
        <span class="text-sm text-neutral-700 dark:text-neutral-600">{{ t("title.Size") }}: </span>
        {{ Math.round(size) }}
        <span class="text-sm text-neutral-700 dark:text-neutral-600">%</span>
      </div>
    </template>
    <template #right="{ size }">
      <div>{{ t("title.rightPanel") }}</div>
      <div class="absolute bottom-0 right-0 p-2 font-extralight text-base text-neutral-700 dark:text-neutral-500">
        <span class="text-sm text-neutral-700 dark:text-neutral-600">{{ t("title.Size") }}: </span>
        {{ Math.round(size) }}
        <span class="text-sm text-neutral-700 dark:text-neutral-600">%</span>
      </div>
    </template>
  </Split>
</template>

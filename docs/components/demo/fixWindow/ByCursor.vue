<script setup lang="ts">
  import { classDiv } from "~/components/demo/fixWindow/dataForExamples"
  import { cn } from "#imports"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <div
    class="custom-class w-full h-32 flex justify-center items-center border-b-2 border-neutral-300 dark:border-neutral-700">
    <div class="text-neutral-400 dark:text-neutral-600 font-asap font-extralight text-base select-none">
      {{ t("title.leftClick") }}
    </div>
    <FixWindow byCursor eventOpen="click" eventClose="hover" typePosition="absolute">
      <div :class="cn(classDiv, 'p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-lg border-solid')">
        {{ t("title.cursorLocation") }}
      </div>
    </FixWindow>
  </div>
  <div class="custom-class w-full h-32 flex justify-center items-center">
    <div class="text-neutral-400 dark:text-neutral-600 font-asap font-extralight text-base select-none">
      {{ t("title.rightClick") }}
    </div>
    <FixWindow byCursor eventOpen="contextmenu" eventClose="hover" typePosition="absolute">
      <div :class="cn(classDiv, 'p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md shadow-lg border-solid')">
        {{ t("title.cursorLocation") }}
      </div>
    </FixWindow>
  </div>
</template>

<style scoped>
  .custom-class {
    --pattern-fg: color-mix(in oklab, var(--color-neutral-500) 20%, transparent);
    background-image: radial-gradient(var(--pattern-fg) 1px, transparent 1px);
    background-size: 4px 4px;
  }
</style>

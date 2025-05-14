<script setup lang="ts">
  import { classDiv } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const size = ref(30)
  const dataSizes = ref([10, 30, 50, 70, 100])
</script>

<template>
  <Select :label="t('label.size')" :help="t('help.size')" :dataSelect="dataSizes" v-model="size" />
  <Separator class="w-full"></Separator>
  <div :class="[classDiv, 'my-5']">
    {{ t("title.hoverMe") }}
    <FixWindow :marginPx="size" classBody="custom-dialog-class" style-position="absolute">
      <div class="size-18 bg-theme-600/80 dark:bg-theme-400/80 rounded-sm"></div>
    </FixWindow>
    <FixWindow :marginPx="0" style-position="absolute">
      <div
        class="flex items-center justify-center w-18 bg-neutral-200/70 dark:bg-neutral-800/70 text-neutral-400 dark:text-neutral-700 rounded-sm"
        :style="`height: ${size}px`">
        {{ t("title.Size") }} {{ size }}px
      </div>
    </FixWindow>
  </div>
</template>

<style scoped>
  :deep(.custom-dialog-class) {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 10%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>

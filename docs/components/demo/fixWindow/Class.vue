<script setup lang="ts">
  import { classDiv } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <div :class="[classDiv, 'my-5']">
    {{ t("title.hoverMe") }}
    <FixWindow class="custom-dialog-class border-theme-200 dark:border-theme-800" mode="outlined">
      {{ t("title.dynamicWindow") }}
    </FixWindow>
  </div>
</template>

<style scoped>
  :deep(.custom-dialog-class) {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
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

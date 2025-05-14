<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-22 p-5' }"
    :panels="[
      { name: 'styled', class: 'custom-panel-class' }, // Custom CSS class applied
      { name: 'default' }
    ]">
    <template #styled>
      <div class="font-semibold mb-1 text-xl ml-5 text-neutral-700 dark:text-neutral-200">
        {{ t("title.styledPanel") }}
      </div>
    </template>
    <template #default>
      <div class="font-semibold mb-1 text-xl ml-5 text-neutral-700 dark:text-neutral-200">
        {{ t("title.defaultPanel") }}
      </div>
    </template>
  </Split>
</template>

<style scoped>
  :deep(.custom-panel-class) {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 20%, transparent);
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

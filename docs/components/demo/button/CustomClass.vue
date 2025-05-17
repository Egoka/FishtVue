<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap">
    <Button mode="outline" size="md" class="custom-button-class">{{ t("button.CustomClass") }}</Button>
    <Button mode="outline" size="md" icon="check" classIcon="custom-icon-class">{{ t("button.IconClass") }}</Button>
  </div>
</template>

<style scoped>
  .custom-button-class {
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
  :deep(.custom-icon-class) {
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

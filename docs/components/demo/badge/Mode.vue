<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap gap-5 justify-center">
    <Badge mode="primary">{{ t("label.primary") }}</Badge>
    <Badge mode="secondary">{{ t("label.secondary") }}</Badge>
    <Badge mode="outline">{{ t("label.outline") }}</Badge>
    <Badge mode="neutral">{{ t("label.neutral") }}</Badge>
  </div>
</template>

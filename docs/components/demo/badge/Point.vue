<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap gap-5 justify-center">
    <Badge point mode="primary">{{ t("label.primary") }}</Badge>
    <Badge point mode="secondary">{{ t("label.secondary") }}</Badge>
    <Badge point mode="outline">{{ t("label.outline") }}</Badge>
    <Badge point mode="neutral">{{ t("label.neutral") }}</Badge>
  </div>
</template>

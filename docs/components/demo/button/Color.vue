<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap">
    <Button mode="primary" size="md" color="theme">{{ t("button.Theme") }}</Button>
    <Button mode="primary" size="md" color="neutral">{{ t("button.Neutral") }}</Button>
    <Button mode="primary" size="md" color="creative">{{ t("button.Creative") }}</Button>
    <Button mode="primary" size="md" color="destructive">{{ t("button.Destructive") }}</Button>
  </div>
</template>

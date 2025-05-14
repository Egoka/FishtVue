<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap items-center">
    <Button mode="primary" size="md" color="theme">{{ t("button.clickMe") }}</Button>
    <Button mode="outline" size="sm" color="neutral" icon="check">{{ t("button.check") }}</Button>
    <Button mode="ghost" size="lg" color="destructive" :loading="true">{{ t("button.loading") }}</Button>
  </div>
</template>

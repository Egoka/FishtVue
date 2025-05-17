<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap">
    <Button mode="primary" size="md" color="theme">{{ t("button.Primary") }}</Button>
    <Button mode="outline" size="md" color="neutral">{{ t("button.Outline") }}</Button>
    <Button mode="ghost" size="md" color="creative">{{ t("button.Ghost") }}</Button>
  </div>
</template>

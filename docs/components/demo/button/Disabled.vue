<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap">
    <Button mode="primary" size="md" color="theme" disabled>{{ t("button.Disabled") }}</Button>
    <Button mode="primary" size="md" color="theme" icon="check" disabled>{{ t("button.DisabledIcon") }}</Button>
  </div>
</template>

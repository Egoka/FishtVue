<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
</script>
<template>
  <Button mode="primary" size="md" color="theme">
    <template #default>
      <span>{{ t("title.customContent") }}</span>
    </template>
  </Button>
</template>

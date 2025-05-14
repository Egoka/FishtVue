<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap">
    <Button mode="primary" size="md" color="theme" rounded="none">{{ t("button.None") }}</Button>
    <Button mode="primary" size="md" color="theme" rounded="md">MD</Button>
    <Button mode="primary" size="md" color="theme" rounded="lg">LG</Button>
    <Button mode="primary" size="md" color="theme" rounded="full">{{ t("button.Full") }}</Button>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
</script>
<template>
  <Input :label="t('label.text')" classInput="text-theme-700 dark:text-theme-300">
    <template #before>
      <Icons type="bi:body-text" />
    </template>
  </Input>
</template>

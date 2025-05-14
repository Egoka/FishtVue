<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const selectedDate = ref()
</script>

<template>
  <Calendar :label="t('label.event')" v-model="selectedDate" />
</template>

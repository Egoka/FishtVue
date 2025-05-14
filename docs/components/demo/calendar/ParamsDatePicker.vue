<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const date = ref()
</script>

<template>
  <Calendar :paramsDatePicker="{ isRange: true, placeholder: t('placeholder.selectDateRange') }" v-model="date">
  </Calendar>
</template>

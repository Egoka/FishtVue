<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const selectedItem = ref()
</script>

<template>
  <Select :dataSelect="[]" :noData="t('label.noFruitsAvailable')" v-model="selectedItem" />
</template>

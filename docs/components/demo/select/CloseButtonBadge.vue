<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  import { musicalInstruments } from "~/components/demo/select/dataForExample"

  const { locale } = useI18n()
  const data = ref(musicalInstruments[locale.value])
  const selectedItems = ref()
</script>

<template>
  <Select :dataSelect="data" multiple closeButtonBadge v-model="selectedItems" />
</template>

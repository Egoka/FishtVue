<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  import { transport } from "~/components/demo/select/dataForExample"

  const { locale } = useI18n()
  const data = ref(transport[locale.value])
  const selectedValue = ref()
</script>

<template>
  <Select :dataSelect="data" :maxVisible="3" v-model="selectedValue" />
</template>

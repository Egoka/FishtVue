<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  import { animals } from "~/components/demo/select/dataForExample"

  const { locale } = useI18n()
  const data = ref(animals[locale.value])
  const selectedItem = ref()
</script>

<template>
  <Select :dataSelect="data" noQuery v-model="selectedItem" />
</template>

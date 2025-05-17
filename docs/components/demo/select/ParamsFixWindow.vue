<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  import { colors } from "~/components/demo/select/dataForExample"
  import type { SelectProps } from "#fishtvue/select"

  const { locale } = useI18n()
  const data = ref(colors[locale.value])
  const selectedItem = ref()
  const paramsFixWindow = ref<SelectProps["paramsFixWindow"]>({
    position: "right",
    eventOpen: "hover",
    eventClose: "hover"
  })
</script>

<template>
  <Select :dataSelect="data" :paramsFixWindow="paramsFixWindow" v-model="selectedItem" />
</template>

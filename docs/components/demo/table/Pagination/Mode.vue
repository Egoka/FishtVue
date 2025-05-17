<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import type { TableProps } from "fishtvue/table"
  import generateData from "~/components/demo/table/dataForExample"
  import { dataSelectMode } from "~/components/demo/configOptions"
  import { useI18n } from "vue-i18n"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const modeStyle = ref<FormProps["modeStyle"]>()
  const { data } = useAsyncData("tablePaginationMode", () =>
    Promise.resolve(
      generateData(500, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
</script>

<template>
  <Select :label="t('label.mode')" :help="t('help.mode')" :dataSelect="dataSelectMode" v-model="modeStyle" />
  <Separator></Separator>
  <Table
    :countVisibleRows="5"
    :data-source="data as any[]"
    :pagination="{
      visible: true,
      mode: modeStyle
    }">
  </Table>
</template>

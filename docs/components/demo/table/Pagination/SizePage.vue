<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import { dataSelectMode } from "~/components/demo/configOptions"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const sizePage = ref(20)
  const { data } = useAsyncData("tablePaginationSizePage", () =>
    Promise.resolve(
      generateData(500, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
</script>

<template>
  <Input
    type="number"
    :label="t('label.sizePage')"
    :help="t('help.sizePage')"
    :dataSelect="dataSelectMode"
    v-model="sizePage" />
  <Separator></Separator>
  <Table
    :countVisibleRows="5"
    :data-source="data as any[]"
    :pagination="{
      visible: true,
      sizePage: +sizePage
    }">
  </Table>
</template>

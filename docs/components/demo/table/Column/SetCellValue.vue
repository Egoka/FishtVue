<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnSetCellValue", () =>
    Promise.resolve(generateData(5, "cars", ["model", "year", "mileageKm", "priceUSD"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "model", caption: t("caption.model") },
    { dataField: "year", caption: t("caption.year"), setCellValue: (_, value) => `${value} year` },
    { dataField: "mileageKm", caption: t("caption.mileageKm"), setCellValue: (_, value) => `${value} km` },
    { dataField: "priceUSD", caption: t("caption.priceUSD"), setCellValue: (_, value) => `$ ${value}` }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns"></Table>
</template>

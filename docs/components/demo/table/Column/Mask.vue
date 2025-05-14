<script setup lang="ts">
  import generateData, { type ThemeData } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnMask", () =>
    Promise.resolve(generateData(5, "cars", ["model", "mileageKm", "priceUSD"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "model", caption: t("caption.model") },
    { dataField: "mileageKm", caption: t("caption.mileageKm"), mask: "price" },
    { dataField: "priceUSD", caption: t("caption.priceUSD"), mask: "price" }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns"></Table>
</template>

<script setup lang="ts">
  import type { TableProps } from "fishtvue/table"
  import generateData from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnDefaultFilter", () =>
    Promise.resolve(generateData(5, "cars", ["model", "color", "priceUSD"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "model", caption: t("caption.model") },
    { dataField: "color", caption: t("caption.color"), isFilter: true, defaultFilter: "Black" },
    { dataField: "priceUSD", caption: t("caption.priceUSD"), isFilter: true }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns"></Table>
</template>

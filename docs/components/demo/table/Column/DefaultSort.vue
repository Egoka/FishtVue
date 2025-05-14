<script setup lang="ts">
  import type { TableProps } from "fishtvue/table"
  import generateData from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnDefaultSort", () =>
    Promise.resolve(generateData(5, "cars", ["model", "color", "priceUSD"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "model", caption: t("caption.model") },
    { dataField: "color", caption: t("caption.color"), isSort: true, defaultSort: "asc" },
    { dataField: "priceUSD", caption: t("caption.priceUSD"), isSort: true }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns"></Table>
</template>

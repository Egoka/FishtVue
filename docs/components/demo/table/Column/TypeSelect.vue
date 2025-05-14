<script setup lang="ts">
  import generateData, { type ThemeData } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnTypeSelect", () =>
    Promise.resolve(generateData(500, "hotels", ["name", "country", "stars"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), type: "string", isFilter: true },
    { dataField: "country", caption: t("caption.country"), type: "select", isFilter: true },
    { dataField: "stars", caption: t("caption.stars"), type: "select", isFilter: true }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :countVisibleRows="5" :columns="columns"></Table>
</template>

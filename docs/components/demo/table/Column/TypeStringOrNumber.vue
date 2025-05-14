<script setup lang="ts">
  import generateData, { type ThemeData } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnTypeStringOrNumber", () =>
    Promise.resolve(generateData(50, "hotels", ["name", "stars", "roomsAvailable"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), type: "string", isFilter: true },
    { dataField: "stars", caption: t("caption.stars"), type: "number", isFilter: true },
    { dataField: "roomsAvailable", caption: t("caption.roomsAvailable"), type: "number", isFilter: true }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :countVisibleRows="5" :columns="columns"></Table>
</template>

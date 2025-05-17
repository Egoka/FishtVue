<script setup lang="ts">
  import generateData, { type ThemeData } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnTypeDate", () =>
    Promise.resolve(generateData(500, "events", ["name", "createdAt", "updatedAt", "startDate", "endDate"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), type: "string", isFilter: true },
    { dataField: "createdAt", caption: t("caption.createdAt"), type: "date", isFilter: true },
    { dataField: "updatedAt", caption: t("caption.updatedAt"), type: "date", isFilter: true },
    { dataField: "startDate", caption: t("caption.startDate"), type: "date", isFilter: true },
    { dataField: "endDate", caption: t("caption.endDate"), type: "date", isFilter: true }
  ])
</script>

<template>
  <Table :data-source="data" :countVisibleRows="5" :columns="columns"></Table>
</template>

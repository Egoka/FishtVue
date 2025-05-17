<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableSummaryType", () =>
    Promise.resolve(
      generateData(5, "statistics", ["name", "totalUsers", "activeUsers", "newUsersToday", "totalRevenue"])
    )
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name") },
    { dataField: "totalUsers", caption: t("caption.totalUsers") },
    { dataField: "totalRevenue", caption: t("caption.totalRevenue") },
    { dataField: "activeUsers", caption: t("caption.activeUsers") },
    { dataField: "newUsersToday", caption: t("caption.newUsersToday") }
  ])
  const summary = ref<TableProps["summary"]>([
    { dataField: "name", type: "count", dataType: "string" },
    { dataField: "totalUsers", type: "avg", dataType: "number" },
    { dataField: "totalRevenue", type: "min", dataType: "number" },
    { dataField: "activeUsers", type: "max", dataType: "number" },
    { dataField: "newUsersToday", type: "sum", dataType: "number" }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns" :summary="summary"> </Table>
</template>

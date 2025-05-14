<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import type { TableProps } from "fishtvue/table"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const { data } = useAsyncData("tableEditGlobal", () =>
    Promise.resolve(generateData(50, "users", ["name", "age", "role"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), type: "string" },
    { dataField: "age", caption: t("caption.age"), type: "number", edit: true },
    { dataField: "role", caption: t("caption.role"), type: "select", edit: true }
  ])
</script>

<template>
  <Table filter :countVisibleRows="5" :columns="columns" :data-source="data as any[]"> </Table>
</template>

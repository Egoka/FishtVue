<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import type { TableProps } from "fishtvue/table"
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
  const { data } = useAsyncData("tableEditGlobal", () =>
    Promise.resolve(generateData(50, "users", ["name", "role", "createdAt", "updatedAt"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), type: "string", width: 100 },
    { dataField: "role", caption: t("caption.role"), type: "select", width: 100 },
    { dataField: "createdAt", caption: t("caption.createdAt"), type: "date", width: 100 },
    { dataField: "updatedAt", caption: t("caption.updatedAt"), type: "date", width: 100 }
  ])
</script>

<template>
  <Table edit filter :countVisibleRows="5" :columns="columns" :data-source="data as any[]"> </Table>
</template>

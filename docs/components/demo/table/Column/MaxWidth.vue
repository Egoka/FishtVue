<script setup lang="ts">
  import generateData, { type ThemeData } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnMaxWidth", () =>
    Promise.resolve(
      generateData(5, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), isResized: true, maxWidth: 200 },
    { dataField: "color", caption: t("caption.color") },
    { dataField: "pricePerKg", caption: t("caption.weightGrams"), isResized: true, maxWidth: 150 }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns"></Table>
</template>

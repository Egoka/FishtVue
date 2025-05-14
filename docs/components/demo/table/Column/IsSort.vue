<script setup lang="ts">
  import generateData, { type ThemeData } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnIsSort", () =>
    Promise.resolve(
      generateData(50, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), isSort: true },
    { dataField: "color", caption: t("caption.color") },
    { dataField: "weightGrams", caption: t("caption.weightGrams"), isSort: true }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :countVisibleRows="5" :columns="columns"></Table>
</template>

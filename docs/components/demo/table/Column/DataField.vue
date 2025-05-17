<script setup lang="ts">
  import type { TableProps } from "fishtvue/table"
  import generateData from "~/components/demo/table/dataForExample"
  import { useAsyncData } from "#imports"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnDataField", () =>
    Promise.resolve(
      generateData(5, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name" },
    { dataField: "color" },
    { dataField: "weightGrams" }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns"></Table>
</template>

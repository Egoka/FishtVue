<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import type { TableProps } from "fishtvue/table"

  const { data } = useAsyncData("tableSummaryDataField", () =>
    Promise.resolve(generateData(5, "fruits", ["name", "color", "weightGrams"]))
  )
  const summary = ref<TableProps["summary"]>([
    { dataField: "name" },
    { dataField: "color" },
    { dataField: "weightGrams" }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :summary="summary"> </Table>
</template>

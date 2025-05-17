<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { data } = useAsyncData("tablePaginationInfoText", () =>
    Promise.resolve(
      generateData(500, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
</script>

<template>
  <Table
    :countVisibleRows="5"
    :data-source="data as any[]"
    :pagination="{
      visible: true,
      isInfoText: true
    }">
  </Table>
</template>

<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const { data } = useAsyncData("tablePaginationSizesSelector", () =>
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
      sizePage: 10,
      sizesSelector: [10, 25, 50]
    }">
  </Table>
</template>

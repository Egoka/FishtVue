<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const { data } = useAsyncData("tablePaginationPageSizeSelector", () =>
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
      isPageSizeSelector: true
    }">
  </Table>
</template>

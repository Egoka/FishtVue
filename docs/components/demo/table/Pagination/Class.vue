<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import { useAsyncData } from "#imports"

  const { data } = useAsyncData("tablePaginationClass", () =>
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
      class: 'custom-pagination-class'
    }">
  </Table>
</template>

<style scoped>
  :deep(.custom-pagination-class) {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>

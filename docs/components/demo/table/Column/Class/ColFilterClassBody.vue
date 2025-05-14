<script setup lang="ts">
  import generateData, { type ThemeData } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnClassColFilterClassBody", () =>
    Promise.resolve(generateData(5, "fruits", ["name", "color", "weightGrams"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), isFilter: true, class: { colFilterClass: "class-th-red" } },
    { dataField: "color", caption: t("caption.color"), isFilter: true, class: { colFilterClass: "class-th-orange" } },
    {
      dataField: "weightGrams",
      caption: t("caption.weightGrams"),
      isFilter: true,
      class: { colFilterClass: "class-th-green" }
    }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns"> </Table>
</template>
<style scoped>
  :deep(.class-th-red) {
    margin: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-red-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
  :deep(.class-th-orange) {
    margin: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-orange-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
  :deep(.class-th-green) {
    margin: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-green-500) 40%, transparent);
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

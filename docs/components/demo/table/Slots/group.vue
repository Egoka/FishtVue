<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableSlotsGroup", () =>
    Promise.resolve(generateData(50, "fruits", ["name", "color", "weightGrams"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name") },
    { dataField: "color", caption: t("caption.color") },
    { dataField: "weightGrams", caption: t("caption.weightGrams") }
  ])
</script>

<template>
  <Table grouping="color" :countVisibleRows="5" :data-source="data as any[]" :columns="columns">
    <template #group="{ item }">
      <div class="custom-group flex flex-row items-center justify-between w-full px-5 text-left font-semibold text-xl">
        {{ item }}
      </div>
    </template>
  </Table>
</template>
<style scoped>
  .custom-group {
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

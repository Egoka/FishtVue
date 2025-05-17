<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#app"

  const { t } = useI18n()
  const { data } = useAsyncData("tableSlotsDynamic", () =>
    Promise.resolve(generateData(5, "fruits", ["name", "color", "weightGrams"]))
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), cellTemplate: "name" },
    { dataField: "color", caption: t("caption.color"), cellTemplate: "color" },
    { dataField: "weightGrams", caption: t("caption.weightGrams"), cellTemplate: "weightGrams" }
  ])
</script>

<template>
  <Table :data-source="data as any[]" :columns="columns">
    <template #name="{ value }">
      <div class="custom-dynamic-class w-full px-5 text-center font-light text-xl">
        {{ value }}
      </div>
    </template>
    <template #color="{ value }">
      <div class="custom-dynamic-class w-full px-5 text-center font-light text-xl">
        {{ value }}
      </div>
    </template>
    <template #weightGrams="{ value }">
      <div class="custom-dynamic-class w-full px-5 text-center font-light text-xl">
        {{ value }}
      </div>
    </template>
  </Table>
</template>
<style scoped>
  .custom-dynamic-class {
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

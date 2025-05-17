<script setup lang="ts">
  import type { IColumn, TableProps } from "#fishtvue/table"
  import generateData, { type ThemeData } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const visible = ref<IColumn["visible"]>(false)
  const { data } = useAsyncData("tableColumnVisible", () =>
    Promise.resolve(
      generateData(5, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name") },
    { dataField: "color", caption: t("caption.color") },
    { dataField: "weightGrams", caption: t("caption.weightGrams"), visible }
  ])
</script>

<template>
  <Switch switchingType="switch" v-model="visible" :label="t('label.visible')" />
  <Separator></Separator>
  <Table :data-source="data as any[]" :columns="columns"></Table>
</template>

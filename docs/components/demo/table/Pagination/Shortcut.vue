<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import type { TableProps } from "fishtvue/table"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const visible = ref(true)
  const { data } = useAsyncData("tablePaginationShortcut", () =>
    Promise.resolve(
      generateData(500, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
</script>

<template>
  <Switch switchingType="switch" v-model="visible" :label="t('label.visible')" />
  <Separator></Separator>
  <Table :countVisibleRows="5" :data-source="data as any[]" :pagination="visible"> </Table>
</template>

<script setup lang="ts">
  import generateData from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const countVisibleRows = ref(5)
  const { data } = useAsyncData("tableCountVisibleRows", () =>
    Promise.resolve(
      generateData(500, "fruits", ["name", "color", "weightGrams", "isTropical", "originCountry", "pricePerKg"])
    )
  )
</script>

<template>
  <Select
    :label="t('label.countVisibleRows')"
    :help="t('help.countVisibleRows')"
    :dataSelect="[3, 4, 5, 6, 7, 8]"
    v-model="countVisibleRows" />
  <Separator></Separator>
  <Table :countVisibleRows="countVisibleRows" :data-source="data as any[]"></Table>
</template>

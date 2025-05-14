<script setup lang="ts">
  import type { TableProps } from "fishtvue/table"
  import generateData, { styleOne } from "~/components/demo/table/dataForExample"
  import { useI18n } from "vue-i18n"
  import { useAsyncData } from "#imports"

  const { t } = useI18n()
  const { data } = useAsyncData("tableColumnCellTemplate", () => Promise.resolve(generateData(50, "hotels")))
  const columns = ref<TableProps["columns"]>([
    { dataField: "name", caption: t("caption.name"), type: "string", isSort: true, isFilter: true, width: 200 },
    { dataField: "country", caption: t("caption.country"), type: "select", isSort: true, isFilter: true, width: 130 },
    { dataField: "isRecommended", caption: t("caption.isRecommended"), isSort: true, cellTemplate: "status" },
    {
      dataField: "stars",
      caption: t("caption.stars"),
      type: "select",
      isSort: true,
      isFilter: true,
      cellTemplate: "rating"
    }
  ])
</script>

<template>
  <Table :countVisibleRows="5" :data-source="data as any[]" :columns="columns">
    <template #rating="{ value: countStars }">
      <Icons
        type="ion:star-outline"
        v-for="star in 5 - countStars"
        :key="star"
        class="w-5 h-5 text-neutral-300 dark:text-neutral-700"></Icons>
      <Icons
        type="ion:star"
        v-for="star in Number(countStars)"
        :key="star"
        class="w-5 h-5 text-amber-300 dark:text-amber-700"></Icons>
    </template>
    <template #status="{ value }">
      <Badge v-if="value === 'true'" mode="neutral" :class="styleOne.green">yes</Badge>
      <Badge v-else-if="value === 'false'" mode="neutral" :class="styleOne.red">no</Badge>
    </template>
  </Table>
</template>

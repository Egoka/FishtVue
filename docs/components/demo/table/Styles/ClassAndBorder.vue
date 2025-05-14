<script setup lang="ts">
import type {ITableStyles, TableProps} from "fishtvue/table"
import generateData from "~/components/demo/table/dataForExample";
import {useI18n} from "vue-i18n";
import { useAsyncData } from "#imports";

const {t} = useI18n()
const { data } = useAsyncData("tableStylesClassAndBorder", () =>
    Promise.resolve(generateData(50, 'fruits', ['name', 'color', 'weightGrams',]))
);
const styles = reactive<ITableStyles>({})
const classesDataSelect = ref([
  {id: 'body', value: 'body', key: {body: 'p-1.5 custom-table-class'}},
  {id: 'toolbar', value: 'toolbar', key: {toolbar: 'justify-end items-end custom-table-class'}},
  {id: 'bodyTable', value: 'bodyTable', key: {bodyTable: 'custom-table-class'}},
  {id: 'slotHeader', value: 'slotHeader', key: {slotHeader: 'custom-table-class'}},
  {id: 'slotFooter', value: 'slotFooter', key: {slotFooter: 'custom-table-class'}},
  {id: 'table', value: 'table', key: {table: 'custom-table-class'}},
  {id: 'thead', value: 'thead', key: {thead: 'custom-table-class'}},
  {id: 'tbody', value: 'tbody', key: {tbody: 'custom-table-class'}},
  {id: 'tfoot', value: 'tfoot', key: {tfoot: 'custom-table-class'}},
  {
    id: 'group',
    value: 'group',
    key: {group: 'text-left text-gray-800 dark:text-gray-300 px-6 py-2 pr-3 pl-10 sm:pl-12 custom-table-class'}
  },
  {
    id: 'groupText',
    value: 'groupText',
    key: {groupText: 'left-10 sm:left-12 flex items-center w-fit min-h-[2.5rem] truncate custom-table-class'}
  },
  {id: 'pagination', value: 'pagination', key: {pagination: 'custom-table-class'}},
])
const borderDataSelect = ref([
  {id: 'table', value: 'table', key: {table: 'border-1 border-theme-200 dark:border-theme-700'},},
  {id: 'header', value: 'header', key: {header: 'border-b-1 border-theme-200 dark:border-theme-700'},},
  {id: 'filter', value: 'filter', key: {filter: 'border-r-1 border-theme-200 dark:border-theme-700'},},
  {id: 'head', value: 'head', key: {head: 'border-b-1 border-theme-200 dark:border-theme-700'},},
  {id: 'cell', value: 'cell', key: {cell: 'border-r-1 border-b-1 border-theme-200 dark:border-theme-700'},},
  {id: 'summary', value: 'summary', key: {summary: 'border-t-1 border-theme-200 dark:border-theme-700'},},
  {id: 'pagination', value: 'pagination', key: {pagination: 'border-t-1 border-theme-200 dark:border-theme-700'},},
  {id: 'footer', value: 'footer', key: {footer: 'border-t-1 border-theme-200 dark:border-theme-700'},},
])
</script>

<template>
  <div class="flex flex-wrap justify-center">
    <Select
        :label="t('label.tableZones')"
        :help="t('help.tableZones')"
        class-body="m-2 w-[9rem] mb-0 rounded-md"
        clear
        multiple
        :max-visible="0"
        noQuery
        :data-select="classesDataSelect"
        @update:model-value="(value: any[])=>styles.class = (value as [])?.reduce((result,item)=>Object.assign(result, classesDataSelect.find(i=>i.id===item)?.key),{})"/>
    <Select
        :label="t('label.tableBorder')"
        :help="t('help.tableBorder')"
        class-body="m-2 w-[9rem] mb-0 rounded-md"
        clear
        multiple
        :max-visible="0"
        noQuery
        :data-select="borderDataSelect"
        @update:model-value="(value: any[])=>styles.border = (value as [])?.reduce((result,item)=>Object.assign(result, borderDataSelect.find(i=>i.id===item)?.key),{})"/>
  </div>
  <Separator></Separator>
  <Table
      toolbar
      filter
      grouping="color"
      columns
      pagination
      :data-source="data as any[]"
      :countVisibleRows="5"
      :styles="styles">
    <template #toolbar>
      <div class="w-full text-left font-semibold text-lg pl-5"> {{ t("title.toolbar") }}</div>
    </template>
    <template #header>
      <div class="w-full text-left font-semibold text-lg pl-5"> {{ t("title.header") }}</div>
    </template>
    <template #footer>
      <div class="w-full text-left font-semibold text-lg pl-5"> {{ t("title.footer") }}</div>
    </template>
  </Table>
</template>

<style scoped>
.custom-table-class {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 30%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}

:deep(.custom-table-class) {
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 30%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
</style>
<script setup lang="ts">
import type {ITableStyles, TableProps} from "fishtvue/table"
import generateData from "~/components/demo/table/dataForExample";
import {useI18n} from "vue-i18n";
import { useAsyncData } from "#imports";

const {t} = useI18n()
const { data } = useAsyncData("tableStylesRadiusAndHeight", () =>
    Promise.resolve(generateData(50, 'fruits', ['name', 'color', 'weightGrams',]))
);
const styles = reactive<ITableStyles>({})
</script>
<template>
  <div class="flex flex-wrap justify-center">
    <Select
        :label="t('label.borderRadiusPx')"
        :help="t('help.borderRadiusPx')"
        class-select="justify-end pr-px"
        :data-select="[0, 1, 5, 10, 15, 20, 30, 50]"
        no-query
        v-model="styles.borderRadiusPx"
        class-body="m-2 w-52"
        clear>
      <template v-if="styles.borderRadiusPx" #after>px</template>
      <template #item="{item}">
        {{item.value}}px
      </template>
    </Select>
    <Select
        :label="t('label.heightCell')"
        :help="t('help.heightCell')"
        class-select="justify-end pr-px"
        :data-select="[ 20, 30, 40, 50, 60]"
        no-query
        v-model="styles.heightCell"
        class-body="m-2 w-52"
        clear>
      <template v-if="styles.heightCell" #after>px</template>
      <template #item="{item}">
        {{item.value}}px
      </template>
    </Select>
  </div>
  <Separator></Separator>
  <Table
      filter
      columns
      :data-source="data as any[]"
      :countVisibleRows="5"
      :styles="styles">
  </Table>
</template>
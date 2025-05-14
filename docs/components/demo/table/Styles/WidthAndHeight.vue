<script setup lang="ts">
import type {ITableStyles, TableProps} from "fishtvue/table"
import generateData from "~/components/demo/table/dataForExample";
import {useI18n} from "vue-i18n";
import { useAsyncData } from "#imports";

const {t} = useI18n()
const { data } = useAsyncData("tableStylesWidthAndHeight", () =>
    Promise.resolve(generateData(50, 'fruits', ['name', 'color', 'weightGrams',]))
);
const styles = reactive<ITableStyles>({})
</script>

<template>
  <div class="flex flex-wrap justify-center">
    <Select
        :label="t('label.width')"
        :help="t('help.width')"
        class-select="justify-end pr-px"
        :data-select="[300, 400, 500, 600, 700]"
        no-query
        v-model="styles.width"
        class-body="m-2 w-52"
        clear>
      <template v-if="styles.width" #after>px</template>
      <template #item="{item}">
        {{item.value}}px
      </template>
    </Select>
    <Select
        :label="t('label.height')"
        :help="t('help.height')"
        class-select="justify-end pr-px"
        :data-select="[300, 400, 500, 600, 700]"
        no-query
        v-model="styles.height"
        class-body="m-2 w-52"
        clear>
      <template v-if="styles.height" #after>px</template>
      <template #item="{item}">
        {{item.value}}px
      </template>
    </Select>
  </div>
  <Separator></Separator>
  <Table
      toolbar
      filter
      grouping="color"
      columns
      :pagination="{visible: true, sizePage: 20}"
      :data-source="data as any[]"
      :countVisibleRows="5"
      :styles="styles">
  </Table>
</template>
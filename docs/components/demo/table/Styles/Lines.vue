<script setup lang="ts">
import type {ITableStyles, TableProps} from "fishtvue/table"
import generateData from "~/components/demo/table/dataForExample";
import {useI18n} from "vue-i18n";
import { useAsyncData } from "#imports";

const {t} = useI18n()
const { data } = useAsyncData("tableStylesLines", () =>
    Promise.resolve(generateData(5, 'fruits', ['name', 'color', 'weightGrams',]))
);
const styles = reactive<ITableStyles>({
  horizontalLines: false,
  verticalLines: false,
  filterLines: false
})
</script>

<template>
  <div class="flex flex-wrap justify-center">
    <Switch
        :label="t('label.horizontalLines')"
        :help="t('help.horizontalLines')"
        v-model="styles.horizontalLines"
        :switching-type="'switch'">
    </Switch>
    <Switch
        :label="t('label.verticalLines')"
        :help="t('help.verticalLines')"
        v-model="styles.verticalLines"
        :switching-type="'switch'">
    </Switch>
    <Switch
        :label="t('label.filterLines')"
        :help="t('help.filterLines')"
        v-model="styles.filterLines"
        :switching-type="'switch'">
    </Switch>
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
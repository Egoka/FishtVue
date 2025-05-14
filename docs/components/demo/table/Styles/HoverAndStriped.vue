<script setup lang="ts">
import type {ITableStyles} from "fishtvue/table"
import generateData from "~/components/demo/table/dataForExample";
import {useI18n} from "vue-i18n";
import { useAsyncData } from "#imports";

const {t} = useI18n()
const { data } = useAsyncData("tableStylesHoverAndStriped", () =>
    Promise.resolve(generateData(5, 'fruits', ['name', 'color', 'weightGrams',]))
);
const styles = reactive<ITableStyles>({
  hoverRows: "hover:bg-theme-100/10 dark:hover:bg-theme-900/10",
  isStripedRows: false
})
const hoverRows = ref(true)
watch(hoverRows, () => {
  styles.hoverRows = hoverRows.value ? "hover:bg-theme-100/10 dark:hover:bg-theme-900/10" : ""
})
</script>

<template>
  <div class="flex flex-wrap justify-center">
    <Switch
        :label="t('label.hoverRows')"
        v-model="hoverRows"
        :switching-type="'switch'">
    </Switch>
    <Switch
        :label="t('label.isStripedRows')"
        v-model="styles.isStripedRows"
        :switching-type="'switch'">
    </Switch>
  </div>
  <Separator></Separator>
  <Table
      :data-source="data as any[]"
      :countVisibleRows="5"
      :styles="styles">
  </Table>
</template>
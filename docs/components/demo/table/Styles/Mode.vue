<script setup lang="ts">
import type {TableProps} from "fishtvue/table"
import type {FormProps} from "#fishtvue/form"
import generateData from "~/components/demo/table/dataForExample";
import {dataSelectMode} from "~/components/demo/configOptions";
import {useI18n} from "vue-i18n";
import { useAsyncData } from "#imports";

const {t} = useI18n()
const { data } = useAsyncData("tableStylesMode", () =>
    Promise.resolve(generateData(500, 'fruits', ['name', 'color', 'weightGrams',]))
);
const modeStyle = ref<FormProps["modeStyle"]>()
</script>

<template>
  <Select
      :label="t('label.mode')"
      :help="t('help.mode')"
      :dataSelect="dataSelectMode"
      v-model="modeStyle"/>
  <Separator></Separator>
  <Table columns summary filter :mode="modeStyle" :data-source="data as any[]" :countVisibleRows="5"></Table>
</template>
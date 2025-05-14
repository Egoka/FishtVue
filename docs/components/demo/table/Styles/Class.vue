<script setup lang="ts">
import type {TableProps} from "fishtvue/table"
import generateData from "~/components/demo/table/dataForExample";
import { useAsyncData } from "#imports";

const { data } = useAsyncData("tableStylesClass", () =>
    Promise.resolve(generateData(500, 'fruits', ['name', 'color', 'weightGrams',]))
);
</script>

<template>
  <Table :data-source="data as any[]" :countVisibleRows="5" class="custom-table-class"></Table>
</template>

<style scoped>
.custom-table-class{
  --pattern-fg: color-mix(in oklab, var(--color-theme-500) 20%, transparent);
  background-size: 10px 10px;
  background-image: repeating-linear-gradient(315deg, var(--pattern-fg) 0, var(--pattern-fg) 1px, transparent 0, transparent 50%);
}
</style>
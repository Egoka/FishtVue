<script setup lang="ts">
  import type { ColumnGroupProps, ColumnGroupSlots } from "./Table"
  // ---BASE-COMPONENT----------------------
  // ColumnGroup — renderless descriptor для multi-level headers compound `<Table>` API.
  // Своего DOM не рендерит: родительский <Table> через VNode-walk собирает вложенные <Column>
  // в плоский список колонок (для тела) + строит верхний ряд шапки `<th colspan>` с caption группы.
  // Сопоставление в Table идёт по имени "ColumnGroup".
  defineOptions({ name: "ColumnGroup", inheritAttrs: false })
  // ---PROPS-SLOTS-------------------------
  defineProps<ColumnGroupProps>()
  defineSlots<ColumnGroupSlots>()
</script>

<template>
  <!-- renderless: структура считывается родительским <Table> через slots.default() -->
  <slot v-if="false" />
</template>

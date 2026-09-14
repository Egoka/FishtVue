<script setup lang="ts">
  import type { ColumnProps, ColumnSlots } from "./Table"
  // ---BASE-COMPONENT----------------------
  // Column — renderless descriptor для compound `<Table><Column>` API. Своего DOM не рендерит:
  // родительский <Table> читает props/slots этого компонента через VNode-walk (slots.default())
  // и сам строит <th>/фильтр/ячейку. Поэтому здесь нет `new Component()` / стилей — это чисто
  // декларативная единица (зеркало MenuItem.vue). Сопоставление в Table идёт по имени "Column".
  defineOptions({ name: "Column", inheritAttrs: false })
  // ---PROPS-SLOTS-------------------------
  defineProps<ColumnProps>()
  defineSlots<ColumnSlots>()
</script>

<template>
  <!-- renderless: структура считывается родительским <Table> через slots.default() -->
  <slot v-if="false" />
</template>

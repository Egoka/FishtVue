<script setup lang="ts">
  import type { SelectGroupProps, SelectGroupSlots } from "./Select"
  // ---BASE-COMPONENT----------------------
  // SelectGroup — renderless descriptor для группировки опций в compound `<Select>` API (Issue 3).
  // Своего DOM не рендерит: родительский <Select> через VNode-walk собирает вложенные <SelectOption>
  // и рендерит non-selectable header-строку с `label` над ними (зеркало FormSection.vue / ColumnGroup).
  // Сопоставление в Select идёт по имени "SelectGroup".
  defineOptions({ name: "SelectGroup", inheritAttrs: false })
  // ---PROPS-SLOTS-------------------------
  defineProps<SelectGroupProps>()
  defineSlots<SelectGroupSlots>()
</script>

<template>
  <!-- renderless: структура считывается родительским <Select> через slots.default() -->
  <slot v-if="false" />
</template>

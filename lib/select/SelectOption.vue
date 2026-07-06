<script setup lang="ts">
  import type { SelectOptionProps, SelectOptionSlots } from "./Select"
  // ---BASE-COMPONENT----------------------
  // SelectOption — renderless descriptor для compound `<Select><SelectOption>` API (Issue 3). Своего DOM
  // не рендерит: родительский <Select> читает props/default-slot через VNode-walk (slots.default()) и сам
  // строит опцию списка. Здесь нет `new Component()` / стилей — чистая декларативная единица
  // (зеркало FormField.vue / Column.vue). Сопоставление в Select идёт по имени "SelectOption".
  // `value` — и model-значение (keySelect), и fallback-текст; `label` или текст default-slot — отображение.
  defineOptions({ name: "SelectOption", inheritAttrs: false })
  // ---PROPS-SLOTS-------------------------
  defineProps<SelectOptionProps>()
  defineSlots<SelectOptionSlots>()
</script>

<template>
  <!-- renderless: props и текст default-slot считываются родительским <Select> через slots.default();
       собственный DOM не рендерится -->
  <span v-if="false" />
</template>

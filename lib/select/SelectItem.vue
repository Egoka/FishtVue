<script setup lang="ts">
  import type { SelectItemProps, SelectItemSlots } from "./Select"
  // ---BASE-COMPONENT----------------------
  // SelectItem — renderless descriptor для compound `<Select><SelectItem>` API (Issue 3). Своего DOM
  // не рендерит: родительский <Select> читает props/default-slot через VNode-walk (slots.default()) и сам
  // строит опцию списка. Здесь нет `new Component()` / стилей — чистая декларативная единица
  // (зеркало FormField.vue / Column.vue). Сопоставление в Select идёт по имени "SelectItem".
  // Имя `SelectItem`, а не `SelectOption`: последнее занято options-типом `componentsOptions.Select`
  // (конвенция `XOption`) — решение 8 редизайна props 1.0.
  // `value` — и model-значение (keySelect), и fallback-текст; `label` или текст default-slot — отображение.
  defineOptions({ name: "SelectItem", inheritAttrs: false })
  // ---PROPS-SLOTS-------------------------
  defineProps<SelectItemProps>()
  defineSlots<SelectItemSlots>()
</script>

<template>
  <!-- renderless: props и текст default-slot считываются родительским <Select> через slots.default();
       собственный DOM не рендерится -->
  <span v-if="false" />
</template>

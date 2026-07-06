<script setup lang="ts">
  import type { FormFieldProps, FormFieldSlots } from "./Form"
  // ---BASE-COMPONENT----------------------
  // FormField — renderless descriptor для compound `<Form><FormField>` API (Issue 2). Своего DOM не
  // рендерит: родительский <Form> читает props/slots через VNode-walk (slots.default()) и сам строит
  // поле (Input/Select/.../зарегистрированный тип) либо рендерит default-slot как custom-контрол.
  // Здесь нет `new Component()` / стилей — чистая декларативная единица (зеркало Column.vue/MenuItem.vue).
  // Сопоставление в Form идёт по имени "FormField".
  defineOptions({ name: "FormField", inheritAttrs: false })
  // ---PROPS-SLOTS-------------------------
  defineProps<FormFieldProps>()
  defineSlots<FormFieldSlots>()
</script>

<template>
  <!-- renderless: props и default-slot (custom-контрол) считываются родительским <Form> через
       slots.default(); собственный DOM не рендерится (default-slot — scoped, поэтому placeholder, а не <slot>) -->
  <span v-if="false" />
</template>

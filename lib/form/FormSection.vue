<script setup lang="ts">
  import type { FormSectionProps, FormSectionSlots } from "./Form"
  // ---BASE-COMPONENT----------------------
  // FormSection — renderless descriptor для группировки полей в compound `<Form>` API (Issue 2).
  // Своего DOM не рендерит: родительский <Form> через VNode-walk собирает вложенные <FormField>
  // в одну секцию FormStructure (title/description пробрасываются в `itemTitle` slot).
  // Сопоставление в Form идёт по имени "FormSection".
  defineOptions({ name: "FormSection", inheritAttrs: false })
  // ---PROPS-SLOTS-------------------------
  defineProps<FormSectionProps>()
  defineSlots<FormSectionSlots>()
</script>

<template>
  <!-- renderless: структура считывается родительским <Form> через slots.default() -->
  <slot v-if="false" />
</template>

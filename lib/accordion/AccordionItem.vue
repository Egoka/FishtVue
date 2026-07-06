<script setup lang="ts">
  import type { AccordionItemProps, AccordionItemSlots } from "./AccordionItem"
  // ---BASE-COMPONENT----------------------
  // AccordionItem — renderless descriptor: собственного DOM не рендерит. Родительский <Accordion>
  // читает props/slots этого компонента через VNode-walk и сам рендерит секцию.
  // Поэтому здесь нет `new Component()` / стилей — это чисто декларативная единица.
  defineOptions({ name: "AccordionItem", inheritAttrs: false })
  // ---PROPS-EMITS-SLOTS-------------------
  // эмитов нет (AccordionItemEmits = null) — defineEmits не объявляем
  defineProps<AccordionItemProps>()
  defineSlots<AccordionItemSlots>()
</script>

<template>
  <!-- renderless: структура считывается родительским <Accordion> через slots.default() -->
  <slot v-if="false" />
</template>

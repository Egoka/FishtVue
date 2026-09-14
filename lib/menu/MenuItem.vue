<script setup lang="ts">
  import type { MenuItemProps, MenuItemSlots, MenuItemEmits } from "./MenuItem"
  // ---BASE-COMPONENT----------------------
  // MenuItem — renderless descriptor: собственного DOM не рендерит. Родительский <Menu>
  // читает props/slots этого компонента через VNode-walk и сам рендерит пункт меню.
  // Поэтому здесь нет `new Component()` / стилей — это чисто декларативная единица.
  defineOptions({ name: "MenuItem", inheritAttrs: false })
  // ---PROPS-EMITS-SLOTS-------------------
  defineProps<MenuItemProps>()
  defineEmits<MenuItemEmits>()
  defineSlots<MenuItemSlots>()
</script>

<template>
  <!-- renderless: структура считывается родительским <Menu> через slots.default() -->
  <slot v-if="false" />
</template>

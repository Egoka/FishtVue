<script setup lang="ts">
  import type { MenuGroupProps, MenuGroupSlots } from "./MenuGroup"
  // ---BASE-COMPONENT----------------------
  // MenuGroup — renderless descriptor: собственного DOM не рендерит. Родительский <Menu>
  // читает props/slots этого компонента через VNode-walk и сам рендерит группу.
  defineOptions({ name: "MenuGroup", inheritAttrs: false })
  // ---PROPS-EMITS-SLOTS-------------------
  defineProps<MenuGroupProps>()
  defineSlots<MenuGroupSlots>()
</script>

<template>
  <!-- renderless: структура считывается родительским <Menu> через slots.default() -->
  <slot v-if="false" />
</template>

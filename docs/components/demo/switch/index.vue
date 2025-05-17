<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { SwitchProps } from "#fishtvue/switch"

  import { layoutConfigOptions } from "~/components/demo/configOptions"

  const optionsValues = ref<SwitchProps>({})
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<SwitchProps>(optionsValues.value, [
      "switchingType",
      //@ts-ignore
      "modeSwitch",
      "rounded",
      "iconActive",
      "iconInactive",
      "label",
      "required",
      "disabled",
      "help",
      "class"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Switch" :options="options">
    <Switch v-bind="optionsValues" />
  </Demo>
</template>

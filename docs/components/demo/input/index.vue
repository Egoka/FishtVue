<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { InputProps } from "#fishtvue/input"
  import { layoutConfigOptions } from "~/components/demo/configOptions"

  const optionsValues = ref<InputProps>({})
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<InputProps>(optionsValues.value, [
      "type",
      "maskInput",
      "mode",
      "label",
      "labelMode",
      "placeholder",
      "autoFocus",
      "autocomplete",
      "isInvalid",
      "messageInvalid",
      "required",
      "loading",
      "disabled",
      "clear",
      "help",
      "width",
      "height",
      "animation",
      "lengthInteger",
      "lengthDecimal",
      "classInput",
      "classBody",
      "class"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Input" :options="options">
    <Input v-bind="optionsValues" />
  </Demo>
</template>

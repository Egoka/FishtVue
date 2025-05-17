<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { AriaProps } from "#fishtvue/aria"
  import { layoutConfigOptions } from "~/components/demo/configOptions"

  const optionsValues = ref<AriaProps>({})
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<AriaProps>(optionsValues.value, [
      "mode",
      "label",
      "labelMode",
      "placeholder",
      "autocomplete",
      "wrap",
      "rows",
      "maxLength",
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
      "classInput",
      "classBody",
      "class"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Aria" :options="options">
    <Aria v-bind="optionsValues" />
  </Demo>
</template>

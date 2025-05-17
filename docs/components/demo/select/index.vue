<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { SelectProps } from "#fishtvue/select"
  import { colorsObj } from "~/components/demo/select/dataForExample"
  import { useI18n } from "vue-i18n"
  import { layoutConfigOptions } from "~/components/demo/configOptions"

  const { locale } = useI18n()
  const optionsValues = ref<SelectProps>({
    // dataSelect: [colorsObj[locale.value][1]]
  })
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<SelectProps>(optionsValues.value, [
      "dataSelect",
      "keySelect",
      "valueSelect",
      "mode",
      "label",
      "labelMode",
      "autoFocus",
      "multiple",
      "maxVisible",
      "closeButtonBadge",
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
      "noData",
      "noQuery",
      "classSelect",
      "classSelectList",
      "classMaskQuery",
      "classBody",
      "class"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Select" :options="options">
    <Select v-bind="optionsValues" />
  </Demo>
</template>

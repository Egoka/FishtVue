<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { CalendarProps } from "#fishtvue/calendar"
  import { layoutConfigOptions } from "~/components/demo/configOptions"

  const optionsValues = ref<CalendarProps>({})
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<CalendarProps>(optionsValues.value, [
      "mode",
      "label",
      "labelMode",
      "autoFocus",
      "isNotCloseOnDateChange",
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
      "classDataPicker",
      "classPicker",
      "classDateText",
      "classBody",
      "class"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Calendar" :options="options">
    <Calendar v-bind="optionsValues" />
  </Demo>
</template>

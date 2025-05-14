<script lang="ts" setup>
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { FixWindowProps } from "#fishtvue/fixwindow"
  import { layoutConfigOptions } from "~/components/demo/configOptions"
  import { cn } from "~/composables/tailwindHandler"
  import { classDiv, classDivActive } from "~/components/demo/fixWindow/dataForExamples"

  const optionsValues = ref<FixWindowProps>({
    modelValue: false
  })
  const isOpen = ref(false)
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<FixWindowProps>(optionsValues.value, [
      "typePosition",
      // @ts-ignore
      "positionFixWindow",
      "mode",
      "eventOpen",
      "eventClose",
      "delay",
      "marginPx",
      "translatePx",
      "paddingWindow",
      "closeButton",
      "class",
      "classBody"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" :options="options" title="FixWindow">
    <div :class="cn(...classDiv, isOpen ? classDivActive : '')">
      <div>Content</div>
      <FixWindow v-bind="optionsValues" @update:modelValue="(e: boolean) => (isOpen = e)"> Fix Window </FixWindow>
    </div>
  </Demo>
</template>

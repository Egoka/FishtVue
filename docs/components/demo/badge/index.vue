<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { BadgeProps } from "#fishtvue/badge"
  import { layoutConfigOptions } from "~/components/demo/configOptions"

  const optionsValues = ref<BadgeProps>({})
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<BadgeProps>(optionsValues.value, [
      // @ts-ignore
      "modeBadge",
      "point",
      "closeButton",
      "class",
      "classContent"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Badge" :options="options">
    <Badge v-bind="optionsValues">Badge</Badge>
  </Demo>
</template>

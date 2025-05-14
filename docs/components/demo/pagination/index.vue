<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { PaginationProps } from "#fishtvue/pagination"
  import { layoutConfigOptions } from "~/components/demo/configOptions"

  const optionsValues = ref<PaginationProps>({})
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<PaginationProps>(optionsValues.value, [
      "total",
      "mode",
      "sizePage",
      "sizesSelector",
      "visibleNumberPages",
      "isInfoText",
      "isPageSizeSelector",
      "isHiddenNavigationButtons",
      "class"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Pagination" :options="options">
    <Pagination v-bind="optionsValues" />
  </Demo>
</template>

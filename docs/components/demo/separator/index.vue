<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { SeparatorProps } from "#fishtvue/separator"
  import { layoutConfigOptions } from "~/components/demo/configOptions"

  const optionsValues = ref<SeparatorProps>({})
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<SeparatorProps>(optionsValues.value, [
      "vertical",
      "contentPosition",
      "gradient",
      "depth",
      "class",
      "classBodyLine",
      "classLine",
      "classContent",
      "classBodyLineLeft",
      "classLineLeft",
      "classBodyLineRight",
      "classLineRight"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Separator" :options="options" class-demo="bg-none">
    <div class="flex w-full h-full p-2" :class="[optionsValues?.vertical ? 'flex-row' : 'flex-col']">
      <div
        class="flex justify-center items-center custom-separator-class"
        :class="[optionsValues?.vertical ? 'w-1/2 h-full mx-2' : 'w-full h-1/2 my-2']"></div>
      <Separator v-bind="optionsValues" classLine="">
        <Icons type="user" class="text-neutral-400 dark:text-neutral-700"></Icons>
      </Separator>
      <div
        class="flex justify-center items-center custom-separator-class"
        :class="[optionsValues?.vertical ? ' w-1/2 h-full mx-2' : 'w-full h-1/2 my-2']"></div>
    </div>
  </Demo>
</template>

<style scoped>
  :deep(.custom-separator-class) {
    --pattern-fg: color-mix(in oklab, var(--color-neutral-500) 5%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>

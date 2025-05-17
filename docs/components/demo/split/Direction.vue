<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  import type { SplitProps } from "#fishtvue/split"

  const { t } = useI18n()
  const direction = ref<SplitProps["direction"]>("vertical")
</script>

<template>
  <Select
    switchingType="switch"
    v-model="direction"
    :dataSelect="['horizontal', 'vertical']"
    :label="t('label.direction')"
    :help="t('help.direction')" />
  <Separator class="w-full" />
  <Split
    class="h-80 relative rounded-lg border dark:border-gray-800"
    :direction="direction"
    :panels="[{ name: 't1' }, { name: 't2' }]"
    units="pixels">
    <template #t1="{ size }">
      <div
        class="flex justify-center items-center h-full w-full text-center text-4xl text-neutral-500 dark:text-neutral-500">
        {{ Math.round(size) }} <span class="text-xl text-neutral-400 dark:text-neutral-600">px</span>
      </div>
    </template>
    <template #t2="{ size }">
      <div
        class="flex justify-center items-center h-full w-full text-center text-4xl text-neutral-500 dark:text-neutral-500">
        {{ Math.round(size) }} <span class="text-xl text-neutral-400 dark:text-neutral-600">px</span>
      </div>
    </template>
  </Split>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const t1 = ref<number>(50)
  const t2 = ref<number>(50)
  const moveResizePanel = ref<boolean>(false)
  const resizePanels = ref<boolean>(false)

  function onUpdatedPanels(event: any) {
    t1.value = Math.round(event.t1)
    t2.value = Math.round(event.t2)
  }

  function onStartResize() {
    resizePanels.value = true
  }

  function onStopResizePanel() {
    resizePanels.value = false
  }

  function onMoveResizePanel() {
    moveResizePanel.value = true
  }

  function onOutResizePanel() {
    moveResizePanel.value = false
  }
</script>

<template>
  <div class="flex gap-10">
    <div
      :class="[
        'flex gap-2 p-2 rounded-sm border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-400',
        'transition duration-200',
        moveResizePanel ? 'bg-neutral-200 dark:bg-neutral-800' : ''
      ]">
      <Icons
        type="mage:light-bulb"
        :class="[
          'transition duration-200',
          moveResizePanel ? 'text-theme-500 dark:text-theme-600' : 'text-neutral-200 dark:text-neutral-700'
        ]" />
      {{ t("title.movePanel") }}
    </div>
    <div
      :class="[
        'flex gap-2 p-2 rounded-sm border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-400',
        'transition duration-200',
        resizePanels ? 'bg-neutral-200 dark:bg-neutral-800' : ''
      ]">
      <Icons
        type="mage:light-bulb"
        :class="[
          'transition duration-200',
          resizePanels ? 'text-theme-500 dark:text-theme-600' : 'text-neutral-200 dark:text-neutral-700'
        ]" />
      {{ t("title.resizePanel") }}
    </div>
  </div>
  <Separator class="w-full" />
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-28' }"
    :panels="[
      { name: 't1', title: 'First' },
      { name: 't2', title: 'Second' }
    ]"
    @updated-panels="onUpdatedPanels"
    @start-resize-panel="onStartResize"
    @stop-resize-panel="onStopResizePanel"
    @move-resize-panel="onMoveResizePanel"
    @out-resize-panel="onOutResizePanel">
    <template #t1="{ panel }">
      <div v-if="panel?.title" class="font-semibold mt-3 text-xl ml-5 text-neutral-700 dark:text-neutral-400">
        {{ panel.title }}
      </div>
      <div class="flex items-center justify-center w-full text-center text-4xl text-neutral-700 dark:text-neutral-500">
        {{ t1 }} <span class="text-xl text-neutral-700 dark:text-neutral-600">%</span>
      </div>
    </template>
    <template #t2="{ panel }">
      <div v-if="panel?.title" class="font-semibold mt-3 text-xl ml-5 text-neutral-700 dark:text-neutral-400">
        {{ panel.title }}
      </div>
      <div class="flex items-center justify-center w-full text-center text-4xl text-neutral-700 dark:text-neutral-500">
        {{ t2 }} <span class="text-xl text-neutral-700 dark:text-neutral-600">%</span>
      </div>
    </template>
  </Split>
</template>

<style scoped></style>

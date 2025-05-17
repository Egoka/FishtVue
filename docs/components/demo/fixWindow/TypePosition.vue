<script setup lang="ts">
  import { classDiv, classDivActive, classWindow, type Position } from "./dataForExamples"
  import { cn } from "~/composables/tailwindHandler"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const positions = ref<Array<Position | {}>>([
    {
      name: t("position.top-left"),
      position: "top-left"
    },
    {},
    {
      name: t("position.top"),
      position: "top"
    },
    {},
    {
      name: t("position.top-right"),
      position: "top-right"
    },
    {
      name: t("position.left-top"),
      position: "left-top"
    },
    {},
    {
      name: t("position.center-top"),
      position: "center-top"
    },
    {},
    {
      name: t("position.right-top"),
      position: "right-top"
    },
    {
      name: t("position.left"),
      position: "left"
    },
    {
      name: t("position.center-left"),
      position: "center-left"
    },
    {
      name: t("position.center"),
      position: "center"
    },
    {
      name: t("position.center-right"),
      position: "center-right"
    },
    {
      name: t("position.right"),
      position: "right"
    },
    {
      name: t("position.left-bottom"),
      position: "left-bottom"
    },
    {},
    {
      name: t("position.center-bottom"),
      position: "center-bottom"
    },
    {},
    {
      name: t("position.right-bottom"),
      position: "right-bottom"
    },
    {
      name: t("position.bottom-left"),
      position: "bottom-left"
    },
    {},
    {
      name: t("position.bottom"),
      position: "bottom"
    },
    {},
    {
      name: t("position.bottom-right"),
      position: "bottom-right"
    }
  ])
  const isOpenFixed = ref(false)
  const isOpenAbsolute = ref(false)
</script>

<template>
  <div class="flex w-auto gap-16 justify-center items-center flex-wrap">
    <div :class="cn(...classDiv, isOpenFixed ? classDivActive : '', 'm-5')">
      <div :class="cn(classWindow, 'bg-transparent dark:bg-transparent')">Fixed</div>
      <FixWindow
        v-for="(item, key) in positions as Position[]"
        :key="key"
        v-model="isOpenFixed"
        typePosition="fixed"
        :position="item.position as any">
        <div class="size-8 bg-theme-600/80 dark:bg-theme-400/80 rounded-sm"></div>
      </FixWindow>
    </div>
    <div :class="cn(...classDiv, isOpenAbsolute ? classDivActive : '', 'm-5')">
      <div :class="cn(classWindow, 'bg-transparent dark:bg-transparent')">Absolute</div>
      <FixWindow
        v-for="(item, key) in positions as Position[]"
        :key="key"
        v-model="isOpenAbsolute"
        typePosition="absolute"
        :position="item.position as any">
        <div class="size-8 bg-theme-600/80 dark:bg-theme-400/80 rounded-sm"></div>
      </FixWindow>
    </div>
  </div>
</template>

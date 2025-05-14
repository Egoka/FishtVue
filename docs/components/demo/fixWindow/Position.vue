<script setup lang="ts">
  import type { Position } from "./dataForExamples"
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
  const classItem = ref([
    "flex justify-center items-center text-center",
    "size-16 p-2",
    "text-neutral-400 dark:text-neutral-500",
    "hover:text-neutral-600 hover:dark:text-neutral-300",
    "rounded-sm border-2 border-neutral-300 dark:border-neutral-700 border-dotted",
    "hover:border-theme-600 hover:dark:border-theme-400 hover:bg-theme-600/20 hover:dark:bg-theme-400/20",
    "cursor-pointer"
  ])
</script>

<template>
  <div class="grid grid-cols-5 gap-y-5 gap-x-5">
    <template v-for="(item, key) in positions as Position[]" :key="key">
      <div v-if="Object.keys(item)?.length" :class="classItem" class="">
        {{ item.name }}
        <FixWindow :position="item.position as any">
          <div class="size-8 bg-theme-600/80 dark:bg-theme-400/80 rounded-sm"></div>
        </FixWindow>
      </div>
      <div v-else></div>
    </template>
  </div>
</template>

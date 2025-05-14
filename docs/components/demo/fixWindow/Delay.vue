<script setup lang="ts">
  import { cn } from "~/composables/tailwindHandler"
  import { classDiv, classDivActive, classWindow } from "~/components/demo/fixWindow/dataForExamples"

  const delays = reactive({
    100: false,
    300: false,
    500: false,
    1000: false,
    1500: false,
    2000: false
  })
</script>

<template>
  <div class="flex w-auto gap-2 justify-center items-center flex-wrap">
    <div
      v-for="(delay, key) in delays"
      :keys="key"
      :class="cn(...classDiv, delay ? classDivActive : '', 'size-32 m-5')">
      <div :class="cn(classWindow, 'bg-transparent dark:bg-transparent')">{{ key }} ms</div>
      <FixWindow v-model="delays[key]" :delay="key">
        <div class="size-8 bg-theme-600/80 dark:bg-theme-400/80 rounded-sm"></div>
      </FixWindow>
    </div>
  </div>
</template>

<style scoped></style>

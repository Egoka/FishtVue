<script setup lang="ts">
  import { classDiv, classWindow } from "~/components/demo/fixWindow/dataForExamples"
  import { cn } from "~/composables/tailwindHandler"

  const dataPaddings = ref([100, 130, 150, 170, 200])
</script>

<template>
  <div class="flex w-auto gap-2 justify-center items-center flex-wrap">
    <div v-for="(padding, key) in dataPaddings" :keys="key" :class="cn(...classDiv, 'size-22 m-5 p-0')">
      <div :class="cn(classWindow, 'bg-transparent dark:bg-transparent')">{{ padding }} px</div>
      <FixWindow :modelValue="true" eventOpen="none" eventClose="none" :paddingWindow="padding">
        <div class="size-8 bg-theme-600/80 dark:bg-theme-400/80 rounded-sm"></div>
      </FixWindow>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from "vue"
  import Switch from "fishtvue/switch/Switch.vue"
  import Separator from "fishtvue/separator/Separator.vue"
  // const { t } = useI18n()
  // Имена совпадают с ключами `SeparatorClassKey` (props 1.0): плоские `classBodyLine*`/`classLine*`
  // схлопнуты в одну карту `classes`, а `left`/`right` стали логическими `start`/`end`.
  const root = ref(false)
  const segment = ref(false)
  const line = ref(false)
  const segmentStart = ref(false)
  const lineStart = ref(false)
  const segmentEnd = ref(false)
  const lineEnd = ref(false)
</script>
<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap justify-center">
      <Switch v-model="root" switchingType="switch" />
      <Switch v-model="segment" switchingType="switch" />
      <Switch v-model="segmentStart" switchingType="switch" />
      <Switch v-model="segmentEnd" switchingType="switch" />
    </div>
    <div class="flex flex-wrap justify-center">
      <Switch v-model="line" switchingType="switch" />
      <Switch v-model="lineStart" switchingType="switch" />
      <Switch v-model="lineEnd" switchingType="switch" />
    </div>
    <Separator class="w-full"></Separator>
    <Separator
      :depth="5"
      class="w-full"
      :gradient="80"
      :class="root ? 'custom-separator-class' : ''"
      :classes="{
        segment: segment ? 'custom-separator-class' : '',
        line: line ? 'bg-red-500 to-red-200 dark:to-red-800' : '',
        segmentStart: segmentStart ? 'custom-separator-class' : '',
        lineStart: lineStart ? 'bg-red-500' : '',
        segmentEnd: segmentEnd ? 'custom-separator-class' : '',
        lineEnd: lineEnd ? 'bg-yellow-500' : ''
      }">
      Test
    </Separator>
  </div>
</template>
<style scoped>
  .custom-separator-class {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
  :deep(.custom-separator-class) {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
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

<script lang="ts" setup>
  import { ref } from "vue"
  import Switch from "fishtvue/switch/Switch.vue"
  import Separator from "fishtvue/separator/Separator.vue"
  // const { t } = useI18n()
  const classRef = ref(false)
  const classBodyLine = ref(false)
  const classLine = ref(false)
  const classBodyLineLeft = ref(false)
  const classLineLeft = ref(false)
  const classBodyLineRight = ref(false)
  const classLineRight = ref(false)
</script>
<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-wrap justify-center">
      <Switch v-model="classRef" switchingType="switch" />
      <Switch v-model="classBodyLine" switchingType="switch" />
      <Switch v-model="classBodyLineLeft" switchingType="switch" />
      <Switch v-model="classBodyLineRight" switchingType="switch" />
    </div>
    <div class="flex flex-wrap justify-center">
      <Switch v-model="classLine" switchingType="switch" />
      <Switch v-model="classLineLeft" switchingType="switch" />
      <Switch v-model="classLineRight" switchingType="switch" />
    </div>
    <Separator class="w-full"></Separator>
    <Separator
      :depth="5"
      class="w-full"
      :gradient="80"
      :class="classRef ? 'custom-separator-class' : ''"
      :classBodyLine="classBodyLine ? 'custom-separator-class' : ''"
      :classLine="classLine ? 'bg-red-500 to-red-200 dark:to-red-800' : ''"
      :classBodyLineLeft="classBodyLineLeft ? 'custom-separator-class' : ''"
      :classLineLeft="classLineLeft ? 'bg-red-500' : ''"
      :classBodyLineRight="classBodyLineRight ? 'custom-separator-class' : ''"
      :classLineRight="classLineRight ? 'bg-yellow-500' : ''">
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

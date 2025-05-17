<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const vertical = ref(false)
</script>

<template>
  <Switch switchingType="switch" v-model="vertical" :label="t('label.orientation')" />
  <Separator class="w-full"></Separator>
  <div class="flex w-1/2 h-32 p-2" :class="[vertical ? 'flex-row' : 'flex-col']">
    <div
      class="flex justify-center items-center custom-separator-class"
      :class="[vertical ? 'w-1/2 h-full mx-2' : 'w-full h-1/2 my-2']">
      {{ t("title.firstContent") }}
    </div>
    <Separator :vertical="vertical" :depth="3"></Separator>
    <div
      class="flex justify-center items-center custom-separator-class"
      :class="[vertical ? ' w-1/2 h-full mx-2' : 'w-full h-1/2 my-2']">
      {{ t("title.secondContent") }}
    </div>
  </div>
</template>

<style scoped>
  :deep(.custom-separator-class) {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 20%, transparent);
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

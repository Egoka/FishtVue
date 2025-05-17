<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  import { fruits } from "~/components/demo/select/dataForExample"

  const { locale } = useI18n()
  const data = ref(fruits[locale.value])
  const selectedItem = ref()
</script>

<template>
  <Select :dataSelect="data" classSelect="custom-select-class" v-model="selectedItem"> </Select>
</template>

<style scoped>
  :deep(.custom-select-class) {
    padding: 10px;
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

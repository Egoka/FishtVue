<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap items-center">
    <Badge class="bg-blue-500 text-white">{{ t("button.custom") }}</Badge>
    <Badge classContent="text-lg font-bold">{{ t("button.custom") }}</Badge>
  </div>
</template>

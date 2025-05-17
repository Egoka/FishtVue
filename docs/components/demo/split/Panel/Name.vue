<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <Split
    class="relative rounded-lg border dark:border-gray-800"
    :styles="{ panel: 'h-28 flex justify-center items-center font-semibold text-xl' }"
    :panels="[
      { name: 'text', size: 50 },
      { name: 'options', size: 50 }
    ]">
    <template #text>
      <div>{{ t("title.Text") }}</div>
    </template>
    <template #options>
      <div>{{ t("title.Options") }}</div>
    </template>
  </Split>
</template>

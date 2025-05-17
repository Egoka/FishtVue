<script setup lang="ts">
  import { classDiv } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <div :class="[classDiv, 'mt-10']">
    {{ t("title.hoverMe") }}
    <FixWindow>{{ t("title.dynamicWindow") }}</FixWindow>
  </div>
</template>

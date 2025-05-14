<script setup lang="ts">
  import { cn } from "#imports"
  const { t } = useI18n()
  import { classDiv, classDivActive, classWindow } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"
  const isOpen = ref(false)
</script>

<template>
  <div :class="cn(...classDiv, isOpen ? classDivActive : '')">
    {{ t("button.clickMe") }}
    <FixWindow :class="classWindow" eventOpen="click" eventClose="click" @open="isOpen = true" @close="isOpen = false">
      {{ t("title.openedOnClick") }}
    </FixWindow>
  </div>
</template>

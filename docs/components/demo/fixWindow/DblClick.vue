<script setup lang="ts">
  import { cn } from "~/composables/tailwindHandler"
  import { classDiv, classDivActive, classWindow } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const isOpen = ref(false)
</script>

<template>
  <div :class="cn(...classDiv, isOpen ? classDivActive : '')">
    {{ t("title.doubleClickMe") }}
    <FixWindow
      :class="classWindow"
      eventOpen="dblclick"
      eventClose="dblclick"
      @open="isOpen = true"
      @close="isOpen = false">
      {{ t("title.openedOnDoubleClick") }}
    </FixWindow>
  </div>
</template>

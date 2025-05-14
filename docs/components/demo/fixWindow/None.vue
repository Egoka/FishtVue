<script setup lang="ts">
  import { cn } from "~/composables/tailwindHandler"
  import { classDiv, classDivActive, classWindow } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
  const isOpen = ref(false)
</script>

<template>
  <div :class="cn(...classDiv, isOpen ? classDivActive : '')">
    {{ t("title.manualControl") }}
    <FixWindow v-model="isOpen" :class="classWindow" eventOpen="none" eventClose="none">
      {{ t("title.controlledManually") }}
    </FixWindow>
  </div>
  <Separator class="w-full"></Separator>
  <Switch switchingType="switch" v-model="isOpen" :label="t('label.open')" />
</template>

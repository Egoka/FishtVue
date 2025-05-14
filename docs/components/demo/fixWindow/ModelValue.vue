<script setup lang="ts">
  import { cn } from "~/composables/tailwindHandler"
  import { classDiv, classDivActive, classWindow } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
  const isOpen = ref(false)
</script>

<template>
  <Switch switchingType="switch" v-model="isOpen" :label="t('label.open')" />
  <Separator class="w-full mb-10"></Separator>
  <div :class="cn(...classDiv, isOpen ? classDivActive : '')">
    {{ t("title.hoverMe") }}
    <FixWindow v-model="isOpen" :class="classWindow">
      {{ t("title.thisWindowIsControlledProgrammatically") }}
    </FixWindow>
  </div>
</template>

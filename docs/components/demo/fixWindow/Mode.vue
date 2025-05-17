<script setup lang="ts">
  import { cn } from "~/composables/tailwindHandler"
  import { classDiv, classDivActive } from "~/components/demo/fixWindow/dataForExamples"
  import { useI18n } from "vue-i18n"
  import { dataSelectMode } from "~/components/demo/configOptions"

  const { t } = useI18n()
  const modeStyle = ref()
  const isOpen = ref(false)
</script>

<template>
  <Select :label="t('label.mode')" :help="t('help.mode')" :dataSelect="dataSelectMode" v-model="modeStyle" />
  <Separator class="w-full"></Separator>
  <div :class="cn(...classDiv, 'mt-5', isOpen ? classDivActive : '')">
    {{ t("title.manualControl") }}
    <FixWindow :mode="modeStyle" eventOpen="hover" eventClose="hover" @open="isOpen = true" @close="isOpen = false">
      {{ t("title.windowWithMode", { mode: modeStyle ?? "none" }) }}
    </FixWindow>
  </div>
</template>

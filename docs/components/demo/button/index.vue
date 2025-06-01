<script setup lang="ts">
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { ButtonProps } from "#fishtvue/button"
  import { layoutConfigOptions } from "~/components/demo/configOptions"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const optionsValues = ref<ButtonProps>({})
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<ButtonProps>(optionsValues.value, [
      // @ts-ignore
      "typeButton",
      // @ts-ignore
      "modeButton",
      "size",
      // @ts-ignore
      "roundedButton",
      "color",
      "icon",
      "iconPosition",
      "disabled",
      "loading",
      "class",
      "classIcon"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" title="Button" :options="options">
    <Button v-bind="optionsValues">{{ t("button.Button") }}</Button>
  </Demo>
</template>

<style scoped></style>

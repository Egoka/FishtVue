<script lang="ts" setup>
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { AlertProps } from "#fishtvue/alert"
  import { openAlert } from "#fishtvue/alert"
  import { layoutConfigOptions } from "~/components/demo/configOptions"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const optionsValues = ref<AlertProps>({
    title: "Title",
    subtitle: "Subtitle",
    displayTime: 3000
  })
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<AlertProps>(optionsValues.value, [
      "title",
      "subtitle",
      // @ts-ignore
      "typeAlert",
      // @ts-ignore
      "sizeAlert",
      // @ts-ignore
      "positionAlert",
      "displayTime",
      "notAnimate",
      "closeButton",
      "class"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" :options="options" title="Alert">
    <Button mode="outline" @click="openAlert(optionsValues)">
      {{ t("button.open") }}
    </Button>
  </Demo>
</template>

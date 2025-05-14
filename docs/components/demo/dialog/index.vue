<script lang="ts" setup>
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { DialogProps } from "#fishtvue/dialog"
  import { layoutConfigOptions } from "~/components/demo/configOptions"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const optionsValues = ref<DialogProps>({
    modelValue: false
  })
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<DialogProps>(optionsValues.value, [
      // @ts-ignore
      "sizeDialog",
      "position",
      "notAnimate",
      "closeButton",
      "withoutMargin",
      "notCloseBackground",
      "class",
      "classBody"
    ])
  )

  function open() {
    optionsValues.value.modelValue = true
  }

  function close() {
    optionsValues.value.modelValue = false
  }
</script>

<template>
  <Demo v-model="optionsValues" :options="options" title="Dialog">
    <Button @click="open">{{ t("button.dialog") }}</Button>
    <Dialog v-bind="optionsValues" @update:modelValue="close">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
        {{ t("content.dialog.position.title") }}
      </h3>
      <div class="my-2">
        <p class="text-sm text-gray-500">
          {{ t("content.dialog.position.text") }}
        </p>
      </div>
    </Dialog>
  </Demo>
</template>

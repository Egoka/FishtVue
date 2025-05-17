<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const formValues = ref({
    Input: "",
    Select: "",
    Calendar: "",
    Aria: "",
    // TextEditor: "",
    Switch: "",
    Custom: ""
  })
  const structure = ref<FormProps["structure"]>([
    {
      fields: structureFields([
        "Input",
        "Select",
        "Calendar",
        "Aria",
        // "TextEditor",
        "Switch",
        "Custom"
      ])
    }
  ])
</script>

<template>
  <Form :structure="structure" v-model:formFields="formValues">
    <template #custom>
      <div class="w-72 p-4 text-gray-400 dark:text-gray-500">
        {{ t("help.customForm") }}
      </div>
    </template>
  </Form>
</template>

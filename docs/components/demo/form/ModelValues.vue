<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"

  const formValues = ref({
    Input: "",
    Select: "",
    Calendar: "",
    Aria: "",
    // TextEditor: "",
    Switch: ""
  })
  const structure = ref<FormProps["structure"]>([
    {
      fields: structureFields([
        "Input",
        "Select",
        "Calendar",
        "Aria",
        // "TextEditor",
        "Switch"
      ])
    }
  ])
</script>

<template>
  <Split
    :panels="[{ name: 'right' }, { name: 'left', size: 50, maxSize: 70, minSize: 25 }]"
    units="percentages"
    :styles="{ panel: 'p-4 content-center' }">
    <template #right>
      <Form :structure="structure" v-model:formFields="formValues" />
    </template>
    <template #left>
      <ProsePre language="json">
        {{ formValues }}
      </ProsePre>
    </template>
  </Split>
</template>

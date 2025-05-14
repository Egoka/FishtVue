<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"

  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([
    { fields: [{ ...structureFields(["password"])[0], classCol: "sm:col-span-6" }] }
  ])
</script>

<template>
  <Form modeValidate="onInput" :structure="structure" v-model:formFields="formValues" />
</template>

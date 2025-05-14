<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"

  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([{ fields: structureFields(["username", "email", "password"]) }])
</script>

<template>
  <Form :structure="structure" v-model:formFields="formValues" />
</template>

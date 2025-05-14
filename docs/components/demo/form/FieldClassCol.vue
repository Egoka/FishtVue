<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"

  const formValues = ref({
    username: "",
    email: "",
    password: ""
  })
  const fields = ref(structureFields(["username", "email", "password"]))
  const structure = computed<FormProps["structure"]>(() => [
    {
      fields: [
        {
          ...fields.value[0],
          classCol: "structure-class " + fields.value[0].classCol
        },
        {
          ...fields.value[1],
          classCol: "structure-class " + fields.value[1].classCol
        },
        {
          ...fields.value[2],
          classCol: "structure-class " + fields.value[2].classCol
        }
      ]
    }
  ])
</script>

<template>
  <Form :structure="structure" v-model:formFields="formValues" />
</template>

<style scoped>
  :deep(.structure-class) {
    padding: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>

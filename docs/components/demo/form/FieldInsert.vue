<script setup lang="ts">
  import type { FormProps, FieldInput } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([
    {
      fields: [
        {
          ...structureFields(["username"])[0],
          insert: {
            beforeIcon: "solar:user-linear",
            beforeText: t("label.before"),
            afterIcon: "solar:user-linear",
            afterText: t("label.after")
          }
        } as FieldInput,
        {
          ...structureFields(["email"])[0],
          insert: {
            beforeIcon: "line-md:email",
            beforeText: t("label.before"),
            afterIcon: "line-md:email",
            afterText: t("label.after")
          }
        } as FieldInput,
        {
          ...structureFields(["password"])[0],
          insert: {
            beforeIcon: "ph:password-light",
            beforeText: t("label.before"),
            afterIcon: "ph:password-light",
            afterText: t("label.after")
          }
        } as FieldInput
      ]
    }
  ])
</script>

<template>
  <Form :structure="structure" v-model:formFields="formValues" />
</template>

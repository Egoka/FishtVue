<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([{ fields: structureFields(["username", "email", "password"]) }])
  const submitButton = ref<FormProps["submitButton"]>(t("button.Register"))
</script>

<template>
  <Input v-model="submitButton" :label="t('label.nameButton')" />
  <Separator></Separator>
  <Form :submitButton="submitButton" :structure="structure" v-model:formFields="formValues"> </Form>
</template>

<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([{ fields: structureFields(["username", "email", "password"]) }])
  const disabled = ref<FormProps["disabled"]>(false)
</script>

<template>
  <Switch switchingType="switch" v-model="disabled" :label="t('label.disabled')" />
  <Separator></Separator>
  <Form :disabled="disabled" :structure="structure" v-model:formFields="formValues" />
</template>

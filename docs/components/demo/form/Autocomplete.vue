<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([{ fields: structureFields(["username", "email", "password"]) }])
  const dataSelect = ref(["on", "off"])
  const autocomplete = ref<FormProps["autocomplete"]>("off")
</script>

<template>
  <Select
    v-model="autocomplete"
    :label="t('label.autocomplete')"
    :help="t('help.autocomplete')"
    :dataSelect="dataSelect" />
  <Separator></Separator>
  <Form :autocomplete="autocomplete" :structure="structure" v-model:formFields="formValues" />
</template>

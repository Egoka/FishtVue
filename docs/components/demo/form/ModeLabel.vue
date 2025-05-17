<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { dataSelectLabelMode } from "~/components/demo/configOptions"
  import { structureFields } from "~/components/demo/form/dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([{ fields: structureFields(["username", "email", "password"]) }])
  const modeLabel = ref<FormProps["modeLabel"]>()
</script>

<template>
  <Select :label="t('label.mode')" :help="t('help.mode')" :dataSelect="dataSelectLabelMode" v-model="modeLabel" />
  <Separator></Separator>
  <Form :modeLabel="modeLabel" :structure="structure" v-model:formFields="formValues" />
</template>

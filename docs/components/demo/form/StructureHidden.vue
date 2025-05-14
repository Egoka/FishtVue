<script setup lang="ts">
  import type { FormExpose, FormProps } from "#fishtvue/form"
  import { structureFields } from "./dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const formValues = ref({
    username: "",
    email: "",
    password: "",
    additionalInformation: false,
    phone: "",
    price: "",
    age: ""
  })
  const structure = ref<FormProps["structure"]>([
    {
      title: t("content.user.title"),
      description: t("content.user.description"),
      fields: structureFields(["username", "additionalInformation"])
    },
    {
      title: t("content.additionalInformation.title"),
      description: t("content.additionalInformation.description"),
      isHidden: true,
      fields: [{ ...structureFields(["email"])[0], classCol: "sm:col-span-6" }]
    }
  ])
  const formTest = ref<FormExpose>()
  watch(
    formValues,
    () => {
      formTest.value?.setStructureParam(1, "isHidden", !formValues.value.additionalInformation)
    },
    { deep: true }
  )
</script>

<template>
  <Form ref="formTest" class="w-72" :structure="structure" v-model:formFields="formValues">
    <template #itemTitle="{ structure }">
      <h2 v-if="structure?.title?.length" class="text-xl font-semibold leading-7 text-gray-900 dark:text-gray-100">
        {{ structure?.title }}
      </h2>
      <p v-if="structure?.description?.length" class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
        {{ structure?.description }}
      </p>
    </template>
  </Form>
</template>

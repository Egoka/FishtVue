<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const formValues = ref({
    isViewUsername: false,
    username: "",
    isViewEmail: false,
    email: "",
    isViewPassword: false,
    password: ""
  })
  const structure = computed<FormProps["structure"]>(() => [
    {
      fields: [
        {
          typeComponent: "Switch",
          name: "isViewUsername",
          switchingType: "switch",
          modelValue: formValues.value.isViewUsername,
          label: t("label.isViewUsername"),
          classCol: "sm:col-span-3"
        },
        {
          ...structureFields(["username"])[0],
          isHidden: !formValues.value.isViewUsername,
          classCol: "sm:col-span-3 mt-4 w-48"
        },
        {
          typeComponent: "Switch",
          name: "isViewEmail",
          switchingType: "switch",
          modelValue: formValues.value.isViewEmail,
          label: t("label.isViewEmail"),
          classCol: "sm:col-span-3"
        },
        {
          ...structureFields(["email"])[0],
          isHidden: !formValues.value.isViewEmail,
          classCol: "sm:col-span-3 mt-4 w-48"
        },
        {
          typeComponent: "Switch",
          name: "isViewPassword",
          switchingType: "switch",
          modelValue: formValues.value.isViewPassword,
          label: t("label.isViewPassword"),
          classCol: "sm:col-span-3"
        },
        {
          ...structureFields(["password"])[0],
          isHidden: !formValues.value.isViewPassword,
          classCol: "sm:col-span-3 mt-4 w-48"
        }
      ]
    }
  ])
</script>

<template>
  <Form :structure="structure" v-model:formFields="formValues" />
</template>

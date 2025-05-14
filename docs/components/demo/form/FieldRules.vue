<script setup lang="ts">
  import type { FieldInput, FormProps } from "#fishtvue/form"
  import { structureFields } from "./dataForExample"
  import { useI18n } from "vue-i18n"
  import { fruits } from "~/components/demo/select/dataForExample"

  const { t, locale } = useI18n()
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
      title: t("content.rules.requiredRule.title"),
      description: t("content.rules.requiredRule.description"),
      fields: [
        {
          ...structureFields(["requiredRule"])[0],
          label: t("label.requiredRuleBase"),
          rules: { required: true }
        },
        {
          ...structureFields(["requiredRule"])[0],
          name: "requiredRuleCustom",
          label: t("label.requiredRuleCustom"),
          rules: {
            required: {
              message: t("message.requiredRule")
            }
          }
        }
      ]
    },
    {
      title: t("content.rules.emailRule.title"),
      description: t("content.rules.emailRule.description"),
      fields: [
        {
          ...structureFields(["emailRule"])[0],
          label: t("label.emailRuleBase"),
          rules: { required: true, email: true }
        },
        {
          ...structureFields(["emailRule"])[0],
          name: "emailRuleCustom",
          label: t("label.emailRuleCustom"),
          rules: {
            required: t("message.requiredRule"),
            email: {
              message: t("message.emailRule")
            }
          }
        }
      ]
    },
    {
      title: t("content.rules.phoneRule.title"),
      description: t("content.rules.phoneRule.description"),
      fields: [
        {
          ...structureFields(["phoneRule"])[0],
          label: t("label.phoneRuleBase"),
          rules: { required: true, phone: true }
        },
        {
          ...structureFields(["phoneRule"])[0],
          name: "phoneRuleCustom",
          label: t("label.phoneRuleCustom"),
          rules: {
            required: t("message.requiredRule"),
            phone: {
              message: t("message.phoneRule")
            }
          }
        }
      ]
    },
    {
      title: t("content.rules.numericRule.title"),
      description: t("content.rules.numericRule.description"),
      fields: [
        {
          ...structureFields(["numericRule"])[0],
          label: t("label.numericRuleBase"),
          rules: { required: true, numeric: true }
        },
        {
          ...structureFields(["numericRule"])[0],
          name: "numericRuleCustom",
          label: t("label.numericRuleCustom"),
          rules: {
            required: t("message.requiredRule"),
            numeric: {
              message: t("message.numericRule")
            }
          }
        }
      ]
    },
    {
      title: t("content.rules.regularRule.title"),
      description: t("content.rules.regularRule.description"),
      fields: [
        {
          ...structureFields(["regularRule"])[0],
          label: t("label.regularRuleBase"),
          rules: {
            required: true,
            regular: {
              regular: "^[0-9]+$"
            }
          }
        } as FieldInput,
        {
          ...structureFields(["regularRule"])[0],
          name: "regularRuleCustom",
          label: t("label.regularRuleCustom"),
          rules: {
            required: t("message.requiredRule"),
            regular: {
              regular: "^[0-9]+$",
              message: t("message.regularRule")
            }
          }
        } as FieldInput
      ]
    },
    {
      title: t("content.rules.rangeRule.title"),
      description: t("content.rules.rangeRule.description"),
      fields: [
        {
          ...structureFields(["rangeRule"])[0],
          name: "rangeRuleCustom",
          label: t("label.rangeRuleCustom"),
          type: "number",
          rules: {
            required: t("message.requiredRule"),
            range: {
              min: 50,
              max: 100,
              message: t("message.rangeRule", { min: 50, max: 100 })
            }
          }
        } as FieldInput,
        {
          ...structureFields(["rangeRule"])[0],
          label: t("label.rangeRuleBase"),
          type: "number",
          rules: {
            required: true,
            range: {
              min: 50,
              max: 100
            }
          }
        } as FieldInput
      ]
    },
    {
      title: t("content.rules.lengthRule.title"),
      description: t("content.rules.lengthRule.description"),
      fields: [
        {
          ...structureFields(["lengthRule"])[0],
          name: "lengthRuleCustom",
          label: t("label.lengthRuleCustom"),
          rules: {
            required: t("message.requiredRule"),
            length: {
              min: 5,
              max: 10,
              message: t("message.lengthRule", { min: 5, max: 10 })
            }
          }
        } as FieldInput,
        {
          ...structureFields(["lengthRule"])[0],
          label: t("label.lengthRuleBase"),
          rules: {
            required: true,
            length: {
              min: 5,
              max: 10
            }
          }
        } as FieldInput
      ]
    },
    {
      title: t("content.rules.asyncRule.title"),
      description: t("content.rules.asyncRule.description"),
      fields: [
        {
          ...structureFields(["asyncRule"])[0],
          name: "asyncRuleCustom",
          label: t("label.asyncRuleCustom"),
          rules: {
            required: t("message.requiredRule"),
            async: {
              async validationCallback(value) {
                return await new Promise((resolve) =>
                  setTimeout(() => {
                    resolve({
                      isInvalid: true,
                      message: t("message.asyncRule", { mail: value })
                    })
                  }, 1000)
                )
              }
            }
          }
        } as FieldInput,
        {
          ...structureFields(["asyncRule"])[0],
          label: t("label.asyncRuleBase"),
          rules: {
            required: true,
            async: {
              async validationCallback() {
                return await new Promise((resolve) =>
                  setTimeout(() => {
                    resolve({
                      isInvalid: true
                    })
                  }, 1000)
                )
              }
            }
          }
        } as FieldInput
      ]
    },
    {
      title: t("content.rules.customRule.title"),
      description: t("content.rules.customRule.description"),
      fields: [
        {
          ...structureFields(["customRule"])[0],
          name: "customRuleCustom",
          label: t("label.customRuleCustom"),
          rules: {
            required: t("message.requiredRule"),
            custom: {
              validationCallback(value) {
                return {
                  isInvalid: !fruits[locale.value].find((fruit) => fruit === value)?.length,
                  message: t("message.customRule", { mail: value })
                }
              }
            }
          }
        } as FieldInput,
        {
          ...structureFields(["customRule"])[0],
          label: t("label.customRuleBase"),
          rules: {
            required: true,
            custom: {
              validationCallback(value) {
                return {
                  isInvalid: !fruits[locale.value].find((fruit) => fruit === value)?.length
                }
              }
            }
          }
        } as FieldInput
      ]
    },
    {
      title: t("content.rules.compareRule.title"),
      description: t("content.rules.compareRule.description"),
      fields: [
        { ...structureFields(["password"])[0] },
        {
          ...structureFields(["compareRule"])[0],
          name: "compareRuleCustom",
          label: t("label.compareRuleCustom"),
          rules: {
            required: t("message.requiredRule"),
            compare: {
              compareFields: ["password"],
              validationCallback(value, compareFields) {
                return {
                  isInvalid: compareFields["password"] !== value,
                  message: t("message.compareRule", { mail: value })
                }
              }
            }
          }
        },
        {
          ...structureFields(["compareRule"])[0],
          label: t("label.compareRuleBase"),
          rules: {
            required: true,
            compare: {
              validationCallback(value, compareFields) {
                return {
                  isInvalid: compareFields["password"] !== value
                }
              }
            }
          }
        }
      ]
    }
  ])
</script>

<template>
  <Form :structure="structure" structureClass="pb-6" structureClassGrid="mt-2" v-model:formFields="formValues">
    <template #itemTitle="{ structure }">
      <h2 v-if="structure?.title?.length" class="mt-5 text-xl font-semibold leading-7 text-gray-900 dark:text-gray-100">
        {{ structure?.title }}
      </h2>
      <p v-if="structure?.description?.length" class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
        {{ structure?.description }}
      </p>
    </template>
  </Form>
</template>

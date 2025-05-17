<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import type { FieldType, FormStructure } from "#fishtvue/form"

  type Keys =
    | "username"
    | "email"
    | "password"
    | "additionalInformation"
    | "Input"
    | "Select"
    | "Calendar"
    | "Aria"
    | "TextEditor"
    | "Switch"
    | "Custom"
    | "requiredRule"
    | "emailRule"
    | "phoneRule"
    | "numericRule"
    | "regularRule"
    | "rangeRule"
    | "lengthRule"
    | "asyncRule"
    | "customRule"
    | "compareRule"
    | "customPayment"
    | "namePayment"
    | "city"
    | "cardNumber"
    | "expires"
    | "year"
    | "CVC"
  const structureFields = (namesFields: Keys[]): FormStructure["fields"] => {
    const fields: Partial<Record<Keys, FieldType>> = {
      username: {
        typeComponent: "Input",
        name: "username",
        rules: { required: true },
        label: "Username",
        placeholder: "Username",
        classCol: "sm:col-span-6"
      },
      email: {
        typeComponent: "Input",
        name: "email",
        rules: { required: true, email: true },
        label: "Email",
        placeholder: "Email",
        classCol: "sm:col-span-3"
      },
      password: {
        typeComponent: "Input",
        name: "password",
        type: "password",
        rules: { required: true, length: { min: 3, max: 8, message: "lengthRule" } },
        label: "Password",
        placeholder: "Password",
        classCol: "sm:col-span-3"
      },
      additionalInformation: {
        typeComponent: "Switch",
        name: "additionalInformation",
        switchingType: "checkbox",
        rounded: 4,
        mode: "none",
        modelValue: false,
        label: "additionalInformation",
        required: true,
        classCol: "sm:col-span-6",
        help: "additionalInformation"
      },
      Input: {
        typeComponent: "Input",
        name: "Input",
        label: "Input"
      },
      Select: {
        typeComponent: "Select",
        name: "Select",
        label: "Select",
        //@ts-ignore
        dataSelect: [
          "apple",
          "banana",
          "orange",
          "grape",
          "mango",
          "pineapple",
          "strawberry",
          "watermelon",
          "peach",
          "kiwi"
        ]
      },
      Calendar: {
        typeComponent: "Calendar",
        name: "Calendar",
        label: "Calendar"
      },
      Aria: {
        typeComponent: "Aria",
        name: "Aria",
        label: "Aria"
      },
      TextEditor: {
        typeComponent: "TextEditor",
        name: "TextEditor",
        label: "TextEditor"
      },
      Switch: {
        typeComponent: "Switch",
        name: "Switch",
        label: "Switch"
      },
      Custom: {
        typeComponent: "Custom",
        name: "Custom",
        nameTemplate: "custom",
        label: "Custom",
        classCol: "col-span-full rounded-md border border-gray-200 dark:border-gray-700 m-1"
      },
      requiredRule: {
        typeComponent: "Input",
        name: "requiredRule",
        label: "requiredRule"
      },
      emailRule: {
        typeComponent: "Input",
        name: "emailRule",
        label: "emailRule"
      },
      phoneRule: {
        typeComponent: "Input",
        name: "phoneRule",
        label: "phoneRule"
      },
      numericRule: {
        typeComponent: "Input",
        name: "numericRule",
        label: "numericRule"
      },
      regularRule: {
        typeComponent: "Input",
        name: "regularRule",
        label: "regularRule"
      },
      rangeRule: {
        typeComponent: "Input",
        name: "rangeRule",
        label: "rangeRule"
      },
      lengthRule: {
        typeComponent: "Input",
        name: "lengthRule",
        label: "lengthRule"
      },
      asyncRule: {
        typeComponent: "Input",
        name: "asyncRule",
        label: "asyncRule"
      },
      customRule: {
        typeComponent: "Input",
        name: "customRule",
        label: "customRule"
      },
      compareRule: {
        typeComponent: "Input",
        name: "compareRule",
        label: "compareRule"
      },
      customPayment: {
        typeComponent: "Custom",
        name: "customPayment",
        nameTemplate: "customPayment"
      },
      namePayment: {
        typeComponent: "Input",
        name: "namePayment",
        label: "namePayment",
        placeholder: "firstLast"
      },
      city: {
        typeComponent: "Input",
        name: "city",
        label: "city"
      },
      cardNumber: {
        typeComponent: "Input",
        name: "cardNumber",
        label: "cardNumber"
      },
      expires: {
        typeComponent: "Select",
        name: "expires",
        label: "expires",
        dataSelect: [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December"
        ],
        classCol: "sm:col-span-2"
      },
      year: {
        typeComponent: "Select",
        name: "year",
        label: "year",
        dataSelect: ["2024", "2025", "2026", "2027", "2028"],
        classCol: "sm:col-span-2"
      },
      CVC: {
        typeComponent: "Input",
        name: "CVC",
        type: "number",
        label: "CVC",
        maskInput: "number",
        classCol: "sm:col-span-2",
        lengthInteger: 3
      }
    }
    return namesFields.reduce((result: FormStructure["fields"], key) => {
      if (key in fields) result.push(fields[key] as FieldType)
      return result
    }, []) as FormStructure["fields"]
  }

  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([{ fields: structureFields(["username", "email", "password"]) }])
</script>

<template>
  <Form :structure="structure" v-model:formFields="formValues" />
</template>

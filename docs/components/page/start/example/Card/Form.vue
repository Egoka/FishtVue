<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "~/components/demo/form/dataForExample"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const structureForm = ref<FormProps["structure"]>([
    {
      title: t("content.payment.title"),
      description: t("content.payment.description"),
      fields: structureFields(["customPayment", "namePayment", "city", "cardNumber", "expires", "year", "CVC"])
    }
  ])
  const formValues = ref({
    customPayment: "",
    namePayment: "",
    city: "",
    cardNumber: "",
    expires: "",
    year: "",
    CVC: ""
  })
  type Pay = "Card" | "Google" | "Apple"
  const valuesPayment = ref<Pay[]>(["Card", "Google", "Apple"])
  const iconsPayment = ref<Record<Pay, string>>({
    Card: "credit-card",
    Google: "ri:google-fill",
    Apple: "ic:baseline-apple"
  })
</script>

<template>
  <Form v-model:formFields="formValues" :structure="structureForm">
    <template #itemTitle="{ structure }">
      <div class="item-title">
        <h2 v-if="structure?.title?.length" class="text-xl font-semibold leading-7 text-gray-900 dark:text-gray-100">
          {{ structure?.title }}
        </h2>
        <p v-if="structure?.description?.length" class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {{ structure?.description }}
        </p>
      </div>
    </template>
    <template #customPayment="{ changeModelValue }">
      <div role="radiogroup" aria-required="false" dir="ltr" class="grid grid-cols-3 gap-4" tabindex="0">
        <Button
          v-for="pay in valuesPayment"
          :key="pay"
          mode="outline"
          type="button"
          role="radio"
          :aria-checked="formValues['customPayment'] === pay"
          :data-state="formValues['customPayment'] === pay ? 'checked' : 'unchecked'"
          :aria-label="pay"
          tabindex="-1"
          class="flex flex-col items-center justify-between w-full p-4 m-0 text-sm font-medium leading-none bg-white dark:bg-neutral-950 data-[state=checked]:bg-black/10 dark:data-[state=checked]:bg-white/5"
          @click="changeModelValue(pay)">
          <Icons :type="iconsPayment?.[pay]" class="mb-3 h-6 w-6" />
          {{ pay }}
        </Button>
      </div>
    </template>
  </Form>
</template>

<style scoped></style>

<script setup lang="ts">
  import type { FormProps } from "#fishtvue/form"
  import { structureFields } from "./dataForExample"
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
  const formValues = ref({ username: "", email: "", password: "" })
  const structure = ref<FormProps["structure"]>([
    {
      title: t("content.user.title"),
      description: t("content.user.description"),
      fields: structureFields(["username", "email", "password"])
    }
  ])
</script>

<template>
  <Form :structure="structure" v-model:formFields="formValues">
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
  </Form>
</template>

<style scoped>
  :deep(.item-title) {
    padding: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>

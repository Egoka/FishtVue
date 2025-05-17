<script setup lang="ts">
  import { ref } from "vue"
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
  // FAQ Data
  const faqData = ref([
    {
      title: t("start.FAQ.title.Q1"),
      subtitle: t("start.FAQ.subtitle.Q1"),
      open: false
    },
    {
      title: t("start.FAQ.title.Q2"),
      subtitle: t("start.FAQ.subtitle.Q2"),
      open: false
    },
    {
      title: t("start.FAQ.title.Q3"),
      subtitle: t("start.FAQ.subtitle.Q3"),
      open: false
    },
    {
      title: t("start.FAQ.title.Q4"),
      subtitle: t("start.FAQ.subtitle.Q4"),
      open: false
    },
    {
      title: t("start.FAQ.title.Q5"),
      subtitle: t("start.FAQ.subtitle.Q5"),
      open: false
    }
  ])
</script>

<template>
  <div class="max-w-[600px] m-auto">
    <h1 class="text-xl font-semibold leading-7 text-gray-900 dark:text-gray-100 mb-3">
      FAQ
      <span class="text-neutral-300 dark:text-neutral-700 font-normal">({{ t("start.FAQ.header") }})</span>
    </h1>
    <Accordion :dataSource="faqData" class="h-80 max-h-80 overflow-auto" />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dataSource = ref([
    {
      title: t("content.accordion.multiple.warmupTitle"),
      subtitle: t("content.accordion.multiple.warmupSubtitle")
    },
    {
      title: t("content.accordion.multiple.strengthTitle"),
      subtitle: t("content.accordion.multiple.strengthSubtitle")
    },
    {
      title: t("content.accordion.multiple.cardioTitle"),
      subtitle: t("content.accordion.multiple.cardioSubtitle")
    },
    {
      title: t("content.accordion.multiple.cooldownTitle"),
      subtitle: t("content.accordion.multiple.cooldownSubtitle")
    },
    {
      title: t("content.accordion.multiple.nutritionTitle"),
      subtitle: t("content.accordion.multiple.nutritionSubtitle")
    }
  ])
</script>
<template>
  <Accordion :dataSource="dataSource" :multiple="true" />
</template>

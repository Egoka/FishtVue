<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dataSourceFirst = ref([
    {
      title: t("content.accordion.duration.first.title"),
      subtitle: t("content.accordion.duration.first.subtitle")
    },
    {
      title: t("content.accordion.duration.first.title"),
      subtitle: t("content.accordion.duration.first.subtitle")
    }
  ])
  const dataSourceSecond = ref([
    {
      title: t("content.accordion.duration.second.title"),
      subtitle: t("content.accordion.duration.second.subtitle")
    },
    {
      title: t("content.accordion.duration.second.title"),
      subtitle: t("content.accordion.duration.second.subtitle")
    }
  ])
</script>
<template>
  <Accordion :animationDuration="200" :dataSource="dataSourceFirst" />
  <Accordion :animationDuration="1000" :dataSource="dataSourceSecond" />
</template>

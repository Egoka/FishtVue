<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dataSource = ref([
    {
      title: t("start.FAQ.title.Q1"),
      subtitle: t("start.FAQ.subtitle.Q1"),
      open: false
    },
    {
      title: t("start.FAQ.title.Q2"),
      subtitle: t("start.FAQ.subtitle.Q2"),
      open: false
    }
  ])
</script>
<template>
  <Accordion :dataSource="dataSource" />
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dataSource = ref([
    {
      title: t("content.accordion.slot.defaultTitle"),
      subtitle: t("content.accordion.slot.defaultSubtitle")
    },
    {
      title: t("content.accordion.slot.customTitle"),
      subtitle: t("content.accordion.slot.customSubtitle")
    }
  ])
</script>
<template>
  <Accordion :dataSource="dataSource">
    <template #title="{ title }">
      <span> 🔖 {{ title }} </span>
    </template>
  </Accordion>
</template>

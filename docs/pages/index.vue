<script setup lang="ts">
  import { useSeoMetaFromDoc } from "~/composables/seo"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  useSeoMetaFromDoc({
    title: t("seo.start.title"),
    description: t("seo.start.description")
  } as any)
</script>
<template>
  <PageStartIntro />
  <PageStartExample />
  <PageStartFeatures />
  <PageStartCTA />
</template>

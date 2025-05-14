<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()

  const dataSourceChevronDown = ref([
    { title: t("content.accordion.icon.faqTitle"), subtitle: t("content.accordion.icon.faqSubtitle") },
    { title: t("content.accordion.icon.categoriesTitle"), subtitle: t("content.accordion.icon.categoriesSubtitle") },
    { title: t("content.accordion.icon.reviewsTitle"), subtitle: t("content.accordion.icon.reviewsSubtitle") },
    { title: t("content.accordion.icon.shippingTitle"), subtitle: t("content.accordion.icon.shippingSubtitle") },
    { title: t("content.accordion.icon.returnsTitle"), subtitle: t("content.accordion.icon.returnsSubtitle") }
  ])

  const dataSourceArrowDownCircle = ref([
    { title: t("content.accordion.icon.ingredientsTitle"), subtitle: t("content.accordion.icon.ingredientsSubtitle") },
    {
      title: t("content.accordion.icon.instructionsTitle"),
      subtitle: t("content.accordion.icon.instructionsSubtitle")
    },
    { title: t("content.accordion.icon.nutritionTitle"), subtitle: t("content.accordion.icon.nutritionSubtitle") },
    { title: t("content.accordion.icon.servingTitle"), subtitle: t("content.accordion.icon.servingSubtitle") },
    { title: t("content.accordion.icon.commentsTitle"), subtitle: t("content.accordion.icon.commentsSubtitle") }
  ])
</script>
<template>
  <Accordion :dataSource="dataSourceChevronDown" icon="ChevronDown" />
  <Separator class="h-20"></Separator>
  <Accordion :dataSource="dataSourceArrowDownCircle" icon="ArrowDownCircle" />
</template>

<script lang="ts" setup>
  import type { DemoOption } from "~/components/demo/index.vue"
  import type { AccordionProps } from "#fishtvue/accordion"
  import { layoutConfigOptions } from "~/components/demo/configOptions"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const optionsValues = ref<AccordionProps>({
    dataSource: [
      {
        title: t("content.accordion.index.profileTitle"),
        subtitle: t("content.accordion.index.profileSubtitle")
      },
      {
        title: t("content.accordion.index.ordersTitle"),
        subtitle: t("content.accordion.index.ordersSubtitle"),
        open: true
      },
      {
        title: t("content.accordion.index.paymentTitle"),
        subtitle: t("content.accordion.index.paymentSubtitle")
      },
      {
        title: t("content.accordion.index.notificationsTitle"),
        subtitle: t("content.accordion.index.notificationsSubtitle")
      },
      {
        title: t("content.accordion.index.supportTitle"),
        subtitle: t("content.accordion.index.supportSubtitle")
      }
    ]
  })
  const options = computed<DemoOption[]>(() =>
    layoutConfigOptions<AccordionProps>(optionsValues.value, [
      "multiple",
      "animationDuration",
      "icon",
      "class",
      "classItem",
      "classTitle",
      "classSubtitle"
    ])
  )
</script>

<template>
  <Demo v-model="optionsValues" :options="options" class-demo="block content-center" title="Accordion">
    <Accordion v-bind="optionsValues" />
  </Demo>
</template>

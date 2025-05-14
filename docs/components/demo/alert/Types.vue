<script setup lang="ts">
  import { type AlertProps, openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const position = ref<AlertProps["position"]>("top-right")
  const notificationVariants = ref<Record<string, AlertProps>>({
    success: {
      position: position.value,
      type: "success",
      title: t("content.alert.type.success.title"),
      subtitle: t("content.alert.type.success.subtitle")
    },
    warning: {
      position: position.value,
      type: "warning",
      title: t("content.alert.type.warning.title"),
      subtitle: t("content.alert.type.warning.subtitle")
    },
    info: {
      position: position.value,
      type: "info",
      title: t("content.alert.type.info.title"),
      subtitle: t("content.alert.type.info.subtitle")
    },
    error: {
      position: position.value,
      type: "error",
      title: t("content.alert.type.error.title"),
      subtitle: t("content.alert.type.error.subtitle")
    },
    neutral: {
      position: position.value,
      type: "neutral",
      title: t("content.alert.type.neutral.title"),
      subtitle: t("content.alert.type.neutral.subtitle")
    }
  })
</script>

<template>
  <div class="flex flex-wrap">
    <Button @click="openAlert({ ...notificationVariants.success, displayTime: 4000 })">{{ t("label.success") }}</Button>
    <Button @click="openAlert({ ...notificationVariants.warning, displayTime: 4000 })">{{ t("label.warning") }}</Button>
    <Button @click="openAlert({ ...notificationVariants.info, displayTime: 4000 })">{{ t("label.info") }}</Button>
    <Button @click="openAlert({ ...notificationVariants.error, displayTime: 4000 })">{{ t("label.error") }}</Button>
    <Button @click="openAlert({ ...notificationVariants.neutral, displayTime: 4000 })">{{ t("label.neutral") }}</Button>
  </div>
</template>

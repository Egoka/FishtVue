<script setup lang="ts">
  import { openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  function open() {
    openAlert({
      type: "info",
      position: "top-right",
      size: "md",
      displayTime: 5000,
      closeButton: true,
      notAnimate: true,
      title: t("content.alert.custom.title"),
      subtitle: `
    <div>
      <strong>${t("content.alert.custom.subtitle")}</strong>
      <p>${t("content.alert.custom.subtitleText")}</p>
    </div>
  `,
      class: "border-2 border-blue-400 shadow-lg rounded-xl"
    })
  }
</script>

<template>
  <Button mode="outline" @click="open">
    {{ t("button.custom") }}
  </Button>
</template>

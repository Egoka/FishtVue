<script setup lang="ts">
  import { type AlertProps, openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const position = ref<AlertProps["position"]>("top-right")
  const options = ref<AlertProps>({
    type: "info",
    title: t("content.alert.type.info.title"),
    subtitle: t("content.alert.type.info.subtitle"),
    position: position.value
  })
</script>

<template>
  <div class="flex flex-wrap">
    <Button @click="openAlert({ ...options, displayTime: 1000 })">1000 ms</Button>
    <Button @click="openAlert({ ...options, displayTime: 2000 })">2000 ms</Button>
    <Button @click="openAlert({ ...options, displayTime: 3000 })">3000 ms</Button>
    <Button @click="openAlert({ ...options, displayTime: 4000 })">4000 ms</Button>
    <Button @click="openAlert({ ...options, displayTime: 5000 })">5000 ms</Button>
  </div>
</template>

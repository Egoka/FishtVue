<script setup lang="ts">
  import { type AlertProps, openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const position = ref<AlertProps["position"]>("top-right")
</script>

<template>
  <Button
    @click="
      openAlert({
        position,
        notAnimate: true,
        type: 'warning',
        title: t('content.alert.type.warning.title'),
        subtitle: t('content.alert.type.warning.subtitle')
      })
    ">
    {{ t("label.open") }}
  </Button>
</template>

<style scoped></style>

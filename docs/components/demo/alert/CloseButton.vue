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
        type: 'error',
        closeButton: true,
        title: t('content.alert.type.error.title'),
        subtitle: t('content.alert.type.error.subtitle')
      })
    ">
    {{ t("label.open") }}
  </Button>
</template>

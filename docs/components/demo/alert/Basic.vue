<script setup lang="ts">
  import { openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap">
    <Button
      @click="
        openAlert({
          type: 'success',
          title: t('content.alert.type.neutral.title'),
          displayTime: 3000,
          position: 'top-right'
        })
      ">
      {{ t("button.onlyTitle") }}
    </Button>
    <Button
      @click="
        openAlert({
          type: 'success',
          subtitle: t('content.alert.type.neutral.subtitle'),
          displayTime: 3000,
          position: 'top-right'
        })
      ">
      {{ t("button.onlySubtitle") }}
    </Button>
    <Button
      @click="
        openAlert({
          type: 'success',
          title: t('content.alert.type.neutral.title'),
          subtitle: t('content.alert.type.neutral.subtitle'),
          displayTime: 3000,
          position: 'top-right'
        })
      ">
      {{ t("button.open") }}
    </Button>
  </div>
</template>

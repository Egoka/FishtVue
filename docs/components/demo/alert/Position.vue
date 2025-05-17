<script setup lang="ts">
  import { openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const state = reactive<Record<string, boolean>>({
    "top-left": false,
    top: false,
    "top-right": false,
    left: false,
    center: false,
    right: false,
    "bottom-left": false,
    bottom: false,
    "bottom-right": false
  })

  function openDialog(position: any) {
    openAlert({
      type: "neutral",
      title: t("content.alert.type.neutral.title"),
      subtitle: t("content.alert.type.neutral.subtitle"),
      displayTime: 4000,
      position
    })
  }
</script>

<template>
  <div class="grid grid-cols-3 gap-y-10 gap-x-12">
    <Button v-for="position in Object.keys(state)" :key="position" @click="openDialog(position as any)">
      {{ String(position).toLowerCase() }}
    </Button>
  </div>
</template>

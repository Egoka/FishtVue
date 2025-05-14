<script setup lang="ts">
  import { openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const isShow = ref(true)

  function handleDelete() {
    isShow.value = false
    openAlert({
      type: "success",
      title: t("content.badge.closeButton"),
      displayTime: 3000,
      position: "top-right",
      toTeleport: ".closeButton"
    })
    setTimeout(() => (isShow.value = true), 3000)
  }
</script>

<template>
  <div class="flex size-30 justify-center items-center">
    <transition
      leave-active-class="transition-opacity ease-in-out duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="transition-opacity ease-in-out duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100">
      <Badge v-show="isShow" closeButton @delete="handleDelete">Badge</Badge>
    </transition>
  </div>
</template>

<style scoped></style>

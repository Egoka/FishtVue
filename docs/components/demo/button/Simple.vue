<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
</script>

<template>
  <Button>{{ t("button.open") }}</Button>
</template>

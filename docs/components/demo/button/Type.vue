<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap">
    <Button mode="primary" size="md" color="theme" type="button">{{ t("button.Button") }}</Button>
    <Button mode="primary" size="md" color="theme" type="reset">{{ t("button.Reset") }}</Button>
    <Button mode="primary" size="md" color="theme" type="submit">{{ t("button.Submit") }}</Button>
    <Button mode="primary" size="md" color="theme" type="icon" icon="face-smile">{{ t("button.Icon") }}</Button>
  </div>
</template>

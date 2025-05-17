<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <Separator></Separator>
  <br />
  <Separator contentPosition="center" :gradient="50" :depth="3">
    {{ t("title.centeredContent") }}
  </Separator>
</template>

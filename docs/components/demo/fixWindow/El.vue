<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <Button id="target-element" mode="outline">
    {{ t("title.hoverMe") }}
  </Button>
  <FixWindow :el="'#target-element'" mode="outlined">
    {{ t("title.thisWindowIsAlignedToTheButton") }}
  </FixWindow>
</template>

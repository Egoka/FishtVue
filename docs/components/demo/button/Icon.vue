<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <div class="flex flex-wrap">
    <Button mode="primary" size="md" color="theme" icon="check">{{ t("button.WithIcon") }}</Button>
    <Button mode="primary" size="md" color="theme" icon="check" iconPosition="left">{{ t("button.IconLeft") }}</Button>
    <Button mode="primary" size="md" color="theme" icon="check" iconPosition="right">
      {{ t("button.IconRight") }}
    </Button>
  </div>
</template>

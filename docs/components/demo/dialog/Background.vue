<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dialog = ref(false)
</script>

<template>
  <Button @click="dialog = true">{{ t("button.dialog") }}</Button>
  <Dialog v-model="dialog">
    <template #background>
      <div class="custom-dialog-class fixed inset-0"></div>
    </template>
    {{ t("content.dialog.background.text") }}
  </Dialog>
</template>

<style scoped>
  .custom-dialog-class {
    padding: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>

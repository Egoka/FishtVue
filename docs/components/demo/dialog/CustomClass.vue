<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dialog = ref(false)
</script>

<template>
  <Button @click="dialog = true">{{ t("content.dialog.index") }}</Button>
  <Dialog v-model="dialog" class="custom-dialog-class" classBody="custom-dialog-body-class">
    <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
      {{ t("content.dialog.position.title") }}
    </h3>
    <div class="my-2">
      <p class="text-sm text-gray-500">
        {{ t("content.dialog.position.text") }}
      </p>
    </div>
  </Dialog>
</template>

<style scoped>
  :global(.custom-dialog-class) {
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
  :global(.custom-dialog-body-class) {
    padding: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-neutral-500) 20%, transparent);
    background-image: radial-gradient(var(--pattern-fg) 1px, transparent 1px);
    background-size: 4px 4px;
  }
</style>

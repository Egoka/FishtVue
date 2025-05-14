<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dialog = ref(false)
</script>

<template>
  <Button @click="dialog = true">{{ t("button.openDialog") }}</Button>
  <Dialog v-model="dialog" size="md" position="center" closeButton>
    {{ t("title.theDialogIsOpen") }}
  </Dialog>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dialog = ref(false)
</script>

<template>
  <div class="relative">
    <Button @click="dialog = true">{{ t("button.dialog") }}</Button>
    <Dialog v-model="dialog" position="center" close-button class="p-0" size="md">
      <template #default>
        <div class="p-5">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-400">
            {{ t("title.Authentication") }}
          </h3>
          <DemoFormBasic />
        </div>
      </template>
    </Dialog>
  </div>
</template>

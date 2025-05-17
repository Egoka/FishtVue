<script setup lang="ts">
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
  const state = reactive<Record<string, boolean>>({
    "top-left": false,
    top: false,
    "top-right": false,
    left: false,
    center: false,
    right: false,
    "bottom-left": false,
    bottom: false,
    "bottom-right": false
  })

  function openDialog(position: keyof typeof state) {
    state[position] = true
  }
</script>

<template>
  <div class="grid grid-cols-3 gap-y-10 gap-x-12">
    <Button v-for="position in Object.keys(state)" :key="position" @click="openDialog(position as any)">
      {{ t(`position.${position}`) }}
    </Button>
  </div>
  <Dialog
    v-for="position in Object.keys(state)"
    :key="position"
    v-model="state[position]"
    size="sm"
    :position="position as any"
    closeButton>
    <template #default="{ closeDialog }">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-200">
        {{ t("content.dialog.position.title") }}
      </h3>
      <div class="my-2">
        <p class="text-sm text-gray-500">
          {{ t("content.dialog.position.text") }}
        </p>
      </div>
      <div class="flex justify-center">
        <Button class="mt-5 mx-2" color="destructive" @click="closeDialog">{{ t("button.no") }}</Button>
        <Button class="mt-5 mx-2" color="creative" @click="closeDialog">{{ t("button.yes") }}</Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
  const { t } = useI18n()
  const dialog = ref(false)
</script>

<template>
  <Button @click="dialog = true">Dialog</Button>
  <Dialog v-model="dialog" position="top" not-close-background class="p-0">
    <template #default="{ closeDialog }">
      <div class="bg-gray-100 dark:bg-gray-900 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
        <div class="sm:flex sm:items-start">
          <div
            class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-800 sm:mx-0 sm:h-10 sm:w-10">
            <Icons type="ExclamationTriangle" class="h-6 w-6 text-red-600 dark:text-red-300"></Icons>
          </div>
          <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-gray-100">
              {{ t("content.dialog.notCloseBackground.title") }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ t("content.dialog.notCloseBackground.message") }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        class="bg-gray-50 dark:bg-gray-950 px-4 py-3 flex justify-center sm:justify-start sm:flex-row-reverse sm:px-6">
        <Button class="mx-2" color="destructive" @click="closeDialog">
          {{ t("button.deactivate") }}
        </Button>
        <Button class="mx-2" color="neutral" @click="closeDialog">
          {{ t("button.cancel") }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

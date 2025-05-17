<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const dialog = ref(false)
  const closeButton = ref(false)
</script>

<template>
  <Switch switchingType="switch" v-model="closeButton" :label="t('label.closeButton')" :help="t('help.closeButton')" />
  <Separator class="w-full"></Separator>
  <Button @click="dialog = true">{{ t("button.dialog") }}</Button>
  <Dialog v-model="dialog" size="md" position="center" :closeButton="closeButton" class="p-0 rounded-lg">
    <div class="preview flex min-h-[250px] w-full justify-center max-w-[448px] mx-auto items-center h-[5rem]">
      <Split
        :panels="[{ name: 'right' }, { name: 'left' }]"
        class="relative rounded-lg overflow-auto border dark:border-gray-800"
        units="percentages">
        <template #right>
          <div class="relative overflow-hidden w-full h-full flex justify-center items-center">
            <img class="absolute left-0 max-w-[448px]" src="/pramod-tiwari-16-unsplash.jpg" alt="" />
          </div>
        </template>
        <template #left>
          <div class="relative overflow-hidden w-full h-full flex justify-center items-center">
            <img class="absolute right-0 max-w-[448px]" src="/pramod-tiwari-17-unsplash.jpg" alt="" />
          </div>
        </template>
      </Split>
    </div>
  </Dialog>
</template>

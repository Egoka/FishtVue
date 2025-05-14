<script setup lang="ts">
  import { onlyIcons } from "~/components/demo/menu/dataForExamples"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const isOnlyIcons = ref(false)
</script>
<template>
  <div class="flex flex-row items-center w-full h-full p-2">
    <div class="flex justify-center items-center w-2/6 h-full mx-2">
      <Menu :onlyIcons="isOnlyIcons" :groups="onlyIcons()"></Menu>
    </div>
    <Separator vertical :depth="3" class="h-full"></Separator>
    <div class="flex justify-center items-center w-4/6 h-full mx-2">
      <Switch switchingType="switch" v-model="isOnlyIcons" :label="t('label.onlyIcons')" :help="t('help.onlyIcons')" />
    </div>
  </div>
</template>

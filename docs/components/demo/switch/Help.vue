<script setup lang="ts">
  const isChecked = ref(false)
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <Switch :help="t('help.switch')" v-model="isChecked" />
  <Switch :help="t('help.switch')" switchingType="switch" v-model="isChecked" />
</template>

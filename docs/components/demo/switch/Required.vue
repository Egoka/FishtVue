<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const isChecked = ref(false)
</script>

<template>
  <Switch required :label="t('label.acceptTerms')" v-model="isChecked" />
  <Switch required :label="t('label.acceptTerms')" switchingType="switch" v-model="isChecked" />
</template>

<script setup lang="ts">
  const { t } = useI18n()
  const isChecked = ref(false)
</script>

<template>
  <Switch :label="t('label.enableNotifications')" v-model="isChecked" />
  <Switch :label="t('label.enableNotifications')" switchingType="switch" v-model="isChecked" />
</template>

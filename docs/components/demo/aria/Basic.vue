<script setup lang="ts">
  const { t } = useI18n()
  const value = ref("")
</script>

<template>
  <Aria :label="t('label.message')" v-model="value"></Aria>
</template>

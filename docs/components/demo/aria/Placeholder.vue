<script setup lang="ts">
  const { t } = useI18n()
  const value = ref("")
</script>

<template>
  <Aria :placeholder="t('placeholder.textHere')" v-model="value"> </Aria>
</template>

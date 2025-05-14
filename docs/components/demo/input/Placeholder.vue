<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const value = ref<string>("")
</script>

<template>
  <Input :placeholder="t('placeholder.textHere')" v-model="value" />
</template>

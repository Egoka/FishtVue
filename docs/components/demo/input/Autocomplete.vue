<script setup lang="ts">
  const valueOn = ref<string>("")
  const valueOff = ref<string>("")
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <Input autocomplete="on" :label="t('on')" v-model="valueOn" />
  <Input autocomplete="off" :label="t('off')" v-model="valueOff" />
</template>

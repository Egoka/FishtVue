<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const valueText = ref("")
  const valueNumber = ref("")
  const valueEmail = ref("")
  const valuePassword = ref("")
</script>

<template>
  <Input type="text" :label="t('label.text')" width="200px" v-model="valueText" />
  <Input type="number" :label="t('label.number')" width="200px" v-model="valueNumber" />
  <Input type="email" :label="t('label.email')" width="200px" v-model="valueEmail" />
  <Input type="password" :label="t('label.password')" width="200px" v-model="valuePassword" />
</template>

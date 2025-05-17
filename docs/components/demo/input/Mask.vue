<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const valueNumber = ref("")
  const valuePrice = ref("")
  const valuePhone = ref("")
</script>
<template>
  <Input maskInput="number" :label="t('label.number')" v-model="valueNumber" />
  <Input maskInput="price" :label="t('label.price')" v-model="valuePrice" />
  <Input maskInput="phone" :label="t('label.phone')" v-model="valuePhone" />
</template>

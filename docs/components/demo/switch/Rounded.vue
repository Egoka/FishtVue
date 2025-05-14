<script setup lang="ts">
  const isChecked2 = ref(false)
  const isChecked5 = ref(false)
  const isCheckedFull = ref(false)
</script>

<template>
  <Switch :rounded="2" v-model="isChecked2" />
  <Switch :rounded="5" v-model="isChecked5" />
  <Switch rounded="full" v-model="isCheckedFull" />
  <Switch :rounded="2" switchingType="switch" v-model="isChecked2" />
  <Switch :rounded="5" switchingType="switch" v-model="isChecked5" />
  <Switch rounded="full" switchingType="switch" v-model="isCheckedFull" />
</template>

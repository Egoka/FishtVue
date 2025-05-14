<script setup lang="ts">
  const isCheckedOutlined = ref(false)
  const isCheckedUnderlined = ref(false)
  const isCheckedFilled = ref(false)
  const isCheckedNone = ref(false)
</script>

<template>
  <Switch mode="outlined" label="outlined" v-model="isCheckedOutlined" />
  <Switch mode="underlined" label="underlined" v-model="isCheckedUnderlined" />
  <Switch mode="filled" label="filled" v-model="isCheckedFilled" />
  <Switch mode="none" label="none" v-model="isCheckedNone" />
  <Switch mode="outlined" label="outlined" switchingType="switch" v-model="isCheckedOutlined" />
  <Switch mode="underlined" label="underlined" switchingType="switch" v-model="isCheckedUnderlined" />
  <Switch mode="filled" label="filled" switchingType="switch" v-model="isCheckedFilled" />
  <Switch mode="none" label="none" switchingType="switch" v-model="isCheckedNone" />
</template>

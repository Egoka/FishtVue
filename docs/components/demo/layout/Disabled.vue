<script setup lang="ts">
  const outlined = ref("outlined")
  const filled = ref("filled")
  const underlined = ref("underlined")
</script>
<template>
  <Input disabled label="outlined" mode="outlined" v-model="outlined"></Input>
  <Input disabled label="filled" mode="filled" v-model="filled"></Input>
  <Input disabled label="underlined" mode="underlined" v-model="underlined"></Input>
</template>

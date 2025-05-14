<script setup lang="ts">
  const valueOn = ref("")
  const valueOff = ref("")
</script>

<template>
  <Aria autocomplete="on" v-model="valueOn"> </Aria>
  <Aria autocomplete="off" v-model="valueOff"> </Aria>
</template>

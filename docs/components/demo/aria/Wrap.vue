<script setup lang="ts">
  const valueSoft = ref()
  const valueHard = ref()
  const valueOff = ref()
</script>

<template>
  <Aria wrap="soft" v-model="valueSoft"> </Aria>
  <Aria wrap="hard" v-model="valueHard"> </Aria>
  <Aria wrap="off" v-model="valueOff"> </Aria>
</template>

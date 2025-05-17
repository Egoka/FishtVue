<script setup lang="ts">
  const value50 = ref()
  const value100 = ref()
</script>

<template>
  <Aria :maxLength="50" v-model="value50"> </Aria>
  <Aria :maxLength="100" v-model="value100"> </Aria>
</template>

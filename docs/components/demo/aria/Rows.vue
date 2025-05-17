<script setup lang="ts">
  const value3 = ref()
  const value5 = ref()
  const value10 = ref()
</script>

<template>
  <Aria :rows="3" v-model="value3"> </Aria>
  <Aria :rows="5" v-model="value5"> </Aria>
  <Aria :rows="10" v-model="value10"> </Aria>
</template>

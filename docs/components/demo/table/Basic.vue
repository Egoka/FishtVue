<script setup lang="ts">
  const tableData = [
    { id: 1, name: "John Doe", age: 30 },
    { id: 2, name: "Jane Smith", age: 25 },
    { id: 3, name: "Bob Johnson", age: 45 }
  ]
</script>

<template>
  <Table :data-source="tableData" :countVisibleRows="3"></Table>
</template>

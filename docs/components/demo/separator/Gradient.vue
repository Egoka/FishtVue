<script setup lang="ts"></script>

<template>
  <Separator :gradient="false" :depth="3">No</Separator>
  <Separator :gradient="true" :depth="3">Base</Separator>
  <Separator :gradient="10" :depth="3">10</Separator>
  <Separator :gradient="50" :depth="3">50</Separator>
  <Separator :gradient="80" :depth="3">80</Separator>
  <Separator :gradient="[10, 90]" :depth="3">[10, 90]</Separator>
  <Separator :gradient="[40, 50]" :depth="3">[45, 50]</Separator>
</template>

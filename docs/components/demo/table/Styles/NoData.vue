<script setup lang="ts">
import {useI18n} from "vue-i18n";

const {t} = useI18n()
</script>
<template>
  <Table :noData="t('message.noData')"></Table>
</template>
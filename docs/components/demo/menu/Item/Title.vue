<script setup lang="ts">
  import { groupsMenuMini } from "~/components/demo/menu/dataForExamples.js"
  const { t } = useI18n()
</script>
<template>
  <Menu :title="t('title.mainMenu')" :groups="groupsMenuMini()"></Menu>
</template>

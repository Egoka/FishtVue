<script setup lang="ts">
  import { dataSelectMode } from "~/components/demo/configOptions"
  import { groupsMenuMini } from "~/components/demo/menu/dataForExamples"

  const { t } = useI18n()
  const modeLabel = ref()
</script>

<template>
  <Menu :mode="modeLabel" :groups="groupsMenuMini()"> </Menu>
  <Separator class="w-full"></Separator>
  <Select :label="t('label.mode')" :help="t('help.mode')" :dataSelect="dataSelectMode" v-model="modeLabel" />
</template>

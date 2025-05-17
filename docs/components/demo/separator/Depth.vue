<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const depth = ref()
</script>

<template>
  <Select switchingType="switch" v-model="depth" :dataSelect="[1, 2, 3, 4, 5, 6, 7]" :label="t('label.depth')" />
  <Separator class="my-5"></Separator>
  <Separator :depth="depth" :gradient="30"> {{ t("title.Depth") }} {{ depth }} </Separator>
</template>

<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <Separator contentPosition="center" :gradient="[20, 30]" :depth="3">
    {{ t("title.centeredContent") }}
  </Separator>
  <br />
  <Separator contentPosition="left" :gradient="[10, 20]" :depth="3">
    {{ t("title.leftContent") }}
  </Separator>
  <br />
  <Separator contentPosition="right" :gradient="[10, 20]" :depth="3">
    {{ t("title.rightContent") }}
  </Separator>
  <Separator contentPosition="full" :gradient="false" :depth="1"></Separator>
</template>

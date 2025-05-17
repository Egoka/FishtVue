<script lang="ts" setup>
  const { t } = useI18n()
  const classRef = ref(false)
  const classBodyLine = ref(false)
  const classLine = ref(false)
  const classBodyLineLeft = ref(false)
  const classLineLeft = ref(false)
  const classBodyLineRight = ref(false)
  const classLineRight = ref(false)
</script>
<template>
  <div class="flex flex-wrap justify-center">
    <Switch v-model="classRef" :label="t('label.class')" switchingType="switch" />
    <Switch v-model="classBodyLine" :label="t('label.classBodyLine')" switchingType="switch" />
    <Switch v-model="classBodyLineLeft" :label="t('label.classBodyLineLeft')" switchingType="switch" />
    <Switch v-model="classBodyLineRight" :label="t('label.classBodyLineRight')" switchingType="switch" />
  </div>
  <div class="flex flex-wrap justify-center">
    <Switch v-model="classLine" :label="t('label.classLine')" switchingType="switch" />
    <Switch v-model="classLineLeft" :label="t('label.classLineLeft')" switchingType="switch" />
    <Switch v-model="classLineRight" :label="t('label.classLineRight')" switchingType="switch" />
  </div>
  <Separator class="w-full"></Separator>
  <Separator
    :depth="5"
    class="w-full"
    :class="classRef ? 'custom-separator-class' : ''"
    :classBodyLine="classBodyLine ? 'custom-separator-class' : ''"
    :classLine="classLine ? 'bg-theme-500' : ''"
    :classBodyLineLeft="classBodyLineLeft ? 'custom-separator-class' : ''"
    :classLineLeft="classLineLeft ? 'bg-red-500' : ''"
    :classBodyLineRight="classBodyLineRight ? 'custom-separator-class' : ''"
    :classLineRight="classLineRight ? 'bg-yellow-500' : ''">
    {{ t("title.Content") }}
  </Separator>
</template>
<style scoped>
  .custom-separator-class {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
  :deep(.custom-separator-class) {
    --pattern-fg: color-mix(in oklab, var(--color-theme-500) 40%, transparent);
    background-size: 10px 10px;
    background-image: repeating-linear-gradient(
      315deg,
      var(--pattern-fg) 0,
      var(--pattern-fg) 1px,
      transparent 0,
      transparent 50%
    );
  }
</style>

<script setup lang="ts">
  import { type AlertProps, openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const position = ref<AlertProps["position"]>("top-right")
</script>

<template>
  <div class="flex flex-wrap">
    <Button
      mode="outline"
      @click="
        openAlert({
          position,
          type: 'success',
          subtitle: t('content.alert.class.subtitle'),
          displayTime: 5000,
          class: 'custom-class'
        })
      ">
      {{ t("button.custom") }}
    </Button>
    <Button
      mode="outline"
      @click="
        openAlert({
          type: 'success',
          position: 'top-right',
          size: '7xl',
          displayTime: 5000,
          subtitle: `<div class='flex'>
                                ${t('content.alert.class.subtitle')}
                                <p class='mt-3 text-sm md:mx-6 md:mt-0'><a href='#' class='whitespace-nowrap font-medium text-green-500 bko'>${t('Discover')}<span aria-hidden='true'> →</span></a></p>
                              <div>`,
          notAnimate: true,
          class: 'border-2 border-green-200 dark:border-green-900 rounded '
        })
      ">
      {{ t("content.alert.class.corners") }}
    </Button>
  </div>
  <div class="flex flex-wrap">
    <Button
      mode="outline"
      @click="
        openAlert({
          type: 'success',
          position: 'top-right',
          size: '7xl',
          displayTime: 5000,
          notAnimate: true,
          subtitle: t('content.alert.class.subtitle'),
          class: 'border-2 border-green-200 dark:border-green-900 rounded-full'
        })
      ">
      {{ t("content.alert.class.rounded") }}
    </Button>
    <Button
      mode="outline"
      @click="
        openAlert({
          type: 'success',
          position: 'top-right',
          size: '7xl',
          displayTime: 5000,
          notAnimate: true,
          subtitle: t('content.alert.class.subtitle'),
          class:
            'border-2 border-green-200 dark:border-green-900 rounded-full bg-gradient-to-r from-green-100 to-green-400 dark:from-green-800 dark:to-green-950'
        })
      ">
      {{ t("content.alert.class.gradient") }}
    </Button>
  </div>
</template>

<style scoped>
  :global(.custom-class) {
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

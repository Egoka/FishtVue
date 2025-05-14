<script setup lang="ts">
  import { type AlertProps, openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const sizes = ref<Array<AlertProps["size"]>>(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"])
</script>

<template>
  <div class="flex flex-wrap">
    <Button
      v-for="size in ['xs', 'sm', 'md', 'lg', 'xl'] as Array<AlertProps['size']>"
      :key="size"
      class="m-2"
      mode="outline"
      @click="
        openAlert({
          type: 'error',
          position: 'top-right',
          title: String(size).toUpperCase(),
          subtitle: t('content.alert.size.subtitle'),
          size: size,
          displayTime: 3000
        })
      ">
      {{ String(size).toUpperCase() }}
    </Button>
  </div>
  <div class="flex flex-wrap">
    <Button
      v-for="size in ['2xl', '3xl', '4xl', '5xl', '6xl', '7xl'] as Array<AlertProps['size']>"
      :key="size"
      class="m-2"
      mode="outline"
      @click="
        openAlert({
          type: 'error',
          position: 'top-right',
          title: String(size).toUpperCase(),
          subtitle: t('content.alert.size.subtitle'),
          size: size,
          displayTime: 3000
        })
      ">
      {{ String(size).toUpperCase() }}
    </Button>
  </div>
</template>

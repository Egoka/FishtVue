<script setup lang="ts">
  import { cn } from "#imports"
  import { useAsyncData } from "#app"
  import type { IconifyIcon } from "@iconify/vue"
  import { loadIcon } from "@iconify/vue"

  const props = defineProps<{
    icon: string
    class?: string | string[]
  }>()

  const {
    data: dataIcon,
    error,
    refresh
  } = useAsyncData<IconifyIcon | null>(`iconify-${props.icon}`, () => loadIcon(props.icon))

  watch(
    () => props.icon,
    () => refresh(),
    { immediate: true }
  )

  watch(error, (err) => {
    if (err) console.error(`Failed to load ${props.icon} icon`)
  })
</script>

<template>
  <svg
    v-if="dataIcon && icon"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    aria-hidden="true"
    role="img"
    :viewBox="`0 0 ${dataIcon.width} ${dataIcon.height}`"
    :class="cn('size-5', props.class, 'iconify')"
    v-html="dataIcon.body" />
  <span v-else :class="cn('size-5', props.class, 'iconify')" />
</template>

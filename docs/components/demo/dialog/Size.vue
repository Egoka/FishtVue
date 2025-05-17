<script setup lang="ts">
  import { reactive, ref } from "vue"
  import { useI18n } from "vue-i18n"
  const { t } = useI18n()
  const state = reactive<Record<string, boolean>>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    "2xl": false,
    "3xl": false,
    "4xl": false,
    "5xl": false,
    "6xl": false,
    "7xl": false
  })

  const demoText = ref(t("content.dialog.size.text"))

  const classTitle = ref("text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300")
  const classSize = ref("block text-end w-full text-sm text-theme-400 dark:text-theme-600")
  const classText = ref("text-base text-gray-600 dark:text-gray-400")

  function openDialog(size: keyof typeof state) {
    state[size] = true
  }
</script>

<template>
  <div class="grid grid-cols-4 gap-4">
    <Button v-for="size in Object.keys(state)" :key="size" @click="openDialog(size)">
      {{ String(size).toUpperCase() }}
    </Button>
    <div class="custom-button col-span-1 rounded-lg m-1 bg-neutral-200 dark:bg-neutral-800" />
  </div>
  <Dialog v-for="size in Object.keys(state)" :key="size" v-model="state[size]" :size="size as any" closeButton>
    <h2 :class="classTitle">{{ t("content.dialog.size.title") }}</h2>
    <p :class="classText">{{ demoText }}</p>
    <span :class="classSize">{{ t("content.dialog.size.size") }} {{ String(size).toUpperCase() }}</span>
  </Dialog>
</template>

<style scoped>
  :deep(.custom-button) {
    padding: 10px;
    --pattern-fg: color-mix(in oklab, var(--color-neutral-500) 20%, transparent);
    background-image: radial-gradient(var(--pattern-fg) 1px, transparent 1px);
    background-size: 4px 4px;
  }
</style>

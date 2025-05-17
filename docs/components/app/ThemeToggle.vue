<script lang="ts">
  type Theme = {
    name: "light" | "dark" | "system"
    title: string
    icon: string
  }
</script>
<script setup lang="ts">
  import { ref } from "vue"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const colorMode = useColorMode()

  const themes = ref<Theme[]>([
    {
      name: "light",
      title: "Switch to light theme",
      icon: "basil:sun-outline"
    },
    {
      name: "dark",
      title: "Switch to dark theme",
      icon: "basil:moon-outline"
    },
    {
      name: "system",
      title: "Switch to system theme",
      icon: "proicons:tv"
    }
  ])
  const activeTheme = ref<Theme>(themes.value.find((i) => i.name === colorMode.preference) ?? themes.value[0])

  function switchTheme() {
    const newTHemeIndex = themes.value.findIndex((i) => i.name === colorMode.preference) + 1
    const newTheme = themes.value[themes.value.length !== newTHemeIndex ? newTHemeIndex : "0"]
    if (newTheme && newTheme?.name) {
      setTheme(newTheme.name)
      activeTheme.value = newTheme
    }
  }

  function setTheme(newTheme: string) {
    colorMode.preference = newTheme
    if (newTheme !== "system") colorMode.value = newTheme
  }
</script>

<template>
  <Button mode="ghost" class="group px-2 size-9" :aria-label="activeTheme.title" @click="switchTheme">
    <AppIcons
      :icon="activeTheme.icon"
      class="text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-300 transition-all duration-500 size-5" />
    <FixWindow
      :delay="3"
      class="hidden lg:flex lg:border-transparent px-2 py-0.5 rounded-xs bg-neutral-100 dark:bg-neutral-900">
      {{ t("SwitchTheme") }}
    </FixWindow>
  </Button>
</template>

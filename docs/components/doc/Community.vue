<script setup lang="ts">
  import { computed } from "vue"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const { site } = useAppConfig()
  const editLink = useEditLink()
  const links = computed(() => [
    { label: editLink.value.text, url: editLink.value.url, icon: "lucide:pencil-line" },
    { label: t("starOnGitHub"), url: site.github, icon: "lucide:star" }
  ])
</script>

<template>
  <div>
    <div class="pt-4">
      <div class="font-bold text-sm mb-2 text-neutral-800 dark:text-neutral-200">{{ t("Community") }}</div>
      <div class="space-y-3 lg:space-y-2 mt-4">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.url"
          target="_blank"
          class="inline-flex gap-2 items-center font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white text-sm transition-colors duration-300">
          <AppIcons :icon="link.icon" class="text-lg" />
          <span>{{ link.label }}</span>
          <AppIcons icon="lucide:arrow-up-right" class="text-base" />
        </a>
      </div>
    </div>
  </div>
</template>

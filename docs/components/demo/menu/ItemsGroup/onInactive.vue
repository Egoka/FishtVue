<script setup lang="ts">
  import { openAlert } from "#fishtvue/alert"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  function open(title: string) {
    openAlert({ title: title, displayTime: 2000, position: "top-right" })
  }
</script>

<template>
  <Menu
    :groups="[
      {
        items: [
          { title: t('title.Profile'), icon: 'user', onInactive: (_, item) => open(item.title ?? '') },
          { title: t('title.Settings'), icon: 'cog-6-tooth', onInactive: (_, item) => open(item.title ?? '') },
          { title: t('title.Documents'), icon: 'document-text', onInactive: (_, item) => open(item.title ?? '') }
        ]
      },
      {
        title: 'Actions',
        items: [
          { title: t('title.Upload'), icon: 'arrow-up-tray', onInactive: (_, item) => open(item.title ?? '') },
          { title: t('title.Share'), icon: 'share', onInactive: (_, item) => open(item.title ?? '') },
          { title: t('title.Delete'), icon: 'trash', onInactive: (_, item) => open(item.title ?? '') }
        ]
      }
    ]">
  </Menu>
</template>

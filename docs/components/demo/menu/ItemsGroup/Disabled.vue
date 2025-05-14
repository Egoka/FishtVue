<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <Menu
    :groups="[
      {
        items: [
          { title: t('title.Edit'), icon: 'pencil' },
          { title: t('title.Copy'), icon: 'document-duplicate' },
          { title: t('title.Delete'), icon: 'trash', disabled: true },
          { title: t('title.Download'), icon: 'arrow-down-tray', disabled: true },
          { title: t('title.Share'), icon: 'share' }
        ]
      },
      {
        title: t('title.advancedOptions'),
        items: [
          { title: t('title.Settings'), icon: 'cog-6-tooth' },
          { title: t('title.moveToFolder'), icon: 'folder-arrow-down', disabled: true },
          { title: t('title.addToFavorites'), icon: 'star' }
        ]
      }
    ]">
  </Menu>
</template>

<style scoped></style>

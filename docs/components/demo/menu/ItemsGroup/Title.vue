<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <Menu
    :groups="[
      {
        items: [
          { title: t('title.newItem') },
          { title: t('title.openRecent') },
          { title: t('title.Save') },
          { title: t('title.Export') },
          { title: t('title.Settings') }
        ]
      },
      {
        items: [{ title: t('title.Share') }, { title: t('title.Print') }]
      }
    ]">
  </Menu>
</template>

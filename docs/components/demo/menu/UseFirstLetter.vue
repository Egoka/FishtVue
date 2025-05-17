<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>
<template>
  <Menu
    :useFirstLetter="true"
    :groups="[
      {
        title: t('title.Group'),
        items: [
          { title: t('title.Home'), icon: 'mdi:home' },
          { title: t('title.Settings') },
          { title: t('title.Profile') },
          { title: t('title.Dashboard') },
          { title: t('title.Documents') },
          { title: t('title.Messages') }
        ]
      }
    ]">
  </Menu>
</template>

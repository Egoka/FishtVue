<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <Menu
    :styles="{ width: '300px' }"
    :groups="[
      {
        items: [
          { title: t('title.Add'), info: t('info.Add') },
          { title: t('title.Edit'), info: t('info.Edit') },
          { title: t('title.Delete'), info: t('info.Delete') },
          { title: t('title.Duplicate'), info: t('info.Duplicate') },
          { title: t('title.Export'), info: t('info.Export') }
        ]
      },
      {
        title: t('title.Advanced'),
        items: [
          { title: t('title.Share'), info: t('info.Share') },
          { title: t('title.Archive'), info: t('info.Archive') },
          { title: t('title.Permissions'), info: t('info.Permissions') }
        ]
      }
    ]">
  </Menu>
</template>

<style scoped></style>

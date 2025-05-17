<script setup>
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const menuRef = ref()
  const selectFirstItem = () => {
    const firstItemKey = menuRef.value.listGroups[0].items[0]._key
    menuRef.value.setSelectedItem(firstItemKey)
  }
</script>
<template>
  <Button @click="selectFirstItem">{{ t("button.selectFirstItem") }}</Button>
  <Separator class="w-full" />
  <Menu
    ref="menuRef"
    :selected="true"
    :groups="[{ items: [{ title: t('title.Item1'), icon: 'star' }, { title: t('title.Item2') }] }]">
  </Menu>
</template>

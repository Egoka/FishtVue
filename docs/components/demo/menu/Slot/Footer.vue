<script setup lang="ts">
  import { groupsMenuMini } from "~/components/demo/menu/dataForExamples"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
</script>

<template>
  <Menu :groups="groupsMenuMini()">
    <template #footer>
      <div class="p-2 text-center">{{ t("title.footerContent") }}</div>
    </template>
  </Menu>
</template>

<style scoped></style>

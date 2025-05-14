<script setup lang="ts">
  const { t } = useI18n()
  import { openAlert } from "#fishtvue/alert"
  import { groupsMenu, groupsMenuMini, groupHorizontal } from "~/components/demo/menu/dataForExamples"
  function open(title: string) {
    openAlert({ title: title, displayTime: 2000, position: "top-right" })
  }
</script>

<template>
  <Menu
    :horizontal="true"
    :groups="[
      {
        title: t('title.Main'),
        items: [
          {
            title: t('title.Home'),
            icon: 'heroicons:home'
          },
          {
            title: t('title.Profile'),
            icon: 'heroicons:user-circle'
          },
          {
            title: t('title.Messages'),
            icon: 'heroicons:chat-bubble-left'
          }
        ]
      }
    ]">
  </Menu>
  <div class="grid transition grid-cols-1 gap-x-6 gap-y-0 sm:grid-cols-6">
    <div class="col-span-full my-5">
      <Menu
        :title="t('title.myAccount')"
        :groups="groupsMenuMini()"
        :separator="{ gradient: [10, 50] }"
        horizontal
        class="max-w-xl"
        @onClick="(_, item) => open(item.title)" />
    </div>
    <div class="col-span-full my-5">
      <Menu
        :title="t('title.myAccount')"
        :groups="groupHorizontal()"
        :separator="{ gradient: [10, 50] }"
        horizontal
        class="max-w-xl"
        @on-click="(_, item) => open(item.title)" />
    </div>
    <div class="col-span-full my-5">
      <Menu
        :title="t('title.myAccount')"
        :groups="groupHorizontal()"
        :separator="{ gradient: [10, 50] }"
        horizontal
        only-icons
        class="max-w-xl"
        @on-click="(_, item) => open(item.title)" />
    </div>
    <div class="col-span-full my-5">
      <Menu
        :separator="{ gradient: [20, 20] }"
        :groups="groupsMenu()"
        horizontal
        class="max-w-xl"
        @on-click="(_, item) => open(item.title)" />
    </div>
  </div>
</template>

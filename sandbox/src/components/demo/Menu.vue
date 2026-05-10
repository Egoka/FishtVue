<script setup lang="ts">
  import { ref } from "vue"
  import Menu from "fishtvue/menu/Menu.vue"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
  import type { SeparatorProps } from "fishtvue"
  import Separator from "fishtvue/separator/Separator.vue"

  const groupsMenuMini = () => [
    {
      items: [
        {
          title: "Profile",
          // icon: "user",
          info: "<div>+1</div>"
        },
        {
          title: "Billing",
          // icon: "credit-card",
          info: "⌘B"
        },
        {
          title: "Settings",
          // icon: "cog-6-tooth",
          info: "⌘S"
        },
        {
          title: "Keyboard Shortcuts"
          // icon: "solar:keyboard-outline",
          // info: "⌘K"
        }
      ]
    }
  ]

  const user = ref({
    name: "Emma Wilson",
    email: "emma.wilson@company.com"
  })
</script>

<template>
  <!--    v-bind="fieldsOmit(baseSeparator, ['isVisible', 'icon']) as SeparatorProps"-->
  <Separator classLine="bg-red-500" class="py-1.5 !px-0 !-mx-1" />
  <Menu
    :groups="groupsMenuMini()"
    :separator="{ classLine: 'bg-red-500' }"
    :styles="{
      height: '100%',
      class: {
        body: 'p-3 z-30',
        title: 'p-0 mb-3 bg-transparent dark:bg-transparent',
        item: 'h-10 justify-start pl-3.5 mb-3 overflow-auto',
        separator: 'bg-red-400 dark:bg-red-100 test232323'
      },
      selectedRows: 'bg-zinc-100 dark:bg-zinc-950'
    }">
    <template #title>
      <div class="flex items-center gap-3 p-2">
        <div class="relative">
          <img src="/avatars/Emma_Wilson.jpg" :alt="user.name" class="size-10 rounded-full object-cover" />
          <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div class="flex flex-col">
          <span class="font-medium text-gray-900 dark:text-gray-100">{{ user.name }}</span>
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</span>
        </div>
      </div>
    </template>
    <template #footer>
      <Separator classLine="bg-red-500" class="py-1.5 !px-0 !-mx-1" />
      <Separator :depth="5" vertical class="w-full" classLine="to-red-200 dark:to-red-800">
        <!--        :class="classRef ? 'custom-separator-class' : ''"-->
        <!--        :classBodyLine="classBodyLine ? 'custom-separator-class' : ''"-->
        <!--        :classBodyLineLeft="classBodyLineLeft ? 'custom-separator-class' : ''"
        :classLineLeft="classLineLeft ? 'bg-red-500' : ''"
        :classBodyLineRight="classBodyLineRight ? 'custom-separator-class' : ''"
        :classLineRight="classLineRight ? 'bg-yellow-500' : ''"-->
      </Separator>
    </template>
  </Menu>
</template>

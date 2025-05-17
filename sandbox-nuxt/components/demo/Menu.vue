<script setup lang="ts">
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
  <Menu :groups="groupsMenuMini()">
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
  </Menu>
</template>

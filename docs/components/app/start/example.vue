<script setup lang="ts">
  import { menuGroups } from "~/components/app/start/dataExemple"
  // import Home from "@/components/app/start/example/Home.vue";
  import Cards from "@/components/app/start/example/Cards.vue"
  import Chat from "@/components/app/start/example/Chat.vue"
  import Inbox from "@/components/app/start/example/Inbox.vue"
  import Customers from "@/components/app/start/example/Customers.vue"
  import type { ItemMenu, MenuExpose } from "#fishtvue/menu"
  const menuApp = ref<MenuExpose>()
  const activePage = ref("")
  const menu = ref(menuGroups())
  const pages = ref<Partial<Record<string, any>>>({
    // "/": Home,
    "/cards": Cards,
    "/chat": Chat,
    "/inbox": Inbox,
    "/customers": Customers
  })
  onMounted(() => {
    activePage.value = menuApp.value?.listGroups[0]?.items?.[0].to
    menuApp.value?.setSelectedItem(menuApp.value?.listGroups[0]?.items?.[0]["_key"] ?? "")
  })
  function switchPage(_: any, data: ItemMenu) {
    activePage.value = data.to
  }
</script>

<template>
  <section>
    <div
      class="hidden sm:flex bg-stone-100 dark:bg-stone-900 border border-black/10 dark:border-white/20 h-[85vh] max-h-[1040px] rounded-xl mx-3 sm:mx-8 lg:mx-14 p-3 mt-20 lg:mt-25 items-start gap-3">
      <Menu
        ref="menuApp"
        :groups="menu"
        only-icons
        class="shadow-none border-0 min-w-[64px]"
        :styles="{
          height: '100%',
          class: {
            body: 'p-3 z-30',
            title: 'p-0 mb-3',
            item: 'size-10 justify-center mb-3'
          }
        }"
        selected
        @onClick="switchPage">
        <template #title>
          <div class="size-10 flex items-center justify-center">
            <AppLogo class="size-6 fill-neutral-500 dark:fill-neutral-400" />
          </div>
        </template>
        <template #footer>
          <img src="/avatars/William_Taylor.jpg" alt="avatar" class="mt-3 size-10 rounded-md object-cover" />
        </template>
      </Menu>
      <component :is="pages[activePage]" class="w-full" />
    </div>
  </section>
</template>

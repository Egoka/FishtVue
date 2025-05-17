<script setup lang="ts">
  import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "reka-ui"
  import type { ContentNavigationItem } from "@nuxt/content"
  import { useRoute } from "#vue-router"

  const route = useRoute()

  defineProps<{ items: ContentNavigationItem[] }>()
  const colorTxt = ref(
    "text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors"
  )
  const colorBorder = ref("border-neutral-200 dark:border-neutral-800")
</script>

<template>
  <div v-for="group in items" :key="group?.title">
    <CollapsibleRoot
      v-if="group.children?.length"
      v-slot="{ open }"
      class="mb-2"
      :default-open="route.path.includes(group.path)">
      <CollapsibleTrigger class="font-bold text-sm inline-flex justify-between w-full items-center pr-4 group">
        <div class="group flex items-center mb-2">
          <AppIcons
            v-if="group?.icon"
            :icon="group.icon as string"
            class="mx-2 text-lg size-7 p-1 border rounded-md"
            :class="[colorTxt, colorBorder]" />
          <span class="font-bold" :class="colorTxt">{{ group.title }}</span>
        </div>
        <AppIcons
          icon="lucide:chevron-down"
          class="size-4 text-lg text-muted-foreground group-hover:text-foreground transition"
          :class="[!open ? '-rotate-90' : '', colorTxt]" />
      </CollapsibleTrigger>
      <CollapsibleContent
        class="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden"
        :class="colorBorder">
        <template v-for="item in group.children" :key="item.title">
          <ul v-if="item.children?.length" class="pl-8 [&:not(:last-child)]:mb-6">
            <li :class="['pl-1 font-bold text-sm pb-2 uppercase', colorTxt]">{{ item.title }}</li>
            <DocSidebarItem v-for="subitem in item.children" :key="subitem.title" :item="subitem" />
          </ul>
          <DocSidebarItem v-else :item="item" />
        </template>
      </CollapsibleContent>
    </CollapsibleRoot>
    <DocSidebarItem v-else :item="group" />
  </div>
</template>

<script lang="ts">
  interface CodeGroupProps {
    /**
     * The default tab to select.
     * @example '1'
     */
    defaultValue?: string
    /**
     * Sync the selected tab with a local storage key.
     */
    sync?: string
    class?: any
  }

  interface CodeGroupSlots {
    default(props?: {}): any
  }
</script>

<script setup lang="ts">
  import { computed, watch, onMounted, ref, onBeforeUpdate } from "vue"
  import { TabsRoot, TabsList, TabsTrigger, TabsContent } from "reka-ui"
  import { useState } from "#imports"
  import { iconsLanguage } from "~/components/content/stylic"

  const props = withDefaults(defineProps<CodeGroupProps>(), {
    defaultValue: "0"
  })
  const slots = defineSlots<CodeGroupSlots>()

  const model = defineModel<string>()

  const items = computed<
    {
      index: number
      label: string
      icon: string
      component: any
    }[]
  >(() => slots.default?.()?.flatMap(transformSlot).filter(Boolean) || [])
  function transformSlot(slot: any, index: number) {
    if (typeof slot.type === "symbol") {
      return slot.children?.map(transformSlot)
    }

    return {
      label: slot.props?.filename || slot.props?.label || ``,
      icon: slot.props?.icon,
      component: slot
    }
  }

  onMounted(() => {
    if (props.sync) {
      const syncKey = `code-group-${props.sync}`
      const syncValue = useState<string>(syncKey, () => localStorage.getItem(syncKey) as string)

      watch(
        syncValue,
        () => {
          if (!syncValue.value) return

          model.value = syncValue.value
        },
        { immediate: true }
      )

      watch(model, () => {
        if (!model.value) return

        syncValue.value = model.value
        localStorage.setItem(syncKey, model.value)
      })
    }
  })
  function getLanguageIcon(language: string): string {
    return language && Object.keys(iconsLanguage.value).includes(language)
      ? (iconsLanguage.value as any)?.[language ?? ""]
      : ""
  }
  const classes = ref<Record<"root" | "list" | "trigger" | "icon", string>>({
    root: "relative group *:not-first:!my-0 *:not-first:!static my-5",
    list: "relative flex items-center gap-1 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 border-b-0 rounded-t-sm overflow-x-auto p-2",
    trigger:
      "relative inline-flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-sm " +
      "text-neutral-700 dark:text-neutral-200 " +
      "data-[state=active]:text-neutral-900 dark:data-[state=active]:text-white " +
      "data-[state=active]:bg-neutral-100 dark:data-[state=active]:bg-neutral-800 " +
      "hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 " +
      "data-[state=inactive]:bg-white dark:data-[state=inactive]:bg-neutral-900 " +
      "disabled:cursor-not-allowed disabled:opacity-75 focus-visible:ring-2 focus-visible:ring-inset " +
      "focus-visible:ring-theme-500 dark:focus-visible:ring-theme-400 " +
      "focus:outline-none transition-colors",
    icon: "size-4 shrink-0 rounded-xs fill-neutral-700 dark:fill-neutral-300"
  })

  const rerenderCount = ref(1)
  onBeforeUpdate(() => rerenderCount.value++)
</script>

<template>
  <TabsRoot v-model="model" :default-value="defaultValue" :unmount-on-hide="false" :class="classes.root">
    <TabsList :class="classes.list">
      <TabsTrigger v-for="(item, index) of items" :key="index" :value="String(index)" :class="classes.trigger">
        <AppIcons
          v-if="item.icon || getLanguageIcon(item.component.props.language)"
          :icon="item.icon ?? getLanguageIcon(item.component.props.language)"
          :class="classes.icon" />
        <span v-if="item.label?.length" class="truncate">{{ item.label }}</span>
      </TabsTrigger>
    </TabsList>

    <TabsContent v-for="(item, index) of items" :key="index" :value="String(index)" as-child>
      <component :is="item.component" hide-header tabindex="-1" />
    </TabsContent>
  </TabsRoot>
</template>

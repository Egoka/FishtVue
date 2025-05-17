<script lang="ts">
  interface CalloutProps {
    to?: string
    target?: "_blank" | string
    icon?: string
    class?: any
    classIcon?: any
  }

  interface CalloutSlots {
    default(props?: {}): any
  }
</script>

<script setup lang="ts">
  import { computed } from "vue"
  import { cn } from "#imports"
  const localePath = useLocalePath()

  defineOptions({ inheritAttrs: false })

  const props = defineProps<CalloutProps>()
  defineSlots<CalloutSlots>()
  const classes = ref<Record<"base" | "icon" | "externalIcon", string>>({
    base:
      "group relative block items-center px-4 py-3 rounded-sm text-sm/6 my-5 last:mb-0 " +
      "[&_code]:text-xs/5 [&_code]:bg-white dark:[&_code]:bg-neutral-900 " +
      "[&_pre]:bg-white dark:[&_pre]:bg-neutral-900 [&>div]:my-2.5 " +
      "[&_ul]:my-2.5 [&_ol]:my-2.5 [&>*]:last:!mb-0 [&_ul]:ps-4.5 [&_ol]:ps-4.5 [&_li]:my-0 " +
      "transition-colors border border-dashed " +
      "border-neutral-200 dark:border-neutral-700 " +
      "bg-neutral-50 dark:bg-neutral-800 " +
      "text-neutral-700 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-300 " +
      "hover:border-theme-500 dark:hover:border-theme-400",
    icon: "size-5 shrink-0 align-sub me-1.5 transition-colors text-theme-500 dark:text-theme-300 fill-theme-500 dark:fill-theme-300 inline-flex items-center align-sub",
    externalIcon:
      "size-4 align-top absolute right-2 top-2 pointer-events-none transition-colors text-neutral-400 dark:text-neutral-500"
  })
  const target = computed(() => props.target || (!!props.to && props.to.startsWith("http") ? "_blank" : undefined))
</script>

<template>
  <div :class="cn(classes.base, props.class)">
    <NuxtLink v-if="to" v-bind="{ to: localePath(to), target, ...$attrs }" class="focus:outline-none" tabindex="-1">
      <span class="text-bold absolute inset-0" aria-hidden="true" />
    </NuxtLink>
    <AppIcons v-if="!!to && target === '_blank'" icon="uim:arrow-up-right" :class="classes.externalIcon" />
    <AppIcons v-if="icon" :icon="icon" :class="cn(classes.icon, props.classIcon)" />
    <slot mdc-unwrap="p" />
  </div>
</template>

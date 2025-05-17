<script setup lang="ts">
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()
  const localePath = useLocalePath()
  const props = defineProps<{ control: any }>()
  const editLink = useEditLink()
  const control = computed(() => ({
    prev: props.control?.[0],
    next: props.control?.[1]
  }))
  const hasEditLink = computed(() => true /*theme.value.editLink*/)
  // const hasLastUpdated = computed(() => page.value.lastUpdated)
  const showFooter = computed(
    () =>
      hasEditLink.value ||
      // || hasLastUpdated.value
      control.value?.prev ||
      control.value?.next
  )
  const classTransition = ref("transition-colors duration-500")
  const classTextControl = ref("text-neutral-500 dark:text-neutral-400")
  const classButtonControl = ref([
    "inline-flex flex-col",
    classTransition.value,
    "transition-colors duration-500",
    "backdrop-blur-[1px] bg-transparent dark:bg-transparent hover:bg-neutral-100/30 hover:dark:bg-neutral-900/30",
    "rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-theme-400 dark:hover:border-theme-700",
    "w-full px-4 py-6"
  ])
</script>

<template>
  <footer v-if="showFooter" class="mt-16 py-8 border-t border-t-neutral-200 dark:border-t-neutral-700">
    <div v-if="hasEditLink" class="flex justify-between text-muted-foreground">
      <div v-if="hasEditLink" class="text-sm text-muted-foreground hover:text-foreground">
        <a
          :href="editLink.url"
          target="_blank"
          class="inline-flex gap-2 items-center text-neutral-700 dark:text-neutral-400">
          <AppIcons icon="lucide:pencil-line" />
          {{ editLink.text }}
        </a>
      </div>
    </div>

    <nav
      v-if="control?.prev?.path || control?.next?.path"
      class="flex flex-col md:flex-row items-center justify-between gap-4 mt-8"
      aria-labelledby="doc-footer-aria-label">
      <span id="doc-footer-aria-label" class="sr-only">{{ t("Pager") }}</span>

      <div class="w-full group">
        <NuxtLink v-if="control?.prev?.path" :class="classButtonControl" :to="localePath(control.prev.path)">
          <span class="text-xs" :class="[classTextControl]">
            {{ t("PreviousPage") }}
          </span>
          <p class="inline-flex items-center gap-1 mt-2">
            <AppIcons icon="lucide:arrow-left" :class="[classTextControl, classTransition]" />
            <span class="text-sm font-semibold" v-html="control.prev.title" />
          </p>
        </NuxtLink>
      </div>
      <div class="w-full group">
        <NuxtLink
          v-if="control?.next?.path"
          class="items-end"
          :class="classButtonControl"
          :to="localePath(control.next.path)">
          <span class="text-xs" :class="[classTextControl]">
            {{ t("NextPage") }}
          </span>

          <p class="inline-flex items-center gap-1 mt-2">
            <span class="text-sm font-semibold" v-html="control.next.title" />
            <AppIcons icon="lucide:arrow-right" :class="[classTextControl, classTransition]" />
          </p>
        </NuxtLink>
      </div>
    </nav>
  </footer>
</template>

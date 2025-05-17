<script setup lang="ts">
  import { ref } from "vue"
  import { useClipboard } from "@vueuse/core"
  import { useI18n } from "vue-i18n"
  import { iconsLanguage } from "~/components/content/stylic"

  const { t } = useI18n()
  const props = defineProps<{
    icon?: string
    code?: string
    language?: string
    filename?: string
    highlights?: number[]
    hideHeader?: boolean
    meta?: string
    classPre?: any
    class?: any
  }>()

  const clipboard = useClipboard()

  const copied = ref(false)
  const classes = ref<Record<"root" | "header" | "icon" | "headerFilename" | "pre" | "copy", string>>({
    root: `relative group fishtvue-button ${props.filename?.length ? " [&>pre]:rounded-t-none [&>pre]:my-0 my-5" : ""}`,
    header:
      "flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 border-b-0 relative rounded-t-sm px-4 py-3",
    icon: "size-4 shrink-0 rounded-xs text-neutral-200 dark:text-neutral-700",
    headerFilename: "text-neutral-700 dark:text-neutral-200 text-sm/6 font-bold",
    copy: "absolute top-[11px] right-[11px] opacity-0 group-hover:opacity-100 transition",
    pre: "group font-mono text-sm/6 border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded-sm px-4 py-3 whitespace-pre-wrap break-words overflow-x-auto focus:outline-none"
  })
  const language = computed(() => props.language)
  const languageIcon = computed<string>(() =>
    language.value && Object.keys(iconsLanguage.value).includes(language.value)
      ? (iconsLanguage.value as any)?.[language.value ?? ""]
      : ""
  )

  let timeoutId: ReturnType<typeof setTimeout> | null = null
  function copy() {
    clipboard.copy(props.code || "")

    copied.value = true

    timeoutId = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })
</script>

<template>
  <div :class="[classes.root, props.class]">
    <div v-if="filename && !hideHeader" :class="classes.header">
      <AppIcons :icon="icon ?? languageIcon ?? ''" :class="classes.icon" />
      <span :class="classes.headerFilename">{{ filename }}</span>
    </div>
    <Button
      type="icon"
      :icon="copied ? 'lucide:check' : 'lucide:copy'"
      classIcon="size-4 transition-all duration-300"
      color="neutral"
      mode="outline"
      size="xs"
      :aria-label="t('CopyCode')"
      class="absolute z-1 m-0 top-[11px] right-[11px] opacity-0 group-hover:opacity-100 transition"
      tabindex="-1"
      @click="copy" />
    <pre :class="[classes.pre, props.classPre, `shiki shiki-themes language-${language}`]" tabindex="0"><slot/></pre>
  </div>
</template>

<style scoped>
  :deep(.shiki span.line) {
    display: block;
  }

  :deep(.shiki span.line.highlight) {
    margin: 0 -16px;
    padding: 0 16px;
  }
</style>

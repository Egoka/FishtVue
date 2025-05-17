<script lang="ts">
  import type { InputProps } from "#fishtvue/input"
  import type { SelectProps } from "#fishtvue/select"
  import type { SwitchProps } from "#fishtvue/switch"
  import type { AriaProps } from "#fishtvue/aria"

  type BaseOption = { nameComp: string }
  type OptionInput = BaseOption & { typeComp: "input" } & InputProps
  type OptionSelect = BaseOption & { typeComp: "select" } & SelectProps
  type OptionSwitch = BaseOption & { typeComp: "switch" } & SwitchProps
  type OptionAria = BaseOption & { typeComp: "aria" } & AriaProps
  export type DemoOption = OptionInput | OptionSelect | OptionSwitch | OptionAria
  export type DemoEmits = {
    (event: "update:modelValue", payload: any): void
  }
</script>

<script setup lang="ts">
  import { cn } from "#imports"
  import { ref, watch } from "vue"
  import { createHighlighter } from "shiki"
  import { isClient, useClipboard } from "@vueuse/core"
  import { useI18n } from "vue-i18n"
  import { process } from "std-env"
  const { t } = useI18n()
  const props = defineProps<{
    modelValue: any
    title?: string
    options: DemoOption[]
    class?: string
    classDemo?: string
  }>()
  const emit = defineEmits<DemoEmits>()
  const colorMode = useColorMode()
  // Стили
  const classes = ref({
    root:
      "rounded-sm w-full relative my-4" +
      "border border-dashed border-neutral-200 dark:border-neutral-700 " +
      "bg-neutral-50/70 dark:bg-neutral-800/70",
    demo:
      "flex justify-center items-center overflow-auto p-8 gap-4 w-full h-full " +
      "rounded-sm border border-neutral-200 dark:border-neutral-700 " +
      "text-neutral-950/5 dark:text-neutral-50/5 bg-[size:10px_10px] bg-fixed bg-[image:repeating-linear-gradient(315deg,currentColor_0,currentColor_1px,_transparent_0,_transparent_50%)]",
    title: "font-asap font-bold text-neutral-400 dark:text-neutral-400",
    blockBorder: "rounded-sm border border-neutral-200 dark:border-neutral-700"
  })

  // Инициализация Shiki
  const highlighter = await createHighlighter({
    themes: ["vitesse-light", "vitesse-dark"],
    langs: ["vue", "javascript"]
  })

  const optionsValues = reactive<Record<string, any>>(props.modelValue)
  const generatedCode = ref("")
  const highlightedCode = ref("")
  const isMoveCode = ref(false)

  function updateGeneratedCode() {
    const componentName = props.title
    const optionsForComponent = props.options.filter((opt) => opt.nameComp && opt.modelValue)
    if (optionsForComponent.length === 0) {
      generatedCode.value = `<${componentName}></${componentName}>`
    } else {
      const attrs = optionsForComponent
        .map((item) => {
          if (item.typeComp === "switch") return item.modelValue ? item.nameComp : false
          if (item.typeComp === "select" && item.multiple) return `${item.nameComp}="[${item.modelValue}]"`
          return `${item.nameComp}="${item.modelValue}"`
        })
        .filter(Boolean)
        .join("\n ")
      generatedCode.value = `<${componentName} ${attrs ? `\n ${attrs}\n` : ""}></${componentName}>`
    }
    if (isClient) {
      const theme = colorMode.value === "light" ? "vitesse-light" : colorMode.value === "dark" ? "vitesse-dark" : ""
      highlightedCode.value = highlighter.codeToHtml(generatedCode.value, { lang: "vue", theme })
    }
  }

  watch(() => props.options, updateGeneratedCode, { deep: true })

  watch(() => colorMode.value, updateGeneratedCode)

  onMounted(() => {
    updateGeneratedCode()
  })

  const clipboard = useClipboard()
  const copied = ref(false)
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  function copy() {
    clipboard.copy(generatedCode.value || "")

    copied.value = true

    timeoutId = setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
  })

  function updateValue(name: string, value: any) {
    optionsValues[name] = value
    emit("update:modelValue", optionsValues)
  }
  function useDevice() {
    const userAgent = process.client ? navigator.userAgent.toLowerCase() : ""
    const isMobile = /iphone|ipad|ipod|android|blackberry|windows phone|opera mini|silk/i.test(userAgent)
    return {
      isMobile
    }
  }
</script>

<template>
  <div :class="cn(classes.root, props.class)">
    <Split
      :panels="[{ name: 'right' }, { name: 'left', size: 50, maxSize: 70, minSize: 25 }]"
      class="min-h-[15rem] relative"
      units="percentages">
      <template #right>
        <Split
          direction="vertical"
          units="percentages"
          :panels="[{ name: 'component' }, { name: 'code', size: 30, maxSize: 70, minSize: 25 }]">
          <template #component>
            <div :class="cn('absolute top-2 left-3 pt-5 pl-4', classes.title)">
              {{ props.title ?? t("Component") }}
            </div>
            <div :class="cn(classes.demo, props.classDemo)">
              <slot />
            </div>
          </template>
          <template #code>
            <div
              :class="
                cn('group', 'w-full h-full p-4 pt-10 overflow-auto', 'bg-white dark:bg-[#121212]', classes.blockBorder)
              "
              @pointermove="isMoveCode = true"
              @pointerout="isMoveCode = false">
              <div :class="cn('absolute top-2 left-5 rounded-sm px-2', 'bg-white dark:bg-[#121212]', classes.title)">
                {{ t("Code") }}
              </div>
              <Button
                type="icon"
                :icon="copied ? 'lucide:check' : 'lucide:copy'"
                classIcon="size-4 transition-all duration-300"
                color="neutral"
                mode="outline"
                size="xs"
                :aria-label="t('CopyCode')"
                :class="[
                  'absolute m-0 top-[11px] right-[11px] transition',
                  useDevice().isMobile || isMoveCode ? 'opacity-100' : 'opacity-0'
                ]"
                tabindex="-1"
                @click="copy" />
              <div class="shiki" v-html="highlightedCode"></div>
            </div>
          </template>
        </Split>
      </template>
      <template #left>
        <div :class="cn('p-4', classes.blockBorder)">
          <div :class="cn('p-4', classes.title)">
            {{ t("Options") }}
          </div>
          <div :class="cn('relative flex flex-col gap-4 pt-4 overflow-auto min-h-96 max-h-[70vh]')">
            <div v-for="option in options" :key="option.nameComp">
              <Input
                v-if="option.typeComp === 'input'"
                v-bind="option"
                mode="filled"
                autocomplete="off"
                clear
                @update:modelValue="(value: any) => updateValue(option.nameComp, value)" />
              <Select
                v-if="option.typeComp === 'select'"
                v-bind="option"
                mode="filled"
                noQuery
                clear
                @update:modelValue="(value: any) => updateValue(option.nameComp, value)" />
              <Switch
                v-if="option.typeComp === 'switch'"
                v-bind="option"
                switchingType="switch"
                @update:modelValue="(value: any) => updateValue(option.nameComp, value)" />
              <Aria
                v-if="option.typeComp === 'aria'"
                v-bind="option"
                mode="filled"
                autocomplete="off"
                clear
                @update:modelValue="(value: any) => updateValue(option.nameComp, value)" />
            </div>
          </div>
        </div>
      </template>
    </Split>
  </div>
</template>
<style scoped>
  :deep(.shiki span.line) {
    display: block;
    line-height: 0;
  }

  :deep(.shiki span.line.highlight) {
    margin: 0 -16px;
    padding: 0 16px;
  }
</style>

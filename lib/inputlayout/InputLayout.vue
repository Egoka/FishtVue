<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, useId, useSlots } from "vue"
  import type { InputLayoutEmits, InputLayoutProps } from "./InputLayout"
  import Label from "fishtvue/label/Label.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import Loading from "fishtvue/loading/Loading.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Component from "fishtvue/component"
  import { isClient } from "fishtvue/utils/domHandler"
  // ---BASE-COMPONENT----------------------
  const InputLayout = new Component<"InputLayout">()
  const options = InputLayout.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<InputLayoutProps>(), {
    isValue: undefined,
    isInvalid: undefined,
    required: undefined,
    loading: undefined,
    disabled: undefined,
    clear: undefined
  })
  const emit = defineEmits<InputLayoutEmits>()
  const slots = useSlots()
  // ---REF-LINK----------------------------
  const input = ref<HTMLElement | undefined>()
  const inputBody = ref<HTMLElement | undefined>()
  const beforeInput = ref<HTMLElement | undefined>()
  const afterInput = ref<HTMLElement | undefined>()
  // ---STATE-------------------------------
  const baseHeight = 38 //px
  const headerHeight = ref<number>(0)
  const isCopy = ref<boolean>(false)
  const beforeWidth = ref<number>(0)
  const afterWidth = ref<number>(0)
  const isTick = ref<boolean>(false)
  // ---OBSERVER REFS (saved for cleanup on unmount) -----------------
  let beforeObserver: ResizeObserver | undefined
  let afterObserver: ResizeObserver | undefined
  // ---PROPS-------------------------------
  const value = computed<InputLayoutProps["value"]>(() => props.value ?? null)
  const isValue = computed<NonNullable<InputLayoutProps["isValue"]>>(() => props?.isValue ?? false)
  const mode = computed<NonNullable<InputLayoutProps["mode"]>>(
    () => (props?.mode as InputLayoutProps["mode"]) ?? options?.mode ?? InputLayout.componentsStyle() ?? "outlined"
  )
  const label = computed<NonNullable<InputLayoutProps["label"]>>(() => String(props?.label ?? ""))
  const labelMode = computed<NonNullable<InputLayoutProps["labelMode"]>>(() => {
    const labelModeValue = (props?.labelMode as InputLayoutProps["labelMode"]) ?? options?.labelMode ?? "offsetDynamic"
    return labelModeValue ? labelModeValue : "offsetDynamic"
  })
  const labelType = computed<NonNullable<InputLayoutProps["labelMode"]>>(() =>
    getLabelType(isValue.value, label.value, labelMode.value)
  )
  // ---A11Y: label↔control association (single source of truth) -----
  // `useId()` — SSR-stable, hydration-safe (зеркало Accordion/Split).
  const autoId = useId() ?? ""
  // id контрола: явный props.id выигрывает, иначе автогенерация.
  const fieldId = computed<string>(() => props.id ?? autoId)
  // id самой метки (для aria-labelledby у non-labelable триггеров);
  // undefined без label → атрибут не виснет на dangling-id.
  const labelId = computed<string | undefined>(() => (label.value ? `${fieldId.value}-label` : undefined))
  const isRequired = computed<NonNullable<InputLayoutProps["required"]>>(() => props.required ?? false)
  const isLoading = computed<InputLayoutProps["loading"]>(() => props.loading ?? false)
  const isDisabled = computed<InputLayoutProps["disabled"]>(() => props.disabled ?? false)
  const isInvalid = computed<InputLayoutProps["isInvalid"]>(() => (!isDisabled.value ? props.isInvalid : false))
  const messageInvalid = computed<InputLayoutProps["messageInvalid"]>(() => props.messageInvalid ?? "")
  const help = computed<InputLayoutProps["help"]>(() => String(props.help ?? ""))
  const widthLayout = computed<string>(() => {
    const resultWidth = (props?.width as InputLayoutProps["width"]) ?? options?.height ?? ""
    return resultWidth ? (typeof resultWidth === "number" ? `${resultWidth}px` : resultWidth) : ""
  })
  const heightLayout = computed<string>(() => {
    const resultHeight = (props?.height as InputLayoutProps["height"]) ?? options?.height ?? ""
    return resultHeight ? (typeof resultHeight === "number" ? `${resultHeight}px` : resultHeight) : ""
  })
  const animation = computed<NonNullable<InputLayoutProps["animation"]>>(() =>
    isTick.value
      ? ((props?.animation as InputLayoutProps["animation"]) ??
        options?.animation ??
        "motion-safe:transition-all motion-safe:duration-550")
      : ""
  )
  const background = computed(() =>
    mode.value === "outlined"
      ? "bg-white dark:bg-surface-950"
      : mode.value === "underlined"
        ? "bg-surface-50 dark:bg-surface-950"
        : mode.value === "filled"
          ? "bg-surface-100 dark:bg-surface-900"
          : ""
  )
  const classBody = computed(() =>
    InputLayout.setStyle([
      "inputBody classBody relative rounded-md",
      background.value,
      animation.value ?? "",
      options?.classBody ?? "",
      props?.classBody ?? "",
      isInvalid.value ? "is-invalid" : "",
      // N59: style-for-print — печатаем монохромно и читаемо, без display:none
      "print:border print:border-black print:bg-white print:text-black print:shadow-none"
    ])
  )
  const classBase = computed(() =>
    InputLayout.setStyle([
      "classLayout rounded-md w-full text-surface-900 dark:text-surface-100 sm:text-sm sm:leading-6 focus-visible:ring-0",
      heightLayout.value.length ? "" : "max-h-20",
      isDisabled.value
        ? "bg-surface-50 dark:bg-surface-950 text-surface-500 dark:text-surface-500 border-surface-200 dark:border-surface-800 border-dashed shadow-none"
        : "",
      mode.value === "outlined" ? "border border-surface-300 dark:border-surface-600" : "",
      mode.value === "underlined" ? "rounded-none border-0 border-surface-300 dark:border-surface-700 border-b" : "",
      mode.value === "filled"
        ? `${isDisabled.value ? "border-dotted border-2 border-surface-200" : "border-0 border-transparent"} `
        : "",
      animation.value ?? "",
      options?.class ?? "",
      props?.class ?? "",
      isInvalid.value
        ? "border-red-500 dark:border-red-500 ring-1 ring-inset ring-red-500 dark:ring-red-500 scroll-mt-10"
        : "",
      "flex items-center peer overflow-auto",
      // B10: high-contrast — border-* сбрасывается forced-colors, outline сохраняет границу поля
      "forced-colors:outline"
    ])
  )
  const styleBase = computed(
    () =>
      (widthLayout.value ? `width:${widthLayout.value};` : "") +
      (heightLayout.value ? `height:${heightLayout.value};` : "") +
      (baseHeight ? `min-height: ${baseHeight}px;` : "") +
      (beforeWidth.value ? `padding-left: ${beforeWidth.value}px;` : "padding-left: 10px;") +
      (afterWidth.value ? `padding-right: ${afterWidth.value}px;` : "padding-right: 10px;")
  )
  const classBeforeInput = computed(() =>
    InputLayout.setStyle([
      "beforeInput absolute inset-y-0 left-0 flex items-center pr-1",
      beforeInput.value && beforeWidth.value > 16 ? "pl-2" : "pl-1.5"
    ])
  )
  const classAfterInput = computed(() => InputLayout.setStyle("absolute inset-y-0 right-0 flex items-center"))
  const classAfterSlot = computed(() => InputLayout.setStyle("flex pr-2"))
  const classLoading = computed(() => InputLayout.setStyle("relative mx-4"))
  const classInvalid = computed(() =>
    InputLayout.setStyle(
      "absolute block text-red-600 dark:text-red-400 text-sm truncate ml-1 data-[invalid=true]:visible invisible"
    )
  )
  const classIconBody = computed(() => InputLayout.setStyle("relative mr-2"))
  const classIconContent = computed(() =>
    InputLayout.setStyle(
      "p-3 rounded-md shadow-lg " +
        "bg-white dark:bg-surface-900 " +
        "font-light italic text-xs text-surface-500 dark:text-surface-400 " +
        "ring-1 ring-black/20 focus:outline-none"
    )
  )
  // E29.7: inline-классы шаблона (<transition>-блоки + hover-иконки) движок сам не регистрирует —
  // явно регистрируем их motion-safe:-варианты, чтобы reduced-motion уважался.
  InputLayout.setStyle(
    "motion-safe:transition motion-safe:transition-all motion-safe:ease-in " +
      "motion-safe:duration-200 motion-safe:duration-300 opacity-100 opacity-0"
  )
  // ---EXPOSE------------------------------
  defineExpose({
    // ---STATE-------------------------
    input,
    inputBody,
    beforeInput,
    afterInput,
    headerHeight,
    isCopy,
    beforeWidth,
    afterWidth,
    // ---PROPS-------------------------
    value,
    isValue,
    mode,
    label,
    labelMode,
    labelType,
    isRequired,
    isLoading,
    isDisabled,
    isInvalid,
    messageInvalid,
    help,
    width: widthLayout,
    height: heightLayout,
    animation,
    classBody,
    class: classBase,
    // ---METHODS-----------------------
    copy
  })
  // ---MOUNT-UNMOUNT-----------------------
  function resolveOffsetTop(): number {
    const raw = (props.offsetTop as InputLayoutProps["offsetTop"]) ?? options?.offsetTop
    if (typeof raw === "number") return raw
    if (typeof raw === "function") {
      try {
        return (raw as () => number)() || 0
      } catch {
        return 0
      }
    }
    if (typeof raw === "string") {
      const parsed = parseInt(raw, 10)
      return Number.isFinite(parsed) ? parsed : 0
    }
    return 0
  }
  // Резолвим offsetTop сразу — synchronously: в jsdom-тестах expose.headerHeight
  // должен быть актуальным без ожидания onMounted-hook.
  headerHeight.value = resolveOffsetTop()
  // `InputLayout.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84).
  onMounted(() => {
    if (beforeInput.value) {
      beforeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) beforeWidth.value = (entry as any).target["offsetWidth"]
      })
      beforeObserver.observe(beforeInput.value as HTMLElement)
    }
    if (afterInput.value) {
      afterObserver = new ResizeObserver((entries) => {
        for (const entry of entries) afterWidth.value = (entry as any)?.target["offsetWidth"]
      })
      afterObserver.observe(afterInput.value as HTMLElement)
    }
    headerHeight.value = resolveOffsetTop()
    setTimeout(() => (isTick.value = true), 100)
  })
  // ---SET_OBSERVER-------------------------
  let layoutObserver: ResizeObserver
  if (isClient())
    layoutObserver = new ResizeObserver((entries) =>
      entries.forEach(() => {
        setWidthInput()
      })
    )
  const widthInput = ref<number>(0)

  function setWidthInput() {
    const result = inputBody.value?.clientWidth
    widthInput.value = result ? result : 0
  }

  onMounted(() => {
    if (isClient() && inputBody.value) layoutObserver.observe(inputBody.value as Element)
  })
  onUnmounted(() => {
    if (!isClient()) return
    layoutObserver?.disconnect()
    beforeObserver?.disconnect()
    afterObserver?.disconnect()
  })
  // ---METHODS-----------------------------
  const getLabelType = (
    value: any,
    label: InputLayoutProps["label"],
    labelMode: NonNullable<InputLayoutProps["labelMode"]>
  ): NonNullable<InputLayoutProps["labelMode"]> => {
    if (label?.length) {
      if (value) {
        if (["offsetDynamic", "offsetStatic"].includes(labelMode)) return "offsetStatic"
        else if (["vanishing"].includes(labelMode)) return "none"
        else return "static"
      } else return labelMode
    } else return "none"
  }

  function legacyCopy(text: string): boolean {
    if (!isClient()) return false
    try {
      const el = document.createElement("textarea")
      el.value = text
      el.setAttribute("readonly", "")
      el.style.position = "fixed"
      el.style.top = "0"
      el.style.left = "0"
      el.style.opacity = "0"
      document.body.appendChild(el)
      el.focus()
      el.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }

  async function copy() {
    if (!isClient()) return
    const text = String(value.value ?? "")
    const writeText: ((s: string) => Promise<void>) | undefined =
      typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function"
        ? navigator.clipboard.writeText.bind(navigator.clipboard)
        : undefined
    let ok = false
    if (writeText) {
      try {
        await writeText(text)
        ok = true
      } catch (err) {
        // HTTPS-only / permission-denied / iframe-sandbox → fallback на execCommand
        ok = legacyCopy(text)
        if (!ok) console.error("Failed to copy: ", err)
      }
    } else {
      ok = legacyCopy(text)
    }
    if (ok) {
      isCopy.value = true
      setTimeout(() => (isCopy.value = false), 3000)
    }
  }
</script>

<template>
  <div
    data-input-layout
    ref="inputBody"
    :class="classBody"
    :style="`${widthLayout ? `width:${widthLayout};` : ''}${heightLayout ? `height:${heightLayout};` : ''}scroll-margin-top: ${headerHeight + 10}px;`">
    <div
      v-if="slots.before"
      data-input-layout-before
      ref="beforeInput"
      :class="classBeforeInput"
      :style="`${heightLayout ? `height:${heightLayout};` : ''}max-height: 4rem;`">
      <slot name="before" />
    </div>
    <div data-input-layout-base ref="input" :class="classBase" :style="styleBase">
      <slot :id="fieldId" :labelledby="labelId" />
    </div>
    <slot name="body" />
    <Label
      v-if="label"
      :id="labelId"
      :for-id="fieldId"
      :title="label"
      :type="labelType"
      :mode="mode"
      :is-required="isRequired"
      :translate-x="beforeWidth || 10"
      :max-width="widthInput"
      :animate="isTick" />
    <span
      ref="afterInput"
      :class="classAfterInput"
      :style="`${heightLayout ? `height:${heightLayout};` : ''}max-height: 15rem;`">
      <div v-if="slots.after" data-input-layout-after :class="classAfterSlot">
        <slot name="after" />
      </div>
      <transition
        leave-active-class="motion-safe:transition motion-safe:ease-in motion-safe:duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        enter-active-class="motion-safe:transition motion-safe:ease-in motion-safe:duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100">
        <div v-if="isLoading" data-loading :class="classLoading">
          <Loading v-if="isLoading" type="simple" class="absolute -top-[10px] -left-4" />
        </div>
      </transition>
      <div v-if="help?.length" data-input-layout-help :class="classIconBody">
        <Icons
          type="QuestionMarkCircle"
          stile-icon="solid"
          class="text-surface-400 dark:text-surface-600 hover:text-yellow-500 motion-safe:transition cursor-help" />
        <FixWindow
          :mode="mode"
          event-open="click"
          event-close="hover"
          position="bottom-right"
          :margin-px="12"
          :padding-window="40"
          class-body="z-30"
          stop-open-propagation
          class="border-0 w-auto max-w-[15rem] origin-top-right px-0 bg-transparent dark:bg-transparent">
          <div :class="classIconContent">
            <slot name="help">
              <span data-input-layout-help-text>{{ help }}</span>
            </slot>
          </div>
        </FixWindow>
      </div>
      <template v-if="!isDisabled">
        <div v-if="isInvalid && messageInvalid" data-input-layout-invalid :class="classIconBody">
          <Icons
            type="ExclamationCircle"
            stile-icon="solid"
            class="text-red-500 dark:text-red-500 motion-safe:transition cursor-pointer" />
          <FixWindow
            :mode="mode"
            event-open="click"
            event-close="hover"
            position="bottom-right"
            :margin-px="12"
            :padding-window="40"
            class-body="z-30"
            stop-open-propagation
            class="border-0 w-auto max-w-[15rem] origin-top-right px-0 bg-transparent dark:bg-transparent">
            <div :class="classIconContent">
              <slot name="messageInvalid">
                <span data-input-layout-message-invalid-text>{{ messageInvalid }}</span>
              </slot>
            </div>
          </FixWindow>
        </div>
        <transition
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition ease-in duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="clear && (value?.length || value > 0)" data-input-layout-clear :class="classIconBody">
            <Icons
              type="XCircle"
              stile-icon="solid"
              class="text-surface-400 dark:text-surface-600 hover:text-red-600 hover:dark:text-red-500 motion-safe:transition-all motion-safe:duration-300 cursor-pointer"
              @click.stop="emit('clear')" />
            <FixWindow v-if="slots.default" mode="filled" :delay="1000" :padding-window="40">
              {{ InputLayout.t("clear") ?? "Clear" }}
            </FixWindow>
          </div>
        </transition>
      </template>
      <template v-else-if="value?.length">
        <div v-if="!isCopy" data-input-layout-copy :class="classIconBody">
          <Icons
            type="square-2-stack"
            stile-icon="solid"
            class="mr-2 text-surface-400 dark:text-surface-600 hover:text-surface-600 hover:dark:text-surface-400 motion-safe:transition"
            @click.stop="copy" />
          <FixWindow :mode="mode" :delay="1000" :padding-window="40">
            {{ InputLayout.t("copy") ?? "Copy" }}
          </FixWindow>
        </div>
        <div v-else data-input-layout-copied :class="classIconBody">
          <Icons
            type="Check"
            stile-icon="solid"
            class="mr-2 text-emerald-400 dark:text-emerald-600"
            :aria-label="InputLayout.t('inputLayout.copied') ?? 'Copied'" />
          <FixWindow :mode="mode" :delay="0" :padding-window="40">
            {{ InputLayout.t("inputLayout.copied") ?? "Copied" }}
          </FixWindow>
        </div>
      </template>
    </span>
    <p
      data-input-layout-message-invalid
      :data-invalid="isInvalid"
      :class="classInvalid"
      :style="`max-width: ${inputBody?.['offsetWidth'] ?? 10}px`"
      aria-live="assertive"
      aria-atomic="true">
      {{ messageInvalid }}
    </p>
  </div>
</template>

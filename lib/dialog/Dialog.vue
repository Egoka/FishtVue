<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
  import { isClient } from "fishtvue/utils/domHandler"
  import { lockBodyScroll, unlockBodyScroll } from "fishtvue/utils/scrollLockHandler"
  import type { Size, StyleClass } from "fishtvue/types"
  import type { DialogClassKey, DialogEmits, DialogProps } from "./Dialog"
  import Button from "fishtvue/button/Button.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"
  import { cn } from "fishtvue/utils/tailwindHandler"
  // ---BASE-COMPONENT----------------------
  const Dialog = new Component<"Dialog">()
  const options = Dialog.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<DialogProps>(), {
    closeButton: undefined,
    animated: undefined,
    margin: undefined,
    closeOnBackdrop: undefined,
    returnFocus: undefined,
    // `TeleportTarget` включает `false`, поэтому Vue видит тут Boolean и скастовал бы
    // отсутствующий prop в `false` — слой `componentsOptions.Dialog.teleport` стал бы недостижим.
    teleport: undefined
  })
  const emit = defineEmits<DialogEmits>()
  const { cls, raw } = Dialog.resolveClasses<DialogClassKey>(props)
  // ---STATE-------------------------------
  const isOpen = ref<boolean>(props.modelValue ?? false)
  const dialogContentRef = ref<HTMLElement | null>(null)
  const triggerEl = ref<HTMLElement | null>(null)
  let escapeListener: ((event: KeyboardEvent) => void) | null = null
  let isLockedByThisInstance = false
  watch(
    () => props.modelValue,
    (value) => (isOpen.value = value),
    { immediate: true }
  )
  const sizes: Record<Size, string> = {
    xs: "sm:max-w-xs",
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    "6xl": "sm:max-w-6xl",
    "7xl": "sm:max-w-7xl"
  }
  // ---PROPS-------------------------------
  const teleport = computed<DialogProps["teleport"]>(() => props.teleport ?? options?.teleport ?? "body")
  const size = computed<string>(() => sizes[props?.size ?? options?.size ?? "2xl"])
  const isCloseButton = computed<NonNullable<DialogProps["closeButton"]>>(
    () => props.closeButton ?? options?.closeButton ?? false
  )
  // Positive-инверсии снятых `notCloseBackground` / `withoutMargin` (dev-patterns §2 F):
  // default перевёрнут в `true`, поэтому отсутствие prop'а = «закрываем по клику» и «отступ есть».
  const isCloseOnBackdrop = computed<NonNullable<DialogProps["closeOnBackdrop"]>>(
    () => props.closeOnBackdrop ?? options?.closeOnBackdrop ?? true
  )
  const isMargin = computed<NonNullable<DialogProps["margin"]>>(() => props.margin ?? options?.margin ?? true)
  const position = computed<NonNullable<DialogProps["position"]>>(() => props.position ?? options?.position ?? "center")
  const ariaLabel = computed<string | undefined>(() => props.ariaLabel ?? options?.ariaLabel ?? undefined)
  const ariaLabelledby = computed<string | undefined>(
    () => props.ariaLabelledby ?? options?.ariaLabelledby ?? undefined
  )
  const ariaDescribedby = computed<string | undefined>(
    () => props.ariaDescribedby ?? options?.ariaDescribedby ?? undefined
  )
  const initialFocus = computed<string | undefined>(() => props.initialFocus ?? options?.initialFocus ?? undefined)
  const returnFocus = computed<boolean>(() => props.returnFocus ?? options?.returnFocus ?? true)
  // aria-label не должен дублировать labelledby — браузеры игнорируют label при наличии labelledby,
  // но пустим только один атрибут чтобы axe-core не жаловался.
  const resolvedAriaLabel = computed<string | undefined>(() => (ariaLabelledby.value ? undefined : ariaLabel.value))
  const enterAndLeaveClass = computed<string>(() => {
    let returnClass
    const isAnimated = props?.animated ?? options?.animated ?? true
    if (isAnimated) {
      if ((position.value as string).includes("left")) {
        returnClass = "-translate-x-full"
      } else if ((position.value as string).includes("right")) {
        returnClass = "translate-x-full"
      } else if ((position.value as string).includes("top")) {
        returnClass = "-translate-y-full"
      } else if ((position.value as string).includes("bottom")) {
        returnClass = "translate-y-full"
      } else returnClass = "translate-x-0 opacity-0"
    } else returnClass = "translate-x-0 opacity-0"
    Dialog.setStyle(returnClass)
    return returnClass
  })
  const classPosition = computed<StyleClass>(() => {
    const arrayDialog: StyleClass = []
    if (position.value === "center") {
      arrayDialog.push("top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2")
    }
    if ((position.value as string).includes("bottom")) {
      arrayDialog.push(`bottom-0 ${!isMargin.value ? "" : "mb-5"}`)
    } else if ((position.value as string).includes("top")) {
      arrayDialog.push(`top-0 ${!isMargin.value ? "" : "mt-5"}`)
    } else {
      arrayDialog.push("top-1/2 -translate-y-1/2")
    }
    if ((position.value as string).includes("right")) {
      arrayDialog.push(`right-0 ${!isMargin.value ? "" : "mr-5"}`)
    } else if ((position.value as string).includes("left")) {
      arrayDialog.push(`left-0 ${!isMargin.value ? "" : "ml-5"}`)
    } else {
      arrayDialog.push("left-1/2 -translate-x-1/2")
    }
    return arrayDialog
  })

  Dialog.setStyle(
    `motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500 translate-x-0 opacity-100`
  )
  Dialog.setStyle(
    `motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-500 opacity-100 opacity-0`
  )
  // Корень — `class`/`classes.root`; карточка — `classes.content` (до 1.0.0 было наоборот:
  // `classBody` адресовал корень, а `class` — карточку). Структурный `absolute` теперь в базе,
  // поэтому классы потребителя идут последними и перебивают его (dev-patterns §2 D).
  const classBase = computed<StyleClass>(() =>
    cls(
      "root",
      "fixed top-0 left-0 right-0 bottom-0 z-[200] w-full overflow-x-hidden overflow-y-auto inset-0 h-screen max-h-full"
    )
  )
  const classBackground = computed<StyleClass>(() => Dialog.setStyle("fixed inset-0"))
  const classBackgroundBase = computed<StyleClass>(() => cls("backdrop", "fixed inset-0 z-[199]"))
  const classBackgroundBaseColor = computed<StyleClass>(() =>
    Dialog.setStyle(
      "fixed inset-0 bg-surface-500/10 dark:bg-surface-900/10 backdrop-blur-[3px] motion-safe:transition-all motion-safe:duration-200"
    )
  )
  const classContent = computed<StyleClass>(() =>
    cls(
      "content",
      "p-6 w-full max-w-xs max-h-full rounded-md bg-white dark:bg-surface-950 absolute",
      size.value ?? "",
      classPosition.value ?? ""
    )
  )
  // Hand-off в корень `Button` закрытия — без setStyle-префикса Dialog.
  const classClose = computed<StyleClass>(() => cn("absolute top-2 end-2 px-[5px] m-1 h-9 w-9", raw("close")))
  // ---FOCUS-TRAP--------------------------
  const FOCUSABLE_SELECTOR = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    'input:not([disabled]):not([type="hidden"])',
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(",")

  function getFocusable(root: HTMLElement | null): HTMLElement[] {
    if (!root) return []
    const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    return nodes.filter((el) => {
      if (el.hasAttribute("disabled")) return false
      if (el.getAttribute("aria-hidden") === "true") return false
      return true
    })
  }

  function focusFirst(): void {
    if (!isClient()) return
    const root = dialogContentRef.value
    if (!root) return
    let target: HTMLElement | null = null
    if (initialFocus.value) {
      target = root.querySelector<HTMLElement>(initialFocus.value)
    }
    if (!target) {
      const focusables = getFocusable(root)
      target = focusables[0] ?? root
    }
    target?.focus()
  }

  function onDialogKeydown(event: KeyboardEvent): void {
    if (event.key !== "Tab") return
    const root = dialogContentRef.value
    if (!root) return
    const focusables = getFocusable(root)
    if (focusables.length === 0) {
      event.preventDefault()
      return
    }
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const active = document.activeElement as HTMLElement | null
    if (event.shiftKey) {
      if (active === first || !root.contains(active)) {
        event.preventDefault()
        last.focus()
      }
    } else {
      if (active === last || !root.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }
  }
  // ---EXPOSE------------------------------
  defineExpose({
    // ---PROPS-------------------------
    teleport,
    isOpen,
    size,
    isCloseButton,
    isCloseOnBackdrop,
    isMargin,
    position,
    classPosition,
    classBase,
    classContent,
    triggerEl,
    dialogContentRef,
    // ---METHODS-----------------------
    closeDialog,
    focusFirst
  })
  // ---UNMOUNT-----------------------------
  onBeforeUnmount(() => {
    if (!isClient()) return
    if (escapeListener) {
      document.removeEventListener("keydown", escapeListener)
      escapeListener = null
    }
    if (isLockedByThisInstance) {
      unlockBodyScroll()
      isLockedByThisInstance = false
    }
  })
  // ---WATCHERS----------------------------
  watch(
    isOpen,
    (value) => {
      if (!isClient()) return
      if (value) {
        // capture trigger перед mount focus
        triggerEl.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
        lockBodyScroll()
        isLockedByThisInstance = true
        escapeListener = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            event.stopPropagation()
            closeDialog()
          }
        }
        document.addEventListener("keydown", escapeListener)
        void nextTick(() => focusFirst())
      } else {
        if (isLockedByThisInstance) {
          unlockBodyScroll()
          isLockedByThisInstance = false
        }
        if (escapeListener) {
          document.removeEventListener("keydown", escapeListener)
          escapeListener = null
        }
        if (returnFocus.value && triggerEl.value && typeof triggerEl.value.focus === "function") {
          const t = triggerEl.value
          void nextTick(() => t.focus())
        }
        triggerEl.value = null
      }
    },
    { immediate: true, flush: "post" }
  )

  // ---METHODS-----------------------------
  function closeDialog(): void {
    isOpen.value = !isOpen.value
    emit("update:modelValue", false)
  }
</script>

<template>
  <Teleport :to="teleport === false ? 'body' : teleport" :disabled="teleport === false">
    <transition
      appear
      leave-active-class="motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500"
      leave-from-class="translate-x-0 opacity-100"
      :leave-to-class="enterAndLeaveClass"
      enter-active-class="motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500"
      :enter-from-class="enterAndLeaveClass"
      enter-to-class="translate-x-0 opacity-100">
      <div
        v-if="isOpen"
        ref="dialogContentRef"
        :class="classBase"
        data-dialog
        role="dialog"
        aria-modal="true"
        :aria-label="resolvedAriaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        tabindex="-1"
        @keydown="onDialogKeydown">
        <div v-if="isCloseOnBackdrop" :class="classBackground" @click="closeDialog" />
        <div data-dialog-content :class="classContent">
          <slot :closeDialog="closeDialog"></slot>
          <Button
            v-if="isCloseButton"
            data-dialog-close
            variant="ghost"
            :class="classClose"
            :aria-label="Dialog.t('dialog.close') ?? 'Close dialog'"
            @click="closeDialog">
            <Icons type="XMark" class="fill-surface-500 dark:fill-surface-500" />
          </Button>
        </div>
        <div data-dialog-live class="sr-only" aria-live="polite" aria-atomic="true"></div>
      </div>
    </transition>
    <transition
      leave-active-class="motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100">
      <div v-if="isOpen" :class="classBackgroundBase" data-dialog-background>
        <slot name="background">
          <div :class="classBackgroundBaseColor" />
        </slot>
      </div>
    </transition>
  </Teleport>
</template>

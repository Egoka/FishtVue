<script setup lang="ts">
  import type { ComponentInternalInstance } from "vue"
  import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue"
  import { XMarkIcon } from "@heroicons/vue/20/solid"
  import { useFloating, type Placement } from "./useFloating"
  import { useClickOutside } from "./useClickOutside"
  import { isClient } from "fishtvue/utils/domHandler"
  import type { FixWindowEmits, FixWindowEvent, FixWindowExpose, FixWindowProps, FixWindowRole } from "./FixWindow"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  // Component.__hooks() авто-регистрирует onServerPrefetch + vueOnMounted → initStyle().
  // Не вызывать FixWindow.initStyle() вручную — будет дубликат (dev-patterns.md §2 row 1).
  const FixWindow = new Component<"FixWindow">()
  const options = FixWindow.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<FixWindowProps>(), {
    byCursor: undefined,
    closeButton: undefined,
    stopOpenPropagation: undefined,
    focusTrap: undefined,
    returnFocus: undefined,
    teleport: undefined
  })
  const emit = defineEmits<FixWindowEmits>()
  // ---REF-LINK----------------------------
  const fixWindow = ref<HTMLElement>()
  const scrollableEl = ref<HTMLElement | Element>()
  // ---STATE-------------------------------
  const instance = ref<ComponentInternalInstance | null>()
  const isOpen = ref<boolean>(false)
  const timer = ref<number | null>(null)
  const countTimer = ref<number>(0)
  const positionMouse = ref<{ x: number; y: number }>()
  const triggerEl = ref<HTMLElement | null>(null)
  const stopClickOutside = ref<(() => void) | null>(null)
  let escapeListener: ((event: KeyboardEvent) => void) | null = null
  // ---PROPS-------------------------------
  const typePosition = computed<NonNullable<FixWindowProps["typePosition"]>>(
    () =>
      (props?.typePosition as FixWindowProps["typePosition"]) ??
      options?.typePosition ??
      (props.scrollableEl ? "absolute" : "fixed")
  )
  const position = computed<NonNullable<FixWindowProps["position"]>>(
    () =>
      (props?.position as FixWindowProps["position"]) ?? options?.position ?? (byCursor.value ? "center-bottom" : "top")
  )
  const delay = computed<NonNullable<FixWindowProps["delay"]>>(() => {
    const delay = (props?.delay as FixWindowProps["delay"]) ?? options?.delay
    return delay && !isNaN(delay) ? delay : 0
  })
  const marginPx = computed<NonNullable<FixWindowProps["marginPx"]>>(
    () => (props?.marginPx as FixWindowProps["marginPx"]) ?? options?.marginPx ?? 10
  )
  const translatePx = computed<NonNullable<FixWindowProps["translatePx"]>>(
    () => (props?.translatePx as FixWindowProps["translatePx"]) ?? options?.translatePx ?? 0
  )
  const eventOpen = computed<FixWindowEvent>(
    () => (props?.eventOpen as FixWindowEvent) ?? options?.eventOpen ?? "hover"
  )
  const eventClose = computed<FixWindowEvent>(
    () => (props?.eventClose as FixWindowEvent) ?? defaultCloseEvent(eventOpen.value) ?? options?.eventClose ?? "hover"
  )
  const paddingWindow = computed<NonNullable<FixWindowProps["paddingWindow"]>>(
    () => (props.paddingWindow as FixWindowProps["paddingWindow"]) ?? options?.paddingWindow ?? 0
  )
  const byCursor = computed<NonNullable<FixWindowProps["byCursor"]>>(() => props.byCursor ?? options?.byCursor ?? false)
  const isStopOpenPropagation = computed<FixWindowProps["stopOpenPropagation"]>(
    () => props.stopOpenPropagation ?? false
  )
  const isCloseButton = computed<FixWindowProps["closeButton"]>(
    () => props.closeButton ?? options?.closeButton ?? false
  )
  const teleport = computed<FixWindowProps["teleport"]>(() => props.teleport ?? options?.teleport ?? false)
  const focusTrap = computed<boolean>(() => props.focusTrap ?? options?.focusTrap ?? false)
  const role = computed<FixWindowRole>(() => {
    const r = (props.role as FixWindowRole) ?? options?.role
    if (r) return r
    return eventOpen.value === "hover" ? "tooltip" : "dialog"
  })
  const ariaLabel = computed<string | undefined>(() => props.ariaLabel ?? options?.ariaLabel ?? undefined)
  const ariaLabelledby = computed<string | undefined>(
    () => props.ariaLabelledby ?? options?.ariaLabelledby ?? undefined
  )
  const ariaDescribedby = computed<string | undefined>(
    () => props.ariaDescribedby ?? options?.ariaDescribedby ?? undefined
  )
  // aria-label не должен дублировать labelledby — браузеры игнорируют label при наличии labelledby.
  const resolvedAriaLabel = computed<string | undefined>(() => (ariaLabelledby.value ? undefined : ariaLabel.value))
  const initialFocus = computed<string | undefined>(() => props.initialFocus ?? options?.initialFocus ?? undefined)
  const returnFocus = computed<boolean>(() => props.returnFocus ?? options?.returnFocus ?? true)
  const element = computed<HTMLElement>(() => {
    if (props.el) {
      if (isClient() && typeof props.el === "string") {
        return document.querySelector(props.el)
      } else {
        return props.el
      }
    } else {
      return instance.value?.vnode?.el?.parentElement
    }
  })
  const border = computed<string>(() => {
    if (marginPx.value > 0) {
      if ((position.value as string).match("^(left|right)")) {
        return `border-left: ${marginPx.value}px solid transparent;border-right: ${marginPx.value}px solid transparent;`
      } else if ((position.value as string).match("^(top|bottom)")) {
        return `border-top: ${marginPx.value}px solid transparent;border-bottom: ${marginPx.value}px solid transparent;`
      }
    }
    return ""
  })
  const mode = computed<string>(() => {
    const baseStyle =
      "flex items-center px-1 border border-neutral-200 dark:border-neutral-900 text-black text-zinc-600 dark:text-zinc-400"
    const mode = props.mode ?? options?.mode ?? FixWindow.componentsStyle()
    switch (mode) {
      case "filled":
        return `${baseStyle} bg-stone-100 dark:bg-stone-900 rounded-md`
      case "outlined":
        return `${baseStyle} bg-white dark:bg-neutral-950 rounded-md`
      case "underlined":
        return `${baseStyle} bg-stone-50 dark:bg-stone-950`
      default:
        return ""
    }
  })
  FixWindow.setStyle(
    `motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-300 opacity-100 opacity-0`
  )
  const classBase = computed(() => {
    const classes = `text-neutral-800 dark:text-neutral-300 text-sm z-5`
    return FixWindow.setStyle([classes, options?.classBody ?? "", props?.classBody ?? "", typePosition.value])
  })
  const classContent = computed(() => FixWindow.setStyle([mode.value ?? "", options?.class ?? "", props?.class ?? ""]))
  // ---FLOATING-UI-------------------------
  // Mapping FishtVue Position → Floating UI Placement.
  // Floating UI's logical `start`/`end` обеспечивает корректное RTL-зеркалирование
  // автоматически на documents с `dir="rtl"`.
  function positionToPlacement(p: FixWindowProps["position"]): Placement {
    switch (p) {
      case "top":
      case "center-top":
        return "top"
      case "bottom":
      case "center-bottom":
        return "bottom"
      case "left":
      case "center-left":
        return "left"
      case "right":
      case "center-right":
        return "right"
      case "top-left":
        return "top-start"
      case "top-right":
        return "top-end"
      case "bottom-left":
        return "bottom-start"
      case "bottom-right":
        return "bottom-end"
      case "left-top":
        return "left-start"
      case "left-bottom":
        return "left-end"
      case "right-top":
        return "right-start"
      case "right-bottom":
        return "right-end"
      case "center":
      default:
        return "top"
    }
  }
  // Virtual reference для byCursor (Floating UI virtual element).
  const virtualReferenceEl = computed(() => {
    if (byCursor.value && positionMouse.value) {
      const px = positionMouse.value.x
      const py = positionMouse.value.y
      return {
        getBoundingClientRect: () => ({
          x: px,
          y: py,
          top: py,
          left: px,
          right: px,
          bottom: py,
          width: 0,
          height: 0,
          toJSON: () => ({})
        })
      } as any
    }
    return null
  })
  const referenceRef = computed(() => virtualReferenceEl.value ?? element.value ?? null)
  const placement = computed<Placement>(() => positionToPlacement(position.value))
  const strategy = computed<"absolute" | "fixed">(() => (typePosition.value === "absolute" ? "absolute" : "fixed"))
  // Собственный движок (lib/fixwindow/useFloating.ts) — без рантайм-зависимостей.
  // offset = translatePx ТОЛЬКО: marginPx выражается прозрачным `border` (см. computed
  // `border`) — это и зазор, и hover-bridge (border-box-кромка окна вплотную к триггеру,
  // курсор не выходит в пустоту при переходе trigger → window); иначе marginPx учитывался
  // бы дважды (двойной зазор + dead-zone). flip/shift/autoUpdate — паритет с прежним Floating UI.
  const {
    x: floatX,
    y: floatY,
    update: updateFloating
  } = useFloating(referenceRef, fixWindow, {
    placement,
    strategy,
    offset: translatePx,
    padding: paddingWindow,
    scrollableEl,
    open: isOpen
  })
  // Backward-compat expose: x / y как CSS строки. Math.floor для стабильности
  // существующих тестов; "auto" пока popover не открыт.
  const x = computed<string>(() => (isOpen.value && floatX.value != null ? `${Math.floor(floatX.value)}px` : "auto"))
  const y = computed<string>(() => (isOpen.value && floatY.value != null ? `${Math.floor(floatY.value)}px` : "auto"))
  // ---FOCUS-TRAP (native, mirror Dialog) ---
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
    const root = fixWindow.value
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

  function onPopoverKeydown(event: KeyboardEvent): void {
    if (!focusTrap.value) return
    if (event.key !== "Tab") return
    const root = fixWindow.value
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
  // defineExpose без generic — Vue auto-unwrap'ит refs при template / template-ref usage.
  // Public surface совпадает с FixWindowExpose; дополнительные internal-поля экспозированы
  // для регрессионных тестов (fixWindow, scrollableEl и т.д.).
  defineExpose({
    // ---STATE-------------------------
    x,
    y,
    isOpen,
    // ---PROPS-------------------------
    position,
    delay,
    marginPx,
    isCloseButton,
    eventOpen,
    eventClose,
    element,
    triggerEl,
    // ---INTERNAL (backward-compat — tests inspect these) ---
    fixWindow,
    scrollableEl,
    byCursor,
    isStopOpenPropagation,
    role,
    teleport,
    focusTrap,
    classBase,
    classContent,
    // ---METHODS-----------------------
    open,
    close,
    updatePosition,
    focusFirst
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    instance.value = getCurrentInstance()
    if (element.value) {
      updatePosition()
      addOpenListener()
      addCloseListener()
    }
  })
  onBeforeUnmount(() => {
    removeOpenListener()
    removeCloseListener()
    teardownClickOutside()
    teardownEscapeListener()
    if (timer.value !== null) {
      clearInterval(timer.value)
      timer.value = null
    }
  })
  // ---WATCHERS----------------------------
  watch(
    () => props.scrollableEl as FixWindowProps["scrollableEl"],
    (value) => {
      if (isClient() && value) {
        if (typeof value === "string") {
          const el = document.querySelector(value)
          if (el) scrollableEl.value = el
        } else if (value instanceof HTMLElement) {
          scrollableEl.value = value
        } else scrollableEl.value = undefined
      } else scrollableEl.value = undefined
    },
    { immediate: true }
  )
  watch(
    () => props.modelValue,
    (value) => {
      value ? isOpen.value || open() : close()
    },
    { immediate: true }
  )
  watch(
    isOpen,
    (value: boolean) => {
      if (value) {
        // capture trigger перед focus (для focus return)
        if (focusTrap.value && isClient()) {
          triggerEl.value = document.activeElement instanceof HTMLElement ? document.activeElement : null
        }
        nextTick(() => {
          removeOpenListener()
          addCloseListener()
          setupClickOutside()
          setupEscapeListener()
          updatePosition()
          if (byCursor.value) addDisableScrolling()
          if (focusTrap.value) focusFirst()
        })
      } else {
        const trigger = triggerEl.value
        nextTick(() => {
          addOpenListener()
          removeCloseListener()
          teardownClickOutside()
          teardownEscapeListener()
          if (byCursor.value) removeDisableScrolling()
        })
        if (focusTrap.value && returnFocus.value && trigger && typeof trigger.focus === "function") {
          void nextTick(() => trigger.focus())
        }
        triggerEl.value = null
      }
      emit("update:modelValue", value)
    },
    { immediate: true }
  )
  watch(eventOpen, (value, oldValue) => {
    if (oldValue) removeOpenListener(oldValue)
    addOpenListener()
  })
  watch(eventClose, (value, oldValue) => {
    if (oldValue) removeCloseListener(oldValue)
    addCloseListener()
  })
  watch(position, () => updatePosition())

  // ---SET-LISTENER--------------------------
  function addOpenListener(event?: FixWindowEvent) {
    if (!(isClient() && element.value && element.value instanceof HTMLElement && "addEventListener" in element.value))
      return
    switch (event ?? eventOpen.value) {
      case "hover":
        element.value?.addEventListener("mouseover", open)
        // Touch fallback — на touch devices "hover" не firing, используем touchstart.
        element.value?.addEventListener("touchstart", open as any, { passive: true })
        break
      case "click":
        element.value?.addEventListener("click", open)
        break
      case "mousedown":
        element.value?.addEventListener("mousedown", open)
        break
      case "mouseup":
        element.value?.addEventListener("mouseup", open)
        break
      case "dblclick":
        element.value?.addEventListener("dblclick", open)
        break
      case "contextmenu":
        element.value?.addEventListener("contextmenu", openOnContextMenu)
        break
    }
  }

  function removeOpenListener(event?: FixWindowEvent) {
    if (
      !(isClient() && element.value && element.value instanceof HTMLElement && "removeEventListener" in element.value)
    )
      return
    switch (event ?? eventOpen.value) {
      case "hover":
        // Порядок важен — последний remove call попадает в `lastCall`
        // регрессионных тестов; mouseover должен быть последним.
        element.value?.removeEventListener("touchstart", open as any)
        element.value?.removeEventListener("mouseover", open)
        break
      case "click":
        element.value?.removeEventListener("click", open)
        break
      case "mousedown":
        element.value?.removeEventListener("mousedown", open)
        break
      case "mouseup":
        element.value?.removeEventListener("mouseup", open)
        break
      case "dblclick":
        element.value?.removeEventListener("dblclick", open)
        break
      case "contextmenu":
        element.value?.removeEventListener("contextmenu", openOnContextMenu)
        break
    }
  }

  function addCloseListener(event?: FixWindowEvent) {
    if (!isClient()) return
    switch (event ?? eventClose.value) {
      case "hover": {
        const el = byCursor.value ? (fixWindow.value as HTMLElement) : element.value
        el?.addEventListener("mouseleave", close)
        break
      }
      case "mouseup":
        if (eventOpen.value === "mousedown") {
          const el = byCursor.value ? (fixWindow.value as HTMLElement) : element.value
          el?.addEventListener("mouseup", close)
        }
        break
      // click / mousedown / mouseup (else) / dblclick / contextmenu → click-outside via setupClickOutside()
      // setupClickOutside() уже подписан в watch(isOpen) — Teleport-aware.
    }
  }

  function removeCloseListener(event?: FixWindowEvent) {
    if (!isClient()) return
    switch (event ?? eventClose.value) {
      case "hover": {
        const el = byCursor.value ? (fixWindow.value as HTMLElement) : element.value
        el?.removeEventListener("mouseleave", close)
        break
      }
      case "mouseup":
        if (eventOpen.value === "mousedown") {
          const el = byCursor.value ? (fixWindow.value as HTMLElement) : element.value
          el?.removeEventListener("mouseup", close)
        }
        break
    }
  }
  // ---CLICK-OUTSIDE (Teleport-aware) ---
  function setupClickOutside() {
    if (!isClient()) return
    teardownClickOutside()
    const e = eventClose.value
    if (e === "click" || e === "mousedown" || e === "mouseup" || e === "dblclick" || e === "contextmenu") {
      const ignore = element.value ? [element] : []
      // Слушаем именно `eventClose`-событие (как у прежнего onClickOutside по факту):
      // outside-`click` закрывает при eventClose="click", outside-`mousedown` — при "mousedown" и т.д.
      stopClickOutside.value = useClickOutside(
        fixWindow,
        (event) => {
          close(event as MouseEvent)
        },
        { ignore, events: [e] }
      )
    }
  }
  function teardownClickOutside() {
    if (stopClickOutside.value) {
      stopClickOutside.value()
      stopClickOutside.value = null
    }
  }
  // ---ESCAPE (close on Escape когда focusTrap или eventClose != "none") ---
  function setupEscapeListener() {
    if (!isClient()) return
    teardownEscapeListener()
    if (eventClose.value === "none" && !focusTrap.value) return
    escapeListener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        close(event as any)
      }
    }
    document.addEventListener("keydown", escapeListener)
  }
  function teardownEscapeListener() {
    if (!isClient()) return
    if (escapeListener) {
      document.removeEventListener("keydown", escapeListener)
      escapeListener = null
    }
  }
  // ---DISABLE-SCROLLING (byCursor mode) ---
  const originalScrollState = {
    scrollY: 0,
    wheelEventHandler: null as ((e: WheelEvent) => void) | null,
    touchmoveEventHandler: null as ((e: TouchEvent) => void) | null,
    keydownEventHandler: null as ((e: KeyboardEvent) => void) | null
  }

  function addDisableScrolling() {
    if (!isClient() || !byCursor.value) return
    originalScrollState.scrollY = window.scrollY
    originalScrollState.wheelEventHandler = (e: WheelEvent) => {
      e.preventDefault()
      return false
    }
    originalScrollState.touchmoveEventHandler = (e: TouchEvent) => {
      if (e.target !== fixWindow.value && !fixWindow.value?.contains(e.target as Node)) {
        e.preventDefault()
      }
    }
    originalScrollState.keydownEventHandler = (e: KeyboardEvent) => {
      if (["Space", "PageUp", "PageDown", "End", "Home", "ArrowUp", "ArrowDown"].includes(e.code)) {
        if (e.target !== fixWindow.value && !fixWindow.value?.contains(e.target as Node)) {
          e.preventDefault()
          return false
        }
      }
    }
    window.addEventListener("wheel", originalScrollState.wheelEventHandler, { passive: false })
    window.addEventListener("touchmove", originalScrollState.touchmoveEventHandler, { passive: false })
    window.addEventListener("keydown", originalScrollState.keydownEventHandler)
  }

  function removeDisableScrolling() {
    if (!isClient() || !byCursor.value) return
    if (originalScrollState.wheelEventHandler) {
      window.removeEventListener("wheel", originalScrollState.wheelEventHandler)
      originalScrollState.wheelEventHandler = null
    }
    if (originalScrollState.touchmoveEventHandler) {
      window.removeEventListener("touchmove", originalScrollState.touchmoveEventHandler)
      originalScrollState.touchmoveEventHandler = null
    }
    if (originalScrollState.keydownEventHandler) {
      window.removeEventListener("keydown", originalScrollState.keydownEventHandler)
      originalScrollState.keydownEventHandler = null
    }
    window.scrollTo(0, originalScrollState.scrollY)
  }
  // ---OPEN-CLOSE--------------------------
  function open(event?: MouseEvent) {
    if (isStopOpenPropagation.value) event?.stopImmediatePropagation()
    if (byCursor.value && event)
      positionMouse.value = { x: (event as MouseEvent).x as number, y: (event as MouseEvent).y as number }

    function setIsOpen() {
      isOpen.value = true
      emit("open", event)
    }

    if (delay.value === 0) return setIsOpen()
    if (timer.value === null) {
      addCloseListener()
      timer.value = setInterval(() => {
        if (countTimer.value === delay.value / 10) {
          if (timer.value !== null) clearInterval(timer.value)
          timer.value = null
          setIsOpen()
        } else {
          countTimer.value++
        }
      }, 1) as unknown as number
    }
  }

  function close(event?: MouseEvent) {
    if (timer.value !== null) {
      clearInterval(timer.value)
      timer.value = null
    }
    countTimer.value = 0
    isOpen.value = false
    emit("close", event)
  }

  // ---METHODS-----------------------------
  function openOnContextMenu(event: MouseEvent) {
    event.preventDefault()
    open(event)
  }

  function defaultCloseEvent(event: FixWindowEvent): FixWindowEvent {
    switch (event) {
      case "hover":
        return "hover"
      case "click":
        return "click"
      case "mousedown":
        return "mouseup"
      case "mouseup":
        return "mouseup"
      case "dblclick":
        return "click"
      case "contextmenu":
        return "click"
      default:
        return "click"
    }
  }

  function onCloseButton(event: MouseEvent) {
    event.stopPropagation()
    isOpen.value = false
  }

  // ---UPDATE-POSITION---------------------
  function updatePosition() {
    // Floating UI пересчитывает позицию при изменении reference / floating / placement
    // через autoUpdate; здесь — императивный trigger для backward-compat API.
    void updateFloating()
  }
</script>

<template>
  <Teleport :to="teleport === false ? 'body' : teleport" :disabled="teleport === false">
    <transition
      leave-active-class="motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100">
      <div
        v-show="isOpen"
        data-fix-window
        ref="fixWindow"
        :class="classBase"
        :style="`left: ${x}; top: ${y};${border};`"
        :role="role"
        :aria-label="resolvedAriaLabel"
        :aria-labelledby="ariaLabelledby"
        :aria-describedby="ariaDescribedby"
        :tabindex="focusTrap ? -1 : undefined"
        @keydown="onPopoverKeydown">
        <div data-fix-window-content :class="classContent">
          <slot />
        </div>
        <Button
          v-if="isCloseButton"
          mode="ghost"
          class="absolute top-2 end-2 px-[5px] m-0.5 h-9 w-9"
          :aria-label="FixWindow.t('fixwindow.close') ?? 'Close'"
          @click="onCloseButton">
          <XMarkIcon aria-hidden="true" class="h-5 w-5 fill-neutral-500 dark:fill-neutral-500" />
        </Button>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
  import type { ComponentInternalInstance } from "vue"
  import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
  import { XMarkIcon } from "@heroicons/vue/20/solid"
  import { isClient } from "fishtvue/utils/domHandler"
  import type { FixWindowEmits, FixWindowEvent, FixWindowExpose, FixWindowProps } from "./FixWindow"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const FixWindow = new Component<"FixWindow">()
  const options = FixWindow.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<FixWindowProps>(), {
    byCursor: undefined,
    closeButton: undefined,
    stopOpenPropagation: undefined
  })
  const emit = defineEmits<FixWindowEmits>()
  // ---REF-LINK----------------------------
  const fixWindow = ref<HTMLElement>()
  const scrollableEl = ref<HTMLElement | Element>()
  // ---STATE-------------------------------
  const instance = ref<ComponentInternalInstance | null>()
  const x = ref<string>("auto")
  const y = ref<string>("auto")
  const xT = ref<number>(0)
  const yT = ref<number>(0)
  const isOpen = ref<boolean>(false)
  const timer = ref<number | null>(null)
  const countTimer = ref<number>(0)
  const positionMouse = ref<{ x: number; y: number }>()
  // ---PROPS-------------------------------
  const typePosition = computed<NonNullable<FixWindowProps["typePosition"]>>(
    () => props?.typePosition ?? options?.typePosition ?? (props.scrollableEl ? "absolute" : "fixed")
  )
  const position = computed<NonNullable<FixWindowProps["position"]>>(
    () => props?.position ?? options?.position ?? (byCursor.value ? "center-bottom" : "top")
  )
  const delay = computed<NonNullable<FixWindowProps["delay"]>>(() => {
    const delay = props?.delay ?? options?.delay
    return delay && !isNaN(delay) ? delay : 0
  })
  const marginPx = computed<NonNullable<FixWindowProps["marginPx"]>>(() => props.marginPx ?? options?.marginPx ?? 10)
  const translatePx = computed<NonNullable<FixWindowProps["translatePx"]>>(
    () => props.translatePx ?? options?.translatePx ?? 0
  )
  const eventOpen = computed<FixWindowEvent>(() => props.eventOpen ?? options?.eventOpen ?? "hover")
  const eventClose = computed<FixWindowEvent>(
    () => props.eventClose ?? defaultCloseEvent(eventOpen.value) ?? options?.eventClose ?? "hover"
  )
  const paddingWindow = computed<NonNullable<FixWindowProps["paddingWindow"]>>(
    () => props.paddingWindow ?? options?.paddingWindow ?? 0
  )
  const byCursor = computed<NonNullable<FixWindowProps["byCursor"]>>(() => props.byCursor ?? options?.byCursor ?? false)
  const isStopOpenPropagation = computed<FixWindowProps["stopOpenPropagation"]>(
    () => props.stopOpenPropagation ?? false
  )
  const isCloseButton = computed<FixWindowProps["closeButton"]>(
    () => props.closeButton ?? options?.closeButton ?? false
  )
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
      if (position.value.match("^(left|right)")) {
        return `border-left: ${marginPx.value}px solid transparent;border-right: ${marginPx.value}px solid transparent;`
      } else if (position.value.match("^(top|bottom)")) {
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
  FixWindow.setStyle(`transition-opacity ease-in-out duration-300 opacity-100 opacity-0`)
  const classBase = computed(() => {
    const classes = `text-neutral-800 dark:text-neutral-300 text-sm z-5`
    return FixWindow.setStyle([classes, options?.classBody ?? "", props?.classBody ?? "", typePosition.value], {
      isBaseClasses: true
    })
  })
  const classContent = computed(() => FixWindow.setStyle([mode.value ?? "", options?.class ?? "", props?.class ?? ""]))
  // ---EXPOSE------------------------------
  defineExpose<FixWindowExpose>({
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
    // ---METHODS-----------------------
    open,
    close,
    updatePosition
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    FixWindow.initStyle()
    instance.value = getCurrentInstance()
    if (element.value) {
      updatePosition()
      addOpenListener()
      addCloseListener()
      addPositionListener()
    }
  })
  onUnmounted(() => {
    removeOpenListener()
    removeCloseListener()
    removePositionListener()
  })
  // ---WATCHERS----------------------------
  watch(
    () => props.scrollableEl as FixWindowProps["scrollableEl"],
    (value) => {
      if (isClient() && value) {
        if (typeof value === "string") {
          const el = document.querySelector(value)
          if (el) scrollableEl.value = el
          addPositionListener()
        } else if (value instanceof HTMLElement) {
          scrollableEl.value = value
          addPositionListener()
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
        nextTick(() => {
          removeOpenListener()
          addCloseListener()
          updatePosition()
          if (byCursor.value) addDisableScrolling()
        })
      } else {
        nextTick(() => {
          addOpenListener()
          removeCloseListener()
          if (byCursor.value) removeDisableScrolling()
        })
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
    if (isClient())
      switch (event ?? eventClose.value) {
        case "hover": {
          const el = byCursor.value ? (fixWindow.value as HTMLElement) : element.value
          el?.addEventListener("mouseleave", close)
          break
        }
        case "click":
          window?.addEventListener("click", closeOnClick)
          break
        case "mousedown":
          window?.addEventListener("mousedown", closeOnClick)
          break
        case "mouseup":
          if (eventOpen.value === "mousedown") {
            const el = byCursor.value ? (fixWindow.value as HTMLElement) : element.value
            el?.addEventListener("mouseup", close)
            window?.addEventListener("mouseup", closeOnClick)
          } else window?.addEventListener("mouseup", closeOnClick)
          break
        case "dblclick":
          window?.addEventListener("dblclick", closeOnClick)
          break
        case "contextmenu":
          window?.addEventListener("contextmenu", closeOnClick)
          break
      }
  }

  function removeCloseListener(event?: FixWindowEvent) {
    if (isClient())
      switch (event ?? eventClose.value) {
        case "hover":
          const el = byCursor.value ? (fixWindow.value as HTMLElement) : element.value
          el?.removeEventListener("mouseleave", close)
          break
        case "click":
          window?.removeEventListener("click", closeOnClick)
          break
        case "mousedown":
          window?.removeEventListener("mousedown", closeOnClick)
          break
        case "mouseup":
          if (eventOpen.value === "mousedown") {
            const el = byCursor.value ? (fixWindow.value as HTMLElement) : element.value
            el?.removeEventListener("mouseup", close)
            window?.removeEventListener("mouseup", closeOnClick)
          } else window?.removeEventListener("mouseup", closeOnClick)
          break
        case "dblclick":
          window?.removeEventListener("dblclick", closeOnClick)
          break
        case "contextmenu":
          window?.removeEventListener("contextmenu", closeOnClick)
          break
      }
  }

  function addPositionListener() {
    if (!isClient()) return
    if (scrollableEl.value) (scrollableEl.value as HTMLElement).addEventListener("scroll", updatePosition)
    window.addEventListener("scroll", updatePosition)
    if (scrollableEl.value) (scrollableEl.value as HTMLElement).addEventListener("resize", updatePosition)
    window.addEventListener("resize", updatePosition)
  }

  function removePositionListener() {
    if (!isClient()) return
    if (scrollableEl.value) (scrollableEl.value as HTMLElement).removeEventListener("scroll", updatePosition)
    window.removeEventListener("scroll", updatePosition)
    if (scrollableEl.value) (scrollableEl.value as HTMLElement).removeEventListener("resize", updatePosition)
    window.removeEventListener("resize", updatePosition)
  }

  // Сохраняем исходные обработчики событий и состояние скролла
  const originalScrollState = {
    scrollY: 0,
    wheelEventHandler: null as ((e: WheelEvent) => void) | null,
    touchmoveEventHandler: null as ((e: TouchEvent) => void) | null,
    keydownEventHandler: null as ((e: KeyboardEvent) => void) | null
  }

  function addDisableScrolling() {
    if (!isClient() || !byCursor.value) return

    // Сохраняем текущую позицию скролла
    originalScrollState.scrollY = window.scrollY

    // Предотвращаем скролл через колесо мыши
    originalScrollState.wheelEventHandler = (e: WheelEvent) => {
      e.preventDefault()
      return false
    }

    // Предотвращаем скролл через тач-события
    originalScrollState.touchmoveEventHandler = (e: TouchEvent) => {
      if (e.target !== fixWindow.value && !fixWindow.value?.contains(e.target as Node)) {
        e.preventDefault()
      }
    }

    // Предотвращаем скролл через клавиатуру
    originalScrollState.keydownEventHandler = (e: KeyboardEvent) => {
      // Блокируем клавиши, которые могут вызвать скролл
      if (["Space", "PageUp", "PageDown", "End", "Home", "ArrowUp", "ArrowDown"].includes(e.code)) {
        if (e.target !== fixWindow.value && !fixWindow.value?.contains(e.target as Node)) {
          e.preventDefault()
          return false
        }
      }
    }

    // Добавляем обработчики с опцией passive: false для возможности вызова preventDefault()
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
    if (byCursor.value) positionMouse.value = { x: event?.x as number, y: event?.y as number }

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

  function closeOnClick(event: MouseEvent) {
    if (!event.composedPath().includes(element.value as HTMLElement)) {
      close(event)
    }
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
    if (isOpen.value) {
      if (typePosition.value === "absolute") getPositionAbsolute()
      if (typePosition.value === "fixed") getPositionFixed()

      function getPositionFixed() {
        const body = element.value?.getBoundingClientRect()
        const child = fixWindow.value?.getBoundingClientRect()
        if (body && child) {
          const el = <
            {
              xCenter: number
              yCenter: number
              xTranslate: number
              yTranslate: number
              xValue: number
              yValue: number
              xPositionIndex: 0 | 1 | -1
              yPositionIndex: 0 | 1 | -1
            }
          >{}
          if (
            byCursor.value &&
            typeof positionMouse.value?.x === "number" &&
            typeof positionMouse.value?.y === "number"
          ) {
            body.x = positionMouse.value?.x as number
            body.y = positionMouse.value?.y as number
            body.width = 10
            body.height = 10
          }
          el.xCenter = body.x + (body.width - child.width) / 2
          el.yCenter = body.y + (body.height - child.height) / 2

          el.xTranslate = body.width / 2 + child.width / 2
          el.yTranslate = body.height / 2 + child.height / 2

          el.xPositionIndex = position.value.match("^left") ? -1 : position.value.match("^right") ? 1 : 0
          el.yPositionIndex = position.value.match("^top") ? -1 : position.value.match("^bottom") ? 1 : 0

          el.xValue = position.value.match("-left$")
            ? body.x
            : position.value.match("-right$")
              ? body.x + body.width - child.width
              : 0
          el.yValue = position.value.match("-top$")
            ? body.y
            : position.value.match("-bottom$")
              ? body.y + body.height - child.height
              : 0
          //
          let xNum =
            Math.floor(
              el.xPositionIndex !== 0 || el.xValue === 0 ? el.xCenter + el.xTranslate * el.xPositionIndex : el.xValue
            ) +
            el.xPositionIndex * translatePx.value
          let yNum =
            Math.floor(
              el.yPositionIndex !== 0 || el.yValue === 0 ? el.yCenter + el.yTranslate * el.yPositionIndex : el.yValue
            ) +
            el.yPositionIndex * translatePx.value
          // Обработка границ окна
          if (isClient()) {
            const viewportPadding = paddingWindow.value
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight
            const isCenter = position.value.match("^center")
            // Корректировка по X
            if (typePosition.value === "fixed") {
              if (xNum < viewportPadding) {
                xNum = isCenter ? body.x + body.width / 2 : body.x + body.width
              } else if (xNum + child.width > viewportWidth - viewportPadding) {
                xNum = isCenter ? body.x : body.x - child.width
              }
            }

            // Корректировка по Y
            if (typePosition.value === "fixed") {
              if (yNum < viewportPadding) {
                yNum = isCenter ? body.y + body.height / 2 : body.y + body.height
              } else if (yNum + child.height > viewportHeight - viewportPadding) {
                yNum = isCenter ? body.y : body.y - child.height
              }
            }
          }
          x.value = `${xNum}px`
          y.value = `${yNum}px`
          xT.value = 0
          yT.value = 0
        }
      }

      function getPositionAbsolute() {
        const body = element.value?.getBoundingClientRect()
        const child = fixWindow.value?.getBoundingClientRect()
        if (body && child) {
          const el = <
            {
              xCenter: number
              yCenter: number
              xTranslate: number
              yTranslate: number
              xValue: number
              yValue: number
              xPositionIndex: 0 | 1 | -1
              yPositionIndex: 0 | 1 | -1
            }
          >{}
          el.xCenter = body.width / 2 - child.width / 2 - (child.x - xT.value - body.x)
          el.yCenter = body.height / 2 - child.height / 2 - (child.y - yT.value - body.y)
          if (
            byCursor.value &&
            typeof positionMouse.value?.x === "number" &&
            typeof positionMouse.value?.y === "number"
          ) {
            el.xCenter = positionMouse.value?.x - (body.x + body.width / 2)
            el.yCenter = positionMouse.value?.y - (body.y + body.height / 2)
            body.width = 10
            body.height = 10
          }

          el.xTranslate = body.width / 2 + child.width / 2
          el.yTranslate = body.height / 2 + child.height / 2

          el.xPositionIndex = position.value.match("^left") ? -1 : position.value.match("^right") ? 1 : 0
          el.yPositionIndex = position.value.match("^top") ? -1 : position.value.match("^bottom") ? 1 : 0

          el.xValue = position.value.match("-left$")
            ? -(body.width / 2 - child.width / 2)
            : position.value.match("-right$")
              ? body.width / 2 - child.width / 2
              : 0
          el.yValue = position.value.match("-top$")
            ? -(body.height / 2 - child.height / 2)
            : position.value.match("-bottom$")
              ? body.height / 2 - child.height / 2
              : 0

          let xNum =
            Math.floor(
              el.xPositionIndex !== 0 || el.xValue === 0
                ? el.xCenter + el.xTranslate * el.xPositionIndex
                : el.xCenter + el.xValue
            ) +
            el.xPositionIndex * translatePx.value
          let yNum =
            Math.floor(
              el.yPositionIndex !== 0 || el.yValue === 0
                ? el.yCenter + el.yTranslate * el.yPositionIndex
                : el.yCenter + el.yValue
            ) +
            el.yPositionIndex * translatePx.value

          if (isClient() && !byCursor.value) {
            const viewportPadding = paddingWindow.value
            const viewportWidth = window.innerWidth - viewportPadding
            const viewportHeight = window.innerHeight - viewportPadding
            const isCenter = position.value.match("^center")
            // Корректировка по X
            const bodyCenterX = body.x + body.width / 2
            if (bodyCenterX + (xNum - child.width / 2) < viewportPadding) {
              xNum = isCenter ? child.width / 2 : body.width / 2 + child.width / 2
            } else if (bodyCenterX + xNum + child.width > viewportWidth) {
              xNum = isCenter ? -(child.width / 2) : -(body.width / 2 + child.width / 2)
            }

            // Корректировка по Y
            const bodyCenterY = body.y + body.height / 2
            if (bodyCenterY + (yNum - child.height / 2) < viewportPadding) {
              yNum = isCenter ? child.height / 2 : body.height / 2 + child.height / 2
            } else if (bodyCenterY + yNum + child.height / 2 > viewportHeight) {
              yNum = isCenter ? -(child.height / 2) : -(body.height / 2 + child.height / 2)
            }
          }

          x.value = `auto`
          y.value = `auto`
          xT.value = xNum
          yT.value = yNum
        }
      }
    }
  }
</script>

<template>
  <transition
    leave-active-class="transition-opacity ease-in-out duration-300"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
    enter-active-class="transition-opacity ease-in-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100">
    <div
      v-show="isOpen"
      data-fix-window
      ref="fixWindow"
      :class="classBase"
      :style="`left: ${x}; top: ${y};${border};translate: ${xT ?? 0}px ${yT ?? 0}px;`">
      <div data-fix-window-content :class="classContent">
        <slot />
      </div>
      <Button
        v-if="isCloseButton"
        mode="ghost"
        class="absolute top-2 right-2 px-[5px] m-0.5 h-9 w-9"
        @click="onCloseButton">
        <XMarkIcon aria-hidden="true" class="h-5 w-5 fill-neutral-500 dark:fill-neutral-500" />
      </Button>
    </div>
  </transition>
</template>

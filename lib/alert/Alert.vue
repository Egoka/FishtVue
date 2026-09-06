<script setup lang="ts">
  import { computed, onMounted, ref, useSlots, watch } from "vue"
  import type { AlertEmits, AlertProps } from "./Alert"
  import {
    ChatBubbleOvalLeftIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon
  } from "@heroicons/vue/20/solid"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  import { StyleClass } from "fishtvue/types"
  import { sanitizeHtml } from "./sanitizeHtml"
  // ---BASE-COMPONENT----------------------
  const Alert = new Component<"Alert">()
  const options = Alert.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<AlertProps>(), {
    notAnimate: undefined,
    closeButton: undefined
  })
  const emit = defineEmits<AlertEmits>()
  const slots = useSlots()
  // ---STATE-------------------------------
  const isVisible = ref<boolean>(props.modelValue)
  // ---PROPS-------------------------------
  const type = computed<NonNullable<AlertProps["type"]>>(() => props.type ?? options?.type ?? "success")
  const title = computed<NonNullable<AlertProps["title"]>>(() => props.title ?? "")
  const subtitle = computed<NonNullable<AlertProps["subtitle"]>>(() => props.subtitle ?? "")
  const displayTime = computed<number>(() => +(props.displayTime ?? options?.displayTime ?? 0))
  const notAnimate = computed<NonNullable<AlertProps["notAnimate"]>>(
    () => props.notAnimate ?? options?.notAnimate ?? false
  )
  const isCloseButton = computed<NonNullable<AlertProps["closeButton"]>>(
    () => props.closeButton ?? options?.closeButton ?? false
  )
  const position = computed<NonNullable<AlertProps["position"]>>(() => props.position ?? options?.position ?? "top")
  // Issue 7 / F31 (RTL): позиции логические (`start`/`end`/`top-start`/…). Tailwind logical-utilities
  // (ms/ps/start/end) авто-зеркалятся при dir="rtl"; для не-логического translate анимации
  // добавлен rtl:-флип.
  //
  // Физические алиасы ("left"/"right"/"top-left"/…) сняты в major 2026-09-06 (решение R7), поэтому
  // нормализация больше не нужна. Computed сохранён: он входит в `AlertExpose` и читается
  // анимационными ветками ниже — превращать его в прямое обращение к `position` значило бы
  // менять публичный контракт ради одной строки.
  const positionLogical = computed<string>(() => position.value as string)
  // ARIA mapping per type (Issue 3, audit 2026-05-11):
  // error/warning → assertive alert; success/info/neutral → polite status.
  const ariaRole = computed<"alert" | "status">(() =>
    type.value === "error" || type.value === "warning" ? "alert" : "status"
  )
  const ariaLive = computed<"assertive" | "polite">(() =>
    type.value === "error" || type.value === "warning" ? "assertive" : "polite"
  )
  // Close-button aria-label via locale (Issue 6 partial, audit 2026-05-11).
  const closeLabel = computed<string>(() => Alert.t("alert.close") ?? "Close")
  const startEnterAndLeaveClass = computed<string>(() => {
    let classAnimate
    if (!notAnimate.value) {
      // start → off-screen в logical-начало (LTR: влево, RTL: вправо) — rtl: флипает translate.
      if (positionLogical.value.includes("start")) classAnimate = "-translate-x-[200%] rtl:translate-x-[200%] opacity-0"
      else if (positionLogical.value.includes("end"))
        classAnimate = "translate-x-[200%] rtl:-translate-x-[200%] opacity-0"
      else if (positionLogical.value.includes("top")) classAnimate = "-translate-y-[200%] opacity-0"
      else if (positionLogical.value.includes("bottom")) classAnimate = "translate-y-[200%] opacity-0"
      else classAnimate = "opacity-0"
    } else classAnimate = "opacity-0"
    return Alert.setStyle(classAnimate)
  })
  const endEnterAndLeaveClass = computed<string>(() => {
    let classAnimate
    if (!notAnimate.value) {
      if (positionLogical.value.includes("start")) classAnimate = "translate-x-0 opacity-100"
      else if (positionLogical.value.includes("end")) classAnimate = "translate-x-0 opacity-100"
      else if (positionLogical.value.includes("top")) classAnimate = "translate-y-0 opacity-100"
      else if (positionLogical.value.includes("bottom")) classAnimate = "translate-y-0 opacity-100"
      else classAnimate = "opacity-100"
    } else classAnimate = "opacity-100"
    return Alert.setStyle(classAnimate)
  })
  // ---Issue 9 / R11 — semantic-слоты интентов вместо примитивных шкал ---------------------
  // `success` / `warning` / `info` / `error` — именованные цвета движка (см. theme/primitive.ts).
  // Дефолты равны прежним green / yellow / blue / red, поэтому внешний вид не изменился; но
  // теперь интент Alert перекрашивается темой (`updatePreset({ primitive: { error: … } })`),
  // а не правкой этого файла — и при этом не отбирает у потребителя саму палитру red-*.
  const classesStyle = computed<Record<"body" | "icon" | "title" | "subtitle" | "button" | "buttonIcon", StyleClass>>(
    () => {
      switch (type.value) {
        case "warning":
          return {
            body: "bg-warning-50 dark:bg-warning-950",
            icon: "text-warning-400 dark:text-warning-600",
            title: "text-warning-800 dark:text-warning-200",
            subtitle: "text-warning-700 dark:text-warning-300",
            button: "hover:bg-warning-200 dark:hover:bg-warning-800",
            buttonIcon: "fill-warning-500 dark:fill-warning-500"
          }
        case "info":
          return {
            body: "bg-info-50 dark:bg-info-950",
            icon: "text-info-400 dark:text-info-600",
            title: "text-info-800 dark:text-info-200",
            subtitle: "text-info-700 dark:text-info-300",
            button: "hover:bg-info-200 dark:hover:bg-info-800",
            buttonIcon: "fill-info-500 dark:fill-info-500"
          }
        case "error":
          return {
            body: "bg-error-50 dark:bg-error-950",
            icon: "text-error-400 dark:text-error-600",
            title: "text-error-800 dark:text-error-200",
            subtitle: "text-error-700 dark:text-error-300",
            button: "hover:bg-error-200 dark:hover:bg-error-800",
            buttonIcon: "fill-error-500 dark:fill-error-500"
          }
        case "neutral":
          return {
            body: "bg-neutral-100 dark:bg-neutral-800",
            icon: "text-neutral-400 dark:text-neutral-600",
            title: "text-neutral-600 dark:text-neutral-300",
            subtitle: "text-neutral-500 dark:text-neutral-400",
            button: "hover:bg-neutral-200 dark:hover:bg-neutral-700",
            buttonIcon: "fill-neutral-500 dark:fill-neutral-500"
          }
        // `success` — default-тип; сюда же попадает `type` вне union (untyped JS-потребитель
        // или openAlert). Без `default:` computed вернул бы `undefined`, и каждый консьюмер
        // (`classesStyle.value.body/.icon/.title/.subtitle/.button/.buttonIcon`) падал бы с TypeError.
        case "success":
        default:
          return {
            body: "bg-success-50 dark:bg-success-950",
            icon: "text-success-400 dark:text-success-600",
            title: "text-success-800 dark:text-success-200",
            subtitle: "text-success-700 dark:text-success-300",
            button: "hover:bg-success-200 dark:hover:bg-success-800",
            buttonIcon: "fill-success-500 dark:fill-success-500"
          }
      }
    }
  )

  const icon = computed(() => {
    switch (type.value) {
      case "warning":
        return ExclamationTriangleIcon
      case "info":
        return InformationCircleIcon
      case "error":
        return XCircleIcon
      case "neutral":
        return ChatBubbleOvalLeftIcon
      // Тот же defensive default, что и в `classesStyle`: `type` вне union не должен
      // отдавать `undefined` в `<component :is="icon">` (Vue-warn + пустая иконка).
      case "success":
      default:
        return CheckCircleIcon
    }
  })
  const size = computed<StyleClass>(() => {
    let classSize
    const size = props.size ?? options?.size ?? "2xl"
    switch (size) {
      case "xs":
        classSize = "sm:max-w-xs"
        break
      case "sm":
        classSize = "sm:max-w-sm"
        break
      case "md":
        classSize = "sm:max-w-md"
        break
      case "lg":
        classSize = "sm:max-w-lg"
        break
      case "xl":
        classSize = "sm:max-w-xl"
        break
      case "2xl":
        classSize = "sm:max-w-2xl"
        break
      case "3xl":
        classSize = "sm:max-w-3xl"
        break
      case "4xl":
        classSize = "sm:max-w-4xl"
        break
      case "5xl":
        classSize = "sm:max-w-5xl"
        break
      case "6xl":
        classSize = "sm:max-w-6xl"
        break
      case "7xl":
        classSize = "sm:max-w-7xl"
        break
    }
    return Alert.setStyle(classSize)
  })
  // Issue 9 (audit 2026-05-11): respect prefers-reduced-motion via Tailwind `motion-safe:` prefix.
  Alert.setStyle(`motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500`)
  const classBase = computed<StyleClass>(() =>
    Alert.setStyle([
      // mobile-first: компактный padding на телефоне, sm: на desktop; max-w-[89vw] держит safe-gutters.
      "alert-body p-3 sm:p-4 w-auto max-w-[89vw] rounded-md",
      classesStyle.value.body,
      props?.class ?? "",
      options?.class ?? "",
      size.value
    ])
  )
  // `AlertProps["style"]` = `CSSProperties | undefined` (Alert.d.ts) — `as any` тут не нужен.
  const styleBase = computed<AlertProps["style"]>(() => props.style ?? options?.style)
  const classBody = computed(() => Alert.setStyle("flex"))
  const classDivIcon = computed(() => Alert.setStyle("shrink-0"))
  const classIcon = computed(() => Alert.setStyle(["h-5 w-5", classesStyle.value.icon]))
  const classContent = computed(() => Alert.setStyle("ms-3 mt-0.5"))
  const classTitle = computed(() => Alert.setStyle(["text-sm font-medium", classesStyle.value.title]))
  const classSubtitle = computed(() =>
    Alert.setStyle(["text-sm", title.value?.length ? "mt-2" : "", classesStyle.value.subtitle])
  )
  // `subtitle` поддерживает HTML-разметку, но проходит через best-effort sanitizer
  // (вырезает <script>/<style>/<iframe>/…, on*-обработчики, javascript:/vbscript: протоколы).
  // SSR-safe (чисто строковый). Для полного контроля над rich-разметкой — slot `#subtitle`.
  const sanitizedSubtitle = computed<string>(() => sanitizeHtml(subtitle.value))
  const classSlotDefault = computed(() =>
    Alert.setStyle(["text-sm", title.value?.length ? "mt-2" : "", classesStyle.value.subtitle])
  )
  const classDivCloseButton = ref(Alert.setStyle("relative bottom-[2px] ms-auto ps-3"))
  // ---EXPOSE------------------------------
  defineExpose({
    // ---STATE-------------------------
    isVisible,
    // ---PROPS-------------------------
    type,
    title,
    subtitle,
    displayTime,
    isCloseButton,
    position,
    positionLogical,
    startEnterAndLeaveClass,
    endEnterAndLeaveClass,
    classesStyle,
    size,
    classBase,
    // ---METHODS-----------------------
    close
  })
  // `Alert.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84,
  // Documentation/dev-patterns.md §2 decision row 1).
  // ---MOUNT-------------------------------
  onMounted(() => {})
  // ---WATCHERS----------------------------
  watch(
    () => props.modelValue,
    (value) => {
      isVisible.value = value
      if (displayTime.value >= 100 && value) {
        setTimeout(() => {
          isVisible.value = false
          emit("update:modelValue", false)
        }, displayTime.value)
      }
    },
    { immediate: true }
  )

  // ---METHODS-----------------------------
  function close() {
    isVisible.value = false
    emit("update:modelValue", false)
  }
</script>
<script lang="ts">
  import { openAlert } from "./openAlert"

  export { openAlert }
</script>
<template>
  <transition
    appear
    leave-active-class="motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500"
    :leave-from-class="endEnterAndLeaveClass"
    :leave-to-class="startEnterAndLeaveClass"
    enter-active-class="motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500"
    :enter-from-class="startEnterAndLeaveClass"
    :enter-to-class="endEnterAndLeaveClass">
    <div v-if="isVisible" data-alert :role="ariaRole" :aria-live="ariaLive" aria-atomic="true">
      <div :class="classBase" :style="styleBase">
        <div :class="classBody">
          <div data-alert-icon :class="classDivIcon">
            <component :is="icon" aria-hidden="true" :class="classIcon" />
          </div>
          <div data-alert-content :class="classContent">
            <h3 v-if="title?.length" data-alert-title :class="classTitle">{{ title }}</h3>
            <div v-if="subtitle || slots?.subtitle" data-alert-subtitle :class="classSubtitle">
              <slot name="subtitle"><span data-alert-subtitle-html v-html="sanitizedSubtitle" /></slot>
            </div>
            <div v-if="slots?.default" data-alert-slot :class="classSlotDefault">
              <slot />
            </div>
          </div>
          <div data-alert-button v-if="isCloseButton || displayTime === 0" :class="classDivCloseButton">
            <Button
              type="icon"
              icon="XMark"
              mode="ghost"
              :aria-label="closeLabel"
              :class="['-mx-1.5 -my-2', classesStyle.button as string]"
              :class-icon="classesStyle.buttonIcon"
              @click="close" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

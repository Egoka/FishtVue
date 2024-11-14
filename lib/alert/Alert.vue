<script setup lang="ts">
  import { computed, ref, watch, onMounted, useSlots, CSSProperties } from "vue"
  import type { AlertProps, AlertEmits, AlertExpose } from "./Alert"
  import {
    CheckCircleIcon,
    InformationCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ChatBubbleOvalLeftIcon
  } from "@heroicons/vue/20/solid"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  import { StyleClass } from "fishtvue/types"
  // ---BASE-COMPONENT----------------------
  const Alert = new Component<"Alert">()
  const options = Alert.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<AlertProps>()
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
  const startEnterAndLeaveClass = computed<StyleClass>(() => {
    let classAnimate
    if (!notAnimate.value) {
      if (position.value.includes("left")) classAnimate = "-translate-x-[200%] opacity-0"
      else if (position.value.includes("right")) classAnimate = "translate-x-[200%] opacity-0"
      else if (position.value.includes("top")) classAnimate = "-translate-y-[200%] opacity-0"
      else if (position.value.includes("bottom")) classAnimate = "translate-y-[200%] opacity-0"
      else classAnimate = "opacity-0"
    } else classAnimate = "opacity-0"
    return Alert.setStyle(classAnimate)
  })
  const endEnterAndLeaveClass = computed<StyleClass>(() => {
    let classAnimate
    if (!notAnimate.value) {
      if (position.value.includes("left")) classAnimate = "translate-x-0 opacity-100"
      else if (position.value.includes("right")) classAnimate = "translate-x-0 opacity-100"
      else if (position.value.includes("top")) classAnimate = "translate-y-0 opacity-100"
      else if (position.value.includes("bottom")) classAnimate = "translate-y-0 opacity-100"
      else classAnimate = "opacity-100"
    } else classAnimate = "opacity-100"
    return Alert.setStyle(classAnimate)
  })
  const classesStyle = computed<Record<"body" | "icon" | "title" | "subtitle" | "button" | "buttonIcon", StyleClass>>(
    () => {
      switch (type.value) {
        case "success":
          return {
            body: "bg-green-50 dark:bg-green-950",
            icon: "text-green-400 dark:text-green-600",
            title: "text-green-800 dark:text-green-200",
            subtitle: "text-green-700 dark:text-green-300",
            button: "hover:bg-green-200 dark:hover:bg-green-800",
            buttonIcon: "fill-green-500 dark:fill-green-500"
          }
        case "warning":
          return {
            body: "bg-yellow-50 dark:bg-yellow-950",
            icon: "text-yellow-400 dark:text-yellow-600",
            title: "text-yellow-800 dark:text-yellow-200",
            subtitle: "text-yellow-700 dark:text-yellow-300",
            button: "hover:bg-yellow-200 dark:hover:bg-yellow-800",
            buttonIcon: "fill-yellow-500 dark:fill-yellow-500"
          }
        case "info":
          return {
            body: "bg-blue-50 dark:bg-blue-950",
            icon: "text-blue-400 dark:text-blue-600",
            title: "text-blue-800 dark:text-blue-200",
            subtitle: "text-blue-700 dark:text-blue-300",
            button: "hover:bg-blue-200 dark:hover:bg-blue-800",
            buttonIcon: "fill-blue-500 dark:fill-blue-500"
          }
        case "error":
          return {
            body: "bg-red-50 dark:bg-red-950",
            icon: "text-red-400 dark:text-red-600",
            title: "text-red-800 dark:text-red-200",
            subtitle: "text-red-700 dark:text-red-300",
            button: "hover:bg-red-200 dark:hover:bg-red-800",
            buttonIcon: "fill-red-500 dark:fill-red-500"
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
        default:
          return {
            body: "bg-green-50 dark:bg-green-950",
            icon: "text-green-400 dark:text-green-600",
            title: "text-green-800 dark:text-green-200",
            subtitle: "text-green-700 dark:text-green-300",
            button: "hover:bg-green-200 dark:hover:bg-green-800",
            buttonIcon: "fill-green-500 dark:fill-green-500"
          }
      }
    }
  )
  const icon = computed(() => {
    switch (type.value) {
      case "success":
        return CheckCircleIcon
      case "warning":
        return ExclamationTriangleIcon
      case "info":
        return InformationCircleIcon
      case "error":
        return XCircleIcon
      case "neutral":
        return ChatBubbleOvalLeftIcon
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
      default:
        classSize = "sm:max-w-2xl"
        break
    }
    return Alert.setStyle(classSize)
  })
  Alert.setStyle(`transition-all ease-in-out duration-500`)
  const classBase = computed<StyleClass>(() =>
    Alert.setStyle([
      "alert-body p-4 w-auto max-w-[89vw] rounded-md",
      classesStyle.value.body,
      props?.class ?? "",
      options?.class ?? "",
      size.value
    ])
  )
  const styleBase = computed<CSSProperties>(() => props.style ?? options?.style)
  const classBody = computed(() => Alert.setStyle("flex"))
  const classDivIcon = computed(() => Alert.setStyle("shrink-0"))
  const classIcon = computed(() => Alert.setStyle(["h-5 w-5", classesStyle.value.icon]))
  const classContent = computed(() => Alert.setStyle("ml-3"))
  const classTitle = computed(() => Alert.setStyle(["text-sm font-medium", classesStyle.value.title]))
  const classSubtitle = computed(() =>
    Alert.setStyle(["text-sm", title.value?.length ? "mt-2" : "", classesStyle.value.subtitle])
  )
  const classSlotDefault = computed(() =>
    Alert.setStyle(["text-sm", title.value?.length ? "mt-2" : "", classesStyle.value.subtitle])
  )
  const classDivCloseButton = ref(Alert.setStyle("ml-auto pl-3"))
  // ---EXPOSE------------------------------
  defineExpose<AlertExpose>({
    // ---STATE-------------------------
    isVisible,
    // ---PROPS-------------------------
    type,
    title,
    subtitle,
    displayTime,
    isCloseButton,
    position,
    classesStyle,
    size,
    classBase,
    // ---METHODS-----------------------
    close
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Alert.initStyle()
  })
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
    leave-active-class="transition-all ease-in-out duration-500"
    :leave-from-class="endEnterAndLeaveClass"
    :leave-to-class="startEnterAndLeaveClass"
    enter-active-class="transition-all ease-in-out duration-500"
    :enter-from-class="startEnterAndLeaveClass"
    :enter-to-class="endEnterAndLeaveClass">
    <div v-if="isVisible">
      <div :class="classBase" :style="styleBase">
        <div :class="classBody">
          <div :class="classDivIcon">
            <component :is="icon" aria-hidden="true" :class="classIcon" />
          </div>
          <div :class="classContent">
            <h3 v-if="title?.length" :class="classTitle">{{ title }}</h3>
            <div v-if="subtitle" :class="classSubtitle" v-html="subtitle" />
            <div v-if="slots?.default" :class="classSlotDefault">
              <slot />
            </div>
          </div>
          <div v-if="isCloseButton || displayTime === 0" :class="classDivCloseButton">
            <Button
              type="icon"
              icon="XMark"
              mode="ghost"
              :class="['-mx-1.5 -my-2', classesStyle.button as string]"
              :class-icon="classesStyle.buttonIcon"
              @click="close" />
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { computed, ref, watch, onMounted } from "vue"
  import type { DialogProps, DialogEmits, DialogExpose } from "./Dialog"
  import Button from "fishtvue/button/Button.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"
  import { StyleClass } from "fishtvue/types"
  // ---BASE-COMPONENT----------------------
  const Dialog = new Component<"Dialog">()
  const options = Dialog.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<DialogProps>()
  const emit = defineEmits<DialogEmits>()
  // ---PROPS-------------------------------
  const toTeleport = computed<DialogProps["toTeleport"]>(() => props.toTeleport ?? options?.toTeleport ?? "body")
  const isOpen = computed<boolean>(() => props.modelValue ?? false)
  const size = computed<string>(() => {
    switch (props.size) {
      case "xs":
        return "sm:max-w-xs"
      case "sm":
        return "sm:max-w-sm"
      case "md":
        return "sm:max-w-md"
      case "lg":
        return "sm:max-w-lg"
      case "xl":
        return "sm:max-w-xl"
      case "2xl":
        return "sm:max-w-2xl"
      case "3xl":
        return "sm:max-w-3xl"
      case "4xl":
        return "sm:max-w-4xl"
      case "5xl":
        return "sm:max-w-5xl"
      case "6xl":
        return "sm:max-w-6xl"
      case "7xl":
        return "sm:max-w-7xl"
      default:
        return "sm:max-w-2xl"
    }
  })
  const isCloseButton = computed<DialogProps["closeButton"]>(() => props.closeButton ?? false)
  const notCloseBackground = computed<DialogProps["notCloseBackground"]>(() => props.notCloseBackground ?? false)
  const withoutMargin = computed<DialogProps["withoutMargin"]>(() => props.withoutMargin ?? false)
  const position = computed<NonNullable<DialogProps["position"]>>(() => props.position ?? "center")
  const classBodyDialog = computed<DialogProps["class"]>(() =>
    Dialog.setStyle([options?.class ?? "", props?.class ?? ""])
  )
  const enterAndLeaveClass = computed<StyleClass>(() => {
    let returnClass
    if (!props.notAnimate) {
      if (position.value.includes("left")) {
        returnClass = "-translate-x-full"
      } else if (position.value.includes("right")) {
        returnClass = "translate-x-full"
      } else if (position.value.includes("top")) {
        returnClass = "-translate-y-full"
      } else if (position.value.includes("bottom")) {
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
    if (position.value.includes("bottom")) {
      arrayDialog.push(`bottom-0 ${withoutMargin.value ? "" : "mb-5"}`)
    } else if (position.value.includes("top")) {
      arrayDialog.push(`top-0 ${withoutMargin.value ? "" : "mt-5"}`)
    } else {
      arrayDialog.push("top-1/2 -translate-y-1/2")
    }
    if (position.value.includes("right")) {
      arrayDialog.push(`right-0 ${withoutMargin.value ? "" : "mr-5"}`)
    } else if (position.value.includes("left")) {
      arrayDialog.push(`left-0 ${withoutMargin.value ? "" : "ml-5"}`)
    } else {
      arrayDialog.push("left-1/2 -translate-x-1/2")
    }
    return arrayDialog
  })

  Dialog.setStyle(`transition-all ease-in-out duration-500 translate-x-0 opacity-100`)
  Dialog.setStyle(`transition-opacity ease-in-out duration-500 opacity-100 opacity-0`)
  const classBase = computed<StyleClass>(() =>
    Dialog.setStyle([
      "fixed top-0 left-0 right-0 bottom-0 z-[200] w-full overflow-x-hidden overflow-y-auto inset-0 h-screen max-h-full",
      options?.classBody ?? "",
      props.classBody ?? ""
    ])
  )
  const classBackground = ref<StyleClass>(Dialog.setStyle("fixed inset-0"))
  const classBackgroundBase = ref<StyleClass>(Dialog.setStyle("fixed inset-0 z-[99]"))
  const classBackgroundBaseColor = ref<StyleClass>(
    Dialog.setStyle(
      "fixed inset-0 bg-neutral-500/10 dark:bg-neutral-900/10 backdrop-blur-[3px] transition-all duration-200"
    )
  )
  const classDialog = computed<StyleClass>(() =>
    Dialog.setStyle([
      "p-6 w-full max-w-xs max-h-full rounded-md bg-white dark:bg-neutral-950",
      classBodyDialog.value ?? "",
      classPosition.value ?? "",
      size.value ?? "",
      "relative"
    ])
  )
  // ---EXPOSE------------------------------
  defineExpose<DialogExpose>({
    // ---PROPS-------------------------
    toTeleport,
    isOpen,
    size,
    isCloseButton,
    notCloseBackground,
    withoutMargin,
    position,
    classBodyDialog,
    classPosition,
    classBase,
    classDialog,
    // ---METHODS-----------------------
    closeDialog
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Dialog.initStyle()
  })
  // ---WATCHERS----------------------------
  watch(isOpen, (value) => {
    const bodyEl = document.querySelector("body")
    if (bodyEl) {
      if (value) {
        bodyEl.classList.add("overflow-hidden")
        bodyEl.setAttribute("style", `${bodyEl.style.cssText}overflow: hidden;`)
      } else {
        bodyEl?.classList.remove("overflow-hidden")
        if (bodyEl.style.overflow === "hidden")
          bodyEl.setAttribute("style", bodyEl.style.cssText.replace("overflow: hidden;", ""))
      }
    }
  })

  // ---METHODS-----------------------------
  function closeDialog() {
    emit("update:modelValue", false)
  }
</script>

<template>
  <Teleport defer :to="String(toTeleport)">
    <transition
      appear
      leave-active-class="transition-all ease-in-out duration-500"
      leave-from-class="translate-x-0 opacity-100"
      :leave-to-class="enterAndLeaveClass"
      enter-active-class="transition-all ease-in-out duration-500"
      :enter-from-class="enterAndLeaveClass"
      enter-to-class="translate-x-0 opacity-100">
      <div v-if="isOpen" :class="classBase">
        <div v-if="!notCloseBackground" :class="classBackground" @click="closeDialog" />
        <div :class="classDialog">
          <slot :closeDialog="closeDialog"></slot>
          <Button
            v-if="isCloseButton"
            mode="ghost"
            class="absolute top-2 right-2 px-[5px] m-1 h-9 w-9"
            @click="closeDialog">
            <Icons type="XMark" class="fill-neutral-500 dark:fill-neutral-500" />
          </Button>
        </div>
      </div>
    </transition>
    <transition
      leave-active-class="transition-opacity ease-in-out duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      enter-active-class="transition-opacity ease-in-out duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100">
      <div v-if="isOpen" :class="classBackgroundBase">
        <slot name="background">
          <div :class="classBackgroundBaseColor" />
        </slot>
      </div>
    </transition>
  </Teleport>
</template>

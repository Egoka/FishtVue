<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted, useSlots } from "vue"
  import type { InputLayoutProps, InputLayoutEmits, InputLayoutExpose } from "./InputLayout"
  import Label from "fishtvue/label/Label.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import Loading from "fishtvue/loading/Loading.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const InputLayout = new Component<"InputLayout">()
  const options = InputLayout.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<InputLayoutProps>()
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
  // ---PROPS-------------------------------
  const value = computed<InputLayoutProps["value"]>(() => props.value ?? null)
  const isValue = computed<NonNullable<InputLayoutProps["isValue"]>>(() => props?.isValue ?? false)
  const mode = computed<NonNullable<InputLayoutProps["mode"]>>(() => props?.mode ?? options?.mode ?? "outlined")
  const label = computed<NonNullable<InputLayoutProps["label"]>>(() => String(props?.label ?? ""))
  const labelMode = computed<NonNullable<InputLayoutProps["labelMode"]>>(() => {
    const labelModeValue = props?.labelMode ?? options?.labelMode ?? "offsetDynamic"
    return labelModeValue ? labelModeValue : "offsetDynamic"
  })
  const labelType = computed<NonNullable<InputLayoutProps["labelMode"]>>(() =>
    getLabelType(isValue.value, label.value, labelMode.value)
  )
  const isRequired = computed<NonNullable<InputLayoutProps["required"]>>(() => props.required)
  const isLoading = computed<InputLayoutProps["loading"]>(() => props.loading ?? false)
  const isDisabled = computed<InputLayoutProps["disabled"]>(() => props.disabled ?? false)
  const isInvalid = computed<InputLayoutProps["isInvalid"]>(() => (!isDisabled.value ? props.isInvalid : false))
  const messageInvalid = computed<InputLayoutProps["messageInvalid"]>(() => props.messageInvalid ?? "")
  const help = computed<InputLayoutProps["help"]>(() => String(props.help ?? ""))
  const width = computed<InputLayoutProps["width"]>(() =>
    props?.width ? (typeof props?.width === "number" ? `${props?.width}px` : props?.width) : ""
  )
  const height = computed<InputLayoutProps["height"]>(() =>
    props?.height ? (typeof props?.height === "number" ? `${props?.height}px` : props?.height) : ""
  )
  const animation = computed<NonNullable<InputLayoutProps["animation"]>>(
    () => props?.animation ?? options?.animation ?? "transition-all duration-550"
  )
  const classBody = computed(() =>
    InputLayout.setStyle([
      "inputBody classBody relative mb-6 rounded-md",
      animation.value ?? "",
      options?.classBody ?? "",
      props?.classBody ?? "",
      isInvalid.value ? "is-invalid" : ""
    ])
  )
  const classBase = computed(() =>
    InputLayout.setStyle([
      "classLayout rounded-md w-full max-h-20 text-gray-900 dark:text-gray-100 sm:text-sm sm:leading-6 focus-visible:ring-0",
      mode.value === "outlined" ? "border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-950" : "",
      mode.value === "underlined"
        ? "rounded-none border-0 border-gray-300 dark:border-gray-700 border-b bg-stone-50 dark:bg-stone-950"
        : "",
      mode.value === "filled"
        ? `${isDisabled.value ? "border-dotted border-2 border-slate-200" : "border-0 border-transparent"} bg-stone-100 dark:bg-stone-900`
        : "",
      animation.value ?? "",
      options?.class ?? "",
      props?.class ?? "",
      isInvalid.value
        ? "border-red-500 dark:border-red-500 ring-1 ring-inset ring-red-500 dark:ring-red-500 scroll-mt-10"
        : "",
      isDisabled.value
        ? "bg-neutral-50 dark:bg-neutral-950 text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-800 border-dashed shadow-none"
        : "",
      "block peer overflow-auto"
    ])
  )
  const classBeforeInput = computed(() =>
    InputLayout.setStyle([
      "beforeInput absolute inset-y-0 left-0 flex items-center pr-1",
      beforeInput.value && beforeWidth.value > 16 ? "pl-3" : "pl-1.5"
    ])
  )
  const classAfterInput = computed(() => InputLayout.setStyle("absolute inset-y-0 right-0 flex items-center"))
  const classAfterSlot = computed(() => InputLayout.setStyle("flex pr-2"))
  const classLoading = computed(() => InputLayout.setStyle("relative mx-2"))
  const classInvalid = computed(() =>
    InputLayout.setStyle(
      "absolute block text-red-600 dark:text-red-400 text-sm truncate ml-1 data-[invalid=true]:visible invisible"
    )
  )
  const classIconBody = computed(() => InputLayout.setStyle("relative mr-2"))
  const classIconContent = computed(() =>
    InputLayout.setStyle(
      "p-3 rounded-md shadow-lg " +
        "bg-white dark:bg-stone-900 " +
        "font-light italic text-xs text-gray-500 dark:text-gray-400 " +
        "ring-1 ring-black/20 focus:outline-none"
    )
  )
  InputLayout.setStyle("transition ease-in duration-200 opacity-100 opacity-0")
  // ---EXPOSE------------------------------
  defineExpose<InputLayoutExpose>({
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
    width,
    height,
    animation,
    classBody,
    class: classBase,
    // ---METHODS-----------------------
    copy
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    InputLayout.initStyle()
    if (beforeInput.value) {
      new ResizeObserver((entries) => {
        for (const entry of entries) beforeWidth.value = (entry as any).target["offsetWidth"]
      }).observe(beforeInput.value as HTMLElement)
    }
    if (afterInput.value) {
      new ResizeObserver((entries) => {
        for (const entry of entries) afterWidth.value = (entry as any)?.target["offsetWidth"]
      }).observe(afterInput.value as HTMLElement)
    }
    headerHeight.value = <number>document.querySelector("header")?.offsetHeight
  })
  // ---SET_OBSERVER-------------------------
  const tableObserver = new ResizeObserver((entries) => {
    entries.forEach(() => {
      setWidthInput()
    })
  })
  const widthInput = ref<number>(0)

  function setWidthInput() {
    const result = inputBody.value?.clientWidth
    widthInput.value = result ? result : 0
  }

  onMounted(() => {
    if (inputBody.value) {
      tableObserver.observe(inputBody.value as Element)
    }
  })
  onUnmounted(() => {
    tableObserver.disconnect()
  })
  // ---METHODS-----------------------------
  const getLabelType = (
    value: any,
    label: InputLayoutProps["label"],
    labelMode: NonNullable<InputLayoutProps["labelMode"]>
  ): NonNullable<InputLayoutProps["labelMode"]> => {
    if (label?.length) {
      if (value) {
        if (["offsetDynamic", "offsetStatic"].includes(labelMode)) {
          return "offsetStatic"
        } else if (["vanishing"].includes(labelMode)) {
          return "none"
        } else {
          return "static"
        }
      } else {
        return labelMode
      }
    } else {
      return "none"
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(String(value.value))
      isCopy.value = true
      setTimeout(() => (isCopy.value = false), 3000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }
</script>

<template>
  <div ref="inputBody" :class="classBody" :style="`scroll-margin-top: ${headerHeight + 10}px;`">
    <div v-if="slots.before" ref="beforeInput" :class="classBeforeInput" :style="`height: ${height};max-height: 4rem;`">
      <slot name="before" />
    </div>
    <div
      ref="input"
      :class="classBase"
      :style="`width:${width};height:${height};min-height: ${baseHeight}px;padding-left: ${beforeWidth || 10}px; padding-right: ${afterWidth || 10}px;`">
      <slot />
    </div>
    <slot name="body" />
    <Label
      :title="label"
      :type="labelType"
      :mode="mode"
      :is-required="isRequired"
      :is-disabled="isDisabled"
      :translate-x="beforeWidth || 15"
      :max-width="widthInput" />
    <span ref="afterInput" :class="classAfterInput" :style="`height: ${height};max-height: 4rem;`">
      <div v-if="slots.after" :class="classAfterSlot">
        <slot name="after" />
      </div>
      <transition
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        enter-active-class="transition ease-in duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100">
        <div v-if="isLoading" :class="classLoading">
          <Loading v-if="isLoading" type="simple" class="absolute" />
        </div>
      </transition>
      <div v-if="help?.length" :class="classIconBody">
        <Icons
          type="QuestionMarkCircle"
          class="text-gray-400 dark:text-gray-600 hover:text-yellow-500 transition cursor-help" />
        <FixWindow
          :mode="mode"
          event-open="click"
          position="bottom-right"
          :margin-px="12.0"
          :padding-window="40"
          class-body="z-20"
          stop-open-propagation
          class="border-0 w-auto max-w-[15rem] origin-top-right px-0 bg-transparent dark:bg-transparent">
          <div v-html="help" :class="classIconContent" />
        </FixWindow>
      </div>
      <template v-if="!isDisabled">
        <div v-if="isInvalid && messageInvalid" :class="classIconBody">
          <Icons type="ExclamationCircle" class="text-red-500 dark:text-red-500 transition cursor-pointer" />
          <FixWindow
            :mode="mode"
            event-open="click"
            position="bottom-right"
            :margin-px="12.0"
            :padding-window="40"
            class-body="z-20"
            stop-open-propagation
            class="border-0 w-auto max-w-[15rem] origin-top-right px-0 bg-transparent dark:bg-transparent">
            <div v-html="messageInvalid" :class="classIconContent" />
          </FixWindow>
        </div>
        <transition
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition ease-in duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="clear && (value?.length || value > 0)" :class="classIconBody">
            <Icons
              type="XCircle"
              class="text-gray-400 dark:text-gray-600 hover:text-red-600 hover:dark:text-red-500 transition-all duration-300 cursor-pointer"
              @click.stop="emit('clear')" />
            <FixWindow v-if="slots.default" mode="filled" :delay="10" :padding-window="40">Очистить</FixWindow>
          </div>
        </transition>
      </template>
      <template v-else-if="value?.length">
        <div v-if="!isCopy" :class="classIconBody">
          <Icons
            type="DocumentDuplicate"
            class="mr-2 text-gray-400 dark:text-gray-600 hover:text-gray-600 hover:dark:text-gray-400 transition"
            @click.stop="copy" />
          <FixWindow :mode="mode" :delay="10" :padding-window="40">Копировать</FixWindow>
        </div>
        <Icons v-else type="Check" class="mr-2 text-emerald-400 dark:text-emerald-600" />
      </template>
    </span>
    <p :data-invalid="isInvalid" :class="classInvalid" :style="`max-width: ${inputBody?.['offsetWidth'] || 10}px`">
      {{ messageInvalid }}
    </p>
  </div>
</template>

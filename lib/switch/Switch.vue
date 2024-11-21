<script setup lang="ts">
  import { computed, getCurrentInstance, ref, watch, onMounted } from "vue"
  import type { SwitchProps, SwitchEmits, SwitchExpose } from "./Switch"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import { StyleClass, StyleMode } from "fishtvue/types"
  // ---BASE-COMPONENT----------------------
  const Switch = new Component<"Switch">()
  const options = Switch.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<SwitchProps>()
  const emit = defineEmits<SwitchEmits>()
  // ---STATE-------------------------------
  const modelValue = ref<SwitchProps["modelValue"]>()
  watch(
    () => props.modelValue,
    (value) => (modelValue.value = Boolean(value)),
    { immediate: true }
  )
  const isActiveSwitch = ref<boolean>(false)
  // ---PROPS-------------------------------
  const id = ref(props.id ?? getCurrentInstance()?.uid)
  const switchingType = computed<SwitchProps["switchingType"]>(
    () => props?.switchingType ?? options?.switchingType ?? "checkbox"
  )
  const mode = computed<SwitchProps["mode"]>(() => props?.mode ?? options?.mode ?? Switch.componentsStyle() ?? "none")
  const label = computed<SwitchProps["label"]>(() => String(props.label ?? ""))
  const isDisabled = computed<NonNullable<SwitchProps["disabled"]>>(() => props.disabled ?? false)
  const isRequired = computed<SwitchProps["required"]>(() => props.required ?? false)
  const rounded = computed<number>(() => {
    const valueRounded = props?.rounded ?? options?.rounded
    return valueRounded === "full" ? 9999 : (valueRounded ?? 9999)
  })
  const iconActive = computed<SwitchProps["iconActive"]>(() => props?.iconActive ?? options?.iconActive ?? "")
  const iconInactive = computed<SwitchProps["iconInactive"]>(() => props?.iconInactive ?? options?.iconInactive ?? "")
  const classBaseSwitch = computed<StyleClass>(() =>
    switchingType.value === "switch"
      ? Switch.setStyle([
          "my-4 py-[6px] px-2 rounded-md",
          mode.value === "outlined"
            ? `border border-gray-300 dark:border-gray-600 bg-white dark:bg-black ${isDisabled.value ? "bg-slate-50 dark:bg-stone-950 border-dashed" : ""}`
            : "",
          mode.value === "underlined"
            ? `rounded-none border-0 border-gray-300 dark:border-gray-700 border-b shadow-none bg-stone-50 dark:bg-stone-950 ${isDisabled.value ? "border-dashed" : ""}`
            : "",
          mode.value === "filled"
            ? `bg-stone-100 dark:bg-stone-900 ${isDisabled.value ? "border-2 border-dotted" : ""}`
            : "",
          options?.class ?? "",
          props?.class ?? "",
          isActiveSwitch.value && mode.value !== "none"
            ? "border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700"
            : "",
          "relative flex gap-x-3 transition-all"
        ])
      : switchingType.value === "checkbox"
        ? Switch.setStyle([
            "gap-x-3 my-4 py-[6px] px-2 rounded-md",
            mode.value === "outlined"
              ? `border border-gray-300 dark:border-gray-600 bg-white dark:bg-black ${isDisabled.value ? "bg-slate-50 dark:bg-stone-950 border-dashed" : ""}`
              : "",
            mode.value === "underlined"
              ? `rounded-none border-0 border-gray-300 dark:border-gray-700 border-b shadow-none bg-stone-50 dark:bg-stone-950 ${isDisabled.value ? "border-dashed" : ""}`
              : "",
            mode.value === "filled"
              ? ` bg-stone-100 dark:bg-stone-900 ${isDisabled.value ? "border-2 border-dotted" : ""}`
              : "",
            options?.class ?? "",
            props.class ?? "",
            "relative flex"
          ])
        : ""
  )
  const classInputDiv = ref(Switch.setStyle("flex h-6 items-center"))
  const classSwitch = computed<StyleClass>(() =>
    switchingType.value === "switch"
      ? Switch.setStyle([
          isDisabled.value
            ? `pointer-events-none border-dotted border-2 border-transparent w-9 ${modelValue.value ? "bg-gray-600 dark:bg-gray-400" : "bg-gray-200 dark:bg-gray-800"}`
            : "",
          modelValue.value ? "bg-theme-600 dark:bg-theme-400" : "bg-gray-200 dark:bg-gray-800",
          "flex w-8 flex-none cursor-pointer p-px ring-2 ring-inset ring-gray-900/5 dark:ring-gray-900/5 transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-600"
        ])
      : switchingType.value === "checkbox"
        ? Switch.setStyle([
            "h-4 w-4 bg-stone-50 dark:bg-stone-950",
            "border border-gray-300 dark:border-gray-700",
            "text-theme-500 dark:text-theme-700 checked:bg-theme-600 checked:dark:bg-theme-400",
            "focus:ring-offset-0 focus:ring-theme-200 focus:dark:ring-theme-700",
            "transition cursor-pointer",
            "disabled:bg-slate-500 disabled:text-slate-500 disabled:accent-slate-500"
          ])
        : ""
  )
  const classLabel = computed(() =>
    switchingType.value === "switch"
      ? Switch.setStyle([
          "font-medium text-sm leading-6 text-gray-900 dark:text-gray-100",
          isDisabled.value ? "pointer-events-none text-slate-800 dark:text-slate-200" : "",
          isRequired.value ? `after:content-['*'] after:text-red-500 after:ml-1` : ""
        ])
      : switchingType.value === "checkbox"
        ? Switch.setStyle([
            "font-medium text-sm leading-6 text-gray-600 dark:text-gray-400 cursor-pointer",
            isDisabled.value ? "text-slate-800 dark:text-slate-200" : "",
            isRequired.value ? `after:content-['*'] after:text-red-500 after:dark:text-red-800 after:ml-1` : ""
          ])
        : ""
  )
  const classAfterInput = ref(Switch.setStyle("absolute inset-y-0 right-0 flex items-center"))
  const classIconBody = ref(Switch.setStyle("relative h-5 w-5 mr-2"))
  const classIconContent = ref(
    Switch.setStyle(
      "p-3 rounded-md shadow-lg " +
        "bg-white dark:bg-stone-900 " +
        "font-light italic text-xs text-gray-500 dark:text-gray-400 " +
        "ring-1 ring-black/20 focus:outline-none"
    )
  )
  const classSwitchIcon = computed(() =>
    Switch.setStyle([
      modelValue.value
        ? "translate-x-3.5 bg-theme-100 dark:bg-theme-900"
        : "translate-x-0 bg-gray-100 dark:bg-gray-950",
      "h-4 w-4 transform shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out"
    ])
  )
  // ---EXPOSE------------------------------
  defineExpose<SwitchExpose>({
    // ---PROPS-------------------------------
    id,
    mode,
    label,
    rounded,
    isDisabled,
    isRequired,
    iconActive,
    iconInactive,
    switchingType,
    classBaseSwitch,
    classSwitch,
    // ---METHODS-----------------------------
    inputEvent
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Switch.initStyle()
  })

  // ---METHODS-----------------------------
  function inputEvent(value: boolean) {
    inputModelValue(value)
  }

  function inputModelValue(value: any) {
    emit("update:modelValue", value)
    emit("updateModelValue", value)
  }

  function changeModelValue(value: any) {
    emit("change:modelValue", value)
  }
</script>

<template>
  <div :class="classBaseSwitch">
    <div :class="classInputDiv">
      <button
        v-if="switchingType === 'switch'"
        role="switch"
        type="button"
        tabindex="0"
        :aria-checked="modelValue"
        :data-headlessui-state="modelValue ? 'checked' : ''"
        :class="classSwitch"
        :style="`border-radius: ${rounded}px`"
        @focus="isActiveSwitch = true"
        @blur="isActiveSwitch = false"
        @click="inputEvent(!modelValue)"
        @update:model-value="inputEvent">
        <Icons
          v-if="iconActive && iconInactive"
          :type="modelValue ? iconActive : iconInactive"
          :class="[
            modelValue
              ? 'translate-x-3.5 bg-theme-100 dark:bg-theme-900'
              : 'translate-x-0 bg-gray-100 dark:bg-gray-950',
            'h-4 w-4 transform shadow-sm ring-1 ring-gray-900/5 transition duration-200 ease-in-out text-gray-400 dark:text-gray-600'
          ]"
          :style="`border-radius: ${rounded - 1}px`" />
        <span v-else aria-hidden="true" :class="classSwitchIcon" :style="`border-radius: ${rounded - 1}px`" />
      </button>
      <input
        v-else-if="switchingType === 'checkbox'"
        :id="id"
        :name="id"
        tabindex="0"
        :checked="modelValue"
        :disabled="isDisabled"
        type="checkbox"
        :class="classSwitch"
        :style="`border-radius: ${rounded - 1}px`"
        @keydown.enter="inputEvent(!modelValue)"
        @focus="isActiveSwitch = true"
        @blur="isActiveSwitch = false"
        @input="inputEvent(($event.target as HTMLInputElement).checked)"
        @change="changeModelValue(($event.target as HTMLInputElement).checked)" />
    </div>
    <div :class="classLabel">
      {{ label }}
    </div>
    <slot />
    <span ref="afterInput" :class="classAfterInput">
      <div v-if="help?.length" :class="classIconBody">
        <Icons
          type="QuestionMarkCircle"
          class="text-gray-400 dark:text-gray-600 hover:text-yellow-500 transition cursor-help" />
        <FixWindow
          :mode="mode as StyleMode"
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
    </span>
  </div>
</template>

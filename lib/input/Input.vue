<script setup lang="ts">
  import type { ComponentInternalInstance } from "vue"
  import { computed, getCurrentInstance, onMounted, ref, useSlots, watch } from "vue"
  import type { InputEmits, InputExpose, InputProps } from "./Input"
  import type { InputLayoutExpose, InputLayoutProps } from "fishtvue/inputlayout"
  import { convertToNumber, convertToPhone, onkeydown, toNumber, toPhone } from "fishtvue/utils/numberHandler"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Input = new Component<"Input">()
  const options = Input.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<InputProps>(), {
    autoFocus: undefined,
    isValue: undefined,
    isInvalid: undefined,
    required: undefined,
    loading: undefined,
    disabled: undefined,
    clear: undefined
  })
  const emit = defineEmits<InputEmits>()
  const slots = useSlots()
  // ---REF-LINK----------------------------
  const layout = ref<InputLayoutExpose>()
  const inputRef = ref<HTMLElement | undefined>()
  // ---STATE-------------------------------
  const instance = ref<ComponentInternalInstance | null>()
  const classLayout = ref<InputProps["class"]>()
  const isActiveInput = ref<boolean>(false)
  const modelValue = ref<InputProps["modelValue"]>()
  const arrayInputType: Array<InputProps["type"]> = ["text", "number", "email", "password"]
  // ---PROPS-------------------------------
  const id = ref<NonNullable<InputProps["id"]>>(String(props?.id ?? instance.value?.uid))
  const type = computed<InputProps["type"]>(() =>
    props?.type && !!arrayInputType.find((i) => i === props.type) ? props?.type : "text"
  )
  const privateType = ref(type.value)
  watch(type, (value) => (privateType.value = value))
  const mask = computed<InputProps["maskInput"]>(() => props?.maskInput)
  const mode = computed<NonNullable<InputProps["mode"]>>(() => props.mode ?? options?.mode ?? "outlined")
  const isValue = computed<boolean>(() => !!modelValue.value || isActiveInput.value)
  const autoFocus = computed<NonNullable<InputProps["autoFocus"]>>(() => props?.autoFocus ?? false)
  const placeholder = computed<NonNullable<InputProps["placeholder"]>>(() => String(props?.placeholder ?? ""))
  const autocomplete = computed<NonNullable<InputProps["autocomplete"]>>(() => props?.autocomplete ?? "on")
  const lengthInteger = computed<NonNullable<InputProps["lengthInteger"]>>(() => +(props?.lengthInteger ?? 20))
  const lengthDecimal = computed<NonNullable<InputProps["lengthDecimal"]>>(() => +(props?.lengthDecimal ?? 0))
  const isDisabled = computed<NonNullable<InputProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<InputProps["loading"]>>(() => props.loading ?? false)
  const isInvalid = computed<NonNullable<InputProps["isInvalid"]>>(() => (!isDisabled.value ? props.isInvalid : false))
  const isClear = computed<NonNullable<InputProps["clear"]>>(() => props?.clear ?? options?.clear ?? false)
  const messageInvalid = computed<NonNullable<InputProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  const classBaseInput = computed(() =>
    Input.setStyle([
      "relative z-10 ring-0 border-0 w-full bg-transparent p-1 h-[28px] my-1 rounded-md text-gray-900 dark:text-gray-100",
      "placeholder:select-none focus:placeholder:text-gray-400 focus:placeholder:dark:text-gray-500",
      props.label?.length ? "placeholder:text-transparent placeholder:transition-all" : "",
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      "focus:outline-0 focus:ring-0 transition-all caret-theme-500",
      options?.classInput ?? "",
      props?.classInput ?? "",
      "classInput flex"
    ])
  )
  const inputLayout = computed(() => ({
    isValue: isValue.value,
    mode: mode.value,
    label: props.label,
    labelMode: props.labelMode,
    isInvalid: isInvalid.value,
    messageInvalid: messageInvalid.value,
    required: props.required,
    loading: isLoading.value,
    disabled: isDisabled.value,
    help: props.help,
    clear: isClear.value,
    width: props.width,
    height: props.height,
    animation: props.animation,
    classBody: props.classBody,
    class: props.class
  }))
  // ---EXPOSE------------------------------
  defineExpose<InputExpose>({
    //---STATE-------------------------
    layout,
    isActiveInput,
    classLayout,
    // ---PROPS-------------------------------
    id,
    type,
    mask,
    modelValue,
    autoFocus,
    placeholder,
    autocomplete,
    lengthInteger,
    lengthDecimal,
    isValue,
    mode,
    isDisabled,
    isLoading,
    isInvalid,
    messageInvalid,
    classBaseInput,
    // ---METHODS-----------------------------
    toMask,
    inputModelValue,
    changeModelValue,
    clear,
    focus,
    blur
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Input.initStyle()
    instance.value = getCurrentInstance()
    if (autoFocus.value) {
      inputRef.value?.focus()
    }
  })
  // ---WATCHERS----------------------------
  watch(
    () => props.modelValue,
    (value) => (modelValue.value = String(value ? toMask(value) : (value ?? ""))),
    { immediate: true }
  )
  watch(isActiveInput, (value) => {
    classLayout.value =
      (props?.class ?? options?.class ?? "") +
      (value ? " border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700" : "")
    Input.setStyle(classLayout.value ?? "")
    emit("isActive", value)
  })

  // ---METHODS-----------------------------
  function toMask(baseValue: string | number): string {
    if (!mask?.value) return String(baseValue)
    else if (mask?.value === "phone") return convertToPhone(String(baseValue))
    else if (mask?.value === "number") return convertToNumber(baseValue, lengthInteger.value, lengthDecimal.value, "")
    else if (mask?.value === "price") return convertToNumber(baseValue, lengthInteger.value, lengthDecimal.value, " ")
    else return String(baseValue)
  }

  // ---------------------------------------
  function inputEvent($event: InputEvent) {
    if (mask.value === "phone") toPhone($event)
    if (mask.value === "number") toNumber($event, "", lengthInteger.value, lengthDecimal.value)
    if (mask.value === "price") toNumber($event, " ", lengthInteger.value, lengthDecimal.value)
    inputModelValue(($event.target as HTMLInputElement).value)
  }

  function inputModelValue(valueResult: any) {
    modelValue.value = valueResult
    emit("update:isInvalid", false)
    emit("update:modelValue", valueResult)
  }

  function changeModelValue(valueResult: any) {
    emit("change:modelValue", valueResult)
  }

  function clear() {
    isActiveInput.value = false
    inputModelValue("")
    changeModelValue("")
    emit("clear", "")
  }

  function focus(eventFocus: FocusEvent) {
    inputRef.value?.focus()
    isActiveInput.value = true
    emit("focus", eventFocus)
  }

  function blur(eventFocus: FocusEvent) {
    isActiveInput.value = false
    emit("blur", eventFocus)
  }
</script>

<template>
  <InputLayout ref="layout" :value="modelValue" :class="classLayout ?? ''" v-bind="inputLayout" @clear="clear">
    <input
      data-input
      ref="inputRef"
      :id="id"
      :name="id"
      :type="privateType"
      :disabled="isDisabled"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :value="modelValue"
      :class="classBaseInput"
      @focus="focus"
      @blur="blur"
      @input="inputEvent"
      @keydown="onkeydown"
      @change="changeModelValue(($event.target as HTMLInputElement).value)" />
    <template #body>
      <slot />
    </template>
    <template #before>
      <slot v-if="slots.before" name="before" />
    </template>
    <template #after>
      <slot v-if="slots.after" name="after" />
      <Icons
        v-if="type === 'password' && privateType === 'password'"
        data-eye-slash
        type="EyeSlash"
        class="text-gray-400 dark:text-gray-600 hover:text-cyan-500 hover:dark:text-cyan-700 transition cursor-pointer"
        @click="privateType = 'text'" />
      <Icons
        v-if="type === 'password' && privateType === 'text'"
        data-eye
        type="Eye"
        class="text-gray-400 dark:text-gray-600 hover:text-cyan-500 hover:dark:text-cyan-700 transition cursor-pointer"
        @click="privateType = 'password'" />
    </template>
  </InputLayout>
</template>

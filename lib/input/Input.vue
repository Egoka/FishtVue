<script setup lang="ts">
  import { computed, onMounted, ref, useSlots, watch } from "vue"
  import type { InputEmits, InputProps } from "./Input"
  import type { InputLayoutExpose } from "fishtvue/inputlayout"
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
  const classLayout = ref<InputProps["class"]>()
  const isActiveInput = ref<boolean>(false)
  const modelValue = ref<InputProps["modelValue"]>()
  const arrayInputType: ReadonlyArray<NonNullable<InputProps["type"]>> = [
    "text",
    "number",
    "email",
    "password",
    "tel",
    "url",
    "search"
  ] as const
  // Маппинг разумных autocomplete-значений по типу — помогает password managers/autofill.
  // Перебивается явным `:autocomplete` prop или `componentsOptions.Input.autocomplete`.
  const autocompleteDefaults: Readonly<Record<NonNullable<InputProps["type"]>, string>> = {
    text: "on",
    number: "on",
    search: "on",
    email: "email",
    password: "current-password",
    tel: "tel",
    url: "url"
  }
  // ---PROPS-------------------------------
  const id = ref<InputProps["id"] | undefined>((props?.id as InputProps["id"]) ?? undefined)
  const type = computed<NonNullable<InputProps["type"]>>(() =>
    props?.type && !!arrayInputType.find((i) => i === props.type)
      ? (props.type as NonNullable<InputProps["type"]>)
      : "text"
  )
  const privateType = ref(type.value)
  watch(type, (value) => (privateType.value = value))
  const mask = computed<InputProps["maskInput"]>(() => props?.maskInput as InputProps["maskInput"])
  const phoneFormats = computed<InputProps["phoneFormats"]>(() => props?.phoneFormats ?? options?.phoneFormats)
  const mode = computed<NonNullable<InputProps["mode"]>>(
    () => props.mode ?? options?.mode ?? Input.componentsStyle() ?? "outlined"
  )
  const isValue = computed<boolean>(() => !!modelValue.value || isActiveInput.value)
  const autoFocus = computed<NonNullable<InputProps["autoFocus"]>>(() => props?.autoFocus ?? false)
  const placeholder = computed<NonNullable<InputProps["placeholder"]>>(() => String(props?.placeholder ?? ""))
  const autocomplete = computed<NonNullable<InputProps["autocomplete"]>>(
    () =>
      (props?.autocomplete as InputProps["autocomplete"]) ??
      (options?.autocomplete as InputProps["autocomplete"]) ??
      autocompleteDefaults[type.value]
  )
  const lengthInteger = computed<NonNullable<InputProps["lengthInteger"]>>(() => +(props?.lengthInteger ?? 20))
  const lengthDecimal = computed<NonNullable<InputProps["lengthDecimal"]>>(() => +(props?.lengthDecimal ?? 0))
  const isDisabled = computed<NonNullable<InputProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<InputProps["loading"]>>(() => props.loading ?? false)
  const isInvalid = computed<NonNullable<InputProps["isInvalid"]>>(() =>
    !isDisabled.value ? (props.isInvalid ?? false) : false
  )
  const isClear = computed<NonNullable<InputProps["clear"]>>(() => props?.clear ?? options?.clear ?? false)
  const messageInvalid = computed<NonNullable<InputProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  const classBaseInput = computed(() =>
    Input.setStyle([
      "relative z-10 ring-0 border-0 w-full bg-transparent p-1 h-[28px] my-1 rounded-md text-gray-900 dark:text-gray-100",
      "placeholder:select-none focus:placeholder:text-gray-400 focus:placeholder:dark:text-gray-500",
      props.label?.length ? "placeholder:text-transparent motion-safe:placeholder:transition-all" : "",
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      "focus:outline-0 focus:ring-0 motion-safe:transition-all caret-theme-500",
      "print:border print:border-black print:bg-white print:text-black print:shadow-none",
      options?.classInput ?? "",
      props?.classInput ?? "",
      "classInput flex"
    ])
  )
  const classPasswordToggle = computed(() =>
    Input.setStyle([
      "text-gray-400 dark:text-gray-600 hover:text-theme-500 hover:dark:text-theme-700 motion-safe:transition cursor-pointer",
      options?.passwordToggleClass ?? "",
      props?.passwordToggleClass ?? ""
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
  defineExpose({
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
  // `Input.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts).
  // Дублирование приводило к flash-of-unstyled-content при SSR и двойному выполнению логики.
  onMounted(() => {
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
    else if (mask?.value === "phone") return convertToPhone(String(baseValue), { phoneFormats: phoneFormats.value })
    else if (mask?.value === "number") return convertToNumber(baseValue, lengthInteger.value, lengthDecimal.value, "")
    else if (mask?.value === "price") return convertToNumber(baseValue, lengthInteger.value, lengthDecimal.value, " ")
    else return String(baseValue)
  }

  // ---------------------------------------
  function inputEvent($event: Event) {
    const inputEvent = $event as InputEvent
    if (mask.value === "phone") toPhone(inputEvent, { phoneFormats: phoneFormats.value })
    if (mask.value === "number") toNumber(inputEvent, "", lengthInteger.value, lengthDecimal.value)
    if (mask.value === "price") toNumber(inputEvent, " ", lengthInteger.value, lengthDecimal.value)
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

  // Принимаем три формы: native FocusEvent (template @focus), FocusOptions (programmatic),
  // либо ничего (argless `inp.focus()` — паритет с HTMLElement.focus()).
  function focus(eventOrOptions?: FocusEvent | FocusOptions) {
    if (typeof FocusEvent !== "undefined" && eventOrOptions instanceof FocusEvent) {
      inputRef.value?.focus()
      isActiveInput.value = true
      emit("focus", eventOrOptions)
    } else {
      inputRef.value?.focus(eventOrOptions as FocusOptions | undefined)
      isActiveInput.value = true
    }
  }

  function blur(eventFocus?: FocusEvent) {
    isActiveInput.value = false
    if (eventFocus) emit("blur", eventFocus)
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
        :class="classPasswordToggle"
        @click="privateType = 'text'" />
      <Icons
        v-if="type === 'password' && privateType === 'text'"
        data-eye
        type="Eye"
        :class="classPasswordToggle"
        @click="privateType = 'password'" />
    </template>
  </InputLayout>
</template>

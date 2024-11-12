<script setup lang="ts">
  import { computed, getCurrentInstance, onMounted, ref, useSlots, watch } from "vue"
  import type { AriaProps, AriaEmits, AriaExpose } from "./Aria"
  import type { InputLayoutExpose } from "fishtvue/inputlayout"
  import { onkeydown } from "fishtvue/utils/numberHandler"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Component from "fishtvue/component"
  import type { InputProps } from "fishtvue/input"
  // ---BASE-COMPONENT----------------------
  const Aria = new Component<"Aria">()
  const options = Aria.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<AriaProps>()
  const emit = defineEmits<AriaEmits>()
  const slots = useSlots()
  // ---REF-LINK----------------------------
  const layout = ref<InputLayoutExpose>()
  const inputRef = ref<HTMLElement>()
  // ---STATE-------------------------------
  const isActiveAria = ref<boolean>(false)
  const additionalStyles = ref<string>("max-h-max")
  const classLayout = ref<AriaProps["class"]>()
  const modelValue = ref<InputProps["modelValue"]>()
  watch(
    () => props.modelValue,
    (value) => (modelValue.value = String(value ?? "")),
    { immediate: true }
  )
  // ---PROPS-------------------------------
  const id = ref<NonNullable<AriaProps["id"]>>(String(props.id ?? getCurrentInstance()?.uid))
  const placeholder = computed<NonNullable<AriaProps["placeholder"]>>(() => String(props?.placeholder ?? ""))
  const autocomplete = computed<NonNullable<AriaProps["autocomplete"]>>(() => props?.autocomplete ?? "on")
  const wrap = computed<NonNullable<AriaProps["wrap"]>>(() => props?.wrap ?? "soft")
  const rows = computed<NonNullable<AriaProps["rows"]>>(() => props?.rows ?? 3)
  const maxLength = computed<NonNullable<AriaProps["maxLength"]>>(() => props?.maxLength ?? 9999)
  const isValue = computed<boolean>(() => !!modelValue.value || isActiveAria.value)
  const mode = computed<NonNullable<AriaProps["mode"]>>(() => props.mode ?? "outlined")
  const isDisabled = computed<NonNullable<AriaProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<AriaProps["isInvalid"]>>(() => props.loading ?? false)
  const isInvalid = computed<NonNullable<AriaProps["isInvalid"]>>(() => (!isDisabled.value ? props.isInvalid : false))
  const messageInvalid = computed<NonNullable<AriaProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  const classStyle = computed<NonNullable<AriaProps["class"]>>(() => {
    return props.class ? props.class + additionalStyles.value : additionalStyles.value
  })
  const classBase = computed(() => Aria.setStyle([options?.classBase ?? "", props.classBase ?? ""]))
  const classInput = computed(() =>
    Aria.setStyle([
      "w-full ring-0 border-0 bg-transparent p-0 mt-2 mb-1 min-h-[28px] max-h-[10rem] rounded text-gray-900 dark:text-gray-100",
      "placeholder:text-transparent placeholder:select-none focus:placeholder:text-gray-400 focus:placeholder:dark:text-gray-600",
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      "focus:outline-0 focus:ring-0 caret-theme-500",
      options?.classInput ?? "",
      props.classInput ?? "",
      "classInput block"
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
    clear: props.clear,
    width: props.width,
    height: props.height,
    classBody: props.classBody,
    class: classStyle.value
  }))
  // ---EXPOSE------------------------------
  defineExpose<AriaExpose>({
    // ---STATE-------------------------
    layout,
    inputRef,
    // ---PROPS-------------------------
    id,
    modelValue,
    placeholder,
    autocomplete,
    wrap,
    rows,
    maxLength,
    isValue,
    mode,
    isDisabled,
    isLoading,
    isInvalid,
    messageInvalid,
    classStyle,
    // ---METHODS-----------------------
    closeAria,
    clear
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Aria.initStyle()
  })
  // ---WATCHERS----------------------------
  watch(isActiveAria, (value) => {
    if (value) document.addEventListener("click", closeAria)
    else document.removeEventListener("click", closeAria)
    classLayout.value =
      (props.class ?? "") +
      (value
        ? ` border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700 ${additionalStyles.value}`
        : " " + additionalStyles.value)
  })

  // ---METHODS-----------------------------
  function closeAria(evt: MouseEvent) {
    isActiveAria.value = evt.composedPath().includes(inputRef.value as HTMLElement)
  }

  function clear() {
    isActiveAria.value = false
    inputModelValue("")
    changeModelValue("")
  }

  // ---------------------------------------
  function inputEvent($event: any) {
    inputModelValue(($event.target as HTMLInputElement).value)
  }

  function inputModelValue(valueResult: any) {
    modelValue.value = valueResult
    emit("update:isInvalid", false)
    emit("update:modelValue", valueResult)
  }

  function changeModelValue(value: any) {
    emit("change:modelValue", value)
  }

  function focus(env: FocusEvent) {
    inputRef.value?.focus()
    isActiveAria.value = true
    emit("focus", env)
  }

  function blur(env: FocusEvent) {
    isActiveAria.value = false
    emit("blur", env)
  }
</script>

<template>
  <div :class="classBase">
    <InputLayout ref="layout" :value="modelValue" :class="classLayout" v-bind="inputLayout" @clear="clear">
      <textarea
        :id="id"
        ref="inputRef"
        :name="id"
        :rows="rows"
        :wrap="wrap"
        :value="modelValue"
        :disabled="isDisabled"
        :maxlength="maxLength"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :class="classInput"
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
      </template>
    </InputLayout>
  </div>
</template>

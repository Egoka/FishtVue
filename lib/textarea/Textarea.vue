<script setup lang="ts">
  import { computed, ref, useSlots, watch } from "vue"
  import type { TextareaEmits, TextareaProps } from "./Textarea"
  import type { InputLayoutExpose } from "fishtvue/inputlayout"
  import { onkeydown } from "fishtvue/utils/numberHandler"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Textarea = new Component<"Textarea">()
  const options = Textarea.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<TextareaProps>(), {
    isValue: undefined,
    isInvalid: undefined,
    required: undefined,
    loading: undefined,
    disabled: undefined,
    clear: undefined
  })
  const emit = defineEmits<TextareaEmits>()
  const slots = useSlots()
  // ---REF-LINK----------------------------
  const layout = ref<InputLayoutExpose>()
  const inputRef = ref<HTMLElement>()
  // ---STATE-------------------------------
  const isActiveAria = ref<boolean>(false)
  const additionalStyles = ref<string>("max-h-max")
  const classLayout = ref<TextareaProps["class"]>()
  const modelValue = ref<TextareaProps["modelValue"]>()
  watch(
    () => props.modelValue,
    (value) => (modelValue.value = String(value ?? "")),
    { immediate: true }
  )
  // ---PROPS-------------------------------
  const id = ref<TextareaProps["id"] | undefined>((props?.id as TextareaProps["id"]) ?? undefined)
  const placeholder = computed<NonNullable<TextareaProps["placeholder"]>>(() => String(props?.placeholder ?? ""))
  const autocomplete = computed<NonNullable<TextareaProps["autocomplete"]>>(
    () => (props?.autocomplete as TextareaProps["autocomplete"]) ?? options?.autocomplete ?? "on"
  )
  const wrap = computed<NonNullable<TextareaProps["wrap"]>>(
    () => (props?.wrap as TextareaProps["wrap"]) ?? options?.wrap ?? "soft"
  )
  const rows = computed<NonNullable<TextareaProps["rows"]>>(
    () => (props?.rows as TextareaProps["rows"]) ?? options?.rows ?? 3
  )
  const maxLength = computed<NonNullable<TextareaProps["maxLength"]>>(
    () => (props?.maxLength as TextareaProps["maxLength"]) ?? options?.maxLength ?? 9999
  )
  const isValue = computed<boolean>(() => !!modelValue.value || isActiveAria.value)
  const mode = computed<NonNullable<TextareaProps["mode"]>>(
    () => props.mode ?? options?.mode ?? Textarea.componentsStyle() ?? "outlined"
  )
  const isDisabled = computed<NonNullable<TextareaProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<TextareaProps["isInvalid"]>>(() => props.loading ?? false)
  const isInvalid = computed<NonNullable<TextareaProps["isInvalid"]>>(() =>
    !isDisabled.value ? (props.isInvalid ?? false) : false
  )
  const messageInvalid = computed<NonNullable<TextareaProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  const classStyle = computed<NonNullable<TextareaProps["class"]>>(() => {
    return props.class ? props.class + additionalStyles.value : additionalStyles.value
  })
  const classInput = computed(() =>
    Textarea.setStyle([
      "w-full ring-0 border-0 bg-transparent p-0 mt-2 mb-1 min-h-[28px] max-h-[10rem] rounded text-surface-900 dark:text-surface-100",
      "placeholder:select-none focus:placeholder:text-surface-400 focus:placeholder:dark:text-surface-500",
      props.label?.length ? "placeholder:text-transparent motion-safe:placeholder:transition-all" : "",
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      "focus:outline-0 focus:ring-0 caret-theme-500",
      "print:border print:border-black print:bg-white print:text-black print:shadow-none",
      options?.classInput ?? "",
      props.classInput ?? "",
      "classInput block"
    ])
  )
  const inputLayout = computed(() => ({
    id: props.id,
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
    animation: props.animation,
    classBody: props.classBody,
    class: classStyle.value
  }))
  // ---EXPOSE------------------------------
  defineExpose({
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
    clear,
    focus,
    blur
  })
  // ---MOUNT-UNMOUNT-----------------------
  // Style injection wired up via Component.__hooks() in the base class
  // (onServerPrefetch + vueOnMounted -> initStyle). No explicit onMounted
  // call here — see Documentation/dev-patterns.md §2 decision row 1.

  // ---WATCHERS----------------------------
  watch(isActiveAria, (value) => {
    classLayout.value =
      (props.class ?? options?.class ?? "") +
      (value
        ? ` border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700 ${additionalStyles.value}`
        : " " + additionalStyles.value)
  })

  // ---METHODS-----------------------------
  function clear() {
    isActiveAria.value = false
    inputModelValue("")
    changeModelValue("")
  }

  // ---------------------------------------
  function inputEvent($event: Event) {
    inputModelValue(($event.target as HTMLTextAreaElement).value)
  }

  function inputModelValue(valueResult: string) {
    modelValue.value = valueResult
    emit("update:isInvalid", false)
    emit("update:modelValue", valueResult)
  }

  function changeModelValue(value: string) {
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
  <InputLayout ref="layout" :value="modelValue" :class="classLayout" v-bind="inputLayout" @clear="clear">
    <template #default="{ id: fieldId }">
      <textarea
        :id="fieldId"
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
        @change="changeModelValue(($event.target as HTMLTextAreaElement).value)" />
    </template>
    <template #body>
      <slot />
    </template>
    <template #before>
      <slot v-if="slots.before" name="before" :is-invalid="isInvalid" :is-focused="isActiveAria" />
    </template>
    <template #after>
      <slot v-if="slots.after" name="after" :is-invalid="isInvalid" :is-focused="isActiveAria" :clear="clear" />
    </template>
  </InputLayout>
</template>

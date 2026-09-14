<script setup lang="ts">
  import { computed, ref, useSlots, watch } from "vue"
  import type { TextareaClassKey, TextareaEmits, TextareaProps } from "./Textarea"
  import type { InputLayoutExpose } from "fishtvue/inputlayout"
  import { onkeydown } from "fishtvue/utils/numberHandler"
  import { mergeClasses } from "fishtvue/utils/tailwindHandler"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Textarea = new Component<"Textarea">()
  const options = Textarea.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  // Каждый optional boolean — `undefined` (dev-patterns §2 F): иначе слой componentsOptions недостижим.
  const props = withDefaults(defineProps<TextareaProps>(), {
    invalid: undefined,
    required: undefined,
    loading: undefined,
    disabled: undefined,
    clearable: undefined
  })
  const emit = defineEmits<TextareaEmits>()
  const slots = useSlots()
  const { cls, raw } = Textarea.resolveClasses<TextareaClassKey>(props)
  // ---REF-LINK----------------------------
  const layout = ref<InputLayoutExpose>()
  const inputRef = ref<HTMLElement>()
  // ---STATE-------------------------------
  const isActiveTextarea = ref<boolean>(false)
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
  const isValue = computed<boolean>(() => !!modelValue.value || isActiveTextarea.value)
  const mode = computed<NonNullable<TextareaProps["mode"]>>(
    () => props.mode ?? options?.mode ?? Textarea.componentsStyle() ?? "outlined"
  )
  const isDisabled = computed<NonNullable<TextareaProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<TextareaProps["loading"]>>(() => props.loading ?? false)
  const isInvalid = computed<boolean>(() => (!isDisabled.value ? (props.invalid ?? false) : false))
  const isClearable = computed<boolean>(() => props?.clearable ?? options?.clearable ?? false)
  const messageInvalid = computed<NonNullable<TextareaProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  // Контрол `<textarea data-textarea-control>` — ключ `control`
  const classControl = computed(() =>
    cls(
      "control",
      "w-full ring-0 border-0 bg-transparent p-0 mt-2 mb-1 min-h-[28px] max-h-[10rem] rounded text-surface-900 dark:text-surface-100",
      "placeholder:select-none focus:placeholder:text-surface-400 focus:placeholder:dark:text-surface-500",
      !!props.label?.length && "placeholder:text-transparent motion-safe:placeholder:transition-all",
      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
      "focus:outline-0 focus:ring-0 caret-theme-500",
      "print:border print:border-black print:bg-white print:text-black print:shadow-none",
      "block"
    )
  )
  // Hand-off карты классов в InputLayout (dev-patterns §2 C/D): семейные ключи складываются по ключу
  // `options → props`; aspect-ключ `animation` заменяется (`""` отключает); `root` уходит отдельным `class`.
  // В `base` — снятие лимита высоты рамки (`max-h-max`, textarea растёт по rows) и focus-ring, гейтящийся
  // `!isInvalid`, чтобы красная рамка ошибки оставалась видимой в фокусе. Раньше `max-h-max` клеился к
  // `props.class` без пробела (дефект D-Textarea, закрыт в W2).
  const FOCUS_RING = "border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700"
  const layoutClasses = computed(() => ({
    ...mergeClasses(
      { base: ["max-h-max", isActiveTextarea.value && !isInvalid.value ? FOCUS_RING : ""] },
      fieldsOmit(options?.classes ?? {}, ["root", "animation"]),
      fieldsOmit(props.classes ?? {}, ["root", "animation"])
    ),
    animation: props.classes?.animation ?? options?.classes?.animation
  }))
  const inputLayout = computed(() => ({
    id: props.id,
    hasValue: isValue.value,
    mode: mode.value,
    label: props.label,
    labelMode: props.labelMode,
    invalid: isInvalid.value,
    messageInvalid: messageInvalid.value,
    required: props.required,
    loading: isLoading.value,
    disabled: isDisabled.value,
    help: props.help,
    clearable: isClearable.value,
    width: props.width,
    height: props.height,
    class: raw("root"),
    classes: layoutClasses.value
  }))
  // ---EXPOSE------------------------------
  defineExpose({
    // ---STATE-------------------------
    layout,
    inputRef,
    inputLayout,
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
    isClearable,
    messageInvalid,
    classControl,
    // ---METHODS-----------------------
    clear,
    focus,
    blur
  })
  // ---MOUNT-UNMOUNT-----------------------
  // Style injection wired up via Component.__hooks() in the base class
  // (onServerPrefetch + vueOnMounted -> initStyle). No explicit onMounted
  // call here — see Documentation/dev-patterns.md §2 decision row 1.

  // ---METHODS-----------------------------
  function clear() {
    isActiveTextarea.value = false
    inputModelValue("")
    changeModelValue("")
  }

  // ---------------------------------------
  function inputEvent($event: Event) {
    inputModelValue(($event.target as HTMLTextAreaElement).value)
  }

  function inputModelValue(valueResult: string) {
    modelValue.value = valueResult
    emit("update:invalid", false)
    emit("update:modelValue", valueResult)
  }

  function changeModelValue(value: string) {
    emit("change:modelValue", value)
  }

  function focus(env: FocusEvent) {
    inputRef.value?.focus()
    isActiveTextarea.value = true
    emit("focus", env)
  }

  function blur(env: FocusEvent) {
    isActiveTextarea.value = false
    emit("blur", env)
  }
</script>

<template>
  <!-- Корень Textarea — корень InputLayout: `data-textarea` падает на него fallthrough-атрибутом -->
  <InputLayout data-textarea ref="layout" :value="modelValue" v-bind="inputLayout" @clear="clear">
    <template #default="{ id: fieldId }">
      <textarea
        data-textarea-control
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
        :class="classControl"
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
      <slot v-if="slots.before" name="before" :invalid="isInvalid" :focused="isActiveTextarea" />
    </template>
    <template #after>
      <slot v-if="slots.after" name="after" :invalid="isInvalid" :focused="isActiveTextarea" :clear="clear" />
    </template>
  </InputLayout>
</template>

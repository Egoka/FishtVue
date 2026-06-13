<script setup lang="ts">
  import { computed, ref, watch } from "vue"
  import type { SwitchEmits, SwitchProps } from "./Switch"
  import type { StyleClass, StyleMode } from "fishtvue/types"
  import Icons from "fishtvue/icons/Icons.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Switch = new Component<"Switch">()
  const options = Switch.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<SwitchProps>(), {
    disabled: undefined,
    required: undefined
  })
  const emit = defineEmits<SwitchEmits>()
  // ---STATE-------------------------------
  const modelValue = ref<SwitchProps["modelValue"]>()
  watch(
    () => props.modelValue,
    (value) => (modelValue.value = value as SwitchProps["modelValue"]),
    { immediate: true }
  )
  const isActiveSwitch = ref<boolean>(false)
  // ---PROPS-------------------------------
  const id = ref<SwitchProps["id"] | undefined>((props?.id as SwitchProps["id"]) ?? undefined)
  const switchingType = computed<SwitchProps["switchingType"]>(
    () => (props?.switchingType as SwitchProps["switchingType"]) ?? options?.switchingType ?? "checkbox"
  )
  const mode = computed<SwitchProps["mode"]>(
    () => (props?.mode as SwitchProps["mode"]) ?? options?.mode ?? Switch.componentsStyle() ?? "none"
  )
  const label = computed<SwitchProps["label"]>(() => String(props.label ?? ""))
  const isDisabled = computed<NonNullable<SwitchProps["disabled"]>>(() => props.disabled ?? false)
  const isRequired = computed<SwitchProps["required"]>(() => props.required ?? false)
  const rounded = computed<number>(() => {
    const valueRounded = (props?.rounded as SwitchProps["rounded"]) ?? options?.rounded
    return valueRounded === "full" ? 9999 : (valueRounded ?? 9999)
  })
  const iconActive = computed<SwitchProps["iconActive"]>(
    () => (props?.iconActive as SwitchProps["iconActive"]) ?? options?.iconActive ?? ""
  )
  const iconInactive = computed<SwitchProps["iconInactive"]>(
    () => (props?.iconInactive as SwitchProps["iconInactive"]) ?? options?.iconInactive ?? ""
  )
  const classBaseSwitch = computed<StyleClass>(() =>
    switchingType.value === "switch"
      ? Switch.setStyle([
          "min-w-20 my-4 py-[6px] px-2 rounded-md",
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
          "relative flex gap-x-3 motion-safe:transition-all",
          // Issue 14: стилизуем для печати (канон Button/Input), не прячем display:none.
          "print:border print:border-black print:bg-white print:text-black print:shadow-none"
        ])
      : switchingType.value === "checkbox"
        ? Switch.setStyle([
            "min-w-20 gap-x-3 my-4 py-[6px] px-2 rounded-md",
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
            "relative flex",
            // Issue 14: style-for-print (канон Button/Input).
            "print:border print:border-black print:bg-white print:text-black print:shadow-none"
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
          // Issue 7: motion-safe transitions. Issue 12 (B10): forced-colors:outline сохраняет
          // трек видимым в Windows high-contrast (bg-* там сбрасывается) — on/off различимы по позиции thumb.
          "flex w-8 flex-none cursor-pointer p-px ring-2 ring-inset ring-gray-900/5 dark:ring-gray-900/5 motion-safe:transition-colors motion-safe:duration-200 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-theme-600 forced-colors:outline"
        ])
      : switchingType.value === "checkbox"
        ? Switch.setStyle([
            "h-4 w-4 bg-stone-50 dark:bg-stone-950",
            "border border-gray-300 dark:border-gray-700",
            "text-theme-500 dark:text-theme-700 checked:bg-theme-600 checked:dark:bg-theme-400",
            "focus:ring-offset-0 focus:ring-theme-200 focus:dark:ring-theme-700",
            "motion-safe:transition cursor-pointer",
            "disabled:bg-slate-500 disabled:text-slate-500 disabled:accent-slate-500"
          ])
        : ""
  )
  const classLabel = computed(() =>
    switchingType.value === "switch"
      ? Switch.setStyle([
          "font-medium text-sm leading-6 text-gray-900 dark:text-gray-100 cursor-pointer",
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
  const classAfterInput = ref(Switch.setStyle("relative inset-y-0 end-0 flex items-center"))
  const classIconBody = ref(Switch.setStyle("relative h-5 w-5 me-2"))
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
      // Issue 7: motion-safe transitions.
      "h-4 w-4 shadow-sm ring-1 ring-gray-900/5 motion-safe:transition-all motion-safe:duration-300 ease-in-out"
    ])
  )
  // Иконка-thumb (ветка iconActive/iconInactive) — зеркало classSwitchIcon + transform/цвет иконки.
  // Через `setStyle`, а не inline в шаблоне: inline-классы не регистрируются движком,
  // поэтому их `motion-safe:`-варианты не попадают в инжектируемый CSS (зеркало Table Issue 12).
  const classSwitchIconImg = computed(() =>
    Switch.setStyle([
      modelValue.value
        ? "translate-x-3.5 bg-theme-100 dark:bg-theme-900"
        : "translate-x-0 bg-gray-100 dark:bg-gray-950",
      "h-4 w-4 transform shadow-sm ring-1 ring-gray-900/5 motion-safe:transition-all motion-safe:duration-300 ease-in-out text-gray-400 dark:text-gray-600"
    ])
  )
  // ---TEMPLATE-REF------------------------
  // Единый ref на текущий native control (button[role=switch] или input[type=checkbox]).
  // v-if в шаблоне гарантирует, что в DOM присутствует только один из них.
  const inputRef = ref<HTMLElement | undefined>()
  // ---EXPOSE------------------------------
  defineExpose({
    // ---STATE-------------------------------
    isActiveSwitch,
    // ---REFS--------------------------------
    inputRef,
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
    inputEvent,
    focus,
    blur
  })

  // `Switch.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84).

  // ---METHODS-----------------------------
  function inputEvent(value: boolean) {
    inputModelValue(value)
  }

  function inputModelValue(value: any) {
    emit("update:modelValue", value)
  }

  function changeModelValue(value: any) {
    emit("change:modelValue", value)
  }

  function focus(options?: FocusOptions) {
    inputRef.value?.focus(options)
  }

  function blur() {
    inputRef.value?.blur()
  }
</script>

<template>
  <div data-switch :class="classBaseSwitch">
    <div :class="classInputDiv">
      <!--
        Switch mode: visible <button role="switch"> участвует в a11y/UX, а скрытый
        <input type="checkbox"> рядом обеспечивает FormData submission в native <form>.
        Скрытый input не фокусируется (tabindex=-1, aria-hidden) — это исключительно
        bridge между button-style UI и native form-control семантикой.
      -->
      <input
        v-if="switchingType === 'switch'"
        data-switch-form-bridge
        :name="id"
        :checked="modelValue as boolean"
        :disabled="isDisabled"
        type="checkbox"
        tabindex="-1"
        aria-hidden="true"
        hidden />
      <button
        v-if="switchingType === 'switch'"
        ref="inputRef"
        :id="id"
        data-input-switch
        role="switch"
        type="button"
        tabindex="0"
        :disabled="isDisabled as any"
        :aria-checked="modelValue as boolean | 'mixed' | undefined"
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
          :class="classSwitchIconImg"
          :style="{ borderRadius: `${rounded}px` }" />
        <span v-else aria-hidden="true" :class="classSwitchIcon" :style="`border-radius: ${rounded - 1}px`" />
      </button>
      <input
        v-else-if="switchingType === 'checkbox'"
        ref="inputRef"
        data-input-checkbox
        :id="id as string"
        :name="id"
        tabindex="0"
        :checked="modelValue as any[] | boolean | Set<any> | undefined"
        :disabled="isDisabled"
        type="checkbox"
        :class="classSwitch"
        :style="`border-radius: ${rounded - 1}px`"
        @keydown.stop.enter="inputEvent(!modelValue)"
        @focus="isActiveSwitch = true"
        @blur="isActiveSwitch = false"
        @input="inputEvent(($event.target as HTMLInputElement).checked)"
        @change="changeModelValue(($event.target as HTMLInputElement).checked)" />
    </div>
    <div v-if="label?.length" data-switch-label :class="classLabel" @click="inputEvent(!modelValue)">
      {{ label }}
    </div>
    <slot />
    <span data-switch-after ref="afterInput" :class="classAfterInput">
      <div data-switch-help v-if="help?.length || $slots.help" :class="classIconBody">
        <Icons
          type="QuestionMarkCircle"
          class="text-gray-500 dark:text-gray-400 hover:text-yellow-500 transition cursor-help" />
        <FixWindow
          :mode="mode as StyleMode"
          event-open="click"
          position="bottom-right"
          :margin-px="12.0"
          :padding-window="40"
          class-body="z-20"
          stop-open-propagation
          class="border-0 w-auto max-w-[15rem] origin-top-right px-0 bg-transparent dark:bg-transparent">
          <slot name="help">
            <div :class="classIconContent">{{ help }}</div>
          </slot>
        </FixWindow>
      </div>
    </span>
  </div>
</template>

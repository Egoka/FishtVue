<script setup lang="ts">
  import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from "vue"
  import {
    CalendarClassKey,
    CalendarEmits,
    CalendarMasks,
    CalendarPicker,
    CalendarProps,
    CalendarRangeDate,
    CalendarRangeValue,
    DatePickerProps,
    SimpleDateRange
  } from "./Calendar"
  import { InputLayoutExpose, InputLayoutProps } from "fishtvue/inputlayout"
  import { mergeClasses } from "fishtvue/utils/tailwindHandler"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
  import { isClient } from "fishtvue/utils/domHandler"
  import type { FishtVue } from "fishtvue/config"
  import { FishtVueSymbol } from "fishtvue/config"
  // ---LAZY V-CALENDAR (Wave 2.1)----------------------
  // v-calendar — optional peerDependency: грузим DatePicker динамически в onMounted (зеркало
  // TextEditor/QuillEditor) + CSS lazy (client-only → SSR-safe). Ref-based (НЕ
  // defineAsyncComponent) специально: template-ref `calendarPicker` должен указывать на РЕАЛЬНЫЙ
  // инстанс DatePicker — Calendar читает его `inputValue`/`dateParts`; async-wrapper их не отдаёт.
  // Bundle без Calendar не тянет v-calendar; потребитель Calendar ставит peer сам.
  const DatePicker = ref<any>()
  // ---BASE-COMPONENT----------------------
  const Calendar = new Component<"Calendar">()
  const options = Calendar.getOptions()
  const FishtV = inject<FishtVue>(FishtVueSymbol)
  // ---PROPS-EMITS-SLOTS-------------------
  // Каждый optional boolean — `undefined` (dev-patterns §2 F): иначе слой componentsOptions недостижим.
  const props = withDefaults(defineProps<CalendarProps>(), {
    autoFocus: undefined,
    closeOnSelect: undefined,
    range: undefined,
    invalid: undefined,
    required: undefined,
    loading: undefined,
    disabled: undefined,
    clearable: undefined
  })
  const emit = defineEmits<CalendarEmits>()
  const slots = useSlots()
  const { cls, raw } = Calendar.resolveClasses<CalendarClassKey>(props)
  // ---REF-LINK----------------------------
  const layout = ref<InputLayoutExpose>()
  const datePickerLink = ref<HTMLElement>()
  const picker = ref<HTMLElement>()
  // ---PROPS (резолв до STATE: immediate-watch на modelValue читает `isRange` синхронно в setup) -------
  // Positive-булевы с литеральным default'ом (dev-patterns §2 F): `closeOnSelect` — true.
  const isCloseOnSelect = computed<boolean>(() => props?.closeOnSelect ?? options?.closeOnSelect ?? true)
  const isRange = computed<boolean>(() => props?.range ?? options?.range ?? false)
  // ---STATE-------------------------------
  const isFocus = ref<boolean>(false)
  const isOpenPicker = ref<boolean>(false)
  // `isRange` — внутреннее поле v-calendar: снаружи это top-level prop `range` (T2/T3 редизайна props 1.0),
  // поэтому подставляется последним и не может быть перезадано через `datePickerProps`.
  const datePickerOptions = computed<Partial<DatePickerProps> & { isRange: boolean }>(() => ({
    borderless: true,
    transparent: true,
    color: "theme",
    isDark: "system",
    expanded: true,
    trimWeeks: true,
    masks: {
      modelValue: props.datePickerProps?.mask ?? "DD MMMM YYYY",
      input: [props.datePickerProps?.mask ?? "DD MMMM YYYY"]
    } as CalendarMasks,
    ...options?.datePickerProps,
    ...props.datePickerProps,
    isRange: isRange.value
  }))
  const calendarPicker = ref<CalendarPicker>()
  const value = ref<CalendarProps["modelValue"]>()
  const visibleDate = ref<CalendarPicker["inputValue"]>()
  watch(
    () => props.modelValue,
    (modelValue) => {
      value.value = modelValue
      if (!!(modelValue as Partial<CalendarRangeValue>)?.start && !!(modelValue as Partial<CalendarRangeValue>)?.end) {
        value.value = isRange.value ? modelValue : null
      } else {
        value.value = !isRange.value ? (modelValue ?? "") : ({ start: null, end: null } as unknown as SimpleDateRange)
      }
    },
    { immediate: true }
  )
  // ---PROPS-------------------------------
  const id = ref<CalendarProps["id"] | undefined>((props?.id as CalendarProps["id"]) ?? undefined)
  const isValue = computed<boolean>(() => {
    if (isRange.value) {
      return (
        (!!(visibleDate.value as Partial<CalendarRangeValue>)?.start &&
          !!(visibleDate.value as Partial<CalendarRangeValue>)?.end) ||
        isOpenPicker.value
      )
    } else {
      return !!visibleDate.value || isOpenPicker.value
    }
  })
  const autoFocus = computed<NonNullable<CalendarProps["autoFocus"]>>(
    () => props?.autoFocus ?? options?.autoFocus ?? false
  )
  const isDark = ref<boolean | undefined>(undefined)
  // ---ISSUE 1 — MutationObserver saved in closure-let so onBeforeUnmount can disconnect.
  // eslint-disable-next-line no-undef
  let darkObserver: MutationObserver | undefined
  // ---ISSUE 8 — propagate FishtVue active locale to v-calendar DatePicker.
  // Priority: props.datePickerProps.locale > options.datePickerProps.locale > FishtVue active locale > "en"
  const locale = computed<NonNullable<DatePickerProps["locale"]>>(
    () => props.datePickerProps?.locale ?? options?.datePickerProps?.locale ?? FishtV?.getActiveLocale() ?? "en"
  )
  // ---ISSUE 6 — fall back to global componentsStyle before built-in default.
  const mode = computed<NonNullable<CalendarProps["mode"]>>(
    () => props.mode ?? options?.mode ?? Calendar.componentsStyle() ?? "outlined"
  )
  const placeholder = computed<DatePickerProps["placeholder"]>(() => String(props.datePickerProps?.placeholder ?? ""))
  const isLoading = computed<NonNullable<CalendarProps["loading"]>>(() => props.loading ?? false)
  const isDisabled = computed<NonNullable<CalendarProps["disabled"]>>(() => props.disabled ?? false)
  const isInvalid = computed<boolean>(() => (!isDisabled.value ? (props.invalid ?? false) : false))
  const isClearable = computed<boolean>(() => props?.clearable ?? options?.clearable ?? false)
  const messageInvalid = computed<NonNullable<CalendarProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  const separator = computed<NonNullable<DatePickerProps["separator"]>>(
    () => props.datePickerProps?.separator ?? options?.datePickerProps?.separator ?? "arrow"
  )
  const valueLayout = computed<string>(() =>
    isRange.value
      ? (visibleDate.value as CalendarRangeDate)?.start && (visibleDate.value as CalendarRangeDate)?.end
        ? `${(visibleDate.value as CalendarRangeDate)?.start} > ${(visibleDate.value as CalendarRangeDate)?.end}`
        : ""
      : visibleDate.value
        ? String(visibleDate.value)
        : ""
  )
  const baseDate = computed<Date | CalendarRangeDate | undefined>(() => {
    if (calendarPicker.value && calendarPicker.value?.dateParts && calendarPicker.value?.dateParts.length) {
      const dates: Date[] | [] | undefined = calendarPicker.value?.dateParts
        ?.filter((item) => item?.date)
        ?.map((item) => item?.date) as Date[] | []
      if (Array.isArray(dates) && dates.length) {
        if (dates.length === 2) return { start: dates[0], end: dates[1] }
        else if (dates.length === 1) return dates[0]
      } else return undefined
    }
    return undefined
  })
  const fixWindowProps = computed<NonNullable<CalendarProps["fixWindowProps"]>>(() => ({
    position: "bottom-left",
    eventOpen: "click",
    eventClose: "hover",
    marginPx: 5,
    ...options?.fixWindowProps,
    ...props?.fixWindowProps
  }))
  // Триггер `[data-calendar-control]` — ключ `control`, текст даты — `text`, контейнер picker'а — `picker`.
  const classControl = computed(() =>
    cls("control", "w-56 focus:outline-0 focus:ring-0 items-center", "flex min-h-[36px] max-h-16 overflow-auto")
  )
  const classText = computed(() =>
    isRange.value
      ? cls("text", "flex flex-wrap items-center z-10 max-h-max cursor-pointer leading-3")
      : cls(
          "text",
          "border-0 w-full text-left bg-transparent py-1.5 pl-1 cursor-pointer text-surface-900 dark:text-surface-100 placeholder:text-surface-400 placeholder:dark:text-surface-600 focus:ring-0 sm:text-sm sm:leading-6",
          isDisabled.value && "text-surface-500 dark:text-surface-500",
          "block flex-1"
        )
  )
  const classPicker = computed(() =>
    cls(
      "picker",
      "mt-0 w-min min-w-min max-w-lg max-h-max text-base sm:text-sm rounded-md ring-1 ring-black/5 shadow-xl",
      mode.value === "filled" && "border-0 bg-surface-100 dark:bg-surface-900",
      mode.value === "outlined" && "border border-surface-300 dark:border-surface-600 bg-white dark:bg-black",
      mode.value === "underlined" &&
        "rounded-none border-0 border-surface-300 dark:border-surface-700 border-b bg-surface-50 dark:bg-surface-950",
      "vc-primary overflow-auto focus:outline-none"
    )
  )
  const classSeparatorNone = ref(Calendar.setStyle("h-5 w-1"))
  const classPlaceholder = ref(Calendar.setStyle("text-surface-400 dark:text-surface-600"))
  // Hand-off карты классов в InputLayout (dev-patterns §2 C/D): семейные ключи складываются по ключу,
  // aspect `animation` заменяется, `root` уходит отдельным `class`; focus-ring триггера живёт в `base`
  // и гейтится `!isInvalid`, чтобы красная рамка ошибки оставалась видимой.
  const FOCUS_RING = "border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700"
  const layoutClasses = computed(() => ({
    ...mergeClasses(
      { base: "cursor-pointer" },
      fieldsOmit(options?.classes ?? {}, ["root", "animation"]),
      fieldsOmit(props.classes ?? {}, ["root", "animation"]),
      { base: isFocus.value && !isInvalid.value ? FOCUS_RING : undefined }
    ),
    animation: props.classes?.animation ?? options?.classes?.animation
  }))
  const inputLayout = computed<Omit<InputLayoutProps, "value">>(() => ({
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
  // G34: ссылка на КОРНЕВОЙ элемент компонента. Корень Calendar — это `<InputLayout>`, поэтому
  // элемент берётся из его же expose (`inputBody`), а не заводится второй ref на тот же узел.
  // Зеркало `componentTable` у Table и `buttonRef` у Button.
  const componentCalendar = computed<HTMLElement | undefined>(() => layout.value?.inputBody)

  defineExpose({
    //---STATE-------------------------
    layout,
    componentCalendar,
    inputLayout,
    datePickerLink,
    picker,
    calendarPicker,
    isFocus,
    isOpenPicker,
    datePickerOptions,
    value,
    visibleDate,
    // ---PROPS-------------------------------
    id,
    isValue,
    autoFocus,
    isCloseOnSelect,
    isRange,
    mode,
    placeholder,
    isLoading,
    isDisabled,
    isInvalid,
    isClearable,
    messageInvalid,
    separator,
    valueLayout,
    fixWindowProps,
    classControl,
    classText,
    classPicker,
    // ---METHODS-----------------------------
    openCalendar,
    closeCalendar,
    changeDate,
    focus,
    clearDataPicker
  })
  // ---MOUNT-UNMOUNT-----------------------
  // ---Wave 2.3 — drop duplicate Calendar.initStyle() — Component.__hooks() already registers it.
  // ---ISSUE 1 — onBeforeUnmount cleanup for MutationObserver + keydown listeners (memory leak fix).
  onMounted(async () => {
    initDarkModeObserver()
    if (autoFocus.value) openCalendar()
    // ---Wave 2.1 — lazy v-calendar (optional peer): компонент + CSS грузятся на клиенте при mount,
    // не на import-time (SSR-safe, bundle без Calendar не тянет). Отсутствие peer → picker не рендерится.
    try {
      DatePicker.value = (await import("v-calendar")).DatePicker
      import("v-calendar/style.css").catch(() => {})
    } catch {
      /* v-calendar не установлен (optional peer) — picker остаётся нерендеренным */
    }
    // читаем начальный inputValue после того, как picker смонтировался (await nextTick)
    await nextTick()
    visibleDate.value = <CalendarPicker["inputValue"]>(calendarPicker.value?.inputValue as CalendarPicker["inputValue"])
  })
  onBeforeUnmount(() => {
    darkObserver?.disconnect()
    darkObserver = undefined
    if (isClient()) {
      document.removeEventListener("keydown", keydownCalendar)
      document.removeEventListener("keydown", openCalendarOnEnter)
    }
  })
  // ---WATCHERS----------------------------
  watch(calendarPicker, () => emit("ready", calendarPicker.value as CalendarPicker), { deep: true })
  // Issue 11 (calendar.md): inputValue у v-calendar считается не мгновенно после mount — сам
  // DatePicker ещё не успел посчитать форматированную строку/диапазон из modelValue+mask.
  // Раньше синхронизация была через watch(calendarPicker, ..., {deep:true}) с guard'ом
  // "visibleDate.value == null" — не работало по двум причинам: (а) onMounted-read (L268-271)
  // успевает присвоить visibleDate ДО того, как v-calendar досчитает значение, присваивая уже
  // непустой объект (`{start:"",end:""}` в range-режиме) — после этого guard навсегда false;
  // (б) deep-watch на весь calendarPicker-инстанс срабатывает только один раз, при первом
  // появлении самого рефа, и не видит последующих внутренних изменений inputValue у v-calendar.
  // watch на геттер конкретно inputValue решает оба: триггерится на каждое его реальное
  // изменение, а guard — "значение непустое", а не "visibleDate ещё не выставлен".
  const hasInputValue = (v: CalendarPicker["inputValue"] | undefined) =>
    typeof v === "string"
      ? v !== ""
      : !!(v as Partial<CalendarRangeValue>)?.start || !!(v as Partial<CalendarRangeValue>)?.end
  watch(
    () => calendarPicker.value?.inputValue as CalendarPicker["inputValue"] | undefined,
    (inputValue) => {
      if (calendarPicker.value && hasInputValue(inputValue)) {
        visibleDate.value = inputValue as CalendarPicker["inputValue"]
      }
    },
    { deep: true }
  )
  watch(isOpenPicker, (value) => {
    if (!isClient()) return
    if (value) document.addEventListener("keydown", keydownCalendar)
    else document.removeEventListener("keydown", keydownCalendar)
    focus(value)
    emit("active", value)
  })
  watch(isFocus, (value) => {
    if (!isClient()) return
    if (value) document.addEventListener("keydown", openCalendarOnEnter)
    else document.removeEventListener("keydown", openCalendarOnEnter)
  })

  // ---METHODS-----------------------------
  function keydownCalendar(event: KeyboardEvent) {
    if (["Escape", "Esc"].includes(event.key)) isOpenPicker.value = false
  }

  function openCalendarOnEnter(event: KeyboardEvent) {
    if (event.key === "Enter") openCalendar()
  }

  function openCalendar() {
    if (isDisabled.value) return
    isOpenPicker.value = true
  }

  function closeCalendar(event?: MouseEvent) {
    if (isDisabled.value) return
    if (event) {
      if ((isOpenPicker.value ?? false) && ((datePickerLink.value ?? false) || (picker.value ?? false)))
        isOpenPicker.value =
          event.composedPath().includes(datePickerLink.value as HTMLElement) ||
          event.composedPath().includes(picker.value as HTMLElement)
    } else isOpenPicker.value = false
  }

  // ---------------------------------------
  function changeDate(date: CalendarPicker["inputValue"]) {
    visibleDate.value = date
    if (isCloseOnSelect.value) isOpenPicker.value = false
    emit("update:invalid", false)
    emit("update:modelValue", baseDate.value)
    emit("change:modelValue", baseDate.value)
  }

  function focus(focus: boolean = true) {
    isFocus.value = focus
  }

  function clearDataPicker() {
    value.value = undefined
    if (isCloseOnSelect.value) isOpenPicker.value = false
    emit("update:invalid", false)
    emit("update:modelValue", null)
    emit("change:modelValue", null)
  }

  function initDarkModeObserver() {
    const selector = FishtV?.config.optionsTheme?.darkModeSelector ?? ""
    if (!selector || !isClient()) return

    const checkDarkMode = () => (isDark.value = !!document.querySelector(selector))
    checkDarkMode()
    // eslint-disable-next-line no-undef
    darkObserver = new MutationObserver(checkDarkMode)
    darkObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
      subtree: true
    })
  }
</script>

<template>
  <!-- Корень Calendar — корень InputLayout: `data-calendar` падает на него fallthrough-атрибутом -->
  <InputLayout data-calendar ref="layout" :value="valueLayout" v-bind="inputLayout" @clear="clearDataPicker">
    <template #default="{ id: fieldId, labelledby }">
      <div
        ref="datePickerLink"
        :id="fieldId"
        :aria-labelledby="labelledby"
        data-calendar-control
        tabindex="0"
        :class="classControl"
        @focusin="focus(true)"
        @focusout="focus(false)"
        @click="openCalendar">
        <div v-if="isRange" data-calendar-text :class="classText">
          {{ (visibleDate as CalendarRangeValue)?.start }}
          <Icons
            v-if="
              separator === 'arrow' &&
              (visibleDate as CalendarRangeValue)?.start &&
              (visibleDate as CalendarRangeValue)?.end
            "
            type="ArrowLongRight"
            :class="[
              isDisabled ? 'text-surface-500 dark:text-surface-500' : 'text-surface-400 dark:text-surface-400',
              'mx-1'
            ]" />
          <Icons
            v-if="
              separator === 'points' &&
              (visibleDate as CalendarRangeValue)?.start &&
              (visibleDate as CalendarRangeValue)?.end
            "
            type="EllipsisVertical"
            :class="[
              isDisabled ? 'text-surface-500 dark:text-surface-500' : 'text-surface-600 dark:text-surface-400'
            ]" />
          <div
            v-if="
              separator === 'none' &&
              (visibleDate as CalendarRangeValue)?.start &&
              (visibleDate as CalendarRangeValue)?.end
            "
            :class="classSeparatorNone" />
          <div
            v-if="
              !(visibleDate as CalendarRangeValue)?.start && !(visibleDate as CalendarRangeValue)?.end && isOpenPicker
            "
            :class="classPlaceholder">
            {{ placeholder }}
          </div>
          {{ (visibleDate as CalendarRangeValue)?.end }}
        </div>
        <div v-else data-calendar-text :class="classText">
          <span v-if="!visibleDate && isOpenPicker" :class="classPlaceholder">{{ placeholder }}</span>
          {{ visibleDate }}
        </div>
      </div>
    </template>
    <template #body>
      <FixWindow
        v-bind="fixWindowProps"
        :model-value="isOpenPicker"
        class-body="z-30"
        class="px-0 rounded-[0.4rem]"
        @close="(env) => closeCalendar(env)">
        <div data-calendar-picker ref="picker" :class="classPicker">
          <component
            :is="DatePicker"
            v-if="DatePicker && isRange"
            v-model.range.string="value"
            v-bind="fieldsOmit(datePickerOptions, ['isRange', 'locale'])"
            ref="calendarPicker"
            :is-dark="isDark"
            :locale="locale"
            class="vc-primary"
            @update:modelValue="changeDate">
            <template #footer>
              <slot name="footerPicker" />
            </template>
          </component>
          <component
            :is="DatePicker"
            v-else-if="DatePicker"
            v-model.string="value"
            v-bind="fieldsOmit(datePickerOptions, ['isRange', 'locale'])"
            :is-dark="isDark"
            :locale="locale"
            ref="calendarPicker"
            class="vc-primary"
            @update:modelValue="changeDate">
            <template #footer>
              <slot name="footerPicker" />
            </template>
          </component>
        </div>
      </FixWindow>
      <slot />
    </template>
    <template #before>
      <slot v-if="slots.before" name="before" />
    </template>
    <template #after>
      <slot v-if="slots.after" name="after" />
    </template>
  </InputLayout>
</template>
<style scoped>
  :root {
    --theme: var(--theme);
    --theme-contrast: var(--theme-contrast);
  }

  :deep(.vc-container.vc-light) {
    --vc-focus-ring: 0 0 0 2px hsla(var(--theme), var(--theme-contrast), 94.4%, 0.4);
  }

  :deep(.vc-container.vc-dark) {
    --vc-focus-ring: 0 0 0 2px hsla(var(--theme), var(--theme-contrast), 9.2%, 0.4);
  }

  :deep(.vc-primary) {
    --vc-accent-50: hsla(var(--theme) var(--theme-contrast) 95.1%);
    --vc-accent-100: hsla(var(--theme) var(--theme-contrast) 93.1%);
    --vc-accent-200: hsla(var(--theme) var(--theme-contrast) 86%);
    --vc-accent-300: hsla(var(--theme) var(--theme-contrast) 74.4%);
    --vc-accent-400: hsla(var(--theme) var(--theme-contrast) 60.1%);
    --vc-accent-500: hsla(var(--theme) var(--theme-contrast) 46.9%);
    --vc-accent-600: hsla(var(--theme) var(--theme-contrast) 39.5%);
    --vc-accent-700: hsla(var(--theme) var(--theme-contrast) 30.5%);
    --vc-accent-800: hsla(var(--theme) var(--theme-contrast) 20.5%);
    --vc-accent-900: hsla(var(--theme) var(--theme-contrast) 9.2%);
  }
</style>

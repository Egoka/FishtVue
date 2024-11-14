<script setup lang="ts">
  import { computed, getCurrentInstance, ref, watch, onMounted, useSlots } from "vue"
  import type {
    CalendarProps,
    CalendarEmits,
    CalendarExpose,
    IParamsDatePicker,
    ICalendarPicker,
    IRangeValue,
    IRangeDate
  } from "./Calendar"
  import { InputLayoutExpose, InputLayoutProps } from "fishtvue/inputlayout"
  import { DatePicker } from "v-calendar"
  import "v-calendar/style.css"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
  // ---BASE-COMPONENT----------------------
  const Calendar = new Component<"Calendar">()
  const options = Calendar.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<CalendarProps>()
  const emit = defineEmits<CalendarEmits>()
  const slots = useSlots()
  // ---REF-LINK----------------------------
  const layout = ref<InputLayoutExpose>()
  const dataPicker = ref<HTMLElement>()
  const picker = ref<HTMLElement>()
  // ---STATE-------------------------------
  const isFocus = ref<boolean>(false)
  const isOpenPicker = ref<boolean>(false)
  const datePicker = computed<Partial<IParamsDatePicker>>(() => ({
    borderless: true,
    transparent: true,
    color: "theme",
    isDark: "system",
    expanded: true,
    trimWeeks: true,
    masks: {
      modelValue: props.paramsDatePicker?.mask ?? "DD MMMM YYYY",
      input: [props.paramsDatePicker?.mask ?? "DD MMMM YYYY"]
    },
    ...options?.paramsDatePicker,
    ...props.paramsDatePicker
  }))
  const calendarPicker = ref<ICalendarPicker>()
  const classLayout = ref<CalendarProps["class"]>()
  const value = ref<CalendarProps["modelValue"]>()
  const visibleDate = ref<ICalendarPicker["inputValue"]>()
  watch(
    () => props.modelValue,
    (modelValue) => {
      value.value =
        !!(modelValue as Partial<IRangeValue>)?.start && !!(modelValue as Partial<IRangeValue>)?.end
          ? props.paramsDatePicker?.isRange
            ? modelValue
            : null
          : !props.paramsDatePicker?.isRange
            ? (modelValue ?? "")
            : { start: null, end: null }
    },
    { immediate: true }
  )
  // ---PROPS-------------------------------
  const id = ref<NonNullable<CalendarProps["id"]>>(String(String(props.id ?? getCurrentInstance()?.uid)))
  const isValue = computed<boolean>(() => {
    if (props.paramsDatePicker?.isRange) {
      return (
        (!!(visibleDate.value as Partial<IRangeValue>)?.start && !!(visibleDate.value as Partial<IRangeValue>)?.end) ||
        isOpenPicker.value
      )
    } else {
      return !!visibleDate.value || isOpenPicker.value
    }
  })
  const autoFocus = computed<NonNullable<CalendarProps["autoFocus"]>>(
    () => props?.autoFocus ?? options?.autoFocus ?? false
  )
  const isNotCloseOnDateChange = computed<NonNullable<CalendarProps["isNotCloseOnDateChange"]>>(
    () => props?.isNotCloseOnDateChange ?? options?.isNotCloseOnDateChange ?? false
  )
  const mode = computed<NonNullable<CalendarProps["mode"]>>(() => props.mode ?? options?.mode ?? "outlined")
  const placeholder = computed<IParamsDatePicker["placeholder"]>(() =>
    String(props.paramsDatePicker?.placeholder ?? "")
  )
  const isLoading = computed<NonNullable<CalendarProps["loading"]>>(() => props.loading ?? false)
  const isDisabled = computed<NonNullable<CalendarProps["disabled"]>>(() => props.disabled ?? false)
  const isInvalid = computed<NonNullable<CalendarProps["isInvalid"]>>(() =>
    !isDisabled.value ? props.isInvalid : false
  )
  const messageInvalid = computed<NonNullable<CalendarProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  const separator = computed<NonNullable<IParamsDatePicker["separator"]>>(
    () => props.paramsDatePicker?.separator ?? "arrow"
  )
  const valueLayout = computed<string>(() =>
    datePicker.value?.isRange
      ? (visibleDate.value as IRangeDate)?.start && (visibleDate.value as IRangeDate)?.end
        ? `${(visibleDate.value as IRangeDate)?.start} > ${(visibleDate.value as IRangeDate)?.end}`
        : ""
      : visibleDate.value
        ? String(visibleDate.value)
        : ""
  )
  const baseDate = computed<Date | IRangeDate | undefined>(() => {
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
  const paramsFixWindow = computed<NonNullable<CalendarProps["paramsFixWindow"]>>(() => ({
    position: "bottom-left",
    eventOpen: "click",
    eventClose: "hover",
    marginPx: 5,
    ...options?.paramsFixWindow,
    ...props?.paramsFixWindow
  }))
  const classDataPicker = computed(() =>
    Calendar.setStyle([
      "w-full focus:outline-0 focus:ring-0 items-center",
      options?.classDataPicker ?? "",
      props?.classDataPicker ?? "",
      "flex min-h-[36px] max-h-16 overflow-auto"
    ])
  )
  const classDateText = computed(() =>
    datePicker.value?.isRange
      ? Calendar.setStyle([
          options?.classDateText ?? "",
          props?.classDateText ?? "",
          "flex flex-wrap items-center z-10 max-h-max cursor-pointer leading-3"
        ])
      : Calendar.setStyle([
          "border-0 w-full text-left bg-transparent py-1.5 pl-1 cursor-pointer text-gray-900 dark:text-gray-100 placeholder:text-gray-400 placeholder:dark:text-gray-600 focus:ring-0 sm:text-sm sm:leading-6",
          options?.classDateText ?? "",
          props?.classDateText ?? "",
          isDisabled.value ? "text-slate-500 dark:text-slate-500" : "",
          "block flex-1"
        ])
  )
  const classPicker = computed(() =>
    Calendar.setStyle([
      "mt-1 w-min min-w-min max-w-lg max-h-max text-base sm:text-sm rounded-md ring-1 ring-black/5 shadow-xl",
      mode.value === "filled"
        ? "border-0 bg-stone-100 dark:bg-stone-900"
        : mode.value === "outlined"
          ? "border border-gray-300 dark:border-gray-600 bg-white dark:bg-black"
          : mode.value === "underlined"
            ? "rounded-none border-0 border-gray-300 dark:border-gray-700 border-b bg-stone-50 dark:bg-stone-950"
            : "",
      options?.classPicker ?? "",
      props?.classPicker ?? "",
      "vc-primary overflow-auto focus:outline-none"
    ])
  )
  const classSeparatorNone = ref(Calendar.setStyle("h-5 w-1"))
  const classPlaceholder = ref(Calendar.setStyle("text-gray-400 dark:text-gray-600"))
  const inputLayout = computed<Omit<InputLayoutProps, "value">>(() => ({
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
    classBody: props.classBody,
    class: props.class
  }))
  // ---EXPOSE------------------------------
  defineExpose<CalendarExpose>({
    //---STATE-------------------------
    layout,
    inputLayout,
    dataPicker,
    picker,
    calendarPicker,
    isFocus,
    isOpenPicker,
    datePicker,
    value,
    visibleDate,
    // ---PROPS-------------------------------
    id,
    isValue,
    autoFocus,
    isNotCloseOnDateChange,
    mode,
    placeholder,
    isLoading,
    isDisabled,
    isInvalid,
    messageInvalid,
    separator,
    valueLayout,
    paramsFixWindow,
    classLayout,
    classDataPicker,
    classDateText,
    classPicker,
    // ---METHODS-----------------------------
    openCalendar,
    closeCalendar,
    changeDate,
    focus,
    clearDataPicker
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Calendar.initStyle()
    if (autoFocus.value) openCalendar()
    setTimeout(() => {
      visibleDate.value = <ICalendarPicker["inputValue"]>(
        (calendarPicker.value?.inputValue as ICalendarPicker["inputValue"])
      )
    }, 1)
  })
  // ---WATCHERS----------------------------
  watch(calendarPicker, () => emit("getCalendar", calendarPicker.value as ICalendarPicker), { deep: true })
  watch(isOpenPicker, (value) => {
    if (value) document.addEventListener("keydown", keydownCalendar)
    else document.removeEventListener("keydown", keydownCalendar)
    focus(value)
    emit("isActive", value)
  })
  watch(isFocus, (value) => {
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

  function closeCalendar(evt?: MouseEvent) {
    if (isDisabled.value) return
    if (evt) {
      if ((isOpenPicker.value ?? false) && ((dataPicker.value ?? false) || (picker.value ?? false)))
        isOpenPicker.value =
          evt.composedPath().includes(dataPicker.value as HTMLElement) ||
          evt.composedPath().includes(picker.value as HTMLElement)
    } else isOpenPicker.value = false
  }

  // ---------------------------------------
  function changeDate(date: ICalendarPicker["inputValue"]) {
    visibleDate.value = date
    if (!isNotCloseOnDateChange.value) {
      // isOpenPicker.value = false
    }
    emit("update:isInvalid", false)
    emit("update:modelValue", baseDate.value)
    emit("change:modelValue", baseDate.value)
  }

  function focus(focus: boolean = true) {
    isFocus.value = focus
    classLayout.value =
      (props.class ?? options?.class ?? "cursor-pointer") +
      (isFocus.value
        ? " border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700"
        : "")
  }

  function clearDataPicker() {
    isOpenPicker.value = false
    emit("update:isInvalid", false)
    emit("update:modelValue", null)
    emit("change:modelValue", null)
  }
</script>

<template>
  <InputLayout ref="layout" :value="valueLayout" :class="classLayout" v-bind="inputLayout" @clear="clearDataPicker">
    <div
      ref="dataPicker"
      :id="id"
      tabindex="0"
      :class="classDataPicker"
      @focusin="focus(true)"
      @focusout="focus(false)"
      @click="openCalendar">
      <div v-if="datePicker?.isRange" :class="classDateText">
        {{ (visibleDate as IRangeValue)?.start }}
        <Icons
          v-if="separator === 'arrow' && (visibleDate as IRangeValue)?.start && (visibleDate as IRangeValue)?.end"
          type="ArrowLongRight"
          :class="[isDisabled ? 'text-slate-500 dark:text-slate-500' : 'text-gray-400 dark:text-gray-400', 'mx-1']" />
        <Icons
          v-if="separator === 'points' && (visibleDate as IRangeValue)?.start && (visibleDate as IRangeValue)?.end"
          type="EllipsisVertical"
          :class="[isDisabled ? 'text-slate-500 dark:text-slate-500' : 'text-gray-600 dark:text-gray-400']" />
        <div
          v-if="separator === 'none' && (visibleDate as IRangeValue)?.start && (visibleDate as IRangeValue)?.end"
          :class="classSeparatorNone" />
        <div
          v-if="!(visibleDate as IRangeValue)?.start && !(visibleDate as IRangeValue)?.end && isOpenPicker"
          :class="classPlaceholder">
          {{ placeholder }}
        </div>
        {{ (visibleDate as IRangeValue)?.end }}
      </div>
      <div v-else :class="classDateText">
        <span v-if="!visibleDate && isOpenPicker" :class="classPlaceholder">{{ placeholder }}</span>
        {{ visibleDate }}
      </div>
    </div>
    <template #body>
      <FixWindow
        v-bind="paramsFixWindow"
        :model-value="isOpenPicker"
        class-body="z-30"
        @close="(env) => closeCalendar(env)">
        <div ref="picker" :class="classPicker">
          <DatePicker
            v-if="datePicker?.isRange"
            v-model.range.string="value"
            v-bind="fieldsOmit(datePicker, ['isRange'])"
            ref="calendarPicker"
            class="vc-primary"
            @update:modelValue="changeDate">
            <template #footer>
              <slot name="footerPicker" />
            </template>
          </DatePicker>
          <DatePicker
            v-else
            v-model.string="value"
            v-bind="fieldsOmit(datePicker, ['isRange'])"
            ref="calendarPicker"
            class="vc-primary"
            @update:modelValue="changeDate">
            <template #footer>
              <slot name="footerPicker" />
            </template>
          </DatePicker>
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

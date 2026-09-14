import { VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor, StyleMode } from "../types"
import { InputLayoutClassKey, InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
import { ColorName } from "fishtvue/theme"
import { FixWindowProps } from "fishtvue/fixwindow"
import Locale from "v-calendar/dist/types/src/utils/locale"
import { Theme } from "v-calendar/dist/types/src/utils/theme"
import { DateRange } from "v-calendar/dist/types/src/utils/date/range"
import { Attribute } from "v-calendar/dist/types/src/utils/attribute"
import { LocaleConfig } from "v-calendar/src/utils/locale"
import { DateRangeSource } from "v-calendar/src/utils/date/range"
import { DateRepeatConfig } from "v-calendar/dist/types/src/utils/date/repeat"
import { CalendarDay } from "v-calendar/dist/types/src/utils/page"
import { UpdateOptions, ValueTarget } from "v-calendar/dist/types/src/use/datePicker"
import { MoveOptions, MoveTarget } from "v-calendar/dist/types/src/use/calendar"
import { DateParts, DatePartsRules } from "v-calendar/dist/types/src/utils/date/helpers"
import { PopoverEventHandlers, PopoverOptions } from "v-calendar/dist/types/src/utils/popovers"
import { DateSource, SimpleDateParts } from "v-calendar/src/utils/date/helpers"
import { PopoverVisibility } from "v-calendar/src/utils/popovers"
import { Placement } from "@popperjs/core"

/**
 * ## Calendar
 *
 * Calendar - a component for selecting single or range dates with advanced customization options.
 *
 * Supports flexible configurations, various styles, and emits events for date changes and interactions.
 */
declare class Calendar extends ClassComponent<CalendarProps, CalendarSlots, CalendarEmits, CalendarExpose> {}

// ---------------------------------------
type DateValueCalendar = Date | number | string | null
// https://vcalendar.io/i18n/masks.html
export type CalendarMask =
  | "M"
  | "MM"
  | "MMM"
  | "MMMM" //Month
  | "D"
  | "DD"
  | "Do" //Month Day
  | "d"
  | "dd"
  | "W"
  | "WW"
  | "WWW"
  | "WWWW" //Week Day
  | "YY"
  | "YYYY" //Year
  | "h"
  | "hh"
  | "H"
  | "HH" //Hour
  | "m"
  | "mm" //Minute
  | "s"
  | "ss" //Second
  | "S"
  | "SS"
  | "SSS" //Fractional Second
  | "A"
  | "a" //AM/PM
  | "ZZ"
  | "ZZZ"
  | "ZZZZ" //Timezone
  | "L" //Localized Date
  | "DD MMMM YYYY"
  | "DD.MM.YYYY"
  | "YYYY/MM/DD"
  | string
export type ColorCalendarPicker = ColorName

export interface CalendarRangeDate {
  start: Date | string
  end: Date | string
}

export interface Profile<T> {
  start: T
  base: T
  end: T
  startEnd?: T
}

export interface Glyph {
  key: string | number
  color: string
  class: string | any[]
  style: Record<string, any>
}

export type Content = Glyph
export type ContentConfig = string | Partial<Content | Profile<Partial<Content>>>

export type DatePickerDate = DateSource | Partial<SimpleDateParts> | null
export type DatePickerRangeObject = {
  start: Exclude<DatePickerDate, null>
  end: Exclude<DatePickerDate, null>
}
export type DatePickerModel = DatePickerDate | DatePickerRangeObject

export type HighlightFillMode = "solid" | "light" | "outline"
export interface Highlight extends Glyph {
  fillMode: HighlightFillMode
  wrapperClass: string | any[]
  contentClass: string | any[]
  contentStyle: Record<string, any>
}
export type HighlightConfig = boolean | string | Partial<Highlight | Profile<Partial<Highlight>>>

// Dots
export type Dot = Glyph
export type DotConfig = boolean | string | Partial<Dot | Profile<Partial<Dot>>>

// Bars
export type Bar = Glyph
export type BarConfig = boolean | string | Partial<Bar | Profile<Partial<Bar>>>

export type EventConfig = Partial<{
  label: string
}>

export type PopoverConfig = Partial<{
  label: string
  visibility: PopoverVisibility
  placement: Placement
  hideIndicator: boolean
  isInteractive: boolean
}>

export type AttributeConfig = Partial<{
  key: string | number
  hashcode: string
  content: ContentConfig
  highlight: HighlightConfig
  dot: DotConfig
  bar: BarConfig
  popover: PopoverConfig
  event: EventConfig
  dates: DateRangeSource[]
  customData: any
  order: number
  pinPage: boolean
}>

export interface CalendarPicker {
  showCalendar: boolean
  datePickerPopoverId: string
  popoverRef: any
  popoverEvents: Partial<PopoverEventHandlers>
  calendarRef: any
  isRange: boolean
  isTimeMode: boolean
  isDateTimeMode: boolean
  is24hr: boolean
  hideTimeHeader: boolean
  timeAccuracy: number
  isDragging: boolean
  inputValue: string | CalendarRangeDate
  inputEvents:
    | {
        click?: ((e: MouseEvent) => void) | undefined
        mousemove?: ((e: MouseEvent) => void) | undefined
        mouseleave?: ((e: MouseEvent) => void) | undefined
        focusin?: ((e: MouseEvent) => void) | undefined
        focusout?: ((e: MouseEvent) => void) | undefined
        input: (e: InputEvent) => void
        change: (e: InputEvent) => void
        keyup: (e: KeyboardEvent) => void
      }
    | {
        start: {
          click?: ((e: MouseEvent) => void) | undefined
          mousemove?: ((e: MouseEvent) => void) | undefined
          mouseleave?: ((e: MouseEvent) => void) | undefined
          focusin?: ((e: MouseEvent) => void) | undefined
          focusout?: ((e: MouseEvent) => void) | undefined
          input: (e: InputEvent) => void
          change: (e: InputEvent) => void
          keyup: (e: KeyboardEvent) => void
        }
        end: {
          click?: ((e: MouseEvent) => void) | undefined
          mousemove?: ((e: MouseEvent) => void) | undefined
          mouseleave?: ((e: MouseEvent) => void) | undefined
          focusin?: ((e: MouseEvent) => void) | undefined
          focusout?: ((e: MouseEvent) => void) | undefined
          input: (e: InputEvent) => void
          change: (e: InputEvent) => void
          keyup: (e: KeyboardEvent) => void
        }
      }
  dateParts: (DateParts | null)[]
  attributes: any[]
  rules: DatePartsRules[]
  move: (target: MoveTarget, opts?: Partial<MoveOptions>) => Promise<any>
  moveBy: (pages: number, opts?: Partial<MoveOptions>) => Promise<any>
  moveToValue: (target: ValueTarget, opts?: Partial<MoveOptions>) => Promise<any>
  updateValue: (
    value: any,
    opts?: Partial<UpdateOptions>
  ) => Promise<
    | string
    | number
    | Date
    | DateParts
    | {
        start: string | number | Date | DateParts | null
        end: string | number | Date | DateParts | null
      }
    | null
  >
  showPopover: (opts?: Partial<PopoverOptions>) => void
  hidePopover: (opts?: Partial<PopoverOptions>) => void
  togglePopover: (opts: Partial<PopoverOptions>) => void
  onDayClick: (day: CalendarDay, event: MouseEvent) => void
  onDayKeydown: (day: CalendarDay, event: KeyboardEvent) => void
  onDayMouseEnter: (day: CalendarDay, event: MouseEvent) => void
  onPopoverBeforeShow: (el: HTMLElement) => void
  onPopoverAfterShow: (el: HTMLElement) => void
  onPopoverBeforeHide: (el: HTMLElement) => void
  onPopoverAfterHide: (el: HTMLElement) => void
  color: string
  isDark: boolean | "system"
  displayMode: "light" | "dark"
  theme: Theme
  locale: Locale
  masks: any
  disabledDates: DateRange[]
  disabledAttribute: Attribute
}

export interface CalendarMasks {
  title?: string
  weekdays?: string
  navMonths?: string
  dayPopover?: string
  data?: Array<string>
  modelValue?: CalendarMask
  input?: Array<CalendarMask>
}

interface CalendarAttributeConfig extends Omit<Partial<AttributeConfig>, "dates"> {
  dates: DateRangeSource | DateRangeSource[]
}

export interface SimpleDateRange {
  start: Date
  end: Date
}

export interface CalendarRangeValue {
  start: DateValueCalendar
  end: DateValueCalendar
  span: number
  order: number
  repeat: Partial<DateRepeatConfig>
}

export interface DatePickerProps {
  ///Calendar//////////////////////
  borderless: boolean
  transparent: boolean
  color: ColorCalendarPicker
  isDark: boolean | "system"
  expanded: boolean
  titlePosition: "center" | "left" | "right"
  view: "daily" | "weekly" | "monthly"
  showWeeknumbers: "left" | "left-outside" | "right" | "right-outside"
  trimWeeks: boolean
  rows: number
  columns: number
  step: number
  minDate: Date | string | null
  maxDate: Date | string | null
  popover: Partial<PopoverOptions>
  attributes: Partial<CalendarAttributeConfig>[]
  ///DatePicker//////////////////////
  mode: "date" | "dateTime" | "time"
  isRequired: boolean
  is24hr: boolean
  mask: CalendarMask
  masks: CalendarMasks
  disabledDates: DateRangeSource | DateRangeSource[]
  selectAttribute: Partial<CalendarAttributeConfig>
  rules: "auto" | DatePartsRules
  locale: string | Partial<LocaleConfig>
  timezone: "UTC" | string
  placeholder: string
  separator: "arrow" | "points" | "none"
}

/**
 * Ключи карты `classes` (dev-patterns §2 B): семейные `InputLayoutClassKey` плюс собственные.
 * `root` — корень `<InputLayout data-calendar>`.
 * - `control` — триггер `<div data-calendar-control>` (бывший `classDataPicker`).
 * - `text` — текст выбранной даты `[data-calendar-text]` (бывший `classDateText`).
 * - `picker` — контейнер v-calendar `[data-calendar-picker]` (бывший `classPicker`).
 */
export declare type CalendarClassKey = InputLayoutClassKey | "control" | "text" | "picker"

export declare type BaseCalendarProps = {
  /**
   * Props, пробрасываемые во внутренний `<DatePicker>` (v-calendar): формат, локаль, атрибуты и т.д.
   * (бывший `paramsDatePicker`). Диапазон включается отдельным top-level prop'ом `range`.
   * @type {Partial<DatePickerProps> | undefined}
   */
  datePickerProps?: Partial<DatePickerProps>

  /**
   * Режим диапазона дат (`start`/`end`) вместо одиночной даты. Бывший `datePickerProps.isRange`:
   * вынесен наверх, потому что определяет и модель (`modelValue`), и разметку триггера.
   * @type {boolean | undefined}
   */
  range?: boolean

  /**
   * Automatically focuses the calendar input on mount.
   * @type {boolean | undefined}
   */
  autoFocus?: boolean

  /**
   * Закрывать picker при выборе даты. Default `true` (бывший инвертированный `isNotCloseOnDateChange`).
   * Резолвится `props ?? componentsOptions.Calendar.closeOnSelect ?? true`.
   * @type {boolean | undefined}
   */
  closeOnSelect?: boolean

  /**
   * Props, пробрасываемые в `FixWindow` дропдауна picker'а (бывший `paramsFixWindow`).
   * @type {FixWindowProps | undefined}
   */
  fixWindowProps?: FixWindowProps
}

/**
 * Props for the Calendar component.
 */
export interface CalendarProps
  extends Omit<InputLayoutProps, "value" | "hasValue" | "classes">, Partial<BaseCalendarProps> {
  /**
   * The unique identifier for the calendar component.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The current value of the calendar, can be a single date or a date range.
   * @type {DateValueCalendar | Partial<CalendarRangeValue>}
   */
  modelValue?: DatePickerModel | undefined //DateValueCalendar | Partial<CalendarRangeValue>

  /**
   * Карта классов внутренних элементов: семейные ключи уходят в `InputLayout`, `control`/`text`/`picker` —
   * триггер, текст даты и контейнер picker'а; `root` ≡ `class`. См. `CalendarClassKey`.
   * @type {ClassesMap<CalendarClassKey> | undefined}
   */
  classes?: ClassesMap<CalendarClassKey>
}

export declare type CalendarSlots = {
  footerPicker(): VNode[]
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
/**
 * Events emitted by the Calendar component.
 */
export declare type CalendarEmits = {
  /**
   * v-model-канал prop'а `invalid`: выбор даты сбрасывает ошибку — payload всегда `false`.
   * @param event
   * @param {boolean} payload - The invalid state.
   */
  (event: "update:invalid", payload: boolean): void

  /**
   * Emitted when the `modelValue` is updated.
   * @param event
   * @param {CalendarProps["modelValue"]} payload - The updated value.
   */
  (event: "update:modelValue", payload: CalendarProps["modelValue"]): void

  /**
   * Emitted when the `modelValue` changes.
   * @param event
   * @param {CalendarProps["modelValue"]} payload - The changed value.
   */
  (event: "change:modelValue", payload: CalendarProps["modelValue"]): void

  /**
   * Инстанс v-calendar picker'а готов (бывший `getCalendar`).
   * @param event
   * @param {CalendarPicker} payload - The calendar picker instance.
   */
  (event: "ready", payload: CalendarPicker): void

  /**
   * Открыт ли picker (бывший `isActive`).
   * @param event
   * @param {boolean} payload - Indicates if the calendar is active.
   */
  (event: "active", payload: boolean): void
}

/**
 * Methods and states exposed via `ref` for the Calendar component.
 */
export declare type CalendarExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the layout state of the input field.
   * @type {InputLayoutExpose | undefined}
   */
  layout: InputLayoutExpose | undefined

  /**
   * Reference to the component's ROOT element (G34).
   *
   * The root of Calendar is `<InputLayout>`, so the element is taken from its own expose
   * (`inputBody`) rather than duplicating a ref on the same node. Mirrors `componentTable`
   * on Table and `buttonRef` on Button.
   * @type {HTMLElement | undefined}
   */
  componentCalendar: HTMLElement | undefined

  /**
   * Reference to the input layout properties.
   * @type {Omit<InputLayoutProps, "value">}
   */
  inputLayout: Omit<InputLayoutProps, "value">

  /**
   * Reference to the data picker HTML element.
   * @type {HTMLElement | undefined}
   */
  datePickerLink: HTMLElement | undefined

  /**
   * Reference to the calendar picker HTML element.
   * @type {HTMLElement | undefined}
   */
  picker: HTMLElement | undefined

  /**
   * Instance of the calendar picker.
   * @type {CalendarPicker | undefined}
   */
  calendarPicker: CalendarPicker | undefined

  /**
   * Indicates if the calendar input is focused.
   * @type {boolean}
   */
  isFocus: boolean

  /**
   * Indicates if the calendar picker is open.
   * @type {boolean}
   */
  isOpenPicker: boolean

  /**
   * Resolved props внутреннего `<DatePicker>` (defaults + options + props + `isRange` из `range`).
   * @type {Partial<DatePickerProps> & { isRange: boolean }}
   */
  datePickerOptions: Partial<DatePickerProps> & { isRange: boolean }

  /**
   * Current value of the calendar.
   * @type {CalendarProps["modelValue"]}
   */
  value: CalendarProps["modelValue"]

  /**
   * The currently visible date in the picker.
   * @type {CalendarPicker["inputValue"] | undefined}
   */
  visibleDate: CalendarPicker["inputValue"] | undefined

  // ---PROPS-------------------------------
  /**
   * Current `id` value for the calendar component.
   * @type {CalendarProps["id"]}
   */
  id: CalendarProps["id"]

  /**
   * Indicates whether the calendar has a value.
   * @type {boolean}
   */
  isValue: boolean

  /**
   * Indicates if autofocus is enabled.
   * @type {CalendarProps["autoFocus"]}
   */
  autoFocus: CalendarProps["autoFocus"]

  /**
   * Закрывается ли picker при выборе даты (resolved `closeOnSelect`, default `true`).
   * @type {boolean}
   */
  isCloseOnSelect: boolean

  /**
   * Режим диапазона (resolved `range`).
   * @type {boolean}
   */
  isRange: boolean

  /**
   * The current styling mode of the editor.
   * @type {StyleMode}
   */
  mode: StyleMode

  /**
   * Placeholder text for the input field.
   * @type {DatePickerProps["placeholder"] | undefined}
   */
  placeholder: DatePickerProps["placeholder"] | undefined

  /**
   * Indicates if the calendar is in a loading state.
   * @type {CalendarProps["loading"]}
   */
  isLoading: CalendarProps["loading"]

  /**
   * Indicates if the calendar is disabled.
   * @type {CalendarProps["disabled"]}
   */
  isDisabled: CalendarProps["disabled"]

  /**
   * Indicates if the calendar is invalid (resolved `invalid`, `false` при `disabled`).
   * @type {boolean}
   */
  isInvalid: boolean

  /**
   * Показывается ли кнопка очистки (resolved `clearable`: props → options → `false`).
   * @type {boolean}
   */
  isClearable: boolean

  /**
   * Validation message for the calendar input.
   * @type {CalendarProps["messageInvalid"]}
   */
  messageInvalid: CalendarProps["messageInvalid"]

  /**
   * Separator character for date ranges.
   * @type {DatePickerProps["separator"] | undefined}
   */
  separator: DatePickerProps["separator"] | undefined

  /**
   * Current layout value.
   * @type {string}
   */
  valueLayout: string

  /**
   * Resolved props дропдауна picker'а.
   * @type {NonNullable<CalendarProps["fixWindowProps"]>}
   */
  fixWindowProps: NonNullable<CalendarProps["fixWindowProps"]>

  /**
   * Итоговый класс триггера `[data-calendar-control]` (база + `classes.control`).
   * @type {string}
   */
  classControl: string

  /**
   * Итоговый класс текста даты `[data-calendar-text]` (база + `classes.text`).
   * @type {string}
   */
  classText: string

  /**
   * Итоговый класс контейнера picker'а `[data-calendar-picker]` (база + mode + `classes.picker`).
   * @type {string}
   */
  classPicker: string

  // ---METHODS-----------------------
  /**
   * Opens the calendar picker.
   */
  openCalendar(): void

  /**
   * Closes the calendar picker.
   * @param {MouseEvent | undefined} event - The event that triggered the action.
   */
  closeCalendar(event?: MouseEvent): void

  /**
   * Changes the selected date in the calendar.
   * @param {CalendarPicker["inputValue"]} date - The new date value.
   */
  changeDate(date: CalendarPicker["inputValue"]): void

  /**
   * Sets the focus state for the calendar.
   * @param {boolean} focus - The desired focus state.
   */
  focus(focus: boolean): void

  /**
   * Clears the selected date in the calendar.
   */
  clearDataPicker(): void
}
export declare type CalendarOption = Pick<
  CalendarProps,
  | "datePickerProps"
  | "range"
  | "autoFocus"
  | "closeOnSelect"
  | "fixWindowProps"
  | "class"
  | "classes"
  | keyof InputLayoutOption
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Calendar: GlobalComponentConstructor<Calendar>
  }
}

export default Calendar

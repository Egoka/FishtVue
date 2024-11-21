import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass, StyleMode } from "../types"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
import { namesColors } from "fishtvue/theme"
import { FixWindowProps } from "fishtvue/fixwindow"
import Locale from "v-calendar/dist/types/src/utils/locale"
import { Theme } from "v-calendar/dist/types/src/utils/theme"
import { DateRange } from "v-calendar/dist/types/src/utils/date/range"
import { Attribute } from "v-calendar/dist/types/src/utils/attribute"
import { LocaleConfig } from "v-calendar/src/utils/locale"
import { AttributeConfig } from "v-calendar/src/utils/attribute"
import { DateRangeSource } from "v-calendar/src/utils/date/range"
import { DateRepeatConfig } from "v-calendar/dist/types/src/utils/date/repeat"
import { CalendarDay } from "v-calendar/dist/types/src/utils/page"
import { UpdateOptions, ValueTarget } from "v-calendar/dist/types/src/use/datePicker"
import { MoveOptions, MoveTarget } from "v-calendar/dist/types/src/use/calendar"
import { DateParts, DatePartsRules } from "v-calendar/dist/types/src/utils/date/helpers"
import { PopoverEventHandlers, PopoverOptions } from "v-calendar/dist/types/src/utils/popovers"

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
export type ColorCalendarPicker = namesColors

export interface IRangeDate {
  start: Date | string
  end: Date | string
}

export interface ICalendarPicker {
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
  inputValue: string | IRangeDate
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

export interface IMasksDate {
  title?: string
  weekdays?: string
  navMonths?: string
  dayPopover?: string
  data?: Array<string>
  modelValue?: CalendarMask
  input?: Array<CalendarMask>
}

interface IAttributeConfig extends Omit<Partial<AttributeConfig>, "dates"> {
  dates: DateRangeSource | DateRangeSource[]
}

export interface SimpleDateRange {
  start: Date
  end: Date
}

export interface IRangeValue {
  start: DateValueCalendar
  end: DateValueCalendar
  span: number
  order: number
  repeat: Partial<DateRepeatConfig>
}

export interface IParamsDatePicker {
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
  attributes: Partial<IAttributeConfig>[]
  ///DatePicker//////////////////////
  mode: "date" | "dateTime" | "time"
  isRange: boolean
  isRequired: boolean
  is24hr: boolean
  mask: CalendarMask
  masks: IMasksDate
  disabledDates: DateRangeSource | DateRangeSource[]
  selectAttribute: Partial<IAttributeConfig>
  rules: "auto" | DatePartsRules
  locale: string | Partial<LocaleConfig>
  timezone: "UTC" | string
  placeholder: string
  separator: "arrow" | "points" | "none"
}

export declare type BaseCalendarProps = {
  /**
   * Additional parameters for date picker behavior and formatting.
   * @type {Partial<IParamsDatePicker> | undefined}
   */
  paramsDatePicker?: Partial<IParamsDatePicker>

  /**
   * Automatically focuses the calendar input on mount.
   * @type {boolean | undefined}
   */
  autoFocus?: boolean

  /**
   * Prevents the calendar from closing when a date is selected.
   * @type {boolean | undefined}
   */
  isNotCloseOnDateChange?: boolean

  /**
   * Custom CSS class for the data picker.
   * @type {StyleClass | undefined}
   */
  classDataPicker?: StyleClass

  /**
   * Custom CSS class for the calendar picker.
   * @type {StyleClass | undefined}
   */
  classPicker?: StyleClass

  /**
   * Custom CSS class for the displayed date text.
   * @type {StyleClass | undefined}
   */
  classDateText?: StyleClass

  /**
   * Configuration for fixing the calendar window's position.
   * @type {FixWindowProps | undefined}
   */
  paramsFixWindow?: FixWindowProps
}

/**
 * Props for the Calendar component.
 */
export interface CalendarProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseCalendarProps> {
  /**
   * The unique identifier for the calendar component.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The current value of the calendar, can be a single date or a date range.
   * @type {DateValueCalendar | Partial<IRangeValue>}
   */
  modelValue?: DateValueCalendar | Partial<IRangeValue>
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
   * Emitted when the invalid state of the calendar is updated.
   * @param event
   * @param {CalendarProps["isInvalid"]} payload - The invalid state.
   */
  (event: "update:isInvalid", payload: CalendarProps["isInvalid"]): void

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
   * Emitted when the calendar data is retrieved.
   * @param event
   * @param {ICalendarPicker} payload - The calendar picker instance.
   */
  (event: "getCalendar", payload: ICalendarPicker): void

  /**
   * Emitted when the calendar's active state changes.
   * @param event
   * @param {boolean} payload - Indicates if the calendar is active.
   */
  (event: "isActive", payload: boolean): void
}

/**
 * Methods and states exposed via `ref` for the Calendar component.
 */
export declare type CalendarExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the layout state of the input field.
   * @type {Ref<InputLayoutExpose | undefined>}
   */
  layout: Ref<InputLayoutExpose | undefined>

  /**
   * Reference to the input layout properties.
   * @type {Ref<Omit<InputLayoutProps, "value">>}
   */
  inputLayout: Ref<Omit<InputLayoutProps, "value">>

  /**
   * Reference to the data picker HTML element.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  dataPicker: ReadRef<HTMLElement | undefined>

  /**
   * Reference to the calendar picker HTML element.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  picker: ReadRef<HTMLElement | undefined>

  /**
   * Instance of the calendar picker.
   * @type {ReadRef<ICalendarPicker | undefined>}
   */
  calendarPicker: ReadRef<ICalendarPicker | undefined>

  /**
   * Indicates if the calendar input is focused.
   * @type {ReadRef<boolean>}
   */
  isFocus: ReadRef<boolean>

  /**
   * Indicates if the calendar picker is open.
   * @type {ReadRef<boolean>}
   */
  isOpenPicker: ReadRef<boolean>

  /**
   * Parameters for the date picker.
   * @type {ReadRef<Partial<IParamsDatePicker>>}
   */
  datePicker: ReadRef<Partial<IParamsDatePicker>>

  /**
   * Current value of the calendar.
   * @type {ReadRef<CalendarProps["modelValue"]>}
   */
  value: ReadRef<CalendarProps["modelValue"]>

  /**
   * The currently visible date in the picker.
   * @type {ReadRef<ICalendarPicker["inputValue"] | undefined>}
   */
  visibleDate: ReadRef<ICalendarPicker["inputValue"] | undefined>

  // ---PROPS-------------------------------
  /**
   * Current `id` value for the calendar component.
   * @type {ReadRef<CalendarProps["id"]>}
   */
  id: ReadRef<CalendarProps["id"]>

  /**
   * Indicates whether the calendar has a value.
   * @type {ReadRef<boolean>}
   */
  isValue: ReadRef<boolean>

  /**
   * Indicates if autofocus is enabled.
   * @type {ReadRef<CalendarProps["autoFocus"]>}
   */
  autoFocus: ReadRef<CalendarProps["autoFocus"]>

  /**
   * Indicates if the calendar remains open on date selection.
   * @type {ReadRef<CalendarProps["isNotCloseOnDateChange"]>}
   */
  isNotCloseOnDateChange: ReadRef<CalendarProps["isNotCloseOnDateChange"]>

  /**
   * The current styling mode of the editor.
   * @type {ReadRef<StyleMode>}
   */
  mode: ReadRef<StyleMode>

  /**
   * Placeholder text for the input field.
   * @type {ReadRef<IParamsDatePicker["placeholder"] | undefined>}
   */
  placeholder: ReadRef<IParamsDatePicker["placeholder"] | undefined>

  /**
   * Indicates if the calendar is in a loading state.
   * @type {ReadRef<CalendarProps["loading"]>}
   */
  isLoading: ReadRef<CalendarProps["loading"]>

  /**
   * Indicates if the calendar is disabled.
   * @type {ReadRef<CalendarProps["disabled"]>}
   */
  isDisabled: ReadRef<CalendarProps["disabled"]>

  /**
   * Indicates if the calendar is invalid.
   * @type {ReadRef<CalendarProps["isInvalid"]>}
   */
  isInvalid: ReadRef<CalendarProps["isInvalid"]>

  /**
   * Validation message for the calendar input.
   * @type {ReadRef<CalendarProps["messageInvalid"]>}
   */
  messageInvalid: ReadRef<CalendarProps["messageInvalid"]>

  /**
   * Separator character for date ranges.
   * @type {ReadRef<IParamsDatePicker["separator"] | undefined>}
   */
  separator: ReadRef<IParamsDatePicker["separator"] | undefined>

  /**
   * Current layout value.
   * @type {ReadRef<string>}
   */
  valueLayout: ReadRef<string>

  /**
   * Configuration for fixing the calendar window.
   * @type {ReadRef<CalendarProps["paramsFixWindow"]>}
   */
  paramsFixWindow: ReadRef<CalendarProps["paramsFixWindow"]>

  /**
   * CSS class for the layout container.
   * @type {ReadRef<CalendarProps["class"]>}
   */
  classLayout: ReadRef<CalendarProps["class"]>

  /**
   * CSS class for the data picker.
   * @type {ReadRef<CalendarProps["classDataPicker"]>}
   */
  classDataPicker: ReadRef<CalendarProps["classDataPicker"]>

  /**
   * CSS class for the date text display.
   * @type {ReadRef<CalendarProps["classDateText"]>}
   */
  classDateText: ReadRef<CalendarProps["classDateText"]>

  /**
   * CSS class for the calendar picker.
   * @type {ReadRef<CalendarProps["classPicker"]>}
   */
  classPicker: ReadRef<CalendarProps["classPicker"]>

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
   * @param {ICalendarPicker["inputValue"]} date - The new date value.
   */
  changeDate(date: ICalendarPicker["inputValue"]): void

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
  | "paramsDatePicker"
  | "autoFocus"
  | "isNotCloseOnDateChange"
  | "classDataPicker"
  | "classPicker"
  | "classDateText"
  | "paramsFixWindow"
  | keyof InputLayoutOption
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Calendar: GlobalComponentConstructor<Calendar>
  }
}

export default Calendar

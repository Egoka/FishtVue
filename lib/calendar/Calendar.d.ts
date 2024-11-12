import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
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
  paramsDatePicker?: Partial<IParamsDatePicker>
  autoFocus?: boolean
  isNotCloseOnDateChange?: boolean
  classDataPicker?: StyleClass
  classPicker?: StyleClass
  classDateText?: StyleClass
  paramsFixWindow?: FixWindowProps
}

export interface CalendarProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseCalendarProps> {
  id?: string
  modelValue?: DateValueCalendar | Partial<IRangeValue>
}

export declare type CalendarSlots = {
  footerPicker(): VNode[]
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
export declare type CalendarEmits = {
  (event: "update:isInvalid", payload: CalendarProps["isInvalid"]): void
  (event: "update:modelValue", payload: CalendarProps["modelValue"]): void
  (event: "change:modelValue", payload: CalendarProps["modelValue"]): void
  (event: "getCalendar", payload: ICalendarPicker): void
  (event: "isActive", payload: boolean): void
}
export declare type CalendarExpose = {
  //---STATE-------------------------
  layout: Ref<InputLayoutExpose | undefined>
  inputLayout: Ref<Omit<InputLayoutProps, "value">>
  dataPicker: ReadRef<HTMLElement | undefined>
  picker: ReadRef<HTMLElement | undefined>
  calendarPicker: ReadRef<ICalendarPicker | undefined>
  isFocus: ReadRef<boolean>
  isOpenPicker: ReadRef<boolean>
  datePicker: ReadRef<Partial<IParamsDatePicker>>
  value: ReadRef<CalendarProps["modelValue"]>
  visibleDate: ReadRef<ICalendarPicker["inputValue"] | undefined>
  // ---PROPS-------------------------------
  id: ReadRef<CalendarProps["id"]>
  isValue: ReadRef<boolean>
  autoFocus: ReadRef<CalendarProps["autoFocus"]>
  isNotCloseOnDateChange: ReadRef<CalendarProps["isNotCloseOnDateChange"]>
  mode: ReadRef<CalendarProps["mode"]>
  placeholder: ReadRef<IParamsDatePicker["placeholder"] | undefined>
  isLoading: ReadRef<CalendarProps["loading"]>
  isDisabled: ReadRef<CalendarProps["disabled"]>
  isInvalid: ReadRef<CalendarProps["isInvalid"]>
  messageInvalid: ReadRef<CalendarProps["messageInvalid"]>
  separator: ReadRef<IParamsDatePicker["separator"] | undefined>
  valueLayout: ReadRef<string>
  paramsFixWindow: ReadRef<CalendarProps["paramsFixWindow"]>
  classLayout: ReadRef<CalendarProps["class"]>
  classDataPicker: ReadRef<CalendarProps["classDataPicker"]>
  classDateText: ReadRef<CalendarProps["classDateText"]>
  classPicker: ReadRef<CalendarProps["classPicker"]>
  // ---METHODS-----------------------------
  openCalendar(): void
  closeCalendar(evt?: MouseEvent): void
  changeDate(date: ICalendarPicker["inputValue"]): void
  focus(focus: boolean): void
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
declare class Calendar extends ClassComponent<CalendarProps, CalendarSlots, CalendarEmits, CalendarExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Calendar: GlobalComponentConstructor<Calendar>
  }
}

export default Calendar

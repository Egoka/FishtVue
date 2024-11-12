import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { BadgeProps } from "fishtvue/badge"
import { FixWindowExpose, FixWindowProps } from "fishtvue/fixwindow"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
// ---------------------------------------
export type IDataItem = { [key: string]: any }
export type BaseDataItem = string | number | IDataItem
export declare type BaseSelectProps = {
  dataSelect: Array<BaseDataItem>
  autoFocus: boolean
  keySelect: string | "id"
  valueSelect: string | "value"
  multiple: boolean
  maxVisible: number
  closeButtonBadge: BadgeProps["closeButton"]
  noData: string
  noQuery: boolean
  classSelect: StyleClass | "justify-end"
  classSelectList: StyleClass
  classMaskQuery: "font-bold text-theme-700 dark:text-theme-300" | string
  paramsFixWindow: Omit<FixWindowProps, "modelValue">
}

export interface SelectProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseSelectProps> {
  id?: string
  modelValue?: number | string | NonNullable<unknown> | null | Array<number | string | null>
}

export declare type SelectSlots = {
  default(): VNode[]
  values(): VNode[]
  item(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
export declare type SelectEmits = {
  (event: "update:isInvalid", payload: SelectProps["isInvalid"]): void
  (event: "update:modelValue", selectValue: SelectProps["modelValue"] | null, selectItem?: Array<any>): void
  (event: "change:modelValue", selectValue: SelectProps["modelValue"] | null, selectItem?: Array<any>): void
  (event: "isActive", payload: boolean): void
}
export declare type SelectExpose = {
  // ---STATE-------------------------
  layout: Ref<InputLayoutExpose | undefined>
  selectListWindow: Ref<FixWindowExpose | undefined>
  selectBody: ReadRef<HTMLElement | undefined>
  selectList: ReadRef<HTMLElement | undefined>
  selectSearch: ReadRef<HTMLElement | undefined>
  selectItems: ReadRef<HTMLElement | undefined>
  activeItem: ReadRef<number>
  query: ReadRef<string>
  isOpenList: ReadRef<boolean>
  classLayout: ReadRef<SelectProps["class"]>
  value: ReadRef<SelectProps["modelValue"]>
  // ---PROPS-------------------------
  visibleValue: ReadRef<Array<any>>
  valueKeys: ReadRef<Array<any>>
  keySelect: ReadRef<SelectProps["keySelect"] | null>
  valueSelect: ReadRef<SelectProps["valueSelect"] | null>
  dataSelect: ReadRef<SelectProps["dataSelect"]>
  autoFocus: ReadRef<NonNullable<SelectProps["autoFocus"]>>
  mode: ReadRef<NonNullable<SelectProps["mode"]>>
  isDisabled: ReadRef<NonNullable<SelectProps["disabled"]>>
  isLoading: ReadRef<NonNullable<SelectProps["loading"]>>
  isInvalid: ReadRef<NonNullable<SelectProps["isInvalid"]>>
  messageInvalid: ReadRef<SelectProps["messageInvalid"]>
  isValue: ReadRef<boolean>
  isMultiple: ReadRef<NonNullable<SelectProps["multiple"]>>
  maxVisible: ReadRef<SelectProps["maxVisible"] | undefined>
  noData: ReadRef<NonNullable<SelectProps["noData"]>>
  isQuery: ReadRef<NonNullable<SelectProps["noQuery"]>>
  classMaskQuery: ReadRef<NonNullable<SelectProps["classMaskQuery"]>>
  dataList: ReadRef<Array<any>>
  paramsFixWindow: ReadRef<NonNullable<SelectProps["paramsFixWindow"]>>
  classBase: ReadRef<SelectProps["classSelect"]>
  classSelectList: ReadRef<SelectProps["classSelectList"]>
  // ---METHODS-----------------------
  focusSelect(isFocus: boolean): void
  openSelect(): void
  closeSelect(evt: MouseEvent): void
  select(selectValue: BaseDataItem | null): void
}
export declare type SelectOption = Pick<
  SelectProps,
  | "autoFocus"
  | "multiple"
  | "maxVisible"
  | "closeButtonBadge"
  | "noData"
  | "noQuery"
  | "classSelect"
  | "classSelectList"
  | "classMaskQuery"
  | "paramsFixWindow"
  | keyof InputLayoutOption
>

// ---------------------------------------
declare class Select extends ClassComponent<SelectProps, SelectSlots, SelectEmits, SelectExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Select: GlobalComponentConstructor<Select>
  }
}

export default Select

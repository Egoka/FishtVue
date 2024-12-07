import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { BadgeProps } from "fishtvue/badge"
import { FixWindowExpose, FixWindowProps } from "fishtvue/fixwindow"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"

/**
 * ## Select
 *
 * Select - a component for selecting items from a dropdown list.
 *
 * Supports single or multiple selection, customizable styles, and advanced query-based filtering.
 */
declare class Select extends ClassComponent<SelectProps, SelectSlots, SelectEmits, SelectExpose> {}

// ---------------------------------------
export type IDataItem = { [key: string]: any }
export type BaseDataItem = string | number | IDataItem

/**
 * Base props for the Select component.
 */
export declare type BaseSelectProps = {
  /**
   * The data items available for selection.
   * @type {Array<BaseDataItem>}
   */
  dataSelect: Array<BaseDataItem>

  /**
   * Automatically focuses the select input on mount.
   * @type {boolean}
   */
  autoFocus: boolean

  /**
   * The key used to uniquely identify each item in the data set.
   * @type {string | "id"}
   */
  keySelect: string | "id"

  /**
   * The key used to retrieve the display value of each item.
   * @type {string | "value"}
   */
  valueSelect: string | "value"

  /**
   * Enables multiple item selection.
   * @type {boolean}
   */
  multiple: boolean

  /**
   * The maximum number of items visible in the dropdown list.
   * @type {number}
   */
  maxVisible: number

  /**
   * Enables a close button for badges in multiple selection mode.
   * @type {BadgeProps["closeButton"]}
   */
  closeButtonBadge: BadgeProps["closeButton"]

  /**
   * Text displayed when there are no items in the list.
   * @type {string}
   */
  noData: string

  /**
   * Disables the query-based filtering of items.
   * @type {boolean}
   */
  noQuery: boolean

  /**
   * Custom CSS class for the select container.
   * @type {StyleClass | "justify-end"}
   */
  classSelect: StyleClass | "justify-end"

  /**
   * Custom CSS class for the dropdown list container.
   * @type {StyleClass}
   */
  classSelectList: StyleClass

  /**
   * Custom CSS class for the query text mask.
   * @type {"font-bold text-theme-700 dark:text-theme-300" | string}
   */
  classMaskQuery: "font-bold text-theme-700 dark:text-theme-300" | string

  /**
   * Configuration for the dropdown's positioning behavior.
   * @type {Omit<FixWindowProps, "modelValue">}
   */
  paramsFixWindow: Omit<FixWindowProps, "modelValue">
}

/**
 * Props for the Select component.
 */
export interface SelectProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseSelectProps> {
  /**
   * Unique identifier for the select component.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The current value of the select field.
   * @type {number | string | NonNullable<unknown> | null | Array<number | string | null> | undefined}
   */
  modelValue?: number | string | NonNullable<unknown> | null | Array<number | string | null>
}

export declare type SelectSlots = {
  default(): VNode[]
  values(): VNode[]
  item(): VNode[]
  before(): VNode[]
  after(): VNode[]
}

/**
 * Events emitted by the Select component.
 */
export declare type SelectEmits = {
  /**
   * Emitted when the invalid state is updated.
   * @param event
   * @param {SelectProps["isInvalid"]} payload - The updated invalid state.
   */
  (event: "update:isInvalid", payload: SelectProps["isInvalid"]): void

  /**
   * Emitted when the selected value is updated.
   * @param event
   * @param {SelectProps["modelValue"] | null} selectValue - The updated value.
   * @param {Array<any> | undefined} selectItem - The selected items.
   */
  (event: "update:modelValue", selectValue: SelectProps["modelValue"] | null, selectItem?: Array<any>): void

  /**
   * Emitted when the selected value changes.
   * @param event
   * @param {SelectProps["modelValue"] | null} selectValue - The new value.
   * @param {Array<any> | undefined} selectItem - The selected items.
   */
  (event: "change:modelValue", selectValue: SelectProps["modelValue"] | null, selectItem?: Array<any>): void

  /**
   * Emitted when the select component becomes active or inactive.
   * @param event
   * @param {boolean} payload - Indicates whether the select is active.
   */
  (event: "isActive", payload: boolean): void
}

/**
 * Methods and states exposed via `ref` for the Select component.
 */
export declare type SelectExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the input layout component.
   * @type {Ref<InputLayoutExpose | undefined>}
   */
  layout: Ref<InputLayoutExpose | undefined>

  /**
   * Reference to the dropdown list's window.
   * @type {Ref<FixWindowExpose | undefined>}
   */
  selectListWindow: Ref<FixWindowExpose | undefined>

  /**
   * Reference to the select container element.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  selectBody: ReadRef<HTMLElement | undefined>

  /**
   * Reference to the dropdown list container element.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  selectList: ReadRef<HTMLElement | undefined>

  /**
   * Reference to the search input element within the dropdown.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  selectSearch: ReadRef<HTMLElement | undefined>

  /**
   * Reference to the list of selectable items.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  selectItems: ReadRef<HTMLElement | undefined>

  /**
   * The index of the currently active item.
   * @type {ReadRef<number>}
   */
  activeItem: ReadRef<number>

  /**
   * The current query string used for filtering items.
   * @type {ReadRef<string>}
   */
  query: ReadRef<string>

  /**
   * Indicates whether the dropdown list is open.
   * @type {ReadRef<boolean>}
   */
  isOpenList: ReadRef<boolean>

  /**
   * Custom CSS class for the layout.
   * @type {ReadRef<SelectProps["class"]>}
   */
  classLayout: ReadRef<SelectProps["class"]>

  /**
   * The current value of the select field.
   * @type {ReadRef<SelectProps["modelValue"]>}
   */
  value: ReadRef<SelectProps["modelValue"]>

  // ---PROPS-------------------------
  /**
   * The visible value(s) of the select component.
   * @type {ReadRef<Array<any>>}
   */
  visibleValue: ReadRef<Array<any>>

  /**
   * The keys of the selected values.
   * @type {ReadRef<Array<any>>}
   */
  valueKeys: ReadRef<Array<any>>

  /**
   * The key used to uniquely identify items.
   * @type {ReadRef<SelectProps["keySelect"] | null>}
   */
  keySelect: ReadRef<SelectProps["keySelect"] | null>

  /**
   * The key used to retrieve item display values.
   * @type {ReadRef<SelectProps["valueSelect"] | null>}
   */
  valueSelect: ReadRef<SelectProps["valueSelect"] | null>

  /**
   * The list of available items.
   * @type {ReadRef<SelectProps["dataSelect"]>}
   */
  dataSelect: ReadRef<SelectProps["dataSelect"]>

  /**
   * Indicates whether autofocus is enabled.
   * @type {ReadRef<NonNullable<SelectProps["autoFocus"]>>}
   */
  autoFocus: ReadRef<NonNullable<SelectProps["autoFocus"]>>

  /**
   * Indicates the current styling mode.
   * @type {ReadRef<NonNullable<SelectProps["mode"]>>}
   */
  mode: ReadRef<NonNullable<SelectProps["mode"]>>

  /**
   * Indicates whether the select is disabled.
   * @type {ReadRef<NonNullable<SelectProps["disabled"]>>}
   */
  isDisabled: ReadRef<NonNullable<SelectProps["disabled"]>>

  /**
   * Indicates whether the select is in a loading state.
   * @type {ReadRef<NonNullable<SelectProps["loading"]>>}
   */
  isLoading: ReadRef<NonNullable<SelectProps["loading"]>>

  /**
   * Indicates whether the select is invalid.
   * @type {ReadRef<NonNullable<SelectProps["isInvalid"]>>}
   */
  isInvalid: ReadRef<NonNullable<SelectProps["isInvalid"]>>

  /**
   * The validation message for the select component.
   * @type {ReadRef<SelectProps["messageInvalid"]>}
   */
  messageInvalid: ReadRef<SelectProps["messageInvalid"]>

  /**
   * Indicates whether the select has a value.
   * @type {ReadRef<boolean>}
   */
  isValue: ReadRef<boolean>

  /**
   * Indicates whether multiple selection is enabled.
   * @type {ReadRef<NonNullable<SelectProps["multiple"]>>}
   */
  isMultiple: ReadRef<NonNullable<SelectProps["multiple"]>>

  /**
   * The maximum number of items visible in the dropdown list.
   * @type {ReadRef<SelectProps["maxVisible"] | undefined>}
   */
  maxVisible: ReadRef<SelectProps["maxVisible"] | undefined>

  /**
   * The text displayed when no items are available.
   * @type {ReadRef<NonNullable<SelectProps["noData"]>>}
   */
  noData: ReadRef<NonNullable<SelectProps["noData"]>>

  /**
   * Indicates whether query-based filtering is disabled.
   * @type {ReadRef<NonNullable<SelectProps["noQuery"]>>}
   */
  isQuery: ReadRef<NonNullable<SelectProps["noQuery"]>>

  /**
   * Custom CSS class for the query text mask.
   * @type {ReadRef<NonNullable<SelectProps["classMaskQuery"]>>}
   */
  classMaskQuery: ReadRef<NonNullable<SelectProps["classMaskQuery"]>>

  /**
   * The processed list of data items for rendering.
   * @type {ReadRef<Array<any>>}
   */
  dataList: ReadRef<Array<any>>

  /**
   * Configuration for the dropdown's positioning behavior.
   * @type {ReadRef<NonNullable<SelectProps["paramsFixWindow"]>>}
   */
  paramsFixWindow: ReadRef<NonNullable<SelectProps["paramsFixWindow"]>>

  /**
   * Custom CSS class for the select base container.
   * @type {ReadRef<SelectProps["classSelect"]>}
   */
  classBase: ReadRef<SelectProps["classSelect"]>

  /**
   * Custom CSS class for the dropdown list container.
   * @type {ReadRef<SelectProps["classSelectList"]>}
   */
  classSelectList: ReadRef<SelectProps["classSelectList"]>

  // ---METHODS-----------------------
  /**
   * Sets the focus state of the select component.
   * @param {boolean} isFocus - Indicates whether the select should be focused.
   */
  focusSelect(isFocus: boolean): void

  /**
   * Opens the dropdown list.
   */
  openSelect(): void

  /**
   * Closes the dropdown list.
   * @param {MouseEvent} event - The event that triggered the action.
   */
  closeSelect(event: MouseEvent): void

  /**
   * Selects a specific item or clears the selection.
   * @param {BaseDataItem | null} selectValue - The item to select or `null` to clear.
   */
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

declare module "vue" {
  export interface GlobalComponents {
    Select: GlobalComponentConstructor<Select>
  }
}

export default Select

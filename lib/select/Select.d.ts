import { MaybeRef, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
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
export type IDataItem = {
  [key: string]: any
  /**
   * @deprecated since 2026-05-11 — поле `marker` игнорируется компонентом для защиты от XSS.
   * Для кастомного рендеринга подсветки используйте scoped slot `#marker` (см. SelectSlots).
   */
  marker?: string
}
export type BaseDataItem = string | number | IDataItem

/**
 * Base props for the Select component.
 */
export declare type BaseSelectProps = {
  /**
   * The data items available for selection.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<Array<BaseDataItem>>}
   */
  dataSelect: MaybeRef<Array<BaseDataItem>>

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
  values(args: { selected: any; key?: string; deleteSelect?: (selectValue: BaseDataItem | null) => void }): VNode[]
  item(args: { item: any; key: string; isQuery: boolean }): VNode[]
  /**
   * Scoped slot для безопасного рендера подсветки совпадения query внутри значения опции.
   * По умолчанию выводит текст значения + `<mark>` для участков, совпавших с `query`,
   * через text-interpolation (без `v-html`). Заменяет deprecated `IDataItem.marker` поле.
   */
  marker(args: { item: any; query: string; isQuery: boolean; valueKey: string | null }): VNode[]
  /**
   * Slot для пустой выдачи (либо весь `dataSelect` пустой, либо фильтр без совпадений).
   * По умолчанию рендерит `noData` как text-node. Заменяет небезопасный `v-html="noData"`.
   */
  empty(args: { noData: string; query: string; hasData: boolean }): VNode[]
  default(): VNode[]
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
   * @type {InputLayoutExpose | undefined}
   */
  layout: InputLayoutExpose | undefined

  /**
   * Reference to the dropdown list's window.
   * @type {FixWindowExpose | undefined}
   */
  selectListWindow: FixWindowExpose | undefined

  /**
   * Reference to the select container element.
   * @type {HTMLElement | undefined}
   */
  selectBody: HTMLElement | undefined

  /**
   * Reference to the dropdown list container element.
   * @type {HTMLElement | undefined}
   */
  selectList: HTMLElement | undefined

  /**
   * Reference to the search input element within the dropdown.
   * @type {HTMLElement | undefined}
   */
  selectSearch: HTMLElement | undefined

  /**
   * Reference to the list of selectable items.
   * @type {HTMLElement | undefined}
   */
  selectItems: HTMLElement | undefined

  /**
   * The index of the currently active item.
   * @type {number}
   */
  activeItem: number

  /**
   * The current query string used for filtering items.
   * @type {string}
   */
  query: string

  /**
   * Indicates whether the dropdown list is open.
   * @type {boolean}
   */
  isOpenList: boolean

  /**
   * Custom CSS class for the layout.
   * @type {SelectProps["class"]}
   */
  classLayout: SelectProps["class"]

  /**
   * The current value of the select field.
   * @type {SelectProps["modelValue"]}
   */
  value: SelectProps["modelValue"]

  // ---PROPS-------------------------
  /**
   * The visible value(s) of the select component.
   * @type {Array<any>}
   */
  visibleValue: Array<any>

  /**
   * The keys of the selected values.
   * @type {Array<any>}
   */
  valueKeys: Array<any>

  /**
   * The key used to uniquely identify items.
   * @type {SelectProps["keySelect"] | null}
   */
  keySelect: SelectProps["keySelect"] | null

  /**
   * The key used to retrieve item display values.
   * @type {SelectProps["valueSelect"] | null}
   */
  valueSelect: SelectProps["valueSelect"] | null

  /**
   * The list of available items.
   * @type {SelectProps["dataSelect"]}
   */
  dataSelect: SelectProps["dataSelect"]

  /**
   * Indicates whether autofocus is enabled.
   * @type {SelectProps["autoFocus"]}
   */
  autoFocus: SelectProps["autoFocus"]

  /**
   * Indicates the current styling mode.
   * @type {SelectProps["mode"]}
   */
  mode: SelectProps["mode"]

  /**
   * Indicates whether the select is disabled.
   * @type {SelectProps["disabled"]}
   */
  isDisabled: SelectProps["disabled"]

  /**
   * Indicates whether the select is in a loading state.
   * @type {SelectProps["loading"]}
   */
  isLoading: SelectProps["loading"]

  /**
   * Indicates whether the select is invalid.
   * @type {SelectProps["isInvalid"]}
   */
  isInvalid: SelectProps["isInvalid"]

  /**
   * The validation message for the select component.
   * @type {SelectProps["messageInvalid"]}
   */
  messageInvalid: SelectProps["messageInvalid"]

  /**
   * Indicates whether the select has a value.
   * @type {boolean}
   */
  isValue: boolean

  /**
   * Indicates whether multiple selection is enabled.
   * @type {SelectProps["multiple"]}
   */
  isMultiple: SelectProps["multiple"]

  /**
   * The maximum number of items visible in the dropdown list.
   * @type {SelectProps["maxVisible"] | undefined}
   */
  maxVisible: SelectProps["maxVisible"] | undefined

  /**
   * The text displayed when no items are available.
   * @type {SelectProps["noData"]}
   */
  noData: SelectProps["noData"]

  /**
   * Indicates whether query-based filtering is disabled.
   * @type {SelectProps["noQuery"]}
   */
  isQuery: SelectProps["noQuery"]

  /**
   * Custom CSS class for the query text mask.
   * @type {SelectProps["classMaskQuery"]}
   */
  classMaskQuery: SelectProps["classMaskQuery"]

  /**
   * The processed list of data items for rendering.
   * @type {Array<any>}
   */
  dataList: Array<any>

  /**
   * Configuration for the dropdown's positioning behavior.
   * @type {SelectProps["paramsFixWindow"]}
   */
  paramsFixWindow: SelectProps["paramsFixWindow"]

  /**
   * Custom CSS class for the select base container.
   * @type {SelectProps["classSelect"]}
   */
  classBase: SelectProps["classSelect"]

  /**
   * Custom CSS class for the dropdown list container.
   * @type {SelectProps["classSelectList"]}
   */
  classSelectList: SelectProps["classSelectList"]

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

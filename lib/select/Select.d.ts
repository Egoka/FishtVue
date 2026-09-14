import { MaybeRef, VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor, StyleClass } from "../types"
import { BadgeProps } from "fishtvue/badge"
import { FixWindowExpose, FixWindowProps } from "fishtvue/fixwindow"
import { InputLayoutClassKey, InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"

/**
 * ## Select
 *
 * Select - a component for selecting items from a dropdown list.
 *
 * Supports single or multiple selection, customizable styles, and advanced query-based filtering.
 */
declare class Select extends ClassComponent<SelectProps, SelectSlots, SelectEmits, SelectExpose> {}

// ---------------------------------------
export type SelectDataItem = {
  [key: string]: any
}
export type BaseDataItem = string | number | SelectDataItem

/**
 * Ключи карты `classes` (dev-patterns §2 B): семейные `InputLayoutClassKey` плюс собственные.
 * `root` — корень `<InputLayout data-select>`.
 * - `control` — триггер `<div data-select-control role="combobox">` (бывший `classSelect`).
 * - `list` — контейнер дропдауна `[data-select-list]` (бывший `classSelectList`).
 * - `option` — строка опции `[data-select-list-item]`.
 * - `mark` — aspect-ключ: `<mark>` подсветки совпадения query (бывший `classMaskQuery`);
 *   `props ?? options ?? "font-bold text-theme-700 dark:text-theme-300"`, `""` отключает.
 */
export declare type SelectClassKey = InputLayoutClassKey | "control" | "list" | "option" | "mark"

/**
 * Base props for the Select component.
 */
export declare type BaseSelectProps = {
  /**
   * The data items available for selection (schema-driven API; выигрывает над compound `<SelectItem>`).
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<Array<BaseDataItem>>}
   */
  options: MaybeRef<Array<BaseDataItem>>

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
  badgeCloseButton: BadgeProps["closeButton"]

  /**
   * Text displayed when there are no items in the list.
   * @type {string}
   */
  emptyText: string

  /**
   * Поиск по списку: `true` (default) рендерит поле фильтра в дропдауне, `false` — чистый listbox
   * с first-char typeahead. Резолвится `props ?? componentsOptions.Select.searchable ?? true`.
   * @type {boolean}
   */
  searchable: boolean

  /**
   * Configuration for the dropdown's positioning behavior (`FixWindow`).
   * @type {Omit<FixWindowProps, "modelValue">}
   */
  fixWindowProps: Omit<FixWindowProps, "modelValue">
}

/**
 * Props for the Select component.
 */
export interface SelectProps
  extends Omit<InputLayoutProps, "value" | "hasValue" | "classes">, Partial<BaseSelectProps> {
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

  /**
   * Карта классов внутренних элементов: семейные ключи уходят в `InputLayout`, `control`/`list`/`option` —
   * триггер, дропдаун и строка опции, aspect-ключ `mark` — подсветка совпадения; `root` ≡ `class`.
   * См. `SelectClassKey`.
   * @type {ClassesMap<SelectClassKey> | undefined}
   */
  classes?: ClassesMap<SelectClassKey>
}

export declare type SelectSlots = {
  values(args: { selected: any; key?: string; deleteSelect?: (selectValue: BaseDataItem | null) => void }): VNode[]
  item(args: { item: any; key: string; isQuery: boolean }): VNode[]
  /**
   * Scoped slot для безопасного рендера подсветки совпадения query внутри значения опции.
   * По умолчанию выводит текст значения + `<mark>` для участков, совпавших с `query`,
   * через text-interpolation (без `v-html`). Пришёл на смену полю `SelectDataItem.marker`, снятому 2026-09-06.
   */
  marker(args: { item: any; query: string; isQuery: boolean; valueKey: string | null }): VNode[]
  /**
   * Slot для пустой выдачи (либо весь `options` пустой, либо фильтр без совпадений).
   * По умолчанию рендерит `emptyText` как text-node. Заменяет небезопасный `v-html`.
   */
  empty(args: { emptyText: string; query: string; hasData: boolean }): VNode[]
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}

/**
 * Events emitted by the Select component.
 */
export declare type SelectEmits = {
  /**
   * v-model-канал prop'а `invalid`: выбор значения сбрасывает ошибку — payload всегда `false`.
   * @param event
   * @param {boolean} payload - The updated invalid state.
   */
  (event: "update:invalid", payload: boolean): void

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
   * Открыт ли дропдаун (бывший `isActive`).
   * @param event
   * @param {boolean} payload - Indicates whether the select is active.
   */
  (event: "active", payload: boolean): void
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
   * Props, переданные во внутренний `InputLayout` (включая `class` корня и семейную карту `classes`
   * с focus-ring в `base`). Заменяет прежний `classLayout`.
   * @type {Omit<InputLayoutProps, "value">}
   */
  inputLayout: Omit<InputLayoutProps, "value">

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
   * Нормализованный список опций (schema-driven `options` или compound `<SelectItem>`).
   * @type {Array<BaseDataItem>}
   */
  dataSelect: Array<BaseDataItem>

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
   * Indicates whether the select is invalid (resolved `invalid`, `false` при `disabled`).
   * @type {boolean}
   */
  isInvalid: boolean

  /**
   * Показывается ли кнопка очистки (resolved `clearable`: props → options → `false`).
   * @type {boolean}
   */
  isClearable: boolean

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
   * The text displayed when no items are available (resolved `emptyText`).
   * @type {NonNullable<SelectProps["emptyText"]>}
   */
  emptyText: NonNullable<SelectProps["emptyText"]>

  /**
   * Включён ли поиск по списку (resolved `searchable`).
   * @type {boolean}
   */
  isSearchable: boolean

  /**
   * Класс `<mark>` подсветки совпадения (aspect-ключ `classes.mark`).
   * @type {StyleClass}
   */
  classMark: StyleClass

  /**
   * The processed list of data items for rendering.
   * @type {Array<any>}
   */
  dataList: Array<any>

  /**
   * Resolved configuration for the dropdown's positioning behavior.
   * @type {NonNullable<SelectProps["fixWindowProps"]>}
   */
  fixWindowProps: NonNullable<SelectProps["fixWindowProps"]>

  /**
   * Итоговый класс триггера `[data-select-control]` (база + `classes.control`).
   * @type {string}
   */
  classControl: string

  /**
   * Итоговый класс дропдауна `[data-select-list]` (база + mode + `classes.list`).
   * @type {string}
   */
  classList: string

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
  | "badgeCloseButton"
  | "emptyText"
  | "searchable"
  | "fixWindowProps"
  | "class"
  | "classes"
  | keyof InputLayoutOption
>

// ---COMPOUND API (Issue 3) --------------------------------------------------------------------------------
// Параллельный декларативный API `<Select><SelectItem>` поверх schema-driven `:options` (schema
// выигрывает при наличии). Компонент называется `SelectItem` — имя `SelectOption` занято options-типом
// (конвенция `XOption` для `componentsOptions.Select`), см. решение 8 редизайна props 1.0.

/**
 * Props for the `<SelectItem>` descriptor (compound API). Declares a single option; `<Select>` reads
 * these via VNode-walk and renders the matching list item. `value` is both the model value (`keySelect`)
 * and the display fallback; `label` (or default-slot text) is the display text.
 *
 * Note: `key` is NOT a prop — it is Vue's reserved VNode key. Use `value` as the option identity.
 */
export declare type SelectItemProps = {
  /**
   * Option value — becomes `modelValue` when selected and the identity key in the list.
   * @type {string | number | boolean | object | null}
   */
  value: string | number | boolean | object | null

  /**
   * Display text. Overrides the default-slot text when set.
   * @type {string | undefined}
   */
  label?: string

  /**
   * Disables the option — not selectable, marked `aria-disabled`.
   * @type {boolean | undefined}
   */
  disabled?: boolean
}

/**
 * Slots of `<SelectItem>`. The default slot provides the plain-text display label (rich content is not
 * rendered per-option in the list — use the `#item` slot or schema-driven `:options` for that).
 */
export declare type SelectItemSlots = {
  default(): VNode[]
}

/**
 * Props for the `<SelectGroup>` descriptor (compound API) — groups `<SelectItem>` children under a
 * non-selectable label header.
 */
export declare type SelectGroupProps = {
  /**
   * Group header label.
   * @type {string}
   */
  label: string

  /**
   * Alias of `label`.
   * @type {string | undefined}
   */
  title?: string
}

/**
 * Slots of `<SelectGroup>` — nested `<SelectItem>` descriptors.
 */
export declare type SelectGroupSlots = {
  default(): VNode[]
}

/**
 * `<SelectItem>` — renderless option descriptor for the compound `<Select>` API.
 *
 * ```vue
 * <Select v-model="x">
 *   <SelectItem value="a">Apple</SelectItem>
 *   <SelectItem value="b" disabled>Banana</SelectItem>
 * </Select>
 * ```
 */
declare class SelectItemComponent extends ClassComponent<
  SelectItemProps,
  SelectItemSlots,
  null,
  NonNullable<unknown>
> {}

/**
 * `<SelectGroup>` — renderless group descriptor for the compound `<Select>` API.
 *
 * ```vue
 * <Select v-model="x">
 *   <SelectGroup label="Fruits">
 *     <SelectItem value="a">Apple</SelectItem>
 *   </SelectGroup>
 * </Select>
 * ```
 */
declare class SelectGroupComponent extends ClassComponent<
  SelectGroupProps,
  SelectGroupSlots,
  null,
  NonNullable<unknown>
> {}

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Select: GlobalComponentConstructor<Select>
    SelectItem: GlobalComponentConstructor<SelectItemComponent>
    SelectGroup: GlobalComponentConstructor<SelectGroupComponent>
  }
}

export default Select
// value-экспорты compound-детей (для explicit-import: `import { SelectItem } from "fishtvue/select"`).
// Имя `SelectItem` (а не `SelectOption`) — потому что `SelectOption` занято options-типом выше.
export { SelectItemComponent as SelectItem }
export { SelectGroupComponent as SelectGroup }

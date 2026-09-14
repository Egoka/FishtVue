import { VNode, MaybeRef } from "vue"
import {
  ClassComponent,
  ClassesMap,
  GlobalComponentConstructor,
  ReadRef,
  StyleClass,
  StyleMode,
  THeight,
  TWidth
} from "../types"
import { BaseInputProps, InputProps } from "fishtvue/input"
import { BaseSelectProps, SelectProps } from "fishtvue/select"
import { PaginationProps } from "fishtvue/pagination"
import { BaseCalendarProps, CalendarProps } from "fishtvue/calendar"

/**
 * ## Table
 *
 * Table - a component for displaying and managing tabular data.
 *
 * Supports features like sorting, filtering, grouping, pagination, and advanced styling options.
 */
declare class Table extends ClassComponent<TableProps, TableSlots, TableEmits, TableExpose> {}

// ---TYPES-------------------------------
export type DataField = string
export type DataType = "string" | "number" | "select" | "date"
export type Sort = "asc" | "desc" | null
export type Search = string
export type Page = number
export type Sorted = Record<DataField, Sort>
export type Widths = Record<DataField, number>
export type Filters = Record<DataField, any>
export type DataSource = Array<Record<string, any>>
export type DataGrouping = Record<DataField, Array<Record<string, any>>>
export type ResultData = Record<DataField, Array<Record<string, any>>>

type EditorCell = {
  editable?: boolean
}
// Фильтры и cell-редакторы v-bind'ятся прямо в контрол, поэтому принимают и его `class`/`classes`
// (контракт props 1.0 — dev-patterns §2 A–C), а не только `Base*Props`-часть.
type FilterInputProps = Partial<BaseInputProps> & Pick<InputProps, "class" | "classes">
type FilterSelectProps = Partial<BaseSelectProps> & Pick<SelectProps, "class" | "classes">
type FilterCalendarProps = Partial<BaseCalendarProps> & Pick<CalendarProps, "class" | "classes">
export type EditInput = EditorCell & {
  editorProps?: FilterInputProps
}
type InputDataType = {
  type?: "string" | "number"
  filterProps?: FilterInputProps
  editable?: EditInput | boolean
}
export type EditSelect = EditorCell & {
  editorProps?: FilterSelectProps
}
type SelectDataType = {
  type?: "select"
  filterProps?: FilterSelectProps
  editable?: EditSelect | boolean
}
export type EditDate = EditorCell & {
  editorProps?: FilterCalendarProps
}
type DateDataType = {
  type?: "date"
  filterProps?: FilterCalendarProps
  editable?: EditDate | boolean
}

// ---INTERFACES--------------------------

/**
 * Represents toolbar configuration for the table.
 */
export interface TableToolbar {
  /**
   * Indicates whether the toolbar is visible.
   * @type {boolean | undefined}
   */
  visible?: boolean

  /**
   * Enables search input in the toolbar.
   * @type {boolean | undefined}
   */
  searchable?: boolean
}

/**
 * Sorting configuration for the table.
 */
export interface TableSort {
  /**
   * Indicates whether sorting is enabled.
   * @type {boolean | undefined}
   */
  visible?: boolean

  /**
   * Icon used for sorting.
   * @type {"Bars" | "Arrow" | undefined}
   */
  icon?: "Bars" | "Arrow"
}

/**
 * Filtering configuration for the table.
 */
export interface TableFilter {
  /**
   * Indicates whether filtering is enabled.
   * @type {boolean | undefined}
   */
  visible?: boolean

  /**
   * Message displayed when no filters are applied.
   * @type {string | undefined}
   */
  emptyFilterText?: string

  /**
   * Enables a "clear all filters" option.
   * @type {boolean | undefined}
   */
  clearAll?: boolean
}

/**
 * Grouping configuration for the table.
 */
export interface TableGrouping {
  /**
   * Indicates whether grouping is enabled.
   * @type {boolean | undefined}
   */
  visible?: boolean

  /**
   * The field used for grouping data.
   * @type {string | undefined}
   */
  groupField?: string
}

/**
 * Pagination configuration for the table.
 */
export interface TablePagination extends Omit<PaginationProps, "total" | "modelValue"> {
  /**
   * Indicates whether pagination is visible.
   * @type {boolean | undefined}
   */
  visible?: boolean

  /**
   * The starting page for pagination.
   * @type {number | undefined}
   */
  startPage?: number
}

/**
 * Configuration object for async data loading (mode 3: object).
 */
export interface TableAsyncDataConfig {
  /**
   * URL endpoint for fetching data.
   * @type {string}
   */
  url: string

  /**
   * Optional headers for the fetch request.
   * @type {Record<string, string> | undefined}
   */
  headers?: Record<string, string>

  /**
   * Optional query parameters for the fetch request.
   * @type {Record<string, any> | undefined}
   */
  query?: Record<string, any>
}

/**
 * Parameters passed to async data function (mode 4: function).
 */
export interface TableAsyncDataParams {
  /**
   * Current filter values applied to columns.
   * @type {Filters}
   */
  filters: Filters

  /**
   * Current sorting configuration.
   * @type {Sorted}
   */
  sort: Sorted

  /**
   * Current search query.
   * @type {Search}
   */
  search: Search

  /**
   * Current pagination state.
   * @type {{ page: Page; size: Page }}
   */
  pagination: {
    page: Page
    size: Page
  }
}

/**
 * Result returned by async data function (mode 4: function).
 */
export interface TableAsyncDataResult {
  /**
   * Array of data records for the current page.
   * @type {DataSource}
   */
  dataSource: DataSource

  /**
   * Total count of all records (for pagination calculation).
   * @type {number}
   */
  total: number
}

/**
 * Represents a column configuration for the Table component.
 *
 * Supports features like sorting, filtering, resizing, templates, and custom styles.
 */
export type TableColumn = {
  /**
   * The field in the data source corresponding to this column.
   * @type {DataField | undefined}
   */
  dataField?: DataField

  /**
   * The internal name of the column.
   * @type {string | undefined}
   */
  name?: string

  /**
   * The caption displayed in the column header.
   * @type {string | undefined}
   */
  caption?: string

  /**
   * Controls the visibility of the column.
   * @type {boolean | undefined}
   */
  visible?: boolean

  /**
   * The width of the column in pixels.
   * @type {number | undefined}
   */
  width?: number

  /**
   * The minimum width of the column in pixels.
   * @type {number | undefined}
   */
  minWidth?: number

  /**
   * The maximum width of the column in pixels.
   * @type {number | undefined}
   */
  maxWidth?: number

  /**
   * Indicates whether filtering is enabled for the column.
   * @type {boolean | undefined}
   */
  filterable?: boolean

  /**
   * Indicates whether sorting is enabled for the column.
   * @type {boolean | undefined}
   */
  sortable?: boolean

  /**
   * Indicates whether the column can be resized.
   * @type {boolean | undefined}
   */
  resizable?: boolean

  /**
   * The default filter value for the column.
   * @type {any | undefined}
   */
  defaultFilter?: any

  /**
   * The default sorting order for the column.
   * @type {Sort | undefined}
   */
  defaultSort?: Sort

  /**
   * Input mask applied to the column values.
   * @type {BaseInputProps["maskInput"] | undefined}
   */
  mask?: BaseInputProps["maskInput"]

  /**
   * Template for rendering cell content in the column.
   * @type {string | undefined}
   */
  cellTemplate?: string

  /**
   * Sets the value of a cell in the column.
   * @param {TableColumn} column - The column configuration.
   * @param {any} value - The new value for the cell.
   * @param {any} [data] - The row data to which the cell belongs.
   * @returns {any}
   */
  setCellValue?(column: TableColumn, value: any, data?: any): any

  /**
   * Callback that is invoked when the column cell is clicked.
   * @param {TableColumn} column - The column configuration.
   * @param {any} data - The row data for the clicked cell.
   * @param {number} indexRow - The index of the clicked row.
   */
  onClick?(column: TableColumn, data: any, indexRow: number): void

  /**
   * Карта классов колонки (dev-patterns §2 B). Бывший вложенный `class`-объект.
   * - `th` — ячейка заголовка (`<th>`), `headerText` — текст в ней (бывший `colText`).
   * - `filter` — фильтр-контрол колонки (бывший `colFilter`).
   * - `td` — ячейка данных, `cellText` — контент внутри неё.
   * - `summary` — ячейка итога в `<tfoot>` (бывший `tf`), `summaryText` — её текст (бывший `sumText`).
   *
   * Классы самого фильтра-компонента переехали в `filterProps`: бывший `colFilterClass` →
   * `filterProps.classes.base`, `colFilterClassBody` → `filterProps.class`.
   */
  classes?: {
    /** Ячейка заголовка `<th>`. */
    th?: StyleClass
    /** Текст заголовка колонки (бывший `colText`). */
    headerText?: StyleClass | "text-left text-surface-400 dark:text-surface-500"
    /** Фильтр-контрол колонки (бывший `colFilter`). */
    filter?: StyleClass
    /** Ячейка данных `<td>`. */
    td?: StyleClass | "px-6 py-4 text-surface-800 dark:text-surface-300"
    /** Контент внутри ячейки. */
    cellText?: StyleClass | "flex items-center whitespace-pre-line overflow-auto"
    /** Ячейка итога в `<tfoot>` (бывший `tf`). */
    summary?: StyleClass
    /** Текст итога (бывший `sumText`). */
    summaryText?: StyleClass | "text-left text-surface-400 dark:text-surface-500"
  }
} & (InputDataType | SelectDataType | DateDataType)

export interface TableColumnPrivate extends Omit<TableColumn, "dataField"> {
  id: string
  dataField: string
  /** Резолвленный флаг фильтруемости колонки (`column.filterable` → глобальный `filter`). Internal. */
  filterable: boolean
  /** Резолвленный флаг сортируемости колонки (`column.sortable` → глобальный `sort`). Internal. */
  sortable: boolean
  /** Резолвленный флаг изменяемой ширины (`column.resizable` → глобальный `resizableColumns`). Internal. */
  resizable: boolean
  /**
   * Резолвленный флаг «у ячеек колонки есть редактор» (`column.editable` →
   * `column.editable.editable` → глобальный `editable`). Само поле `editable` несёт конфиг
   * редактора, поэтому гейт живёт отдельно. Internal.
   */
  hasEditor: boolean
  /** Compound-API: ключ родительской `<ColumnGroup>` (null — колонка вне группы). Internal. */
  _groupKey?: number | null
  /** Compound-API: захваченный `#cell` scoped-slot со `<Column>`. Internal. */
  _cellSlot?: (props: any) => any
  /** Compound-API: захваченный `#header` scoped-slot со `<Column>`. Internal. */
  _headerSlot?: (props: any) => any
  /** Compound-API: захваченный `#filter` scoped-slot со `<Column>`. Internal. */
  _filterSlot?: (props: any) => any
}

/**
 * Summary configuration for table rows.
 */
export interface TableSummary {
  /**
   * The field for which the summary is calculated.
   * @type {string | undefined}
   */
  dataField?: string

  /**
   * The name of the summary.
   * @type {string | undefined}
   */
  name?: string

  /**
   * Display format for the summary.
   * @type {string | "Sum: {0}" | "Min: {0}" | "Max: {0}" | "Avg: {0}" | "Count: {0}" | undefined}
   */
  displayFormat?: string | "Sum: {0}" | "Min: {0}" | "Max: {0}" | "Avg: {0}" | "Count: {0}"

  /**
   * The type of summary calculation.
   * @type {"sum" | "min" | "max" | "avg" | "count" | undefined}
   */
  type?: "sum" | "min" | "max" | "avg" | "count"

  /**
   * The data type for the summary.
   * @type {DataType | undefined}
   */
  dataType?: DataType

  /**
   * Customizes the summary text.
   * @param {TableSummary} summary - The summary configuration.
   * @param {string} result - The calculated result.
   * @returns {string}
   */
  customizeText?(summary: TableSummary, result: string): string
}

export interface TableSummaryPrivate extends TableSummary {
  id: string
  dataField: string
  dataType: DataType
}

/**
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-table>` (добавляется `ClassesMap`).
 *
 * **Element-ключи** (аддитивные, склеиваются с базой через twMerge):
 * - `toolbar` — панель инструментов `[data-table-toolbar]`.
 * - `header` / `footer` — слоты шапки и подвала (`[data-table-header]` / `[data-table-footer]`).
 * - `body` — обёртка таблицы `[data-table-body]`.
 * - `viewport` — скролл-контейнер `[data-table-viewport]` (бывший `bodyTable`).
 * - `table` — сам `<table data-table-element>`.
 * - `thead` / `tbody` / `tfoot` — секции таблицы.
 * - `th` — ячейка заголовка `[data-table-thead-col]`.
 * - `td` — ячейка данных `[data-table-tbody-td]` (бывший `cellText`, который вопреки имени шёл на `<td>`).
 * - `cell` — контент внутри ячейки `[data-table-tbody-cell-template]`.
 * - `group` / `groupText` — строка группировки и её текст.
 * - `pagination` — корень [Pagination](./pagination.md).
 *
 * **Aspect-ключи** (заменяющие: `props ?? options ?? default`, `""` отключает):
 * - `mark` — подсветка совпадений поиска (бывший `maskQuery`).
 * - `rowActive` / `rowHover` — активная строка и hover (бывшие `activeRow` / `hoverRows`).
 * - `animation` — transition таблицы.
 * - `border` — общий цвет рамок (бывший `border` / `border.default`).
 * - `borderTable`, `borderHeader`, `borderFilter`, `borderHead`, `borderCell`, `borderSummary`,
 *   `borderPagination`, `borderFooter` — рамка конкретного региона; при отсутствии берётся `border`.
 */
export declare type TableClassKey =
  | "toolbar"
  | "header"
  | "footer"
  | "body"
  | "viewport"
  | "table"
  | "thead"
  | "tbody"
  | "tfoot"
  | "th"
  | "td"
  | "cell"
  | "group"
  | "groupText"
  | "pagination"
  | "mark"
  | "rowActive"
  | "rowHover"
  | "animation"
  | "border"
  | "borderTable"
  | "borderHeader"
  | "borderFilter"
  | "borderHead"
  | "borderCell"
  | "borderSummary"
  | "borderPagination"
  | "borderFooter"

/**
 * Резолвленные не-классовые настройки отображения таблицы — то, что осталось от bag'а `styles`
 * после выноса классов в `classes` и остальных полей в top-level props.
 */
export declare type TableSettings = {
  width: string
  height: string
  stripedRows: boolean
  horizontalLines: boolean
  verticalLines: boolean
  filterLines: boolean
  cellHeight?: number
  borderRadius: number
  defaultColumnWidth?: string
}

/**
 * Props for the Table component.
 */
export declare type TableProps = {
  /**
   * The styling mode of the table.
   * @type {StyleMode | undefined}
   */
  mode?: StyleMode

  /**
   * The data source for the table.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<Array<any> | []> | undefined}
   */
  dataSource?: MaybeRef<Array<any> | []>

  /**
   * Toolbar configuration or visibility toggle.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<TableToolbar | boolean> | undefined}
   */
  toolbar?: MaybeRef<TableToolbar | boolean>

  /**
   * Enables inline editing for table cells.
   * @type {boolean | undefined}
   */
  editable?: boolean

  /**
   * Sorting configuration or visibility toggle.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<TableSort | boolean> | undefined}
   */
  sort?: MaybeRef<TableSort | boolean>

  /**
   * Filtering configuration or visibility toggle.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<TableFilter | boolean> | undefined}
   */
  filter?: MaybeRef<TableFilter | boolean>

  /**
   * Grouping configuration or group field name.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<TableGrouping | string> | undefined}
   */
  grouping?: MaybeRef<TableGrouping | string>

  /**
   * Enables column resizing.
   * @type {boolean | undefined}
   */
  resizableColumns?: boolean

  /**
   * Pagination configuration or visibility toggle.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<TablePagination | boolean> | undefined}
   */
  pagination?: MaybeRef<TablePagination | boolean>

  /**
   * Enables search functionality.
   * @type {boolean | undefined}
   */
  searchable?: boolean

  /**
   * Configuration for table columns.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<boolean | Array<TableColumn>> | undefined}
   */
  columns?: MaybeRef<boolean | Array<TableColumn>>

  /**
   * Configuration for summary rows.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<boolean | Array<TableSummary>> | undefined}
   */
  summary?: MaybeRef<boolean | Array<TableSummary>>

  /**
   * Number of rows visible in the table.
   * @type {number | undefined}
   */
  visibleRows?: number

  /**
   * Number of loading rows displayed during data fetching.
   * @type {number | undefined}
   */
  loadingRows?: number

  /**
   * Message displayed when there is no data.
   * @type {string | undefined}
   */
  emptyText?: string

  /**
   * Message displayed when no columns are defined.
   * @type {string | undefined}
   */
  emptyColumnsText?: string

  /**
   * Accessible table caption, rendered as a visually-hidden `<caption>` element
   * (for screen readers). Use the `caption` slot to provide HTML content instead.
   * @type {string | undefined}
   */
  caption?: string

  /**
   * Row virtualization for large client-side tables (renders only the visible window).
   *
   * - `undefined` (default) — auto-enabled when row count exceeds the threshold
   *   (client-side, non-grouped, non-paginated tables only).
   * - `false` — always render every row (legacy behavior).
   * - `true` — force-enable regardless of row count.
   * - object — force-enable with config: `rowHeight` (fixed px, default `heightCell + 9`),
   *   `overscan` (extra rows above/below, default `6`), `threshold` (auto cutoff, default `100`).
   *
   * Not applied with `grouping`, active `pagination`, or `asyncData: true`/function mode.
   * Fixed row height — multi-line cells are clipped to `rowHeight`.
   * @type {boolean | { rowHeight?: number; overscan?: number; threshold?: number } | undefined}
   */
  virtual?: boolean | { rowHeight?: number; overscan?: number; threshold?: number }

  /**
   * Number of rows simulated during data loading.
   * @type {number | 100 | 1000 | 10000 | undefined}
   */
  loadingThreshold?: number | 100 | 1000 | 10000

  /**
   * Total number of rows in the data source.
   * @type {number | undefined}
   */
  total?: number

  /**
   * Configuration for asynchronous data loading.
   *
   * Supports four modes:
   * - `true` (boolean) - Async mode: disables client-side filtering, sorting, searching, and pagination calculations.
   *   User handles data loading via events. dataSource is still required.
   *
   * - `string` - URL mode: fetches all data once on mount from the specified URL.
   *   Returns array of data. All standard features (filters, sort, search, pagination) work on client-side.
   *
   * - `TableAsyncDataConfig` (object) - Config mode: same as URL mode but with additional fetch options
   *   (headers, query parameters).
   *
   * - `(params: TableAsyncDataParams) => Promise<TableAsyncDataResult>` (function) - Function mode: user-defined async function.
   *   Called on mount and when filters/sort/search/pagination change. Must return dataSource and totalCount.
   *
   * @type {true | string | TableAsyncDataConfig | ((params: TableAsyncDataParams) => Promise<TableAsyncDataResult>) | undefined}
   */
  asyncData?: true | string | TableAsyncDataConfig | ((params: TableAsyncDataParams) => Promise<TableAsyncDataResult>)

  /**
   * Custom CSS class for the table container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов и aspect-ключей; `root` ≡ `class`. См. `TableClassKey`.
   * @type {ClassesMap<TableClassKey> | undefined}
   */
  classes?: ClassesMap<TableClassKey>

  /**
   * Ширина таблицы. Число трактуется как px. Бывший `styles.width`.
   * @type {TWidth | undefined}
   */
  width?: TWidth

  /**
   * Высота таблицы. Число трактуется как px. Бывший `styles.height`.
   * @type {THeight | undefined}
   */
  height?: THeight

  /**
   * Чередующаяся заливка строк. Бывший `styles.isStripedRows`.
   * @type {boolean | undefined}
   */
  stripedRows?: boolean

  /**
   * Горизонтальные линии между строками. Бывший `styles.horizontalLines`.
   * @type {boolean | undefined}
   */
  horizontalLines?: boolean

  /**
   * Вертикальные линии между колонками. Бывший `styles.verticalLines`.
   * @type {boolean | undefined}
   */
  verticalLines?: boolean

  /**
   * Линии вокруг строки фильтров. Бывший `styles.filterLines`.
   * @type {boolean | undefined}
   */
  filterLines?: boolean

  /**
   * Высота ячейки в px. Бывший `styles.heightCell`.
   * @type {number | undefined}
   */
  cellHeight?: number

  /**
   * Радиус скругления таблицы в px (`0` при `mode: "underlined"`). Бывший `styles.borderRadiusPx`.
   * @type {number | undefined}
   */
  borderRadius?: number

  /**
   * Ширина колонки по умолчанию (CSS-строка). Бывший `styles.defaultWidthColumn`.
   * @type {"max-width: 600px;min-width:100px;width:auto" | string | undefined}
   */
  defaultColumnWidth?: "max-width: 600px;min-width:100px;width:auto" | string
}

interface DynamicSlots {
  [key: string]: (args: {
    key: string
    column: TableColumn
    rowData: Record<string, any>
    value: string
    valueWithMarker: string
    isCloseEditor: (isActive: boolean) => boolean
    editValue: (value: any) => false | any
  }) => VNode[]
}
export declare type TableSlots = {
  toolbar(): VNode[]
  header(): VNode[]
  footer(): VNode[]
  group(args: { item: string; length: number }): VNode[]
  /** Accessible `<caption>` content (HTML allowed). Overrides the `caption` prop. */
  caption(): VNode[]
  /** Empty state shown when there is no data. Overrides the `noData` text. */
  empty(): VNode[]
  /** Empty state shown when no columns are defined. Overrides the `noColumn` text. */
  "empty-columns"(): VNode[]
  /** Empty state shown when filters/search produce no rows. Overrides the `noFilter` text. */
  "empty-filter"(): VNode[]
} & DynamicSlots
/**
 * Defines the events emitted by the Table component.
 */
export declare type TableEmits = {
  /**
   * Emitted when sorting is applied.
   * @param event
   * @param {Object} payload - The sorting payload.
   * @param {Array<TableColumnPrivate>} payload.dataColumns - The current state of all columns.
   * @param {Sorted} payload.sortedFields - The fields and their sorting order.
   */
  (event: "sort", payload: { dataColumns: Array<TableColumnPrivate>; sortedFields: Sorted }): void

  /**
   * Emitted when filtering is applied.
   * @param event
   * @param {Object} payload - The filtering payload.
   * @param {Array<TableColumnPrivate>} payload.dataColumns - The current state of all columns.
   * @param {Filters} payload.filteredFields - The fields and their filter values.
   */
  (event: "filter", payload: { dataColumns: Array<TableColumnPrivate>; filteredFields: Filters }): void

  /**
   * Emitted when a search query is applied.
   * @param event
   * @param {Search} payload - The search query string.
   */
  (event: "search", payload: Search): void

  /**
   * Emitted with the result data after processing.
   * @param event
   * @param {ResultData} payload - The processed result data.
   */
  (event: "result-data", payload: ResultData): void

  /**
   * Emitted when the page is switched.
   * @param event
   * @param {Page} payload - The new page number.
   */
  (event: "switch-page", payload: Page): void

  /**
   * Emitted when the page size is changed.
   * @param event
   * @param {Page} payload - The new page size.
   */
  (event: "switch-page-size", payload: Page): void

  /**
   * Emitted before editing a cell.
   * @param event
   * @param {Object} payload - The cell editing payload.
   * @param {any} payload.newValue - The new value for the cell.
   * @param {any} payload.oldValue - The previous value of the cell.
   * @param {string} payload._key - The key identifying the row.
   * @param {TableColumnPrivate} payload.column - The column being edited.
   */
  (event: "before-edit-cell", payload: { newValue: any; oldValue: any; _key: string; column: TableColumnPrivate }): void

  /**
   * Emitted after editing a cell.
   * @param event
   * @param {Object} payload - The cell editing payload.
   * @param {any} payload.newValue - The new value for the cell.
   * @param {any} payload.oldValue - The previous value of the cell.
   * @param {string} payload._key - The key identifying the row.
   * @param {TableColumnPrivate} payload.column - The column that was edited.
   */
  (event: "after-edit-cell", payload: { newValue: any; oldValue: any; _key: string; column: TableColumnPrivate }): void

  /**
   * Emitted before editing a row.
   * @param event
   * @param {Object} payload - The row editing payload.
   * @param {any} payload.newValue - The new value for the row.
   * @param {any} payload.oldValue - The previous value of the row.
   * @param {string} payload._key - The key identifying the row.
   */
  (event: "before-edit-row", payload: { newValue: any; oldValue: any; _key: string }): void

  /**
   * Emitted after editing a row.
   * @param event
   * @param {Object} payload - The row editing payload.
   * @param {any} payload.newValue - The new value for the row.
   * @param {any} payload.oldValue - The previous value of the row.
   * @param {string} payload._key - The key identifying the row.
   */
  (event: "after-edit-row", payload: { newValue: any; oldValue: any; _key: string }): void

  /**
   * Emitted when a row is added.
   * @param event
   * @param {Object} payload - The row addition payload.
   * @param {any} payload.value - The value of the new row.
   * @param {number} payload.index - The index where the row is added.
   * @param {string} payload._key - The key identifying the new row.
   */
  (event: "add-row", payload: { value: any; index: number | null; _key: string }): void

  /**
   * Emitted when a row is deleted.
   * @param event
   * @param {Object} payload - The row deletion payload.
   * @param {any} payload.value - The value of the deleted row.
   * @param {number} payload.index - The index of the deleted row.
   * @param {string} payload._key - The key identifying the deleted row.
   */
  (event: "delete-row", payload: { value: any; index: number | null; _key: string }): void

  /**
   * Emitted when a row is clicked.
   * @param event
   * @param {Object} payload - The row click payload.
   * @param {HTMLElement} payload.eventEl - The HTML element triggering the click.
   * @param {any} payload.data - The data associated with the clicked row.
   * @param {number} payload.indexRow - The index of the clicked row.
   */
  (event: "click-row", payload: { eventEl: HTMLElement; data: any; indexRow: number }): void

  /**
   * Emitted when a cell is clicked.
   * @param event
   * @param {Object} payload - The cell click payload.
   * @param {HTMLElement} payload.eventEl - The HTML element triggering the click.
   * @param {TableColumnPrivate} payload.column - The column of the clicked cell.
   * @param {any} payload.value - The value of the clicked cell.
   * @param {any} payload.valueWithMarker - The marked value of the clicked cell.
   * @param {any} payload.data - The data associated with the clicked row.
   * @param {number} payload.indexRow - The index of the clicked row.
   */
  (
    event: "click-cell",
    payload: {
      eventEl: HTMLElement
      column: TableColumnPrivate
      value: any
      valueWithMarker: any
      data: any
      indexRow: number
    }
  ): void

  /**
   * Emitted when the table enters or exits the loading state.
   * @param event
   * @param {boolean} payload - `true` if loading, otherwise `false`.
   */
  (event: "loading", payload: boolean): void

  /**
   * Emitted when all filters are cleared.
   * @param event
   */
  (event: "clear-filter"): void
}
/**
 * Exposes state, props, and methods for interacting with the Table component programmatically.
 */
export declare type TableExpose = {
  // ---REF-LINK----------------------------
  /**
   * Корневой DOM-элемент компонента (`<div data-table-component>`).
   * `undefined` до mount и при SSR.
   * @type {HTMLElement | undefined}
   */
  componentTable: HTMLElement | undefined

  // ---STATE-------------------------
  /**
   * Уникальный идентификатор текущей активной (выбранной) строки.
   * Формат: `{_key}-{indexRow}`, где _key - уникальный ключ строки, indexRow - её позиция.
   * @type {string | null}
   */
  activeRow: string
  /**
   * The current sorting state for all columns.
   * @type {Sorted}
   */
  sortColumns: Sorted

  /**
   * The current filtering state for all columns.
   * @type {Filters}
   */
  filterColumns: Filters

  /**
   * The current widths for all columns.
   * @type {Widths}
   */
  widthsColumns: Widths

  /**
   * The current search query.
   * @type {Search}
   */
  queryTable: Search

  /**
   * The current page number.
   * @type {Page}
   */
  pageTable: Page

  /**
   * The current page size.
   * @type {Page}
   */
  sizeTable: Page

  /**
   * The entire data source of the table.
   * @type {TableProps["dataSource"]}
   */
  allData: TableProps["dataSource"]

  /**
   * Indicates whether the table is in a loading state.
   * @type {boolean}
   */
  isLoading: boolean

  /**
   * The ID of the column currently being resized.
   * @type {string | null}
   */
  resizableColumn: string | null

  /**
   * The currently editable cell coordinates.
   * @type {{ indexRow: number; indexCol: number } | null}
   */
  editableCell: { indexRow: number; indexCol: number } | null

  // ---PROPS-------------------------------
  /**
   * The current styling mode of the table.
   * @type {TableProps["mode"]}
   */
  mode: TableProps["mode"]

  /**
   * Indicates whether the toolbar is visible.
   * @type {boolean}
   */
  isVisibleToolbar: boolean

  /**
   * Indicates whether search functionality is enabled.
   * @type {boolean}
   */
  isSearch: boolean

  /**
   * Indicates whether the "clear all filters" button is enabled.
   * @type {boolean}
   */
  isFilterClear: boolean

  /**
   * Indicates whether columns are defined.
   * @type {boolean}
   */
  isColumns: boolean

  /**
   * Indicates whether summary rows are defined.
   * @type {boolean}
   */
  isSummary: boolean

  /**
   * The number of rows to simulate during data loading.
   * @type {TableProps["loadingThreshold"]}
   */
  countDataOnLoading: TableProps["loadingThreshold"]

  /**
   * Класс подсветки совпадений поиска (aspect-ключ `classes.mark`).
   * @type {StyleClass}
   */
  classMark: StyleClass

  /**
   * The message displayed when there is no data.
   * @type {TableProps["emptyText"]}
   */
  noData: TableProps["emptyText"]

  /**
   * The message displayed when no columns are defined.
   * @type {TableProps["emptyText"]}
   */
  noColumn: TableProps["emptyText"]

  /**
   * The message displayed when no filters are applied.
   * @type {TableFilter["noFilter"]}
   */
  noFilter: TableFilter["noFilter"]

  /**
   * The icon used for sorting.
   * @type {TableSort["icon"]}
   */
  iconSort: TableSort["icon"]

  /**
   * Indicates whether column resizing is enabled.
   * @type {TableProps["resizableColumns"]}
   */
  resizedColumns: TableProps["resizableColumns"]

  /**
   * Indicates whether cell editing is enabled.
   * @type {TableProps["editable"]}
   */
  isEditCells: TableProps["editable"]

  /**
   * The total number of rows in the data source.
   * @type {number}
   */
  lengthData: number

  /**
   * The field used for grouping data.
   * @type {TableGrouping["groupField"] | null}
   */
  groupField: TableGrouping["groupField"] | null

  /**
   * Indicates whether filtering is enabled.
   * @type {boolean}
   */
  isFilter: boolean

  /**
   * Indicates whether sorting is enabled.
   * @type {boolean}
   */
  isSort: boolean

  /**
   * Indicates whether grouping is enabled.
   * @type {boolean}
   */
  isGroup: boolean

  /**
   * Indicates whether pagination is enabled.
   * @type {boolean}
   */
  isPagination: boolean

  // ---PAGINATION--------------------------
  /**
   * The starting page for pagination.
   * @type {TablePagination["startPage"]}
   */
  startPage: TablePagination["startPage"]

  /**
   * The styling mode of the pagination component.
   * @type {TablePagination["mode"]}
   */
  modePagination: TablePagination["mode"]

  /**
   * The current page size for pagination.
   * @type {TablePagination["pageSize"]}
   */
  pageSize: TablePagination["pageSize"]

  /**
   * The number of visible pages in pagination.
   * @type {TablePagination["visiblePages"]}
   */
  visibleNumberPages: TablePagination["visiblePages"]

  /**
   * The available sizes for the page size selector.
   * @type {TablePagination["pageSizes"]}
   */
  sizesSelector: TablePagination["pageSizes"]

  /**
   * Indicates whether informational text is displayed in pagination.
   * @type {TablePagination["infoText"]}
   */
  isInfoText: TablePagination["infoText"]

  /**
   * Indicates whether the page size selector is visible.
   * @type {TablePagination["pageSizeSelector"]}
   */
  isPageSizeSelector: TablePagination["pageSizeSelector"]

  /**
   * Показываются ли кнопки навигации пагинации (`navigationButtons`, default `true`).
   * @type {TablePagination["navigationButtons"]}
   */
  isNavigationButtons: TablePagination["navigationButtons"]

  // ---CELL--------------------------------
  /**
   * The height of table cells.
   * @type {number}
   */
  heightCell: number

  /**
   * The number of rows visible in the table.
   * @type {ReadRef<TableProps["visibleRows"]>}
   */
  countVisibleRows: ReadRef<TableProps["visibleRows"]>

  /**
   * The calculated height of the table.
   * @type {string}
   */
  heightTable: string

  // ---DATA--------------------------------
  /**
   * The raw data source of the table.
   * @type {Array<any>}
   */
  dataSource: Array<any>

  /**
   * The processed result data.
   * @type {ResultData}
   */
  resultDataSource: ResultData

  /**
   * The current column definitions for the table.
   * @type {Array<TableColumnPrivate>}
   */
  dataColumns: Array<TableColumnPrivate>

  /**
   * The current summary configurations for the table.
   * @type {Array<TableSummaryPrivate>}
   */
  dataSummary: Array<TableSummaryPrivate>

  /**
   * The computed summary data for the table.
   * @type {object}
   */
  summaryColumns: object

  // ---STYLE-------------------------------
  /**
   * Резолвленные не-классовые настройки отображения (`width`, `height`, `stripedRows`,
   * `horizontalLines`, `verticalLines`, `filterLines`, `cellHeight`, `borderRadius`,
   * `defaultColumnWidth`). Bag `styles` снят в 1.0.0 — это его безклассовый остаток.
   * @type {TableSettings}
   */
  settings: TableSettings

  /**
   * The calculated style for the table body.
   * @type {string}
   */
  tableBodyStyle: string

  /**
   * The base CSS class for the table component.
   * @type {StyleClass}
   */
  classBaseTable: StyleClass

  /**
   * The styling mode of the table.
   * @type {string}
   */
  modeStyle: string

  /**
   * Indicates whether dark mode is active.
   * Источник — `optionsTheme.darkModeSelector` (наличие селектора в DOM), а при отсутствии
   * конфигурации — `prefers-color-scheme: dark`.
   * @type {boolean}
   */
  isDark: boolean

  // ---METHODS-----------------------------
  /**
   * Adds a new row to the table.
   * @param {any} data - The data for the new row.
   * @returns {number | null} - The index of the added row, or null if the addition fails.
   * @remarks
   * When running tests or table row addition logic in a jsdom environment, ensure the table's container is properly initialized.
   * Some features may require updating jsdom to the latest version for full compatibility.
   */
  addRow(data?: any): number | null

  /**
   * Removes a row from the table by its key.
   * @param {string} [_key] - The key of the row to be removed.
   * @returns {any | null} The data of the deleted row, or null if no row was found.
   */
  deleteRow(_key?: string): any | null

  /**
   * Updates the values of a row in the table.
   * @param {string} [_key] - The key identifying which row to update.
   * @param {any} [data] - The new data to update the row with.
   * @returns {any | null} The updated row data, or null if no row was found.
   */
  updateRow(_key?: string, data?: any): any | null

  /**
   * Updates the value of a specific cell in the table.
   * @param {string} _key - The unique key identifying the row containing the cell to update.
   * @param {TableColumnPrivate} column - The column definition that identifies the cell to update.
   * @param {any} value - The new value to set for the cell.
   * @returns {any | null} - The updated cell data if successful, or null if the cell or row was not found.
   */
  updateCell(_key?: string, column?: TableColumnPrivate, value?: any): any | null

  /**
   * Retrieves a column by its data field.
   * @param {TableColumn["dataField"]} dataField - The data field of the column.
   * @param {number} [index] - The index of the column if there are duplicates.
   * @returns {TableColumnPrivate | undefined} - The column configuration or `undefined` if not found.
   */
  getColumn(dataField: TableColumn["dataField"], index?: number): TableColumnPrivate | undefined

  /**
   * Updates the data source of the table.
   * @returns {Array<Record<string, any>>} - The updated data source.
   */
  updateDataSource(): Array<Record<string, any>>

  /**
   * Sorts the table by a specified column.
   * @param {TableColumn["dataField"]} dataField - The field to sort by.
   * @param {Sort} [value] - The sorting direction (`asc`, `desc`, or `null`).
   */
  sorting(dataField: TableColumn["dataField"], value?: Sort): void

  /**
   * Filters the table by a specified column.
   * @param {TableColumn["dataField"]} dataField - The field to filter by.
   * @param {any} value - The filter value.
   */
  filtering(dataField: TableColumn["dataField"], value: any): void

  /**
   * Searches the table using a query.
   * @param {Search} value - The search query.
   */
  searching(value: Search): void

  /**
   * Switches the table to a specific page.
   * @param {Page} page - The page number to switch to.
   */
  switchPage(page: Page): void

  /**
   * Changes the page size of the table.
   * @param {Page} pageSize - The new page size.
   */
  switchPageSize(pageSize: Page): void

  /**
   * Starts the loading state for the table.
   */
  startLoading(): void

  /**
   * Stops the loading state for the table.
   */
  stopLoading(): void

  /**
   * Clears all filters applied to the table.
   */
  clearFilter(): void

  /**
   * Updates the height of the table dynamically.
   */
  updateHeightTable(): void

  /**
   * Reloads data from asyncData function (mode 4).
   * Only works when asyncData is configured as a function.
   */
  reloadData(): Promise<void>

  /**
   * Устанавливает фокус на корневой контейнер таблицы (`tabindex="-1"` — только программный фокус).
   * @param {FocusOptions} [options] - Стандартные опции `HTMLElement.focus()`, например `preventScroll`.
   */
  focus(options?: FocusOptions): void
}
export declare type TableOption = Pick<
  TableProps,
  | "mode"
  | "toolbar"
  | "editable"
  | "sort"
  | "filter"
  | "grouping"
  | "resizableColumns"
  | "pagination"
  | "searchable"
  | "visibleRows"
  | "loadingRows"
  | "emptyText"
  | "emptyColumnsText"
  | "loadingThreshold"
  | "virtual"
  | "class"
  | "classes"
  | "width"
  | "height"
  | "stripedRows"
  | "horizontalLines"
  | "verticalLines"
  | "filterLines"
  | "cellHeight"
  | "borderRadius"
  | "defaultColumnWidth"
>

// ---COMPOUND API (<Column> / <ColumnGroup>) -----------------------------------
// Renderless descriptors для compound-режима `<Table><Column>`. Свой DOM не рендерят —
// <Table> читает их props/slots через VNode-walk (см. Table.vue) и строит <th>/ячейки сам.
// Schema-driven `:columns` при наличии выигрывает (backward compat).

/**
 * Props for the `<Column>` descriptor. Полностью повторяют [TableColumn](#TableColumn) — одна колонка
 * в compound-режиме. В шаблоне kebab-case: `data-field`, `is-sort`, `is-filter`, `data-type`…
 */
export declare type ColumnProps = TableColumn

/**
 * Scoped slots `<Column>`. Пробрасываются `<Table>` в рендер соответствующей колонки.
 */
export declare type ColumnSlots = {
  /**
   * Кастомный рендер ячейки колонки (замена дефолтного `markerParts`-рендера). Slot-props
   * совпадают с `cellTemplate`-slot на `<Table>`.
   */
  cell(props: {
    rowData: Record<string, any>
    value: any
    valueWithMarker: string
    column: TableColumnPrivate
    isCloseEditor: (isActive: boolean) => void
    editValue: (value: any) => void
  }): VNode[]
  /**
   * Кастомный рендер заголовка колонки (замена `caption`-текста в `<th>`).
   */
  header(props: { column: TableColumnPrivate }): VNode[]
  /**
   * Кастомный рендер фильтра колонки (замена встроенного Input/Select/Calendar-фильтра).
   */
  filter(props: { column: TableColumnPrivate }): VNode[]
  /**
   * Default slot — для вложения `<Column>` внутрь `<ColumnGroup>`; напрямую не рендерится.
   */
  default(): VNode[]
}

/**
 * `<Column>` — renderless column descriptor for the compound `<Table>` API.
 *
 * ```vue
 * <Table :data-source="rows">
 *   <Column data-field="name" caption="Имя" is-sort>
 *     <template #cell="{ rowData }"><strong>{{ rowData.name }}</strong></template>
 *   </Column>
 * </Table>
 * ```
 */
declare class Column extends ClassComponent<ColumnProps, ColumnSlots, null, NonNullable<unknown>> {}

/**
 * Props for the `<ColumnGroup>` descriptor (multi-level headers).
 */
export declare type ColumnGroupProps = {
  /**
   * Заголовок группы — рендерится в верхнем ряду шапки как `<th colspan>` над колонками группы.
   * @type {string | undefined}
   */
  caption?: string

  /**
   * Custom CSS class для группового `<th>`.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
}

/**
 * Slots of the `<ColumnGroup>` descriptor.
 */
export declare type ColumnGroupSlots = {
  /**
   * Default slot — вложенные `<Column>` группы.
   */
  default(): VNode[]
}

/**
 * `<ColumnGroup>` — renderless multi-level-header descriptor for the compound `<Table>` API.
 *
 * ```vue
 * <Table :data-source="rows">
 *   <ColumnGroup caption="Личное">
 *     <Column data-field="name" />
 *     <Column data-field="age" type="number" />
 *   </ColumnGroup>
 * </Table>
 * ```
 */
declare class ColumnGroup extends ClassComponent<ColumnGroupProps, ColumnGroupSlots, null, NonNullable<unknown>> {}

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Table: GlobalComponentConstructor<Table>
    Column: GlobalComponentConstructor<Column>
    ColumnGroup: GlobalComponentConstructor<ColumnGroup>
  }
}

export default Table
export { Column, ColumnGroup }

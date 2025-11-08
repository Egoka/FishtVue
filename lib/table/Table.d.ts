import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass, StyleMode, THeight, TWidth } from "../types"
import { BaseInputProps } from "fishtvue/input"
import { BaseSelectProps } from "fishtvue/select"
import { PaginationProps } from "fishtvue/pagination"
import { BaseCalendarProps } from "fishtvue/calendar"

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
  isEdit?: boolean
}
export type EditInput = EditorCell & {
  editorOptions?: Partial<BaseInputProps>
}
type InputDataType = {
  type?: "string" | "number"
  paramsFilter?: Partial<BaseInputProps>
  edit?: EditInput | boolean
}
export type EditSelect = EditorCell & {
  editorOptions?: Partial<BaseSelectProps>
}
type SelectDataType = {
  type?: "select"
  paramsFilter?: Partial<BaseSelectProps>
  edit?: EditSelect | boolean
}
export type EditDate = EditorCell & {
  editorOptions?: Partial<BaseCalendarProps>
}
type DateDataType = {
  type?: "date"
  paramsFilter?: Partial<BaseCalendarProps>
  edit?: EditDate | boolean
}

// ---INTERFACES--------------------------

/**
 * Represents toolbar configuration for the table.
 */
export interface IToolbar {
  /**
   * Indicates whether the toolbar is visible.
   * @type {boolean | undefined}
   */
  visible?: boolean

  /**
   * Enables search input in the toolbar.
   * @type {boolean | undefined}
   */
  search?: boolean
}

/**
 * Sorting configuration for the table.
 */
export interface ISort {
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
export interface IFilter {
  /**
   * Indicates whether filtering is enabled.
   * @type {boolean | undefined}
   */
  visible?: boolean

  /**
   * Message displayed when no filters are applied.
   * @type {string | undefined}
   */
  noFilter?: string

  /**
   * Enables a "clear all filters" option.
   * @type {boolean | undefined}
   */
  isClearAllFilter?: boolean
}

/**
 * Grouping configuration for the table.
 */
export interface IGrouping {
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
 * Represents a column configuration for the Table component.
 *
 * Supports features like sorting, filtering, resizing, templates, and custom styles.
 */
export type IColumn = {
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
  isFilter?: boolean

  /**
   * Indicates whether sorting is enabled for the column.
   * @type {boolean | undefined}
   */
  isSort?: boolean

  /**
   * Indicates whether the column can be resized.
   * @type {boolean | undefined}
   */
  isResized?: boolean

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
   * @param {IColumn} column - The column configuration.
   * @param {any} value - The new value for the cell.
   * @param {any} [data] - The row data to which the cell belongs.
   * @returns {any}
   */
  setCellValue?(column: IColumn, value: any, data?: any): any

  /**
   * Callback that is invoked when the column cell is clicked.
   * @param {IColumn} column - The column configuration.
   * @param {any} data - The row data for the clicked cell.
   * @param {number} indexRow - The index of the clicked row.
   */
  onClick?(column: IColumn, data: any, indexRow: number): void

  /**
   * Custom CSS classes for the column.
   */
  class?: {
    /**
     * CSS class for the header cell (`th`).
     * @type {StyleClass | undefined}
     */
    th?: StyleClass

    /**
     * CSS class for the column filter input.
     * @type {StyleClass | undefined}
     */
    colFilter?: StyleClass

    /**
     * CSS class for the column filter container.
     * @type {StyleClass | "border-none font-normal" | undefined}
     */
    colFilterClass?: StyleClass | "border-none font-normal"

    /**
     * CSS class for the column filter body.
     * @type {StyleClass | "tm-0 my-1" | undefined}
     */
    colFilterClassBody?: StyleClass | "tm-0 my-1"

    /**
     * CSS class for text content in the column header.
     * @type {StyleClass | "text-left text-gray-400 dark:text-gray-500" | undefined}
     */
    colText?: StyleClass | "text-left text-gray-400 dark:text-gray-500"

    /**
     * CSS class for table data cells (`td`).
     * @type {StyleClass | "px-6 py-4 text-gray-800 dark:text-gray-300" | undefined}
     */
    td?: StyleClass | "px-6 py-4 text-gray-800 dark:text-gray-300"

    /**
     * CSS class for text content within cells.
     * @type {StyleClass | "flex items-center whitespace-pre-line overflow-auto" | undefined}
     */
    cellText?: StyleClass | "flex items-center whitespace-pre-line overflow-auto"

    /**
     * CSS class for the footer cell (`tf`).
     * @type {StyleClass | undefined}
     */
    tf?: StyleClass

    /**
     * CSS class for summary text in the footer.
     * @type {StyleClass | "text-left text-gray-400 dark:text-gray-500" | undefined}
     */
    sumText?: StyleClass | "text-left text-gray-400 dark:text-gray-500"
  }
} & (InputDataType | SelectDataType | DateDataType)

export interface IColumnPrivate extends Omit<IColumn, "dataField"> {
  id: string
  dataField: string
  isEdit: boolean
}

/**
 * Summary configuration for table rows.
 */
export interface ISummary {
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
   * @param {ISummary} summary - The summary configuration.
   * @param {string} result - The calculated result.
   * @returns {string}
   */
  customizeText?(summary: ISummary, result: string): string
}

export interface ISummaryPrivate extends ISummary {
  id: string
  dataField: string
  dataType: DataType
}

type border = string | "border-neutral-200 dark:border-neutral-800"
/**
 * Represents CSS class styles for different parts of the Table component.
 */
export type ITableStylesClass = {
  /**
   * CSS class for the table container.
   * @type {StyleClass | undefined}
   */
  body?: StyleClass

  /**
   * CSS class for the toolbar section.
   * @type {StyleClass | undefined}
   */
  toolbar?: StyleClass

  /**
   * CSS class for the table body container.
   * @type {StyleClass | undefined}
   */
  bodyTable?: StyleClass

  /**
   * CSS class for the header slot.
   * @type {StyleClass | undefined}
   */
  slotHeader?: StyleClass

  /**
   * CSS class for the footer slot.
   * @type {StyleClass | undefined}
   */
  slotFooter?: StyleClass

  /**
   * CSS class for the table element.
   * @type {StyleClass | undefined}
   */
  table?: StyleClass

  /**
   * CSS class for the `<thead>` element.
   * @type {StyleClass | undefined}
   */
  thead?: StyleClass

  /**
   * CSS class for the `<tbody>` element.
   * @type {StyleClass | undefined}
   */
  tbody?: StyleClass

  /**
   * CSS class for the `<tfoot>` element.
   * @type {StyleClass | undefined}
   */
  tfoot?: StyleClass

  /**
   * CSS class for group rows.
   * @type {StyleClass | undefined}
   */
  group?: StyleClass

  /**
   * CSS class for text in group rows.
   * @type {StyleClass | undefined}
   */
  groupText?: StyleClass

  /**
   * CSS class for cell text.
   * @type {StyleClass | undefined}
   */
  cellText?: StyleClass

  /**
   * CSS class for the pagination section.
   * @type {StyleClass | undefined}
   */
  pagination?: StyleClass
}

/**
 * Represents border styles for different parts of the Table component.
 */
export type ITableStylesBorder = {
  /**
   * Border style for the table element.
   * @type {border | "border-0" | undefined}
   */
  default?: border | "border-0"
  /**
   * Border style for the table element.
   * @type {border | "border-0" | undefined}
   */
  table?: border | "border-0"

  /**
   * Border style for the header section.
   * @type {border | "border-b-0" | undefined}
   */
  header?: border | "border-b-0"

  /**
   * Border style for the filter section.
   * @type {border | "border-r-0" | undefined}
   */
  filter?: border | "border-r-0"

  /**
   * Border style for the `<thead>` element.
   * @type {border | "border-b-0" | undefined}
   */
  head?: border | "border-b-0"

  /**
   * Border style for table cells.
   * @type {border | "border-r-0 border-b-0" | undefined}
   */
  cell?: border | "border-r-0 border-b-0"

  /**
   * Border style for the summary row.
   * @type {border | "border-t-0" | undefined}
   */
  summary?: border | "border-t-0"

  /**
   * Border style for the pagination section.
   * @type {border | "border-t-0" | undefined}
   */
  pagination?: border | "border-t-0"

  /**
   * Border style for the footer section.
   * @type {border | "border-t-0" | undefined}
   */
  footer?: border | "border-t-0"
}

/**
 * Represents the overall styles and configuration for the Table component.
 */
export interface ITableStyles {
  /**
   * CSS class styles for various parts of the Table component.
   * @type {ITableStylesClass | undefined}
   */
  class?: ITableStylesClass

  /**
   * The width of the table.
   * @type {TWidth | undefined}
   */
  width?: TWidth

  /**
   * The height of the table.
   * @type {THeight | undefined}
   */
  height?: THeight

  /**
   * Animation style applied to the table.
   * @type {"transition-all duration-500" | "transition-none" | string | undefined}
   */
  animation?: "transition-all duration-500" | "transition-none" | string

  /**
   * Стили для активной (выбранной) строки таблицы.
   * - `true` - применяет стили по умолчанию
   * - `string` - применяет кастомные CSS классы
   * - `false` или `undefined` - отключает стили активной строки
   * @default "bg-neutral-100/90 dark:bg-neutral-900/50"
   */
  activeRow?: string | "bg-neutral-100/90 dark:bg-neutral-900/50" | boolean

  /**
   * Hover styles for table rows.
   * @type {string | "hover:bg-neutral-100/90 dark:hover:bg-neutral-900/50" | boolean | undefined}
   */
  hoverRows?: string | "hover:bg-neutral-100/90 dark:hover:bg-neutral-900/50" | boolean

  /**
   * Indicates whether striped rows are enabled.
   * @type {boolean | undefined}
   */
  isStripedRows?: boolean

  /**
   * Indicates whether horizontal lines are displayed between rows.
   * @type {boolean | undefined}
   */
  horizontalLines?: boolean

  /**
   * Indicates whether vertical lines are displayed between columns.
   * @type {boolean | undefined}
   */
  verticalLines?: boolean

  /**
   * The border radius applied to the table.
   * @type {number | undefined}
   */
  borderRadiusPx?: number

  /**
   * The height of table cells.
   * @type {number | undefined}
   */
  heightCell?: number

  /**
   * Indicates whether filter lines are displayed.
   * @type {boolean | undefined}
   */
  filterLines?: boolean

  /**
   * The default width for table columns.
   * @type {"max-width: 600px;min-width:100px;width:auto" | string | undefined}
   */
  defaultWidthColumn?: "max-width: 600px;min-width:100px;width:auto" | string

  /**
   * Query text mask applied to table content.
   * @type {"font-bold text-theme-700 dark:text-theme-300" | string | undefined}
   */
  maskQuery?: "font-bold text-theme-700 dark:text-theme-300" | string

  /**
   * Border styles for various parts of the table.
   * @type {border | "border-0 border-b-0 border-t-0 border-r-0" | ITableStylesBorder | undefined}
   */
  border?: border | "border-0 border-b-0 border-t-0 border-r-0" | ITableStylesBorder
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
   * @type {Array<any> | [] | undefined}
   */
  dataSource?: Array<any> | []

  /**
   * Toolbar configuration or visibility toggle.
   * @type {IToolbar | boolean | undefined}
   */
  toolbar?: IToolbar | boolean

  /**
   * Enables inline editing for table cells.
   * @type {boolean | undefined}
   */
  edit?: boolean

  /**
   * Sorting configuration or visibility toggle.
   * @type {ISort | boolean | undefined}
   */
  sort?: ISort | boolean

  /**
   * Filtering configuration or visibility toggle.
   * @type {IFilter | boolean | undefined}
   */
  filter?: IFilter | boolean

  /**
   * Grouping configuration or group field name.
   * @type {IGrouping | string | undefined}
   */
  grouping?: IGrouping | string

  /**
   * Enables column resizing.
   * @type {boolean | undefined}
   */
  resizedColumns?: boolean

  /**
   * Pagination configuration or visibility toggle.
   * @type {TablePagination | boolean | undefined}
   */
  pagination?: TablePagination | boolean

  /**
   * Enables search functionality.
   * @type {boolean | undefined}
   */
  search?: boolean

  /**
   * Configuration for table columns.
   * @type {boolean | Array<IColumn> | undefined}
   */
  columns?: boolean | Array<IColumn>

  /**
   * Configuration for summary rows.
   * @type {boolean | Array<ISummary> | undefined}
   */
  summary?: boolean | Array<ISummary>

  /**
   * Number of rows visible in the table.
   * @type {number | undefined}
   */
  countVisibleRows?: number

  /**
   * Number of loading rows displayed during data fetching.
   * @type {number | undefined}
   */
  sizeLoadingRows?: number

  /**
   * Message displayed when there is no data.
   * @type {string | undefined}
   */
  noData?: string

  /**
   * Message displayed when no columns are defined.
   * @type {string | undefined}
   */
  noColumn?: string

  /**
   * Number of rows simulated during data loading.
   * @type {number | 100 | 1000 | 10000 | undefined}
   */
  countDataOnLoading?: number | 100 | 1000 | 10000

  /**
   * Total number of rows in the data source.
   * @type {number | undefined}
   */
  totalCount?: number

  /**
   * Custom CSS class for the table container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom styles configuration for the table.
   * @type {ITableStyles | undefined}
   */
  styles?: ITableStyles
}

interface DynamicSlots {
  [key: string]: (args: {
    key: string
    column: IColumn
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
} & DynamicSlots
/**
 * Defines the events emitted by the Table component.
 */
export declare type TableEmits = {
  /**
   * Emitted when sorting is applied.
   * @param event
   * @param {Object} payload - The sorting payload.
   * @param {Array<IColumnPrivate>} payload.dataColumns - The current state of all columns.
   * @param {Sorted} payload.sortedFields - The fields and their sorting order.
   */
  (event: "sort", payload: { dataColumns: Array<IColumnPrivate>; sortedFields: Sorted }): void

  /**
   * Emitted when filtering is applied.
   * @param event
   * @param {Object} payload - The filtering payload.
   * @param {Array<IColumnPrivate>} payload.dataColumns - The current state of all columns.
   * @param {Filters} payload.filteredFields - The fields and their filter values.
   */
  (event: "filter", payload: { dataColumns: Array<IColumnPrivate>; filteredFields: Filters }): void

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
  (event: "switch-size-page", payload: Page): void

  /**
   * Emitted before editing a cell.
   * @param event
   * @param {Object} payload - The cell editing payload.
   * @param {any} payload.newValue - The new value for the cell.
   * @param {any} payload.oldValue - The previous value of the cell.
   * @param {string} payload._key - The key identifying the row.
   * @param {IColumnPrivate} payload.column - The column being edited.
   */
  (event: "before-edit-cell", payload: { newValue: any; oldValue: any; _key: string; column: IColumnPrivate }): void

  /**
   * Emitted after editing a cell.
   * @param event
   * @param {Object} payload - The cell editing payload.
   * @param {any} payload.newValue - The new value for the cell.
   * @param {any} payload.oldValue - The previous value of the cell.
   * @param {string} payload._key - The key identifying the row.
   * @param {IColumnPrivate} payload.column - The column that was edited.
   */
  (event: "after-edit-cell", payload: { newValue: any; oldValue: any; _key: string; column: IColumnPrivate }): void

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
   * @param {IColumnPrivate} payload.column - The column of the clicked cell.
   * @param {any} payload.value - The value of the clicked cell.
   * @param {any} payload.valueWithMarker - The marked value of the clicked cell.
   * @param {any} payload.data - The data associated with the clicked row.
   * @param {number} payload.indexRow - The index of the clicked row.
   */
  (
    event: "click-cell",
    payload: {
      eventEl: HTMLElement
      column: IColumnPrivate
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
   * @type {TableProps["countDataOnLoading"]}
   */
  countDataOnLoading: TableProps["countDataOnLoading"]

  /**
   * The mask applied to query text.
   * @type {ITableStyles["maskQuery"]}
   */
  classMaskQuery: ITableStyles["maskQuery"]

  /**
   * The message displayed when there is no data.
   * @type {TableProps["noData"]}
   */
  noData: TableProps["noData"]

  /**
   * The message displayed when no columns are defined.
   * @type {TableProps["noData"]}
   */
  noColumn: TableProps["noData"]

  /**
   * The message displayed when no filters are applied.
   * @type {IFilter["noFilter"]}
   */
  noFilter: IFilter["noFilter"]

  /**
   * The icon used for sorting.
   * @type {ISort["icon"]}
   */
  iconSort: ISort["icon"]

  /**
   * Indicates whether column resizing is enabled.
   * @type {TableProps["resizedColumns"]}
   */
  resizedColumns: TableProps["resizedColumns"]

  /**
   * The total number of rows in the data source.
   * @type {number}
   */
  lengthData: number

  /**
   * The field used for grouping data.
   * @type {IGrouping["groupField"] | null}
   */
  groupField: IGrouping["groupField"] | null

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
   * @type {TablePagination["sizePage"]}
   */
  sizePage: TablePagination["sizePage"]

  /**
   * The number of visible pages in pagination.
   * @type {TablePagination["visibleNumberPages"]}
   */
  visibleNumberPages: TablePagination["visibleNumberPages"]

  /**
   * The available sizes for the page size selector.
   * @type {TablePagination["sizesSelector"]}
   */
  sizesSelector: TablePagination["sizesSelector"]

  /**
   * Indicates whether informational text is displayed in pagination.
   * @type {TablePagination["isInfoText"]}
   */
  isInfoText: TablePagination["isInfoText"]

  /**
   * Indicates whether the page size selector is visible.
   * @type {TablePagination["isPageSizeSelector"]}
   */
  isPageSizeSelector: TablePagination["isPageSizeSelector"]

  /**
   * Indicates whether navigation buttons are hidden in pagination.
   * @type {TablePagination["isHiddenNavigationButtons"]}
   */
  isHiddenNavigationButtons: TablePagination["isHiddenNavigationButtons"]

  // ---CELL--------------------------------
  /**
   * The height of table cells.
   * @type {number}
   */
  heightCell: number

  /**
   * The number of rows visible in the table.
   * @type {ReadRef<TableProps["countVisibleRows"]>}
   */
  countVisibleRows: ReadRef<TableProps["countVisibleRows"]>

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
   * @type {Array<IColumnPrivate>}
   */
  dataColumns: Array<IColumnPrivate>

  /**
   * The current summary configurations for the table.
   * @type {Array<ISummaryPrivate>}
   */
  dataSummary: Array<ISummaryPrivate>

  /**
   * The computed summary data for the table.
   * @type {object}
   */
  summaryColumns: object

  // ---STYLE-------------------------------
  /**
   * The styles applied to the table.
   * @type {ITableStyles}
   */
  styles: ITableStyles

  /**
   * The calculated style for the table body.
   * @type {string}
   */
  tableBodyStyle: string

  /**
   * The styling mode of the table.
   * @type {string}
   */
  modeStyle: string

  /**
   * Indicates whether dark mode is active.
   * @type {boolean}
   */
  isDark: boolean

  // ---METHODS-----------------------------
  /**
   * Adds a new row to the table.
   * @param {any} data - The data for the new row.
   * @returns {number} - The index of the added row.
   */
  addRow(data: any): number | null

  /**
   * Deletes a row from the table.
   * @param {string} _key - The key identifying the row to delete.
   * @returns {false | any} - The deleted row data or `false` if not found.
   */
  deleteRow(_key: string): any | null

  /**
   * Updates a row in the table.
   * @param {string} _key - The key identifying the row to update.
   * @param {any} data - The new data for the row.
   * @returns {false | any} - The updated row data or `false` if not found.
   */
  updateRow(_key: string, data: any): any | null

  /**
   * Updates a specific cell in the table.
   * @param {string} _key - The key identifying the row.
   * @param {IColumnPrivate} column - The column containing the cell.
   * @param {any} value - The new value for the cell.
   * @returns {false | any} - The updated cell data or `false` if not found.
   */
  updateCell(_key: string, column: IColumnPrivate, value: any): any | null

  /**
   * Retrieves a column by its data field.
   * @param {IColumn["dataField"]} dataField - The data field of the column.
   * @param {number} [index] - The index of the column if there are duplicates.
   * @returns {IColumnPrivate | undefined} - The column configuration or `undefined` if not found.
   */
  getColumn(dataField: IColumn["dataField"], index?: number): IColumnPrivate | undefined

  /**
   * Updates the data source of the table.
   * @returns {Array<Record<string, any>>} - The updated data source.
   */
  updateDataSource(): Array<Record<string, any>>

  /**
   * Sorts the table by a specified column.
   * @param {IColumn["dataField"]} dataField - The field to sort by.
   * @param {Sort} [value] - The sorting direction (`asc`, `desc`, or `null`).
   */
  sorting(dataField: IColumn["dataField"], value?: Sort): void

  /**
   * Filters the table by a specified column.
   * @param {IColumn["dataField"]} dataField - The field to filter by.
   * @param {any} value - The filter value.
   */
  filtering(dataField: IColumn["dataField"], value: any): void

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
   * @param {Page} sizePage - The new page size.
   */
  switchSizePage(sizePage: Page): void

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
}
export declare type TableOption = Pick<
  TableProps,
  | "mode"
  | "toolbar"
  | "edit"
  | "sort"
  | "filter"
  | "grouping"
  | "resizedColumns"
  | "pagination"
  | "search"
  | "countVisibleRows"
  | "sizeLoadingRows"
  | "noData"
  | "noColumn"
  | "countDataOnLoading"
  | "class"
  | "styles"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Table: GlobalComponentConstructor<Table>
  }
}

export default Table

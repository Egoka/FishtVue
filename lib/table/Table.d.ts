import { UnwrapNestedRefs, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass, StyleMode, THeight, TWidth } from "../types"
import { BaseInputProps } from "fishtvue/input"
import { BaseSelectProps } from "fishtvue/select"
import { PaginationProps } from "fishtvue/pagination"
import { BaseCalendarProps } from "fishtvue/calendar"
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
  paramsFilter?: Partial<BaseInputProps>
}
type InputDataType = {
  type?: "string" | "number"
  paramsFilter?: Partial<BaseInputProps>
  edit?: EditInput | boolean
}
export type EditSelect = EditorCell & {
  paramsFilter?: Partial<BaseSelectProps>
}
type SelectDataType = {
  type?: "select"
  paramsFilter?: Partial<BaseSelectProps>
  edit?: EditSelect | boolean
}
export type EditDate = EditorCell & {
  paramsFilter?: Partial<BaseCalendarProps>
}
type DateDataType = {
  type?: "date"
  paramsFilter?: Partial<BaseCalendarProps>
  edit?: EditDate | boolean
}

// ---INTERFACES--------------------------
export interface IToolbar {
  visible?: boolean
  search?: boolean
}

export interface ISort {
  visible?: boolean
  icon?: "Bars" | "Arrow"
}

export interface IFilter {
  visible?: boolean
  noFilter?: string
  isClearAllFilter?: boolean
}

export interface IGrouping {
  visible?: boolean
  groupField?: string
}

export type IColumn = {
  dataField?: DataField
  name?: string
  caption?: string
  visible?: boolean
  width?: number
  minWidth?: number
  maxWidth?: number
  isFilter?: boolean
  isSort?: boolean
  isResized?: boolean
  defaultFilter?: any
  defaultSort?: Sort
  mask?: BaseInputProps["maskInput"]
  cellTemplate?: string
  setCellValue?(column: IColumn, value: any, data?: any): any
  class?: {
    th?: StyleClass
    colFilter?: StyleClass
    colFilterClass?: StyleClass | "border-none font-normal"
    colFilterClassBody?: StyleClass | "tm-0 my-1"
    colText?: StyleClass | "text-left text-gray-400 dark:text-gray-500"
    td?: StyleClass | "px-6 py-4 text-gray-800 dark:text-gray-300"
    cellText?: StyleClass | "flex items-center whitespace-pre-line overflow-auto"
    tf?: StyleClass
    sumText?: StyleClass | "text-left text-gray-400 dark:text-gray-500"
  }
} & (InputDataType | SelectDataType | DateDataType)

export interface IColumnPrivate extends Omit<IColumn, "dataField"> {
  id: string
  dataField: string
  isEdit: boolean
}

export interface ISummary {
  dataField?: string
  name?: string
  displayFormat?: string | "Sum: {0}" | "Min: {0}" | "Max: {0}" | "Avg: {0}" | "Count: {0}"
  type?: "sum" | "min" | "max" | "avg" | "count"
  dataType?: DataType

  customizeText?(summary: ISummary, result: string): string
}

export interface ISummaryPrivate extends ISummary {
  id: string
  dataField: string
  dataType: DataType
}

export interface TablePagination extends Omit<PaginationProps, "total" | "modelValue"> {
  visible?: boolean
  startPage?: number
}

type border = string | "border-neutral-200 dark:border-neutral-800"
export type ITableStylesClass = {
  body?: StyleClass
  toolbar?: StyleClass
  bodyTable?: StyleClass
  slotHeader?: StyleClass
  slotFooter?: StyleClass
  table?: StyleClass
  thead?: StyleClass
  tbody?: StyleClass
  tfoot?: StyleClass
  group?: StyleClass
  groupText?: StyleClass
  cellText?: StyleClass
  pagination?: StyleClass
}
export type ITableStylesBorder = {
  table?: border | "border-0"
  header?: border | "border-b-0"
  filter?: border | "border-r-0"
  head?: border | "border-b-0"
  cell?: border | "border-r-0 border-b-0"
  summary?: border | "border-t-0"
  pagination?: border | "border-t-0"
  footer?: border | "border-t-0"
}

export interface ITableStyles {
  class?: ITableStylesClass
  width?: TWidth
  height?: THeight
  animation?: "transition-all duration-500" | "transition-none" | string
  hoverRows?: string | "hover:bg-neutral-100/90 dark:hover:bg-neutral-900/50" | boolean
  isStripedRows?: boolean
  horizontalLines?: boolean
  verticalLines?: boolean
  borderRadiusPx?: number
  heightCell?: number
  filterLines?: boolean
  defaultWidthColumn?: "max-width: 600px;min-width:100px;width:auto" | string
  maskQuery?: "font-bold text-theme-700 dark:text-theme-300" | string
  border?: border | "border-0 border-b-0 border-t-0 border-r-0" | ITableStylesBorder
}

// ---------------------------------------
export declare type TableProps = {
  mode?: StyleMode
  dataSource?: Array<any> | []
  toolbar?: IToolbar | boolean
  edit?: boolean
  sort?: ISort | boolean
  filter?: IFilter | boolean
  grouping?: IGrouping | string
  resizedColumns?: boolean
  pagination?: TablePagination | boolean
  search?: boolean
  columns?: boolean | Array<IColumn>
  summary?: boolean | Array<ISummary>
  countVisibleRows?: number
  sizeLoadingRows?: number
  noData?: string
  noColumn?: string
  countDataOnLoading?: number | 100 | 1000 | 10000
  totalCount?: number
  class?: StyleClass
  styles?: ITableStyles
}
export declare type TableSlots = {
  toolbar(): VNode[]
  header(): VNode[]
  group(): VNode[]
  default(): VNode[]
  footer(): VNode[]
}
export declare type TableEmits = {
  (event: "sort", payload: { dataColumns: Array<IColumnPrivate>; sortedFields: Sorted }): void
  (event: "filter", payload: { dataColumns: Array<IColumnPrivate>; filteredFields: Filters }): void
  (event: "search", payload: Search): void
  (event: "result-data", payload: ResultData): void
  (event: "switch-page", payload: Page): void
  (event: "switch-size-page", payload: Page): void
  (event: "before-edit-cell", payload: { newValue: any; oldValue: any; _key: string; column: IColumnPrivate }): void
  (event: "after-edit-cell", payload: { newValue: any; oldValue: any; _key: string; column: IColumnPrivate }): void
  (event: "before-edit-row", payload: { newValue: any; oldValue: any; _key: string }): void
  (event: "after-edit-row", payload: { newValue: any; oldValue: any; _key: string }): void
  (event: "add-row", payload: { value: any; index: number; _key: string }): void
  (event: "delete-row", payload: { value: any; index: number; _key: string }): void
  (event: "click-row", payload: { eventEl: HTMLElement; data: any; indexRow: number }): void
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
  (event: "loading", payload: boolean): void
  (event: "clear-filter"): void
}
export declare type TableExpose = {
  //---STATE-------------------------
  sortColumns: UnwrapNestedRefs<Sorted>
  filterColumns: UnwrapNestedRefs<Filters>
  widthsColumns: UnwrapNestedRefs<Widths>
  queryTable: ReadRef<Search>
  pageTable: ReadRef<Page>
  sizeTable: ReadRef<Page>
  allData: ReadRef<TableProps["dataSource"]>
  isLoading: ReadRef<boolean>
  // ---PROPS-------------------------------
  mode: ReadRef<TableProps["mode"]>
  isVisibleToolbar: ReadRef<boolean>
  isSearch: ReadRef<boolean>
  isFilterClear: ReadRef<boolean>
  isColumns: ReadRef<boolean>
  isSummary: ReadRef<boolean>
  countDataOnLoading: ReadRef<TableProps["countDataOnLoading"]>
  classMaskQuery: ReadRef<ITableStyles["maskQuery"]>
  noData: ReadRef<TableProps["noData"]>
  noColumn: ReadRef<TableProps["noData"]>
  noFilter: ReadRef<IFilter["noFilter"]>
  iconSort: ReadRef<ISort["icon"]>
  resizedColumns: ReadRef<TableProps["resizedColumns"]>
  lengthData: ReadRef<number>
  groupField: ReadRef<IGrouping["groupField"] | null>
  isFilter: ReadRef<boolean>
  isSort: ReadRef<boolean>
  isGroup: ReadRef<boolean>
  isPagination: ReadRef<boolean>
  // ---PAGINATION--------------------------
  startPage: ReadRef<TablePagination["startPage"]>
  modePagination: ReadRef<TablePagination["mode"]>
  sizePage: ReadRef<TablePagination["sizePage"]>
  visibleNumberPages: ReadRef<TablePagination["visibleNumberPages"]>
  sizesSelector: ReadRef<TablePagination["sizesSelector"]>
  isInfoText: ReadRef<TablePagination["isInfoText"]>
  isPageSizeSelector: ReadRef<TablePagination["isPageSizeSelector"]>
  isHiddenNavigationButtons: ReadRef<TablePagination["isHiddenNavigationButtons"]>
  // ---CELL--------------------------------
  heightCell: ReadRef<number>
  countVisibleRows: ReadRef<TableProps["countVisibleRows"]>
  heightTable: ReadRef<string>
  // ---DATA--------------------------------
  dataSource: ReadRef<Array<any>>
  resultDataSource: ReadRef<ResultData>
  dataColumns: ReadRef<Array<IColumnPrivate>>
  dataSummary: ReadRef<Array<ISummaryPrivate>>
  summaryColumns: ReadRef<object>
  // ---STYLE-------------------------------
  styles: ReadRef<ITableStyles>
  tableBodyStyle: ReadRef<string>
  modeStyle: ReadRef<string>
  isDark: ReadRef<boolean>
  // ---METHODS-----------------------------
  addRow(data: any): false | number
  deleteRow(_key: string): false | any
  updateRow(_key: string, data: any): false | any
  updateCell(_key: string, column: IColumnPrivate, value: any): false | any
  getColumn(dataField: IColumn["dataField"], index?: number): IColumnPrivate | undefined
  updateDataSource(): Array<Record<string, any>>
  sorting(dataField: IColumn["dataField"], value?: Sort): void
  filtering(dataField: IColumn["dataField"], value: any): void
  searching(value: Search): void
  switchPage(page: Page): void
  switchSizePage(sizePage: Page): void
  startLoading(): void
  stopLoading(): void
  clearFilter(): void
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
declare class Table extends ClassComponent<TableProps, TableSlots, TableEmits, TableExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Table: GlobalComponentConstructor<Table>
  }
}

export default Table

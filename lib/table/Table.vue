<script setup lang="ts">
  import { computed, ref, watch, onMounted, onUnmounted, reactive, useSlots, toRaw, nextTick } from "vue"
  import LD from "lodash"
  import dayjs from "dayjs"
  import isBetween from "dayjs/plugin/isBetween"
  import {
    ArrowLongUpIcon,
    ArrowLongDownIcon,
    BarsArrowUpIcon,
    BarsArrowDownIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    TableCellsIcon
  } from "@heroicons/vue/20/solid"
  import {
    TableProps,
    TableEmits,
    TableExpose,
    Page,
    Search,
    Sorted,
    Filters,
    Widths,
    DataSource,
    DataGrouping,
    IToolbar,
    IFilter,
    ITableStyles,
    ISort,
    IGrouping,
    TablePagination,
    ResultData,
    IColumnPrivate,
    EditInput,
    EditSelect,
    EditDate,
    ISummaryPrivate,
    ITableStylesBorder,
    IColumn,
    Sort,
    DataType
  } from "./Table"
  import Button from "fishtvue/button/Button.vue"
  import Loading from "fishtvue/loading/Loading.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Pagination from "fishtvue/pagination/Pagination.vue"
  import Input from "fishtvue/input/Input.vue"
  import Select from "fishtvue/select/Select.vue"
  import Calendar from "fishtvue/calendar/Calendar.vue"
  import Component from "fishtvue/component"
  import { StyleClass, TLoading } from "fishtvue/types"
  import { BaseInputProps } from "fishtvue/input"
  import { BaseSelectProps } from "fishtvue/select"
  import { BaseCalendarProps, IRangeValue } from "fishtvue/calendar"
  import { InputLayoutProps } from "fishtvue/inputlayout"
  import { convertToNumber, convertToPhone } from "fishtvue/utils/numberHandler"
  // ---BASE-COMPONENT----------------------
  const Table = new Component<"Table">()
  const options = Table.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = defineProps<TableProps>()
  const emit = defineEmits<TableEmits>()
  const slots = useSlots()
  // ---REF-LINK----------------------------
  const componentTable = ref<HTMLElement>()
  const tableHeader = ref<HTMLElement>()
  const tableToolbar = ref<HTMLElement>()
  const tableBody = ref<HTMLElement>()
  const table = ref<HTMLElement>()
  const thead = ref<HTMLElement>()
  const tbody = ref<HTMLElement>()
  const tfoot = ref<HTMLElement>()
  const pager = ref<HTMLElement>()
  const tableFooter = ref<HTMLElement>()
  // ---STATE-------------------------------
  const sizeLoadedRows = ref<number>(0)
  const clientHeightTable = ref<number>(0)
  const pageTable = ref<Page>(1)
  const sizeTable = ref<Page>(5)
  const isLoading = ref<TLoading>(false)
  const editableCell = ref<{ indexRow: number; indexCol: number } | null>()
  // ---
  const rowSelector = "tr:last-child"
  const queryTable = ref<Search>("")
  const sortColumns = reactive<Sorted>({})
  const filterColumns = reactive<Filters>({})
  const widthsColumns = reactive<Widths>({})
  // ---
  const allData = ref<NonNullable<TableProps["dataSource"]>>()
  const dataSource = ref<DataSource>([])
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<TableProps["mode"]>>(
    () => props?.mode ?? options?.mode ?? Table.componentsStyle() ?? "outlined"
  )
  const toolbar = computed<TableProps["toolbar"]>(() => props?.toolbar ?? options?.toolbar)
  const sort = computed<TableProps["sort"]>(() => props?.sort ?? options?.sort)
  const filter = computed<TableProps["filter"]>(() => props?.filter ?? options?.filter)
  const grouping = computed<TableProps["grouping"]>(() => props?.grouping ?? options?.grouping)
  const pagination = computed<TableProps["pagination"]>(() => props?.pagination ?? options?.pagination)
  const columns = computed<TableProps["columns"]>(() => props?.columns)
  // -----------
  const isVisibleToolbar = computed<boolean>(
    () => (isSearch.value || !!toolbar.value) && ((toolbar.value as IToolbar)?.visible ?? true)
  )
  const isSearch = computed<boolean>(
    () => (toolbar.value as IToolbar)?.search ?? props?.search ?? options?.search ?? false
  )
  const isFilterClear = computed<boolean>(
    () =>
      ((filter.value as IFilter)?.isClearAllFilter ?? false) &&
      (!!noEmptyFilters(filterColumns).length || !!queryTable.value.length)
  )
  const isColumns = computed<boolean>(() =>
    typeof columns.value === "boolean" ? columns.value : Array.isArray(columns.value)
  )
  const isSummary = computed<boolean>(() =>
    typeof props.summary === "boolean" ? props.summary : Array.isArray(props.summary)
  )
  const countDataOnLoading = computed<NonNullable<TableProps["countDataOnLoading"]>>(
    () => props?.countDataOnLoading ?? options?.countDataOnLoading ?? 1000
  )
  const classMaskQuery = computed<NonNullable<ITableStyles["maskQuery"]>>(
    () => styles.value?.maskQuery ?? "font-bold text-theme-700 dark:text-theme-400"
  )
  const noData = computed<NonNullable<TableProps["noData"]>>(
    () => props.noData ?? options?.noData ?? Table.t("noData") ?? "No data"
  )
  const noColumn = computed<NonNullable<TableProps["noData"]>>(
    () => props.noColumn ?? options?.noColumn ?? Table.t("noColumn") ?? "There are no columns"
  )
  const noFilter = computed<NonNullable<IFilter["noFilter"]>>(
    () => (filter.value as IFilter)?.noFilter ?? Table.t("noDataForQuery") ?? "No data was found for your query"
  )
  const iconSort = computed<ISort["icon"]>(() => (sort.value as ISort)?.icon ?? "Arrow")
  const resizedColumns = computed<NonNullable<TableProps["resizedColumns"]>>(
    () => props?.resizedColumns ?? options?.resizedColumns ?? false
  )
  const isEditCells = computed<NonNullable<TableProps["edit"]>>(() => props?.edit ?? options?.edit ?? false)
  const lengthData = computed<number>(() => props.totalCount ?? dataSource.value.length)
  const isFilter = computed<boolean>(() => {
    const filterValue = filter.value
    return typeof filterValue === "object"
      ? typeof filterValue?.visible === "boolean"
        ? filterValue.visible
        : true
      : typeof filterValue === "boolean"
        ? filterValue
        : false
  })
  const isSort = computed<boolean>(() => {
    const sortValue = sort.value
    return typeof sortValue === "object"
      ? typeof sortValue?.visible === "boolean"
        ? sortValue.visible
        : true
      : typeof sortValue === "boolean"
        ? sortValue
        : false
  })
  const isGroup = computed<boolean>(() => {
    const groupingValue = grouping.value
    return typeof groupingValue === "object"
      ? typeof groupingValue?.visible === "boolean"
        ? groupingValue.visible
        : true
      : typeof groupingValue === "string"
        ? !!groupingValue.length
        : false
  })
  const groupField = computed<IGrouping["groupField"] | null>(() => {
    const groupingValue = grouping.value
    return typeof groupingValue === "object"
      ? typeof groupingValue?.groupField === "string"
        ? groupingValue.groupField
        : null
      : typeof groupingValue === "string"
        ? groupingValue
        : null
  })
  const isPagination = computed<boolean>(() => {
    const paginationValue = pagination.value
    return (
      countVisibleRows.value > 0 &&
      (typeof paginationValue === "object"
        ? typeof paginationValue?.visible === "boolean"
          ? paginationValue.visible
          : true
        : typeof paginationValue === "boolean"
          ? paginationValue
          : false)
    )
  })
  // ---PAGINATION--------------------------
  const startPage = computed<NonNullable<TablePagination["startPage"]>>(
    () => (pagination.value as TablePagination)?.startPage ?? 1
  )
  const modePagination = computed<NonNullable<TablePagination["mode"]>>(
    () => (pagination.value as TablePagination)?.mode ?? mode.value
  )
  const sizePage = computed<NonNullable<TablePagination["sizePage"]>>(
    () => (pagination.value as TablePagination)?.sizePage ?? countVisibleRows.value
  )
  const visibleNumberPages = computed<TablePagination["visibleNumberPages"]>(
    () => (pagination.value as TablePagination)?.visibleNumberPages
  )
  const sizesSelector = computed<TablePagination["sizesSelector"]>(
    () => (pagination.value as TablePagination)?.sizesSelector
  )
  const isInfoText = computed<TablePagination["isInfoText"]>(
    () => (pagination.value as TablePagination)?.isInfoText ?? false
  )
  const isPageSizeSelector = computed<TablePagination["isPageSizeSelector"]>(
    () => (pagination.value as TablePagination)?.isPageSizeSelector ?? false
  )
  const isHiddenNavigationButtons = computed<TablePagination["isHiddenNavigationButtons"]>(
    () => (pagination.value as TablePagination)?.isHiddenNavigationButtons ?? false
  )
  // ---CELL--------------------------------
  const heightCell = computed<number>(() => styles.value?.heightCell ?? 24)
  const countVisibleRows = computed<NonNullable<TableProps["countVisibleRows"]>>(
    () => props?.countVisibleRows ?? options?.countVisibleRows ?? 0
  )
  const sizeLoadingRows = computed<NonNullable<TableProps["sizeLoadingRows"]>>(
    () => props?.sizeLoadingRows ?? options?.sizeLoadingRows ?? 5
  )
  const isLoadingRows = computed(() => countVisibleRows.value > 0 && !isPagination.value)
  // ---DATA--------------------------------
  const dataGrouping = computed<DataGrouping>(() => {
    let data = toRaw(dataSource.value)
    if (isPagination.value) {
      if (isGroup.value && groupField.value) {
        data = Object.values(LD.groupBy(data, (item) => item[groupField.value as string])).flat()
      }
      data = LD.slice(data, sizeTable.value * (pageTable.value - 1), sizeTable.value * pageTable.value)
    }
    return isGroup.value && groupField.value
      ? LD.groupBy(data, (item) => item[groupField.value as string])
      : { 0: data }
  })
  const resultDataSource = computed<ResultData>(() => {
    let resultData: Record<string, any> = toRaw(dataGrouping.value)
    let limit = countVisibleRows.value + sizeLoadedRows.value
    if (resultData && isLoadingRows.value) {
      const result: Record<string, any> = {}
      for (const item of Object.keys(resultData)) {
        if (limit > resultData[item]?.length) {
          result[item] = resultData[item]
          limit -= resultData[item]?.length
        } else {
          result[item] = resultData[item].slice(0, limit)
          limit = 0
          break
        }
      }
      resultData = result
    }
    emit("result-data", resultData)
    return resultData
  })
  const dataColumns = computed<Array<IColumnPrivate>>(() => {
    const listFields: Array<string> = LD.uniq(LD.flatten(LD.map(allData.value, LD.keys))).filter(
      (field) => field !== "_key"
    )
    const columnsValue = columns.value
    if (Array.isArray(columnsValue) && columnsValue?.length) {
      return <Array<IColumnPrivate>>columnsValue
        .map((column, index) => {
          const fieldName = column.dataField ?? listFields[index] ?? ""
          if (fieldName === "") {
            return false
          }
          const options = <IColumnPrivate>{
            ...column,
            id: `Col-${fieldName}-${index}`,
            dataField: fieldName,
            name: `Col-${column.name ?? fieldName}`,
            caption:
              column.caption ??
              (/^\d+$/.test(fieldName)
                ? `Col ${fieldName}`
                : (fieldName as string).charAt(0).toUpperCase() + (fieldName as string).slice(1)),
            visible: typeof column?.visible === "boolean" ? column.visible : true,
            isFilter: typeof column.isFilter === "boolean" ? column.isFilter : isFilter.value,
            isSort: typeof column.isSort === "boolean" ? column.isSort : isSort.value,
            isResized: typeof column.isResized === "boolean" ? column.isResized : resizedColumns.value,
            isEdit: typeof column.edit === "boolean" ? column.edit : (column?.edit?.isEdit ?? isEditCells.value),
            type: column.type ?? "string"
          }
          switch (options.type) {
            case "string": {
              options.paramsFilter = { autocomplete: "off", ...column.paramsFilter } as Partial<BaseInputProps>
              options.edit = {
                paramsFilter: {
                  ...options.paramsFilter,
                  autoFocus: true,
                  ...(column?.edit as EditInput)?.paramsFilter
                } as Partial<BaseInputProps>
              }
              break
            }
            case "number": {
              options.paramsFilter = {
                autocomplete: "off",
                maskInput: "number",
                ...column.paramsFilter
              } as Partial<BaseInputProps>
              options.edit = {
                paramsFilter: {
                  ...options.paramsFilter,
                  autoFocus: true,
                  ...(column?.edit as EditInput)?.paramsFilter
                } as Partial<BaseInputProps>
              }
              break
            }
            case "select": {
              options.paramsFilter = {
                multiple: true,
                maxVisible: 0,
                classSelect: "normal-case font-normal max-h-[25rem]",
                classSelectList: "normal-case font-normal",
                dataSelect: LD.compact(LD.uniq(LD.map(allData.value, options.dataField ?? ""))) ?? [],
                paramsFixWindow: {
                  position: "bottom",
                  ...(column?.paramsFilter as Partial<BaseSelectProps>)?.paramsFixWindow
                },
                ...column.paramsFilter
              } as Partial<BaseSelectProps>
              options.edit = {
                paramsFilter: (<BaseSelectProps>{
                  ...options.paramsFilter,
                  autoFocus: true,
                  multiple: false,
                  ...(column?.edit as EditSelect)?.paramsFilter,
                  paramsFixWindow: {
                    position: "bottom",
                    eventClose: "hover",
                    ...(column?.edit as EditSelect)?.paramsFilter?.paramsFixWindow
                  }
                }) as Partial<BaseSelectProps>
              }
              break
            }
            case "date": {
              options.paramsFilter = {
                paramsDatePicker: {
                  isRange: true,
                  attributes: [
                    {
                      highlight: { fillMode: "light" },
                      dates:
                        LD.compact(
                          LD.uniq(
                            LD.map(allData.value, (item) =>
                              item[options.dataField] ? String(item[options.dataField]) : null
                            )
                          )
                        ) ?? []
                    }
                  ],
                  mask:
                    (column.paramsFilter as Partial<BaseCalendarProps>)?.paramsDatePicker?.masks?.modelValue ??
                    "DD.MM.YYYY"
                },
                paramsFixWindow: {
                  position: "bottom",
                  ...(column?.paramsFilter as Partial<BaseCalendarProps>)?.paramsFixWindow
                },
                ...column.paramsFilter
              } as Partial<BaseCalendarProps>
              options.edit = {
                paramsFilter: {
                  ...options.paramsFilter,
                  paramsDatePicker: {
                    ...(options?.paramsFilter as Partial<BaseCalendarProps>)?.paramsDatePicker,
                    isRange: false
                  },
                  autoFocus: true,
                  ...(column?.edit as EditDate)?.paramsFilter,
                  label: "",
                  labelMode: "none",
                  paramsFixWindow: {
                    position: "bottom",
                    eventClose: "hover",
                    ...((column?.edit as EditDate)?.paramsFilter as Partial<BaseCalendarProps>)?.paramsFixWindow
                  }
                } as Partial<BaseCalendarProps> & Pick<InputLayoutProps, "label" | "labelMode">
              }
              break
            }
          }
          return options
        })
        .filter((i) => i)
    } else {
      return listFields.map<IColumnPrivate>((column, index): IColumnPrivate => {
        return {
          id: `Col-${column}-${index}`,
          dataField: column,
          name: `Col-${column}`,
          type: "string",
          caption: /^\d+$/.test(column)
            ? `Col ${column}`
            : (column.charAt(0).toUpperCase() + column.slice(1))?.replace(/_/g, " "),
          visible: true,
          isFilter: isFilter.value,
          isSort: isSort.value,
          isResized: resizedColumns.value,
          isEdit: isEditCells.value
        }
      })
    }
  })
  const dataSummary = computed<Array<ISummaryPrivate>>(() => {
    if (!isSummary.value) {
      return []
    }
    if (Array.isArray(props.summary) && props.summary?.length) {
      return <Array<ISummaryPrivate>>props.summary.map((summary, index) => {
        const column = getColumn(summary.dataField, index)
        if (column) {
          const summaryName = summary.dataField ?? column.dataField
          return {
            id: `Sum-${summary.name ?? summaryName}-${index}`,
            name: `Sum-${summary.name ?? summaryName}`,
            dataField: summaryName,
            displayFormat:
              summary.displayFormat ??
              (summary.type === "max"
                ? "Max: {0}"
                : summary.type === "min"
                  ? "Min: {0}"
                  : summary.type === "sum"
                    ? "Sum: {0}"
                    : summary.type === "avg"
                      ? "Avg: {0}"
                      : summary.type === "count"
                        ? "Count: {0}"
                        : "Count: {0}") ??
              (["string", "date"].includes(column.type as string)
                ? "Кол. {0}"
                : ["number", "select"].includes(column.type as string)
                  ? "Сум. {0}"
                  : "Кол. {0}"),
            type:
              summary.type ??
              (["string", "date", "select"].includes(column.type as string)
                ? "count"
                : ["number"].includes(column.type as string)
                  ? "sum"
                  : "count"),
            customizeText: summary.customizeText,
            dataType: summary.dataType ?? column.type
          }
        }
        return {}
      })
    } else {
      return <Array<ISummaryPrivate>>dataColumns.value
        .filter((item) => item.visible)
        .map((column) => {
          return {
            name: `Sum-${column.name}`,
            dataField: column.dataField,
            displayFormat: ["string", "date"].includes(column.type as string)
              ? "Кол. {0}"
              : ["number", "select"].includes(column.type as string)
                ? "Сум. {0}"
                : "Кол. {0}",
            type: ["string", "date", "select"].includes(column.type as string)
              ? "count"
              : ["number"].includes(column.type as string)
                ? "sum"
                : "count",
            dataType: column.type
          }
        })
    }
  })
  const summaryColumns = computed(() => {
    if (!isSummary.value || !dataSummary.value?.length) {
      return {}
    }
    return dataSummary.value.reduce((result: { [key: string]: string }, summary) => {
      result[summary.dataField] = setSummary(summary)
      return result
    }, {})
  })
  // ---STYLE-------------------------------
  const baseTableHeight = 288 // 18rem
  const heightTable = ref<string>(countVisibleRows.value ? `height: ${baseTableHeight}px` : "height: auto")
  const styles = computed<Omit<ITableStyles, "border"> & { border?: ITableStylesBorder }>((): any => {
    const s = props?.styles ?? options?.styles
    const hoverRows =
      typeof s?.hoverRows === "string"
        ? (s?.hoverRows as string)
        : typeof s?.hoverRows === "boolean" && s?.hoverRows
          ? "hover:bg-neutral-100/90 dark:hover:bg-neutral-900/50"
          : ""
    return {
      ...s,
      hoverRows: hoverRows,
      width: s?.width ? (typeof s?.width === "number" ? `${s?.width}px` : s?.width) : "",
      height: s?.height ? (typeof s?.height === "number" ? `${s?.height}px` : s?.height) : "",
      animation: s?.animation ?? "transition-all duration-500",
      borderRadiusPx: s?.borderRadiusPx ?? (mode.value === "underlined" ? 0 : 7),
      isStripedRows: s?.isStripedRows ?? false,
      horizontalLines: s?.horizontalLines ?? true
    }
  })
  const defaultBorder = computed(() =>
    typeof styles.value?.border === "object" ? styles.value?.border.table : "border-neutral-200 dark:border-neutral-800"
  )
  const tableBodyStyle = computed<string>(() => {
    const borderTop = !slots.header
      ? `border-top-left-radius: ${styles.value.borderRadiusPx}px;border-top-right-radius: ${styles.value.borderRadiusPx}px;`
      : ""
    const borderBottom = !(isPagination.value || slots.footer)
      ? `border-bottom-left-radius: ${styles.value.borderRadiusPx}px;border-bottom-right-radius: ${styles.value.borderRadiusPx}px;`
      : ""
    return `${borderTop}${borderBottom}`
  })
  const modeStyle = computed<string>(() =>
    mode.value === "filled"
      ? "bg-stone-100 dark:bg-stone-900"
      : mode.value === "outlined"
        ? "bg-white dark:bg-neutral-950"
        : mode.value === "underlined"
          ? "bg-stone-50 dark:bg-stone-950"
          : ""
  )
  Table.setStyle("transition ease-in opacity-100 opacity-0")
  Table.setStyle("duration-200")
  Table.setStyle("duration-500")
  Table.setStyle("duration-1000")
  const classBaseTable = computed<StyleClass>(() =>
    Table.setStyle([
      "componentTable classBody inline-block align-middle relative w-full p-1.5",
      styles.value?.animation,
      styles.value.class?.body,
      options?.class ?? "",
      props?.class ?? ""
    ])
  )
  const classBaseToolbar = computed(() =>
    Table.setStyle([
      "classToolbar toolbar flex mb-2 justify-end items-end",
      styles.value?.animation,
      styles.value.class?.toolbar
    ])
  )
  const classSlotToolbar = ref(Table.setStyle("w-full"))
  const classSearch = ref(Table.setStyle("ml-1"))
  const classIcon = ref(Table.setStyle("h-5 w-5 text-gray-400 dark:text-gray-600"))
  const classIconClearFilter = ref(
    Table.setStyle("h-4 w-4 text-gray-400 dark:text-gray-600 group-hover:text-red-400 group-hover:dark:text-red-600")
  )
  const classTableBody = computed(() =>
    Table.setStyle(["flex flex-col border", defaultBorder.value, styles.value.border?.table])
  )
  const classBodySlotHeader = computed(() =>
    Table.setStyle([
      "min-h-[1.5rem] text-gray-500",
      isSummary.value || isPagination.value ? "relative" : "",
      modeStyle.value
    ])
  )
  const styleHeader = computed(
    () =>
      `border-top-left-radius: ${styles.value.borderRadiusPx}px;border-top-right-radius: ${styles.value.borderRadiusPx}px;`
  )
  const classSlotHeader = computed(() =>
    Table.setStyle([
      "classSlotHeader p-2 border-b-2",
      styles.value.class?.slotHeader,
      defaultBorder.value,
      styles.value.border?.header
    ])
  )
  const classBaseTableBody = ref(Table.setStyle("relative"))
  const classBodyTable = computed(() =>
    Table.setStyle(["classBodyTable overflow-x-auto", styles.value?.animation, styles.value.class?.bodyTable])
  )
  const styleBodyTable = computed(() => [
    tableBodyStyle.value,
    heightTable.value,
    countVisibleRows.value > 0 ? "" : `min-height: ${baseTableHeight}px;`
  ])
  const classTable = computed(() =>
    Table.setStyle(["classTable min-w-full border-separate border-spacing-0", styles.value.class?.table])
  )
  const classTHead = computed(() =>
    Table.setStyle(["classTHead sticky top-0 z-20", styles.value.class?.thead || modeStyle.value])
  )
  const classTh = (column: IColumnPrivate) =>
    Table.setStyle([
      column.id,
      column.class?.th,
      "group/th",
      column.isFilter ? "pl-1 pr-0 py-2" : "pl-6 py-5",
      "border-b",
      defaultBorder.value,
      styles.value.border?.head
    ])
  const styleTh = (column: IColumnPrivate) =>
    !widthsColumns[column.dataField]
      ? (styles.value?.defaultWidthColumn ?? "max-width: 600px;min-width:100px;width:auto")
      : `width: ${widthsColumns[column.dataField]}px;min-width: ${widthsColumns[column.dataField]}px;max-width: ${widthsColumns[column.dataField]}px;`
  const classBodyFilter = computed(() =>
    Table.setStyle([
      "group relative flex w-full",
      styles.value.filterLines ? "border-r group-last/th:border-r-0" : "",
      defaultBorder.value,
      styles.value.border?.filter
    ])
  )
  const classIsFilter = (column: IColumnPrivate) =>
    Table.setStyle(["w-full cursor-pointer", column.class?.colFilter, column.isSort || isSort.value ? "" : "px-1"])
  const classNotFilter = (column: IColumnPrivate) =>
    Table.setStyle([
      "block text-sm font-medium truncate",
      "text-left text-gray-400 dark:text-gray-500",
      column.class?.colText
    ])
  const classIsSort = (column: IColumnPrivate) =>
    Table.setStyle([
      "flex items-center transition-opacity duration-500 pr-1 cursor-pointer",
      sortColumns[column?.dataField] === null ? "opacity-0 group-hover:opacity-100" : "opacity-100"
    ])
  const classSortIcon = ref(Table.setStyle("ml-1 h-4 w-4 text-gray-400 dark:text-gray-600"))
  const classResizedColumns = (column: IColumnPrivate, key: number) =>
    Table.setStyle([
      "resizable absolute z-10 inset-y-0 flex items-center hover:opacity-100 pr-2 cursor-ew-resize transition-opacity duration-500",
      dataColumns.value.length - 1 > key ? "-right-3" : "right-3",
      resizableColumn.value === column.id ? "opacity-100" : "opacity-0"
    ])
  const classResize = computed(() =>
    Table.setStyle([
      "h-8 w-1.5 bg-neutral-300 dark:bg-neutral-600",
      mode.value === "filled" ? "rounded-full" : "",
      mode.value === "outlined" ? "rounded-full" : "",
      mode.value === "underlined" ? "rounded-none" : ""
    ])
  )
  const classTBody = computed(() => Table.setStyle(["classTBody overflow-y-auto", styles.value.class?.tbody]))
  const classGroup = computed(() =>
    Table.setStyle([
      "classGroup sticky",
      "border-t-2 border-b",
      "font-medium text-base whitespace-nowrap",
      "text-left text-gray-800 dark:text-gray-300 px-6 py-2 pr-3 pl-10 sm:pl-12",
      styles.value.class?.group ?? modeStyle.value,
      defaultBorder.value,
      styles.value.border?.cell
    ])
  )
  const styleGroup = computed(() => `top:${thead.value?.clientHeight ?? 1 - 1}px`)
  const classGroupText = computed(() =>
    Table.setStyle([
      "sticky classGroupText left-10 sm:left-12 flex items-center w-fit min-h-[2.5rem] truncate",
      styles.value.class?.groupText
    ])
  )
  const styleGroupText = computed(() => `min-height: ${heightCell.value}px`)
  const classTr = (data: Record<string, any>, indexRow: number) =>
    Table.setStyle([
      `tr--${data?._key ?? indexRow} group/tr`,
      styles.value.hoverRows ? `${styles.value.hoverRows} transition-colors duration-200` : "",
      styles.value.isStripedRows
        ? mode.value === "filled"
          ? "odd:bg-stone-100 even:bg-stone-50 dark:odd:bg-stone-900 dark:even:bg-stone-950"
          : mode.value === "outlined"
            ? "odd:bg-white even:bg-neutral-50 dark:odd:bg-neutral-950 dark:even:bg-neutral-900"
            : mode.value === "underlined"
              ? "odd:bg-stone-50 even:bg-stone-100 dark:odd:bg-stone-950 dark:even:bg-neutral-900"
              : ""
        : ""
    ])
  const classColumnTd = (data: Record<string, any>, indexRow: number, column: IColumnPrivate, indexCol: number) =>
    Table.setStyle([
      "ColumnClassTd",
      `td--${data?._key ?? indexRow}--${column?.name ?? indexCol}`,
      "first:border-l-0 group-first/tr:border-t-0 last:border-r-0 group-last/tr:border-b-0",
      "text-sm font-medium",
      "px-6 py-4 text-gray-800 dark:text-gray-300",
      column.class?.td,
      styles.value.class?.cellText,
      defaultBorder.value,
      styles.value.border?.cell,
      styles.value.verticalLines ? "border-r" : "border-r-0",
      styles.value.horizontalLines ? "border-b" : "border-b-0",
      editableCell.value?.indexRow === indexRow && editableCell.value?.indexCol === indexCol ? "px-1" : ""
    ])
  const styleColumnTd = (column: IColumnPrivate) =>
    !widthsColumns[column.dataField]
      ? (styles.value?.defaultWidthColumn ?? "max-width: 600px;min-width:100px;width:auto")
      : `width: ${widthsColumns[column.dataField]}px;min-width: ${widthsColumns[column.dataField]}px;max-width: ${widthsColumns[column.dataField]}px;`
  const classCellTable = (indexRow: number, column: IColumnPrivate, indexCol: number) =>
    Table.setStyle([
      "flex items-center whitespace-pre-line overflow-auto",
      column.class?.cellText,
      editableCell.value?.indexRow === indexRow && editableCell.value?.indexCol === indexCol ? "overflow-visible" : ""
    ])
  const styleCellTable = computed(() => `min-height: ${heightCell.value}px;max-height: ${heightCell.value * 5 + 2}px;`)
  const classTemplate = (column: IColumnPrivate) =>
    Table.setStyle(["flex items-center whitespace-pre-line overflow-auto", column.class?.cellText])
  const classFooterPaddingHeight = ref(Table.setStyle("border-none"))
  const styleFooterPaddingHeight = computed(() => `height: ${footerPaddingHeight.value - 1}px`)
  const classTFoot = computed(() =>
    Table.setStyle(["classTFoot sticky bottom-0", styles.value.class?.tfoot ?? modeStyle.value])
  )
  const classThSummary = (column: IColumnPrivate) =>
    Table.setStyle(["px-3 py-3", column.class?.tf, "border-t", defaultBorder.value, styles.value.border?.summary])
  const classThSummaryText = (column: IColumnPrivate) =>
    Table.setStyle([
      "block font-normal text-sm text-left text-gray-400 dark:text-gray-500 truncate",
      column.class?.sumText
    ])
  const classIsPagination = computed(() => Table.setStyle([isSummary.value ? "relative sm:px-5" : "", modeStyle.value]))
  const styleIsPagination = computed(() =>
    !slots.footer
      ? `border-bottom-left-radius: ${styles.value.borderRadiusPx}px;border-bottom-right-radius: ${styles.value.borderRadiusPx}px;`
      : ""
  )
  const classIsLoading = ref(
    Table.setStyle("absolute z-30 top-0 bottom-0 left-0 w-full select-none text-center text-sm text-gray-500")
  )
  const classIsLoadingBody = ref(
    Table.setStyle("flex justify-center items-center h-full w-full rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50")
  )
  const classNoData = ref(
    Table.setStyle(
      "absolute top-[40%] flex flex-col items-center left-0 w-full my-5 pointer-events-none text-center text-sm text-gray-500"
    )
  )
  const classNoColumn = ref(
    Table.setStyle("absolute top-[50%] left-0 w-full my-5 pointer-events-none text-center text-sm text-gray-500")
  )
  const classNoFilter = ref(
    Table.setStyle(
      "absolute top-[40%] flex flex-col items-center left-0 w-full my-5 pointer-events-none text-center text-sm text-gray-500"
    )
  )
  const classSlotFooterBody = computed(() =>
    Table.setStyle([
      "min-h-[1.5rem] -mt-[1px] text-gray-500",
      isSummary.value || isPagination.value ? "relative sm:px-5" : "",
      modeStyle.value
    ])
  )
  const styleSlotFooterBody = computed(
    () =>
      `border-bottom-left-radius: ${styles.value.borderRadiusPx}px;border-bottom-right-radius: ${styles.value.borderRadiusPx}px;`
  )
  const classSlotFooter = computed(() =>
    Table.setStyle([
      "classSlotFooter p-2 border-t-2",
      styles.value.class?.slotFooter,
      defaultBorder.value,
      styles.value.border?.footer
    ])
  )
  // ---TABLE_OBSERVER----------------------
  const tableObserver = new ResizeObserver((entries) => entries.forEach(() => setFooterPaddingHeight()))
  const footerPaddingHeight = ref<number>(0)

  function setFooterPaddingHeight() {
    const result =
      (clientHeightTable.value ?? 0) -
      ((thead.value?.clientHeight ?? 0) + (tbody.value?.clientHeight ?? 0) + (tfoot.value?.clientHeight ?? 0))
    footerPaddingHeight.value = result > 0 ? result : 0
  }

  // ---IS-DARK-----------------------------
  const isDark = ref<boolean>(window.matchMedia("(prefers-color-scheme: dark)")?.matches)
  const colorSchemeQueryList = window.matchMedia("(prefers-color-scheme: dark)")
  const setColorScheme = (e: any) => (isDark.value = e.matches)
  setColorScheme(colorSchemeQueryList)
  colorSchemeQueryList.addEventListener("change", setColorScheme)
  // ---EXPOSE------------------------------
  defineExpose<TableExpose>({
    //---STATE-------------------------
    sortColumns,
    filterColumns,
    widthsColumns,
    queryTable,
    pageTable,
    sizeTable,
    allData,
    isLoading,
    // ---PROPS-------------------------------
    mode,
    isVisibleToolbar,
    isSearch,
    isFilterClear,
    isColumns,
    isSummary,
    countDataOnLoading,
    classMaskQuery,
    noData,
    noColumn,
    noFilter,
    iconSort,
    resizedColumns,
    lengthData,
    groupField,
    isFilter,
    isSort,
    isGroup,
    isPagination,
    // ---PAGINATION--------------------------
    startPage,
    modePagination,
    sizePage,
    visibleNumberPages,
    sizesSelector,
    isInfoText,
    isPageSizeSelector,
    isHiddenNavigationButtons,
    // ---CELL--------------------------------
    heightCell,
    countVisibleRows,
    heightTable,
    // ---DATA--------------------------------
    dataSource,
    resultDataSource,
    dataColumns,
    dataSummary,
    summaryColumns,
    // ---STYLE-------------------------------
    styles,
    tableBodyStyle,
    modeStyle,
    isDark,
    // ---METHODS-----------------------------
    addRow,
    deleteRow,
    updateRow,
    updateCell,
    getColumn,
    updateDataSource,
    sorting,
    filtering,
    searching,
    switchPage,
    switchSizePage,
    clearFilter,
    startLoading,
    stopLoading,
    updateHeightTable
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    Table.initStyle()
    if (tbody.value) {
      tableObserver.observe(tbody.value as Element)
    }
    Object.assign(
      sortColumns,
      Object.fromEntries(new Map(dataColumns.value.map((column) => [column.dataField, column.defaultSort ?? null])))
    )
    Object.assign(
      filterColumns,
      Object.fromEntries(new Map(dataColumns.value.map((column) => [column.dataField, column.defaultFilter ?? null])))
    )
    Object.assign(
      widthsColumns,
      Object.fromEntries(
        new Map(
          dataColumns.value.map((column) => [column.dataField, column.width ?? column.maxWidth ?? column.minWidth])
        )
      )
    )
    nextTick(() => {
      updateHeightTable()
      startLastRowVisibleObserver()
    })
  })
  onUnmounted(() => {
    tableObserver.disconnect()
    colorSchemeQueryList.removeEventListener("change", setColorScheme)
  })
  // ---WATCHERS----------------------------
  watch(
    () => [countVisibleRows.value, styles.value.height],
    (value, oldValue) => {
      clientHeightTable.value = 0
      const timeout: number = value[0] === oldValue[0] && styles.value?.hoverRows !== "transition-none" ? 500 : 1
      setTimeout(() => updateHeightTable(), timeout)
    }
  )
  watch(
    () => props.dataSource,
    () => {
      allData.value = props.dataSource?.length
        ? props.dataSource?.map((item) => {
            return { ...item, _key: crypto.randomUUID() }
          })
        : []
      updateDataSource()
    },
    { immediate: true }
  )
  watch(
    () => sortColumns,
    () => {
      emit("sort", { dataColumns: dataColumns.value, sortedFields: getSorted(sortColumns) })
    },
    { deep: true }
  )
  watch(
    () => filterColumns,
    () => {
      switchPage(1)
      emit("filter", { dataColumns: dataColumns.value, filteredFields: getFilters(filterColumns) })
    },
    { deep: true }
  )
  watch(
    () => queryTable.value,
    (query) => {
      switchPage(1)
      emit("search", query)
    }
  )
  watch(
    startPage,
    (numberPage: number) => {
      nextTick(() => switchPage(numberPage))
    },
    { immediate: true }
  )
  watch(
    sizePage,
    (sizePageValue: number) => {
      switchSizePage(sizePageValue ?? sizePage.value)
    },
    { immediate: true }
  )

  // ---METHODS-----------------------------
  function getHeightVisibleRows(): number {
    if (countVisibleRows.value && tbody.value && componentTable.value) {
      const tagTrs: NodeListOf<HTMLTableRowElement> = (tbody.value as HTMLElement)?.querySelectorAll(
        `tr:nth-child(-n+${countVisibleRows.value ?? 1})`
      )
      if (tagTrs && tagTrs.length) {
        let sum = 0
        tagTrs.forEach((item) => (sum += item?.offsetHeight))
        return sum
      } else return countVisibleRows.value * (32 + heightCell.value + 1)
    }
    return 0
  }

  function updateHeightTable(): void {
    if (styles.value.height) {
      const componentTableHeight =
        (componentTable.value?.clientHeight ?? 0) -
        parseFloat(getComputedStyle(componentTable.value as HTMLElement).paddingTop) -
        parseFloat(getComputedStyle(componentTable.value as HTMLElement).paddingBottom)
      const height =
        (componentTableHeight ?? 0) -
        (tableToolbar.value?.clientHeight ?? 0) -
        (tableHeader.value?.clientHeight ?? 0) -
        (pager.value?.clientHeight ?? 0) -
        (tableFooter.value?.clientHeight ?? 0)
      clientHeightTable.value = height >= 0 ? height : 0
      heightTable.value = `height:${height >= 0 ? height : 0}px;`
    } else if (countVisibleRows.value) {
      const resultHeight =
        (thead.value?.clientHeight ?? 0) + (tfoot.value?.clientHeight ?? 0) + getHeightVisibleRows() - 1
      clientHeightTable.value = resultHeight > 0 ? resultHeight : baseTableHeight
      heightTable.value = `height: ${resultHeight > 0 ? resultHeight : baseTableHeight}px;`
    } else {
      clientHeightTable.value = tableBody?.value?.clientHeight ?? 0
      heightTable.value = "height: auto;"
    }
  }

  function getColumn(dataField: IColumn["dataField"], index?: number): IColumnPrivate | undefined {
    return dataColumns.value.find((column, item) => (dataField ? column.dataField === dataField : item === index))
  }

  function updateDataSource(): Array<Record<string, any>> {
    if (!(allData.value && allData.value?.length)) {
      return []
    }
    let data = toRaw(allData.value) as Array<Record<string, any>>
    // Sort
    if (data && Object.keys(sortColumns).filter((i) => sortColumns[i] !== null).length) {
      const sortedFields = getSorted(sortColumns) as any
      data = LD.orderBy(data, Object.keys(sortedFields), Object.values(sortedFields))
    }
    // Filter
    if (data && noEmptyFilters(filterColumns).length) {
      const filter = getFilters(filterColumns)
      data = LD.filter(
        data,
        (row) =>
          Object.keys(filter).filter((item) => {
            const column = dataColumns.value.find((col) => col.dataField === item)
            if (column) return isEqualsValue(column, row[column.dataField], filter[column.dataField])
          }).length === Object.keys(filter).length
      )
    }
    // Search
    if (data && queryTable.value.length) {
      data = LD.filter(
        data,
        (row) =>
          !!dataColumns.value
            .filter((item) => item.visible)
            .filter((item) => isEqualsValue(item, row[item.dataField], queryTable.value)).length
      )
    }
    stopLoading()
    dataSource.value = data ?? []
    startLastRowVisibleObserver()
    return data ?? []
  }

  function sorting(dataField: IColumn["dataField"], value?: Sort) {
    if (!dataField) {
      return
    }
    if (value === undefined) {
      value =
        sortColumns[dataField] === null
          ? "asc"
          : sortColumns[dataField] === "asc"
            ? "desc"
            : sortColumns[dataField] === "desc"
              ? null
              : null
    }
    const timeout = lengthData.value > countDataOnLoading.value ? 800 : 10
    if (timeout > 100) {
      startLoading()
    }
    setTimeout(() => {
      sortColumns[dataField] = value as Sort
      updateDataSource()
    }, timeout)
  }

  function filtering(dataField: IColumn["dataField"], value: any) {
    if (!dataField) {
      return
    }
    const isLoading =
      typeof value === "object" || typeof value === "number"
        ? true
        : (filterColumns[dataField] as string | Array<any>)?.length > (value as string | Array<any>)?.length
    const timeout =
      (allData.value?.length ?? 0) > countDataOnLoading.value
        ? (lengthData.value > countDataOnLoading.value || value === null || value === "" || isLoading) &&
          filterColumns[dataField] !== value
          ? 800
          : 0
        : 0
    if (timeout > 100) {
      startLoading()
    }
    setTimeout(() => {
      filterColumns[dataField] = value
      updateDataSource()
    }, timeout)
  }

  function searching(value: Search | null) {
    const isLoading = queryTable.value?.length > (value?.length ?? 0)
    const timeout =
      (allData.value?.length ?? 0) > countDataOnLoading.value
        ? lengthData.value > countDataOnLoading.value || value === null || value === "" || isLoading
          ? 800
          : 0
        : 0
    if (timeout > 100) {
      startLoading()
    }
    setTimeout(() => {
      queryTable.value = value ?? ""
      updateDataSource()
    }, timeout)
  }

  function switchPage(page: Page) {
    pageTable.value = page
    emit("switch-page", pageTable.value)
  }

  function switchSizePage(sizePage: Page) {
    switchPage(1)
    sizeTable.value = sizePage
    emit("switch-size-page", sizeTable.value)
  }

  function isEqualsValue(column: IColumnPrivate, columnValue: any, value: any): boolean {
    if (columnValue === null || columnValue === undefined) {
      return false
    }
    switch (column.type) {
      case "string":
        return String(columnValue).includes(value)
      case "number":
        return columnValue === Number(value)
      case "select": {
        if (Array.isArray(value)) {
          return (value as Array<string>).includes(columnValue)
        } else {
          return String(columnValue).includes(value)
        }
      }
      case "date": {
        if (value instanceof Date) {
          return dayjs(dayjs(columnValue).startOf("day")).isSame(dayjs(value as Date).startOf("day"))
        } else {
          if (value?.start instanceof Date && value?.end instanceof Date) {
            dayjs.extend(isBetween)
            return dayjs(dayjs(columnValue).startOf("day")).isBetween(
              dayjs((value as IRangeValue)?.start as Date).startOf("day"),
              dayjs((value as IRangeValue)?.end as Date).startOf("day"),
              null,
              "[]"
            )
          } else {
            return false
          }
        }
      }
      default:
        return false
    }
  }

  function setSummary(summary: ISummaryPrivate): string {
    let result: number | string | null | undefined = null
    const columnData: Array<any> = LD.map(dataSource.value, summary.dataField ?? "")
    switch (summary.type) {
      case "sum": {
        if ((["number"] as Array<DataType>).includes(summary.dataType)) {
          result = LD.sumBy(LD.compact(columnData), (i) => (!isNaN(Number(i)) ? Number(i) : 0))
        }
        break
      }
      case "count": {
        if ((["string", "select", "number", "date"] as Array<DataType>).includes(summary.dataType)) {
          result = LD.size(columnData)
        }
        break
      }
      case "min": {
        if ((["string", "select"] as Array<DataType>).includes(summary.dataType)) {
          result = LD.minBy(columnData, (i) => String(i).length)
        }
        if (summary.dataType === "number") {
          result = LD.minBy(columnData, (i) => (!isNaN(Number(i)) ? Number(i) : 0))
        }
        if (summary.dataType === "date") {
          result = LD.minBy(columnData, (i) => new Date(i).getTime())
        }
        break
      }
      case "max": {
        if ((["string", "select"] as Array<DataType>).includes(summary.dataType)) {
          result = LD.maxBy(columnData, (i) => String(i).length)
        }
        if (summary.dataType === "number") {
          result = LD.maxBy(columnData, (i) => (!isNaN(Number(i)) ? Number(i) : 0))
        }
        if (summary.dataType === "date") {
          result = LD.maxBy(columnData, (i) => new Date(i).getTime())
        }
        break
      }
      case "avg": {
        if ((["string", "select"] as Array<DataType>).includes(summary.dataType)) {
          result = LD.round(
            LD.meanBy(columnData, (i) => String(i).length),
            0
          )
        }
        if (summary.dataType === "number") {
          result = LD.round(
            LD.meanBy(columnData, (i) => (!isNaN(Number(i)) ? Number(i) : 0)),
            0
          )
        }
        if (summary.dataType === "date") {
          result = LD.meanBy(columnData, (i) => new Date(i).getTime())
        }
        break
      }
    }
    if (result === null || result === undefined) {
      return ""
    }
    const column = getColumn(summary.dataField)
    if (column) result = setCell(column, String(result))
    if (summary?.customizeText && typeof summary.customizeText === "function") {
      return summary?.customizeText(summary, `${result}`) ?? ""
    } else {
      return String(summary?.displayFormat).replace(/\{0}/g, `${result}`)
    }
  }

  function setCell(column: IColumnPrivate, value: any, data?: any): string {
    function toMask() {
      if (column?.mask === "phone") {
        return convertToPhone(String(value))
      } else if (column?.mask === "number") {
        return convertToNumber(
          value,
          (column.paramsFilter as Partial<BaseInputProps>)?.lengthInteger ?? 20,
          (column.paramsFilter as Partial<BaseInputProps>)?.lengthDecimal ?? 0,
          ""
        )
      } else if (column?.mask === "price") {
        return convertToNumber(
          value,
          (column.paramsFilter as Partial<BaseInputProps>)?.lengthInteger ?? 20,
          (column.paramsFilter as Partial<BaseInputProps>)?.lengthDecimal ?? 0,
          " "
        )
      } else {
        return String(value)
      }
    }

    let valueCell
    if (value === null || value === undefined) {
      valueCell = null
    } else if ("setCellValue" in column && typeof column.setCellValue === "function") {
      valueCell = column.setCellValue(column, value, data)
    } else {
      switch (column.type) {
        case "string":
          valueCell = toMask()
          break
        case "number":
          valueCell = toMask()
          break
        case "select":
          valueCell = toMask()
          break
        case "date":
          valueCell = dayjs(value).format((column as EditDate).paramsFilter?.paramsDatePicker?.mask)
          break
        default:
          valueCell = value
      }
    }
    return valueCell
  }

  function setMarker(column: IColumnPrivate, valueCell: any): string {
    if (valueCell && (filterColumns[column.dataField] || queryTable.value.length)) {
      valueCell = valueCell.replace(
        new RegExp(filterColumns[column.dataField] ?? queryTable.value, "gi"),
        `<span class="${classMaskQuery.value}">$&</span>`
      )
    }
    return valueCell
  }

  function getSorted(sorted: Sorted): Sorted {
    return Object.keys(sorted).reduce((result: Sorted, column) => {
      if (sorted[column] === "asc" || sorted[column] === "desc") {
        result[column] = sorted[column]
      }
      return result
    }, {})
  }

  function getFilters(filters: Filters): Filters {
    return noEmptyFilters(filters).reduce((result, column) => {
      result[column] = filters[column]
      return result
    }, {})
  }

  function noEmptyFilters(filter: Filters): Array<any> {
    return Object.keys(filter).filter(
      (i) =>
        filter[i] !== undefined &&
        filter[i] !== null &&
        filter[i] !== "" &&
        JSON.stringify(filter[i]) !== JSON.stringify({ start: undefined, end: undefined })
    )
  }

  function clearFilter() {
    Object.keys(filterColumns).map((filter) => sorting(filter, null))
    Object.keys(filterColumns).map((filter) => filtering(filter, null))
    searching("")
    emit("clear-filter")
  }

  function clearEditableCell(indexRow: number, indexCol: number) {
    nextTick(() => {
      if (editableCell.value?.indexRow === indexRow && editableCell.value?.indexCol === indexCol) {
        editableCell.value = null
      }
    })
  }

  function startLoading() {
    isLoading.value = true
    emit("loading", isLoading.value)
  }

  function stopLoading() {
    isLoading.value = false
    emit("loading", isLoading.value)
  }

  function clickRow(key: string, data: any, indexRow: number) {
    emit("click-row", {
      eventEl: ((tbody.value as HTMLElement)?.querySelector(`.${key}`) as HTMLElement) ?? null,
      data,
      indexRow
    })
  }

  function clickCell(
    key: string,
    column: IColumnPrivate,
    value: any,
    valueWithMarker: any,
    data: any,
    indexRow: number,
    indexCol: number
  ) {
    if ((column as IColumnPrivate)?.isEdit) {
      editableCell.value = { indexRow, indexCol }
    }
    emit("click-cell", {
      eventEl: ((tbody.value as HTMLElement)?.querySelector(`.${key}`) as HTMLElement) ?? null,
      column,
      value,
      valueWithMarker,
      data,
      indexRow
    })
  }

  function addRow(data: any): number {
    const newValueRow: any = { ...data, _key: crypto.randomUUID() }
    const index: number = (allData.value as Array<any>)?.push(newValueRow) - 1
    emit("add-row", { value: data, index, _key: newValueRow._key })
    return index
  }

  function deleteRow(_key: string): false | any {
    if (_key && Array.isArray(allData.value)) {
      const index = allData.value.findIndex((i) => i._key === _key)
      if (index && index >= 0) {
        emit("delete-row", { value: allData.value[index], index, _key })
        return allData.value?.splice(index, 1)
      }
    }
    return false
  }

  function updateRow(_key: string, data: any): false | any {
    if (_key && Array.isArray(allData.value)) {
      const index = allData.value?.findIndex((i) => i._key === _key)
      if (index && index >= 0) {
        const newValueRow = { ...allData.value[index], ...data }
        emit("before-edit-row", { newValue: newValueRow, oldValue: allData.value[index], _key })
        allData.value[index] = newValueRow
        emit("after-edit-row", { newValue: allData.value[index], oldValue: newValueRow, _key })
        return allData.value[index]
      }
    }
    return false
  }

  function updateCell(_key: string, column: IColumnPrivate, value: any): false | any {
    if (_key && Array.isArray(allData.value) && column && column?.dataField) {
      const index = allData.value?.findIndex((i) => i._key === _key)
      if (index && index >= 0 && column.dataField in allData.value[index]) {
        emit("before-edit-cell", { newValue: value, oldValue: allData.value[index][column.dataField], _key, column })
        allData.value[index][column.dataField] = value
        emit("after-edit-cell", { newValue: allData.value[index][column.dataField], oldValue: value, _key, column })
        return value
      }
    }
    return false
  }

  function startLastRowVisibleObserver() {
    if (tbody.value && isLoadingRows.value) {
      const el = (tbody.value as HTMLElement)?.querySelector(rowSelector)
      if (el) lastRowVisibleObserver.unobserve(el)
      sizeLoadedRows.value =
        countVisibleRows.value + sizeLoadedRows.value > dataSource.value?.length
          ? (dataSource.value?.length ?? sizeLoadedRows.value)
          : sizeLoadedRows.value
      nextTick(() => {
        if (tbody.value) {
          const el = (tbody.value as HTMLElement).querySelector(rowSelector)
          if (el) lastRowVisibleObserver.observe(el)
        }
      })
    }
  }

  function updateSizeLoadedRows() {
    if (!tbody.value) return
    const el = (tbody.value as HTMLElement)?.querySelector(rowSelector)
    if (el) lastRowVisibleObserver.unobserve(el)
    sizeLoadedRows.value += sizeLoadingRows.value
    nextTick(() => {
      if (!tbody.value) return
      if (sizeLoadedRows.value >= dataSource.value?.length) return
      const el = (tbody.value as HTMLElement)?.querySelector(rowSelector)
      if (el) lastRowVisibleObserver.observe(el)
    })
  }

  // ---INTERSECTION_OBSERVER---------------
  const lastRowVisibleObserver = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return
      updateSizeLoadedRows()
    },
    { root: tableBody.value as Element, rootMargin: `100px` }
  )

  // ---RESIZE-COLUMN-----------------------
  function resizeColumn($event: MouseEvent, columnId: string) {
    const columnEl = (thead.value as HTMLElement)?.querySelector(`.${columnId}`)
    if (columnEl) {
      const column = <IColumnPrivate>dataColumns.value.find((item) => item.id === columnId)
      const rect = columnEl.getBoundingClientRect()
      let newW = $event.pageX - rect.left
      const maxW = column.maxWidth
      if (maxW && newW > maxW) {
        newW = maxW
      }
      const minW = column.minWidth ?? 100
      if (minW && newW < minW) {
        newW = minW
      }
      widthsColumns[column.dataField] = Math.round(newW)
    }
  }

  const resizableColumn = ref<string | null>(null)

  function moveResizedColumns(ev: MouseEvent) {
    resizeColumn(ev, resizableColumn.value ?? "")
  }

  function startResizeColumn($event: MouseEvent, column: IColumnPrivate["id"]) {
    if ($event.stopPropagation) $event.stopPropagation()
    if ($event.preventDefault) $event.preventDefault()
    resizableColumn.value = column
    window.addEventListener("mousemove", moveResizedColumns)
    window.addEventListener("mouseup", stopResizeColumn)
  }

  function stopResizeColumn() {
    resizableColumn.value = null
    window.removeEventListener("mousemove", moveResizedColumns)
    window.removeEventListener("mouseup", stopResizeColumn)
  }

  // ---------------------------------------
</script>

<template>
  <div ref="componentTable" :class="classBaseTable" :style="`width:${styles.width};height:${styles.height};`">
    <div v-if="isVisibleToolbar" ref="tableToolbar" :class="classBaseToolbar">
      <div v-if="slots.toolbar" :class="classSlotToolbar">
        <slot name="toolbar" />
      </div>
      <div :class="classSearch">
        <Input
          v-if="isSearch"
          :model-value="queryTable"
          :label="Table.t('find') ?? 'Find...'"
          clear
          :mode="mode"
          label-mode="vanishing"
          :params-input="{
            autocomplete: 'off',
            classInput:
              'min-w-[5rem] max-w-[5rem] focus:max-w-[8rem] focus:min-w-[8rem] sm:focus:max-w-[15rem] sm:focus:min-w-[15rem] transition-all duration-500'
          }"
          :class-body="`sticky top-1 rounded-md ease-out ${modeStyle} mb-2`"
          @change:model-value="(v) => searching(v)"
          @update:model-value="(v) => lengthData > 100 || searching(v)">
          <template #before>
            <MagnifyingGlassIcon aria-hidden="true" :class="classIcon" />
          </template>
        </Input>
      </div>
      <transition
        leave-active-class="transition ease-in duration-1000"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        enter-active-class="transition ease-in duration-1000"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100">
        <Button
          v-if="isFilterClear"
          class="group rounded-md ml-2 h-[38px] min-w-[38px] px-2 bg-stone-100 dark:bg-stone-900"
          @click="clearFilter">
          <FunnelIcon aria-hidden="true" :class="classIconClearFilter" />
          <FixWindow :mode="mode">Очистить все фильтры</FixWindow>
        </Button>
      </transition>
    </div>
    <div :class="classTableBody" :style="`border-radius: ${styles.borderRadiusPx}px;`">
      <div v-if="slots.header" ref="tableHeader" :class="classBodySlotHeader" :style="styleHeader">
        <div :class="classSlotHeader">
          <slot name="header" />
        </div>
      </div>
      <div :class="classBaseTableBody">
        <div ref="tableBody" :class="classBodyTable" :style="styleBodyTable">
          <table ref="table" :class="classTable">
            <!-- -------------------------------- -->
            <thead v-if="isColumns" ref="thead" :class="classTHead">
              <tr>
                <template v-for="(column, key) in dataColumns" :key="column.id">
                  <th v-if="column.visible" scope="col" :class="classTh(column)" :style="styleTh(column)">
                    <div :class="classBodyFilter">
                      <div v-if="column.isFilter" :class="classIsFilter(column)">
                        <Input
                          v-if="column.type === 'string' || column.type === 'number'"
                          :model-value="filterColumns[column?.dataField]"
                          v-bind="column?.paramsFilter as BaseInputProps"
                          :label="column.caption"
                          :mode="mode"
                          :class="['border-none font-normal', column.class?.colFilterClass as string]"
                          :class-body="['tm-0 my-1', column.class?.colFilterClassBody as string]"
                          :style="`min-width: ${column.minWidth || 70}px`"
                          label-mode="offsetDynamic"
                          clear
                          @change:model-value="(v) => filtering(column?.dataField, v)"
                          @update:model-value="(v) => lengthData > 100 || filtering(column?.dataField, v)"
                          @clear="filtering(column?.dataField, null)" />
                        <Select
                          v-else-if="column.type === 'select'"
                          :model-value="filterColumns[column?.dataField]"
                          v-bind="column?.paramsFilter as BaseSelectProps"
                          :label="column.caption"
                          :mode="mode"
                          :class="['border-none font-normal', column.class?.colFilterClass as string]"
                          :class-body="['tm-0 my-1', column.class?.colFilterClassBody as string]"
                          :style="`min-width: ${column.width || column.minWidth || 50}px`"
                          clear
                          @update:model-value="(v) => filtering(column?.dataField, v)" />
                        <Calendar
                          v-else-if="column.type === 'date'"
                          :model-value="filterColumns[column?.dataField]"
                          v-bind="column?.paramsFilter as BaseCalendarProps"
                          :label="column.caption"
                          :mode="mode"
                          label-mode="offsetDynamic"
                          :class="['border-none font-normal', column.class?.colFilterClass as string]"
                          :class-body="['tm-0 my-1', column.class?.colFilterClassBody as string]"
                          :style="`min-width: ${widthsColumns[column.dataField] ? widthsColumns[column.dataField] - 30 : column.width || column.minWidth || 50}px`"
                          clear
                          @update:model-value="(v) => filtering(column?.dataField, v)" />
                      </div>
                      <div v-else :class="classNotFilter">
                        {{ column.caption }}
                      </div>
                      <div
                        v-if="column.isSort ?? isSort"
                        :class="classIsSort(column)"
                        @click="sorting(column?.dataField)">
                        <ArrowLongUpIcon
                          v-if="iconSort === 'Arrow' && [null, 'asc'].includes(sortColumns[column?.dataField])"
                          :class="classSortIcon" />
                        <ArrowLongDownIcon
                          v-if="iconSort === 'Arrow' && sortColumns[column?.dataField] === 'desc'"
                          :class="classSortIcon" />
                        <BarsArrowUpIcon
                          v-if="iconSort === 'Bars' && [null, 'asc'].includes(sortColumns[column?.dataField])"
                          :class="classSortIcon" />
                        <BarsArrowDownIcon
                          v-if="iconSort === 'Bars' && sortColumns[column?.dataField] === 'desc'"
                          :class="classSortIcon" />
                      </div>
                      <div
                        v-if="column.isResized ?? resizedColumns"
                        :class="classResizedColumns(column, key)"
                        @mousedown="startResizeColumn($event, column.id)"
                        @mouseup="stopResizeColumn">
                        <div :class="classResize"></div>
                      </div>
                    </div>
                  </th>
                </template>
              </tr>
            </thead>
            <!-- -------------------------------- -->
            <tbody ref="tbody" :class="classTBody">
              <template v-for="(group, key) in resultDataSource" :key="key">
                <tr v-if="isGroup">
                  <th :colspan="dataColumns.length" scope="colgroup" :class="classGroup" :style="styleGroup">
                    <div :class="classGroupText" :style="styleGroupText">
                      <slot name="group" :item="key" :length="group.length">{{ key }}</slot>
                    </div>
                  </th>
                </tr>
                <template v-for="(data, indexRow) in group" :key="indexRow">
                  <tr
                    :class="classTr(data, indexRow)"
                    @click="clickRow(`tr--${data?._key ?? indexRow}`, data, indexRow)">
                    <template v-for="(column, indexCol) in dataColumns" :key="`${indexRow}-${indexCol}`">
                      <td
                        v-if="column.visible"
                        :class="classColumnTd(data, indexRow, column, indexCol)"
                        :style="styleColumnTd(column)"
                        @click="
                          clickCell(
                            `td--${data?._key ?? indexRow}--${column?.name ?? indexCol}`,
                            column,
                            data[column.dataField],
                            setMarker(column, setCell(column, data[column.dataField], data)),
                            data,
                            indexRow,
                            indexCol
                          )
                        ">
                        <div
                          v-if="!column?.cellTemplate"
                          :class="classCellTable(indexRow, column, indexCol)"
                          :style="styleCellTable">
                          <div
                            v-if="!(editableCell?.indexRow === indexRow && editableCell?.indexCol === indexCol)"
                            v-html="setMarker(column, setCell(column, data[column.dataField], data))" />
                          <template v-if="editableCell?.indexRow === indexRow && editableCell?.indexCol === indexCol">
                            <Input
                              v-if="column.type === 'string' || column.type === 'number'"
                              :model-value="data[column.dataField]"
                              v-bind="{
                                ...(column.edit as EditInput)?.paramsFilter,
                                classInput: `pt-[5px] pl-[10px] text-sm font-medium ${styles.class?.cellText} ${
                                  (column.edit as EditInput)?.paramsFilter?.classInput
                                }`
                              }"
                              :mode="mode"
                              class="border-none font-normal bg-transparent dark:bg-transparent"
                              class-body="pt-0 -my-3 w-full"
                              label-mode="vanishing"
                              @is-active="(isActive) => isActive || clearEditableCell(indexRow, indexCol)"
                              @change:model-value="(value) => updateCell(data?._key, column, value)" />
                            <Select
                              v-else-if="column.type === 'select'"
                              :model-value="data[column.dataField]"
                              v-bind="{
                                ...(column.edit as EditSelect)?.paramsFilter,
                                paramsFixWindow: {
                                  scrollableEl: tableBody,
                                  ...(column.edit as EditSelect)?.paramsFilter?.paramsFixWindow
                                },
                                classSelect: `pl-[10px] text-sm font-medium ${styles.class?.cellText} ${
                                  (column.edit as EditSelect)?.paramsFilter?.classSelect
                                }`
                              }"
                              :mode="mode"
                              class="border-none font-normal bg-transparent dark:bg-transparent"
                              class-body="pt-[2px] -my-3 w-full"
                              label-mode="vanishing"
                              @update:model-value="
                                (value) => {
                                  updateCell(data?._key, column, value)
                                }
                              " />
                            <!--                              @is-active="(isActive) => isActive || clearEditableCell(indexRow, indexCol)"-->
                            <Calendar
                              v-else-if="column.type === 'date'"
                              :model-value="data[column.dataField]"
                              v-bind="{
                                ...(column.edit as EditDate)?.paramsFilter,
                                paramsFixWindow: {
                                  scrollableEl: tableBody,
                                  ...(column.edit as EditDate)?.paramsFilter?.paramsFixWindow
                                },
                                classDateText: `pt-[7px] pl-[10px] text-sm font-medium ${styles.class?.cellText} ${
                                  (column.edit as EditDate)?.paramsFilter?.classDateText
                                }`
                              }"
                              :mode="mode"
                              class="border-none font-normal bg-transparent dark:bg-transparent"
                              class-body="pt-0 -my-3 w-full"
                              label-mode="vanishing"
                              @is-active="(isActive) => isActive || clearEditableCell(indexRow, indexCol)"
                              @update:model-value="(value) => updateCell(data?._key, column, value)" />
                          </template>
                        </div>
                        <div v-else :class="classTemplate" :style="styleCellTable">
                          <slot
                            :name="column?.cellTemplate"
                            :key="data?._key"
                            :column="column"
                            :rowData="data"
                            :value="setCell(column, data[column.dataField], data)"
                            :value-with-marker="setMarker(column, setCell(column, data[column.dataField], data))"
                            :is-close-editor="(isActive) => isActive || clearEditableCell(indexRow, indexCol)"
                            :edit-valiue="(value) => updateCell(data?._key, column, value)" />
                        </div>
                      </td>
                    </template>
                  </tr>
                </template>
              </template>
            </tbody>
            <!-- -------------------------------- -->
            <tr v-if="footerPaddingHeight" :class="classFooterPaddingHeight" :style="styleFooterPaddingHeight"></tr>
            <!-- -------------------------------- -->
            <tfoot v-if="isSummary && Object.keys(summaryColumns).length" ref="tfoot" :class="classTFoot">
              <tr>
                <template v-for="column in dataColumns" :key="column.id">
                  <th v-if="column.visible" scope="col" :class="classThSummary">
                    <div :class="classThSummaryText" v-html="summaryColumns[column.dataField]" />
                  </th>
                </template>
              </tr>
            </tfoot>
            <!-- -------------------------------- -->
          </table>
        </div>
        <!-- -------------------------------- -->
        <div v-if="isPagination && allData?.length" ref="pager" :class="classIsPagination" :style="styleIsPagination">
          <Pagination
            :model-value="pageTable"
            :size-page="+sizeTable"
            :mode="modePagination"
            :total="lengthData"
            :visible-number-pages="visibleNumberPages"
            :is-info-text="isInfoText"
            :sizes-selector="sizesSelector"
            :is-page-size-selector="isPageSizeSelector"
            :is-hidden-navigation-buttons="isHiddenNavigationButtons"
            :class="[
              'classPagination border-t sm:px-2',
              styles.class?.pagination,
              defaultBorder,
              styles.border?.pagination
            ]"
            @update:model-value="switchPage"
            @update:size-page="switchSizePage" />
        </div>
        <!-- -------------------------------- -->
        <transition
          leave-active-class="transition ease-in duration-500"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition ease-in duration-500"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="isLoading" :class="classIsLoading">
            <div :class="classIsLoadingBody">
              <Loading type="Fingerprint" :size="100" :color="isDark ? 'theme.600' : 'theme.500'" />
            </div>
          </div>
        </transition>
        <!-- -------------------------------- -->
        <transition
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition ease-in duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="!isLoading && !allData?.length" :class="classNoData">
            <TableCellsIcon aria-hidden="true" :class="classIcon" />
            <div v-html="noData" />
          </div>
        </transition>
        <transition
          leave-active-class="transition ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition ease-in duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="!isLoading && allData?.length && !dataColumns?.length" :class="classNoColumn" v-html="noColumn" />
        </transition>
        <transition
          leave-active-class="transition-all ease-in duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition-all ease-in duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="!isLoading && allData?.length && dataColumns?.length && !dataSource.length" :class="classNoFilter">
            <FunnelIcon aria-hidden="true" :class="classIcon" />
            <div v-html="noFilter" />
          </div>
        </transition>
      </div>
      <div v-if="slots.footer" ref="tableFooter" :class="classSlotFooterBody" :style="styleSlotFooterBody">
        <div :class="classSlotFooter">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

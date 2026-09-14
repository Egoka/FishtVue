<script setup lang="ts">
  import {
    Comment,
    Fragment,
    Text,
    computed,
    defineComponent,
    nextTick,
    onMounted,
    onUnmounted,
    reactive,
    ref,
    toRaw,
    unref,
    useSlots,
    watch
  } from "vue"
  import * as LD from "lodash-es"
  import { isEqual, isWithinInterval, startOfDay } from "date-fns"
  import {
    ArrowLongDownIcon,
    ArrowLongUpIcon,
    BarsArrowDownIcon,
    BarsArrowUpIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    TableCellsIcon,
    ViewColumnsIcon
  } from "@heroicons/vue/20/solid"
  import {
    DataGrouping,
    DataSource,
    DataType,
    EditDate,
    EditInput,
    EditSelect,
    Filters,
    TableAsyncDataConfig,
    TableAsyncDataParams,
    TableAsyncDataResult,
    TableColumn,
    TableColumnPrivate,
    TableFilter,
    TableGrouping,
    TableSort,
    TableSummaryPrivate,
    TableClassKey,
    TableSettings,
    TableToolbar,
    Page,
    ResultData,
    Search,
    Sort,
    Sorted,
    TableEmits,
    TablePagination,
    TableProps,
    Widths
  } from "./Table"
  import Button from "fishtvue/button/Button.vue"
  import Loading from "fishtvue/loading/Loading.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Pagination from "fishtvue/pagination/Pagination.vue"
  import Input from "fishtvue/input/Input.vue"
  import Select from "fishtvue/select/Select.vue"
  import Calendar from "fishtvue/calendar/Calendar.vue"
  import Component from "fishtvue/component"
  import { useFishtVue } from "fishtvue/config"
  import { StyleClass, TLoading } from "fishtvue/types"
  import { BaseInputProps } from "fishtvue/input"
  import { BaseSelectProps } from "fishtvue/select"
  import { BaseCalendarProps, CalendarRangeValue } from "fishtvue/calendar"
  import { InputLayoutProps } from "fishtvue/inputlayout"
  import { isClient } from "fishtvue/utils/domHandler"
  import { formatDate } from "fishtvue/utils/dateHandler"
  import { generateUUID } from "fishtvue/utils/functionHandler"
  import { convertToNumber, convertToPhone, isNumber } from "fishtvue/utils/numberHandler"
  import { deepCopyObject, deepMerge, deepMergeSoft, fieldsOmit } from "fishtvue/utils/objectHandler"
  import { cn, mergeClasses } from "fishtvue/utils/tailwindHandler"
  // ---BASE-COMPONENT----------------------
  const Table = new Component<"Table">()
  const options = Table.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<TableProps>(), {
    toolbar: undefined,
    editable: undefined,
    sort: undefined,
    filter: undefined,
    resizableColumns: undefined,
    pagination: undefined,
    searchable: undefined,
    columns: undefined,
    summary: undefined,
    virtual: undefined,
    stripedRows: undefined,
    horizontalLines: undefined,
    verticalLines: undefined,
    filterLines: undefined,
    // union `asyncData` включает `boolean` — без own default Vue скастовал бы отсутствующий
    // prop в `false` и слой `componentsOptions` стал бы недостижим (dev-patterns §2 F).
    asyncData: undefined
  })
  const emit = defineEmits<TableEmits>()
  const { cls, raw, pick } = Table.resolveClasses<TableClassKey>(props)
  const slots = useSlots()
  // ---COMPOUND-API (VNode-walk <Column>/<ColumnGroup>/<Pagination>/<Loading>) ----------
  // Считываем декларативные дети из default slot и синтезируем descriptor'ы колонок + header-группы
  // + override-конфиги пейджера/лоадера. Schema-driven `:columns`/`:pagination` при наличии выигрывают
  // (backward compat). Сопоставление по ИМЕНИ компонента — Column.vue/ColumnGroup.vue НЕ импортируем
  // в этот SFC: импорт SFC в SFC ломает type-resolver @vue/compiler-sfc на re-export
  // `declare class ... extends ClassComponent` (урок Menu.vue:206). Имя надёжно и не минифицируется.
  function compoundNormalize(raw: unknown): Array<any> {
    if (raw === null || raw === undefined) return []
    return Array.isArray(raw) ? (raw as Array<any>) : [raw]
  }
  function isVNodeNamed(vn: any, name: string): boolean {
    const t = vn?.type
    return !!t && (t?.name === name || t?.__name === name)
  }
  function compoundFlatten(nodes: Array<any>): Array<any> {
    const out: Array<any> = []
    for (const n of nodes) {
      if (n === null || n === undefined || typeof n !== "object") continue
      if (n.type === Comment || n.type === Text) continue
      if (n.type === Fragment) out.push(...compoundFlatten(compoundNormalize(n.children)))
      else out.push(n)
    }
    return out
  }
  function compoundChildren(vn: any): Array<any> {
    const def = vn?.children?.default
    return typeof def === "function" ? compoundNormalize(def()) : []
  }
  // Извлекаем TableColumn из <Column>-vnode: props + захваченные scoped-slots (cell/header/filter) + ключ группы.
  function extractColumn(vn: any, groupKey: number | null): TableColumn {
    const childSlots = (vn?.children && typeof vn.children === "object" ? vn.children : {}) as Record<string, any>
    return {
      ...(vn?.props ?? {}),
      _groupKey: groupKey,
      _cellSlot: typeof childSlots.cell === "function" ? childSlots.cell : undefined,
      _headerSlot: typeof childSlots.header === "function" ? childSlots.header : undefined,
      _filterSlot: typeof childSlots.filter === "function" ? childSlots.filter : undefined
    } as TableColumn
  }
  type CompoundHeaderGroupMeta = { key: number; caption?: string; class?: any }
  const compoundParsed = computed<{
    columns: Array<TableColumn>
    groups: Array<CompoundHeaderGroupMeta>
    pagination?: Record<string, any>
    loading?: Record<string, any>
  }>(() => {
    const raw = typeof slots.default === "function" ? slots.default() : undefined
    const top = compoundFlatten(compoundNormalize(raw))
    const columnsAcc: Array<TableColumn> = []
    const groupsAcc: Array<CompoundHeaderGroupMeta> = []
    let pagination: Record<string, any> | undefined
    let loading: Record<string, any> | undefined
    let groupKey = 0
    for (const vn of top) {
      if (isVNodeNamed(vn, "Column")) {
        columnsAcc.push(extractColumn(vn, null))
      } else if (isVNodeNamed(vn, "ColumnGroup")) {
        const key = groupKey++
        groupsAcc.push({ key, caption: vn?.props?.caption, class: vn?.props?.class })
        for (const child of compoundFlatten(compoundChildren(vn)))
          if (isVNodeNamed(child, "Column")) columnsAcc.push(extractColumn(child, key))
      } else if (isVNodeNamed(vn, "Pagination")) {
        pagination = { ...(vn?.props ?? {}) }
      } else if (isVNodeNamed(vn, "Loading")) {
        loading = { ...(vn?.props ?? {}) }
      }
    }
    return { columns: columnsAcc, groups: groupsAcc, pagination, loading }
  })
  const compoundColumns = computed<Array<TableColumn>>(() => compoundParsed.value.columns)
  const compoundPaginationConfig = computed<Record<string, any> | undefined>(() => compoundParsed.value.pagination)
  const compoundLoadingProps = computed<Record<string, any>>(() => compoundParsed.value.loading ?? {})
  // Стабильный рендерер захваченного со <Column> scoped-slot (cell/header/filter): определён один раз,
  // props (fn/args) объявлены — slot-props передаются корректно (в отличие от `<component :is="fn">`,
  // где недекларированные атрибуты ушли бы в attrs, а не в первый аргумент slot-функции).
  const RenderColumnSlot = defineComponent({
    name: "RenderColumnSlot",
    props: { render: { type: Function, default: undefined }, args: { type: Object, default: undefined } },
    setup: (p) => () => (p.render ? (p.render as (a: any) => any)(p.args) : null)
  })
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
  const allData = ref<any[]>()
  const dataSource = ref<DataSource>([])
  const totalCountAsync = ref<number | undefined>(undefined)
  // ---PROPS-------------------------------
  const mode = computed<NonNullable<TableProps["mode"]>>(
    () => (props?.mode as TableProps["mode"]) ?? options?.mode ?? Table.componentsStyle() ?? "outlined"
  )
  const toolbar = computed<TableToolbar | boolean>(() => deepMerge(options?.toolbar, unref(props?.toolbar)) ?? false)
  const sort = computed<TableSort | boolean>(() => deepMerge(options?.sort, unref(props?.sort)) ?? false)
  const filter = computed<TableFilter | boolean>(() => deepMerge(options?.filter, unref(props?.filter)) ?? false)
  const grouping = computed<TableGrouping | string>(() => deepMerge(options?.grouping, unref(props?.grouping)))
  const pagination = computed<TablePagination | boolean>(() => {
    // Явный `:pagination` (object/false) выигрывает над compound `<Pagination>`-child.
    const explicit = unref(props?.pagination)
    if (explicit !== undefined && explicit !== null) return deepMerge(options?.pagination, explicit) ?? false
    return (deepMerge(options?.pagination, compoundPaginationConfig.value) as TablePagination | boolean) ?? false
  })
  const columns = computed<boolean | Array<TableColumn>>(() => {
    // Schema `:columns` (массив ИЛИ false) выигрывает; иначе — compound `<Column>`-дети.
    const schema = unref(props?.columns)
    if (schema !== undefined && schema !== null) return schema as boolean | Array<TableColumn>
    return compoundColumns.value.length ? compoundColumns.value : false
  })
  // -----------
  const isVisibleToolbar = computed<boolean>(
    () => (isSearch.value || !!toolbar.value) && ((toolbar.value as TableToolbar)?.visible ?? true)
  )
  const isSearch = computed<boolean>(
    () => (toolbar.value as TableToolbar)?.searchable ?? props?.searchable ?? options?.searchable ?? false
  )
  const isFilterClear = computed<boolean>(
    () =>
      ((filter.value as TableFilter)?.clearAll ?? false) &&
      (!!noEmptyFilters(filterColumns).length || !!queryTable.value.length)
  )
  const isColumns = computed<boolean>(() =>
    typeof columns.value === "boolean" ? columns.value : Array.isArray(columns.value)
  )
  const isSummary = computed<boolean>(() => {
    const summaryValue = unref(props.summary)
    return typeof summaryValue === "boolean" ? summaryValue : Array.isArray(summaryValue)
  })
  const loadingThreshold = computed<NonNullable<TableProps["loadingThreshold"]>>(
    () => (props?.loadingThreshold as TableProps["loadingThreshold"]) ?? options?.loadingThreshold ?? 1000
  )
  // Aspect-ключ `mark`: `""` отключает подсветку целиком, поэтому пустое значение не уходит
  // в `setStyle` (иначе на `<mark>` остался бы голый префикс — урок W2/Select).
  const classMark = computed<StyleClass>(() => {
    const value = pick("mark", "font-bold text-theme-700 dark:text-theme-400")
    return value?.length ? Table.setStyle(value) : ""
  })
  const emptyText = computed<NonNullable<TableProps["emptyText"]>>(
    () => props.emptyText ?? options?.emptyText ?? Table.t("noData") ?? "No data"
  )
  const emptyColumnsText = computed<NonNullable<TableProps["emptyText"]>>(
    () => props.emptyColumnsText ?? options?.emptyColumnsText ?? Table.t("noColumn") ?? "There are no columns"
  )
  const emptyFilterText = computed<NonNullable<TableFilter["emptyFilterText"]>>(
    () =>
      (filter.value as TableFilter)?.emptyFilterText ?? Table.t("noDataForQuery") ?? "No data was found for your query"
  )
  const caption = computed<NonNullable<TableProps["caption"]>>(() => props.caption ?? "")
  const iconSort = computed<TableSort["icon"]>(() => (sort.value as TableSort)?.icon ?? "Arrow")
  const resizableColumns = computed<NonNullable<TableProps["resizableColumns"]>>(
    () => props?.resizableColumns ?? options?.resizableColumns ?? false
  )
  const isEditCells = computed<NonNullable<TableProps["editable"]>>(() => props?.editable ?? options?.editable ?? false)
  const lengthData = computed<number>(() => totalCountAsync.value ?? props.total ?? dataSource.value.length)
  // aria-live: озвучивание количества строк после filter/search/sort (polite, sr-only).
  // Wave 3.5: локализация + плюрализация одним ключом через Component.t(key, { count }) —
  // CLDR-формы активной локали (например, ru: 21 → "результат", 5 → "результатов"; см. table.resultsCount в locale messages).
  const ariaResultsLabel = computed<string>(() => {
    const count = lengthData.value ?? 0
    return Table.t("table.resultsCount", { count })
  })
  const isFilter = computed<boolean>(() =>
    typeof filter.value === "object"
      ? typeof filter.value?.visible === "boolean"
        ? filter.value.visible
        : true
      : typeof (filter.value as unknown) === "boolean"
        ? filter.value
        : false
  )
  const isSort = computed<boolean>(() =>
    typeof sort.value === "object"
      ? typeof sort.value?.visible === "boolean"
        ? sort.value.visible
        : true
      : typeof (sort.value as unknown) === "boolean"
        ? sort.value
        : false
  )
  const isGroup = computed<boolean>(() =>
    typeof grouping.value === "object"
      ? typeof grouping.value?.visible === "boolean"
        ? grouping.value.visible
        : true
      : typeof (grouping.value as unknown) === "string"
        ? !!grouping.value.length
        : false
  )
  const groupField = computed<TableGrouping["groupField"] | null>(() =>
    typeof grouping.value === "object"
      ? typeof grouping.value?.groupField === "string"
        ? grouping.value.groupField
        : null
      : typeof (grouping.value as unknown) === "string"
        ? grouping.value
        : null
  )
  const isPagination = computed<boolean>(() =>
    typeof pagination.value === "object"
      ? typeof pagination.value?.visible === "boolean"
        ? pagination.value.visible
        : true
      : typeof (pagination.value as unknown) === "boolean"
        ? pagination.value
        : false
  )
  // ---ASYNCDATA---------------------------
  const asyncData = computed<TableProps["asyncData"]>(() => props?.asyncData)
  const asyncDataMode = computed<"none" | "boolean" | "url" | "config" | "function">(() => {
    const asyncDataValue = asyncData.value
    if (!asyncDataValue) return "none"
    if (asyncDataValue === true) return "boolean"
    if (typeof asyncDataValue === "string") return "url"
    if (typeof asyncDataValue === "object" && "url" in asyncDataValue) return "config"
    if (typeof asyncDataValue === "function") return "function"
    return "none"
  })
  const isAsyncDataBoolean = computed<boolean>(() => asyncDataMode.value === "boolean")
  const isAsyncDataUrl = computed<boolean>(() => asyncDataMode.value === "url" || asyncDataMode.value === "config")
  const isAsyncDataFunction = computed<boolean>(() => asyncDataMode.value === "function")
  const asyncDataUrl = computed<string | null>(() => {
    if (asyncDataMode.value === "url") return asyncData.value as string
    if (asyncDataMode.value === "config") return (asyncData.value as TableAsyncDataConfig)?.url ?? null
    return null
  })
  const asyncDataConfig = computed<TableAsyncDataConfig | null>(() => {
    if (asyncDataMode.value === "config") return asyncData.value as TableAsyncDataConfig
    return null
  })
  // ---CELL--------------------------------
  const heightCell = computed<number>(() => settings.value.cellHeight ?? 50)
  const visibleRows = computed<NonNullable<TableProps["visibleRows"]>>(
    () => props?.visibleRows ?? options?.visibleRows ?? 0
  )
  const loadingRows = computed<NonNullable<TableProps["loadingRows"]>>(
    () => props?.loadingRows ?? options?.loadingRows ?? 5
  )
  // ---VIRTUALIZATION----------------------
  const virtualScrollTop = ref<number>(0)
  const virtualViewportHeight = ref<number>(0)
  const virtualConfig = computed<{
    enabled: boolean
    force: boolean
    rowHeight: number
    overscan: number
    threshold: number
  }>(() => {
    const raw = props.virtual ?? options?.virtual
    const obj = (typeof raw === "object" && raw !== null ? raw : {}) as Exclude<
      TableProps["virtual"],
      boolean | undefined
    >
    return {
      enabled: raw !== false,
      force: raw === true || (typeof raw === "object" && raw !== null),
      rowHeight: Math.max(1, obj?.rowHeight ?? heightCell.value + 9),
      overscan: obj?.overscan ?? 6,
      threshold: obj?.threshold ?? 100
    }
  })
  // Auto по умолчанию + opt-out через :virtual=false. Только client-side flat-режим:
  // не виртуализируем asyncData(boolean/function) / grouping / активную pagination.
  const isVirtual = computed<boolean>(() => {
    const c = virtualConfig.value
    if (!c.enabled) return false
    if (isAsyncDataBoolean.value || isAsyncDataFunction.value || isGroup.value || isPagination.value) return false
    return c.force || lengthData.value > c.threshold
  })
  const virtualRowHeight = computed<number>(() => virtualConfig.value.rowHeight)
  // ---PAGINATION--------------------------
  const startPage = computed<NonNullable<TablePagination["startPage"]>>(() =>
    isNumber((pagination.value as TablePagination)?.startPage as number) ? +(pagination.value as any).startPage : 1
  )
  const modePagination = computed<NonNullable<TablePagination["mode"]>>(
    () => (pagination.value as TablePagination)?.mode ?? mode.value
  )
  // `TablePagination extends Omit<PaginationProps, …>` — поля схемы переименовались вместе с
  // Pagination (W3b). Локальные имена и expose Table остаются прежними до W4, где переименовывается
  // весь публичный API таблицы разом.
  const pageSize = computed<NonNullable<TablePagination["pageSize"]>>(() =>
    isNumber((pagination.value as TablePagination)?.pageSize as number)
      ? +(pagination.value as any).pageSize
      : visibleRows.value || sizeTable.value
  )
  const visibleNumberPages = computed<TablePagination["visiblePages"]>(
    () => (pagination.value as TablePagination)?.visiblePages
  )
  const sizesSelector = computed<TablePagination["pageSizes"]>(() => (pagination.value as TablePagination)?.pageSizes)
  const isInfoText = computed<TablePagination["infoText"]>(
    () => (pagination.value as TablePagination)?.infoText ?? false
  )
  const isPageSizeSelector = computed<TablePagination["pageSizeSelector"]>(
    () => (pagination.value as TablePagination)?.pageSizeSelector ?? false
  )
  const isNavigationButtons = computed<TablePagination["navigationButtons"]>(
    () => (pagination.value as TablePagination)?.navigationButtons ?? true
  )
  // ---DATA--------------------------------
  const dataGrouping = computed<DataGrouping>(() => {
    let data: Array<Record<string, any>> = toRaw(dataSource.value)
    if (isPagination.value && !isAsyncDataBoolean.value && !isAsyncDataFunction.value) {
      if (isGroup.value && groupField.value) {
        const grouped = LD.groupBy(data, (item: Record<string, any>) => item[groupField.value as string])
        data = Object.values(grouped as Record<string, Array<Record<string, any>>>).flat()
      }
      data = LD.slice(data, sizeTable.value * (pageTable.value - 1), sizeTable.value * pageTable.value)
    }
    return isGroup.value && groupField.value
      ? LD.groupBy(data, (item: Record<string, any>) => item[groupField.value as string])
      : { 0: data }
  })
  const resultDataSource = computed<ResultData>(() => {
    let resultData: Record<string, any> = toRaw(dataGrouping.value)
    let limit = visibleRows.value + sizeLoadedRows.value
    if (resultData && visibleRows.value > 0 && !isVirtual.value) {
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
  // Окно виртуализации поверх плоского (non-grouped) результата. Читает resultDataSource,
  // поэтому result-data продолжает эмититься. visibleRows-слайс в virtual-режиме отключён.
  const virtualWindow = computed<{ rows: any[]; startIndex: number; topPad: number; bottomPad: number }>(() => {
    if (!isVirtual.value) return { rows: [], startIndex: 0, topPad: 0, bottomPad: 0 }
    const { rowHeight, overscan } = virtualConfig.value
    const all = ((resultDataSource.value as any)?.[0] as any[]) ?? []
    const total = all.length
    const count = Math.ceil((virtualViewportHeight.value || 0) / rowHeight) + overscan * 2
    const startIndex = Math.max(0, Math.floor(virtualScrollTop.value / rowHeight) - overscan)
    const endIndex = Math.min(total, startIndex + count)
    return {
      rows: all.slice(startIndex, endIndex),
      startIndex,
      topPad: startIndex * rowHeight,
      bottomPad: Math.max(0, (total - endIndex) * rowHeight)
    }
  })
  // Единый источник для рендера tbody: окно (virtual) или сгруппированный resultDataSource.
  const renderSource = computed<Record<string, any[]>>(() =>
    isVirtual.value ? { 0: virtualWindow.value.rows } : (resultDataSource.value as any)
  )
  // Absolute index строки: для virtual = startIndex + локальный; иначе — локальный (без изменений).
  const absIndex = (localIndex: number): number =>
    isVirtual.value ? virtualWindow.value.startIndex + localIndex : localIndex
  // Захватываем элемент scroll-viewport: в onUnmounted template-ref уже может быть null.
  let virtualScrollEl: HTMLElement | null = null
  function onVirtualScroll() {
    if (!virtualScrollEl) return
    virtualScrollTop.value = virtualScrollEl.scrollTop
    virtualViewportHeight.value = virtualScrollEl.clientHeight
  }
  const dataColumns = computed<Array<TableColumnPrivate>>(() => {
    const listFields: Array<string> = LD.uniq(
      LD.flatMap(allData.value, (item) => Object.keys(item)) as string[]
    ).filter((field) => field !== "_key")
    const columnsValue = columns.value
    if (Array.isArray(columnsValue) && columnsValue?.length) {
      return <Array<TableColumnPrivate>>columnsValue
        .map((column, index) => {
          const fieldName = column.dataField ?? listFields[index] ?? ""
          if (fieldName === "") return false
          const options = <TableColumnPrivate>{
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
            filterable: typeof column.filterable === "boolean" ? column.filterable : isFilter.value,
            sortable: typeof column.sortable === "boolean" ? column.sortable : isSort.value,
            resizable: typeof column.resizable === "boolean" ? column.resizable : resizableColumns.value,
            hasEditor:
              typeof column.editable === "boolean"
                ? column.editable
                : (column?.editable?.editable ?? isEditCells.value),
            type: column.type ?? "string"
          }
          switch (options.type) {
            case "string": {
              options.filterProps = { autocomplete: "off", ...column.filterProps } as Partial<BaseInputProps>
              options.editable = {
                editorProps: {
                  ...options.filterProps,
                  autoFocus: true,
                  ...(column?.editable as EditInput)?.editorProps
                } as Partial<BaseInputProps>
              }
              break
            }
            case "number": {
              options.filterProps = {
                autocomplete: "off",
                maskInput: "number",
                ...column.filterProps
              } as Partial<BaseInputProps>
              options.editable = {
                editorProps: {
                  ...options.filterProps,
                  autoFocus: true,
                  ...(column?.editable as EditInput)?.editorProps
                } as Partial<BaseInputProps>
              }
              break
            }
            case "select": {
              options.filterProps = {
                multiple: true,
                maxVisible: 0,
                classes: { control: "normal-case max-h-[25rem]", list: "normal-case font-normal" },
                options:
                  (column?.filterProps as Partial<BaseSelectProps>)?.options ??
                  LD.uniq(LD.map(allData.value, options.dataField ?? ""))
                    .filter((v) => v !== null && v !== undefined)
                    .sort((a, b) => String(a).localeCompare(String(b))),
                fixWindowProps: {
                  position: "bottom",
                  ...(column?.filterProps as Partial<BaseSelectProps>)?.fixWindowProps
                },
                ...column.filterProps
              } as TableColumnPrivate["filterProps"]
              options.editable = {
                editorProps: (<BaseSelectProps>{
                  ...options.filterProps,
                  autoFocus: true,
                  multiple: false,
                  ...(column?.editable as EditSelect)?.editorProps,
                  fixWindowProps: {
                    position: "bottom",
                    eventClose: "hover",
                    ...(column?.editable as EditSelect)?.editorProps?.fixWindowProps
                  }
                }) as TableColumnPrivate["filterProps"]
              }
              break
            }
            case "date": {
              options.filterProps = {
                range: true,
                datePickerProps: {
                  attributes: [
                    {
                      highlight: { fillMode: "light" },
                      dates:
                        LD.uniq(
                          LD.map(allData.value, (item) =>
                            item[options.dataField] ? String(item[options.dataField]) : null
                          )
                        ).filter((v) => v !== null && v !== undefined) ?? []
                    }
                  ],
                  mask:
                    (column.filterProps as Partial<BaseCalendarProps>)?.datePickerProps?.masks?.modelValue ??
                    "DD.MM.YYYY"
                },
                fixWindowProps: {
                  position: "bottom",
                  ...(column?.filterProps as Partial<BaseCalendarProps>)?.fixWindowProps
                },
                ...column.filterProps
              } as Partial<BaseCalendarProps>
              options.editable = {
                editorProps: {
                  ...options.filterProps,
                  range: false,
                  autoFocus: true,
                  ...(column?.editable as EditDate)?.editorProps,
                  label: "",
                  labelMode: "none",
                  fixWindowProps: {
                    position: "bottom",
                    eventClose: "hover",
                    ...((column?.editable as EditDate)?.editorProps as Partial<BaseCalendarProps>)?.fixWindowProps
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
      return listFields.map<TableColumnPrivate>((column, index): TableColumnPrivate => {
        const options: TableColumnPrivate = {
          id: `Col-${column}-${index}`,
          dataField: column,
          name: `Col-${column}`,
          type: "string",
          caption: /^\d+$/.test(column)
            ? `Col ${column}`
            : (column.charAt(0).toUpperCase() + column.slice(1))?.replace(/_/g, " "),
          visible: true,
          filterable: isFilter.value,
          sortable: isSort.value,
          resizable: resizableColumns.value,
          hasEditor: isEditCells.value
        }
        if (options.hasEditor) {
          options.filterProps = { autocomplete: "off" } as Partial<BaseInputProps>
          options.editable = {
            editorProps: {
              ...options.filterProps,
              autoFocus: true
            } as Partial<BaseInputProps>
          }
        }
        return options
      })
    }
  })
  // Верхний ряд шапки для compound `<ColumnGroup>`: группируем ВИДИМЫЕ dataColumns по `_groupKey`.
  // Подряд идущие колонки одной группы сливаются в один `<th colspan>`; не сгруппированные — span 1.
  const hasColumnGroups = computed<boolean>(() => compoundParsed.value.groups.length > 0)
  const headerGroups = computed<Array<{ key: number | null; caption?: string; class?: any; span: number }>>(() => {
    if (!hasColumnGroups.value) return []
    const groupsMeta = compoundParsed.value.groups
    const out: Array<{ key: number | null; caption?: string; class?: any; span: number }> = []
    for (const col of (dataColumns.value ?? []).filter((c) => c.visible)) {
      const gk = col._groupKey ?? null
      const last = out[out.length - 1]
      if (last && gk !== null && last.key === gk) last.span += 1
      else {
        const meta = gk !== null ? groupsMeta.find((g) => g.key === gk) : undefined
        out.push({ key: gk, caption: meta?.caption, class: meta?.class, span: 1 })
      }
    }
    return out
  })
  const dataSummary = computed<Array<TableSummaryPrivate>>(() => {
    if (!isSummary.value) return []
    const summaryValue = unref(props.summary)
    if (Array.isArray(summaryValue) && summaryValue?.length) {
      return <Array<TableSummaryPrivate>>summaryValue.map((summary, index) => {
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
                        : ["string", "date"].includes(column.type as string)
                          ? "Кол. {0}"
                          : ["number", "select"].includes(column.type as string)
                            ? "Сум. {0}"
                            : "Кол. {0}"),
            // todo added locale
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
      return <Array<TableSummaryPrivate>>dataColumns.value
        .filter((item) => item.visible)
        .map((column) => ({
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
        }))
    }
  })
  const summaryColumns = computed(() => {
    if (!isSummary.value || !dataSummary.value?.length) return {}
    return dataSummary.value.reduce((result: { [key: string]: string }, summary) => {
      result[summary.dataField] = setSummary(summary)
      return result
    }, {})
  })
  // ---STYLE-------------------------------
  const baseTableHeight = 288 // 18rem
  /**
   * Stores the unique identifier of the currently active (selected) row.
   * Format: `{_key}-{indexRow}` where _key is the row's unique key and indexRow is its position.
   * Used to apply active styles to the clicked row via classTr function.
   */
  const activeRow = ref<string | null>()
  const heightTable = ref<string>(visibleRows.value ? `height: ${baseTableHeight}px` : "height: auto")
  // Не-классовые настройки отображения: bag `styles` растворён в top-level props (§2 B),
  // здесь остался только их резолв `props ?? options ?? default`.
  const settings = computed<TableSettings>(() => {
    const width = props.width ?? options?.width
    const height = props.height ?? options?.height
    return {
      width: width ? (typeof width === "number" ? `${width}px` : width) : "",
      height: height ? (typeof height === "number" ? `${height}px` : height) : "",
      stripedRows: props.stripedRows ?? options?.stripedRows ?? false,
      horizontalLines: props.horizontalLines ?? options?.horizontalLines ?? true,
      verticalLines: props.verticalLines ?? options?.verticalLines ?? false,
      filterLines: props.filterLines ?? options?.filterLines ?? false,
      cellHeight: props.cellHeight ?? options?.cellHeight,
      borderRadius: props.borderRadius ?? options?.borderRadius ?? (mode.value === "underlined" ? 0 : 7),
      defaultColumnWidth: props.defaultColumnWidth ?? options?.defaultColumnWidth
    }
  })
  // Aspect-ключи (§2 B): `""` отключает, иначе `props ?? options ?? default`.
  const classAnimation = computed<StyleClass>(() =>
    pick("animation", "motion-safe:transition-all motion-safe:duration-500")
  )
  const classRowActive = computed<StyleClass>(() => pick("rowActive", "bg-surface-100/90 dark:bg-surface-900/50"))
  const classRowHover = computed<StyleClass>(() =>
    pick("rowHover", "hover:bg-surface-100/90 dark:hover:bg-surface-900/50")
  )
  // Общий цвет рамок; региональные ключи падают на него, если не заданы (бывший `styles.border.default`).
  const defaultBorder = computed<StyleClass>(() => pick("border", "border-surface-200 dark:border-surface-800"))
  const borderOf = (key: TableClassKey): StyleClass => pick(key, defaultBorder.value)
  const tableBodyStyle = computed<string>(() => {
    const radius = settings.value.borderRadius - 1
    const borderTop = !slots.header ? `border-top-left-radius: ${radius}px;border-top-right-radius: ${radius}px;` : ""
    const borderBottom = !(isPagination.value || slots.footer)
      ? `border-bottom-left-radius: ${radius}px;border-bottom-right-radius: ${radius}px;`
      : ""
    return `${borderTop}${borderBottom}`
  })
  const modeStyle = computed<string>(() =>
    mode.value === "filled"
      ? "bg-surface-100 dark:bg-surface-900"
      : mode.value === "outlined"
        ? "bg-white dark:bg-surface-950"
        : mode.value === "underlined"
          ? "bg-surface-50 dark:bg-surface-950"
          : ""
  )
  // Issue 12: reduced-motion канон FishtVue — анимируем только при motion-safe (как Button/Menu/Select).
  // Inline-<transition>/Input-классы шаблона не проходят через computed → регистрируем их варианты явно.
  Table.setStyle("motion-safe:transition motion-safe:transition-all ease-in opacity-100 opacity-0")
  Table.setStyle("motion-safe:duration-200")
  Table.setStyle("motion-safe:duration-500")
  Table.setStyle("motion-safe:duration-1000")
  // print / forced-colors варианты overlay/resize/active-row — явная регистрация для гарантии CSS.
  Table.setStyle("print:hidden")
  Table.setStyle("forced-colors:outline")
  const classBaseTable = computed<StyleClass>(() =>
    cls("root", "componentTable classBody inline-block align-middle relative w-full p-1.5", classAnimation.value)
  )
  const classBaseToolbar = computed(() =>
    cls("toolbar", "classToolbar toolbar flex mb-2 justify-between items-end", classAnimation.value)
  )
  const classSearch = ref(Table.setStyle("ml-1"))
  const classIcon = ref(Table.setStyle("h-5 w-5 text-surface-400 dark:text-surface-600"))
  const classIconClearFilter = ref(
    Table.setStyle(
      "h-4 w-4 text-surface-400 dark:text-surface-600 group-hover:text-red-400 group-hover:dark:text-red-600"
    )
  )
  const classTableBody = computed(() => cls("body", "flex flex-col border", borderOf("borderTable")))
  const classBodySlotHeader = computed(() =>
    Table.setStyle([
      "min-h-[1.5rem] text-surface-500",
      isSummary.value || isPagination.value ? "relative" : "",
      modeStyle.value
    ])
  )
  const styleHeader = computed(
    () =>
      `border-top-left-radius: ${settings.value.borderRadius - 1}px;border-top-right-radius: ${settings.value.borderRadius - 1}px;`
  )
  const classSlotHeader = computed(() =>
    Table.setStyle(["classSlotHeader p-2 border-b-2", borderOf("borderHeader"), raw("header")])
  )
  const classBaseTableBody = ref(Table.setStyle("relative"))
  const classBodyTable = computed(() => cls("viewport", "classBodyTable overflow-x-auto", classAnimation.value))
  const styleBodyTable = computed(() => [
    tableBodyStyle.value,
    heightTable.value,
    visibleRows.value > 0 ? "" : `min-height: ${baseTableHeight}px;`
  ])
  const classTable = computed(() => cls("table", "classTable min-w-full border-separate border-spacing-0"))
  const classTHead = computed(() => cls("thead", "classTHead sticky top-0 z-20", raw("thead") ? "" : modeStyle.value))
  const classHeadTr = computed(() => Table.setStyle("bg-inherit dark:bg-inherit"))
  const classTh = (column: TableColumnPrivate) =>
    Table.setStyle([
      column.id,
      "group/th",
      "bg-inherit dark:bg-inherit",
      column.filterable ? "pl-1 pr-0 py-2" : "pl-6 py-5",
      "border-b",
      borderOf("borderHead"),
      raw("th"),
      column.classes?.th
    ])
  const styleTh = (column: TableColumnPrivate) =>
    !widthsColumns[column.dataField]
      ? (settings.value.defaultColumnWidth ?? "max-width: 600px;min-width:100px;width:auto")
      : `width: ${widthsColumns[column.dataField]}px;min-width: ${widthsColumns[column.dataField]}px;max-width: ${widthsColumns[column.dataField]}px;`
  const styleThFilter = (column: TableColumnPrivate) => {
    const width = widthsColumns[column.dataField] - ((column?.sortable ?? isSort.value) ? 28 : 18)
    return `width: ${width}px;min-width: ${width}px;max-width: ${width}px;`
  }
  const classBodyFilter = computed(() =>
    Table.setStyle([
      "group relative flex w-full bg-inherit dark:bg-inherit",
      settings.value.filterLines ? "border-r group-last/th:border-r-0" : "",
      borderOf("borderFilter")
    ])
  )
  // Hand-off в filter-контрол колонки (dev-patterns §2 G): база Table + `filterProps` потребителя.
  // До 1.0.0 это были `column.class.colFilterClass` (шёл в `classes.base`) и `colFilterClassBody`
  // (шёл в `class`) — оба переехали внутрь самого `filterProps`.
  const filterControlProps = (column: TableColumnPrivate) =>
    fieldsOmit((column?.filterProps ?? {}) as Record<string, any>, ["class", "classes"])
  const filterControlClasses = (column: TableColumnPrivate, base: StyleClass = "border-none font-normal") =>
    mergeClasses({ base }, (column?.filterProps as { classes?: Record<string, StyleClass> })?.classes)
  const filterControlClass = (column: TableColumnPrivate) =>
    cn("tm-0 my-1 bg-inherit dark:bg-inherit", (column?.filterProps as { class?: StyleClass })?.class)
  const classIsFilter = (column: TableColumnPrivate) =>
    Table.setStyle([
      "w-full cursor-pointer bg-inherit dark:bg-inherit",
      column.classes?.filter,
      column.sortable || isSort.value ? "" : "px-1"
    ])
  const classNotFilter = (column: TableColumnPrivate) =>
    Table.setStyle([
      "block text-sm font-medium truncate",
      "text-left text-surface-400 dark:text-surface-500",
      column.classes?.headerText
    ])
  // Под `unstyled` setStyle сам оставляет `fv` (UA-preflight `button.fv` из baseStyle) — отдельный
  // fallback не нужен (component/index.ts, dev-patterns §2 E).
  const classIsSort = (column: TableColumnPrivate) =>
    Table.setStyle([
      "flex items-center motion-safe:transition-opacity motion-safe:duration-500 pr-1 cursor-pointer",
      // T2: триггер сортировки доступен с клавиатуры, поэтому у несортированной колонки он обязан
      // проявляться не только по hover, но и по focus-visible — иначе фокус «пропадает» (opacity-0).
      !sortColumns?.[column?.dataField] ? "opacity-0 group-hover:opacity-100 focus-visible:opacity-100" : "opacity-100"
    ])
  const classSortIcon = ref(Table.setStyle("ml-1 h-4 w-4 text-surface-400 dark:text-surface-600"))
  // T2 (a11y): aria-sort отражает live-состояние sortColumns — параллельного state нет.
  // `undefined` убирает атрибут целиком: несортируемая колонка не должна объявляться sortable.
  const ariaSort = (column: TableColumnPrivate): "ascending" | "descending" | "none" | undefined => {
    if (!(column?.sortable ?? isSort.value)) return undefined
    const sort = sortColumns?.[column?.dataField]
    return sort === "asc" ? "ascending" : sort === "desc" ? "descending" : "none"
  }
  // T2 (a11y): accessible name триггера берётся из уже существующего caption колонки (он всегда
  // заполнен при нормализации колонок, fallback выводится из dataField). Явно переданный
  // пустой caption добиваем самим dataField — новый locale-key не нужен.
  const ariaSortLabel = (column: TableColumnPrivate): string => String(column?.caption || column?.dataField || "")
  const classResizedColumns = (column: TableColumnPrivate, key: number) =>
    Table.setStyle([
      // Issue 11 (RTL): pe-2 (padding-inline-end) авто-флипается по dir; inset — физический default
      // (работает без dir-атрибута) + rtl:-override (negative-логический inset движок не поддерживает).
      "resizable absolute z-10 inset-y-0 flex items-center hover:opacity-100 pe-2 cursor-ew-resize motion-safe:transition-opacity motion-safe:duration-500 print:hidden",
      dataColumns.value.length - 1 > key ? "-right-3 rtl:right-auto rtl:-left-3" : "right-3 rtl:right-auto rtl:left-3",
      resizableColumn.value === column.id ? "opacity-100" : "opacity-0"
    ])
  const classResize = computed(() =>
    Table.setStyle([
      "h-8 w-1.5 bg-surface-300 dark:bg-surface-600",
      mode.value === "filled" ? "rounded-full" : "",
      mode.value === "outlined" ? "rounded-full" : "",
      mode.value === "underlined" ? "rounded-none" : ""
    ])
  )
  const classTBody = computed(() => cls("tbody", "classTBody overflow-y-auto"))
  const classGroup = computed(() =>
    cls(
      "group",
      "classGroup sticky",
      "border-t-2 border-b",
      "font-medium text-base whitespace-nowrap",
      "text-left text-surface-800 dark:text-surface-300 px-6 py-2 pe-3 ps-10 sm:ps-12",
      raw("group") ? "" : modeStyle.value,
      borderOf("borderCell")
    )
  )
  const styleGroup = computed(() => `top:${thead.value?.clientHeight ?? 1 - 1}px`)
  const classGroupText = computed(() =>
    cls("groupText", "sticky classGroupText start-10 sm:start-12 flex items-center w-fit min-h-[2.5rem] truncate")
  )
  const styleGroupText = computed(() => `min-height: ${heightCell.value}px`)
  /**
   * Generates CSS classes for table rows.
   * Applies active row styles, hover effects, and striped row styling based on configuration.
   * @param {Record<string, any>} data - Row data object containing the row's unique _key
   * @param {number} indexRow - Index of the row in the current table view
   * @returns {string} Combined CSS class string for the row
   */
  const classTr = (data: Record<string, any>, indexRow: number): string =>
    Table.setStyle([
      `tr--${indexRow} group/tr`,
      activeRow.value === `${data?._key}-${indexRow}` ? `active-row forced-colors:outline ${classRowActive.value}` : "",
      classRowHover.value ? `${classRowHover.value} motion-safe:transition-colors motion-safe:duration-200` : "",
      settings.value.stripedRows
        ? mode.value === "filled"
          ? "odd:bg-surface-100 even:bg-surface-50 dark:odd:bg-surface-900 dark:even:bg-surface-950"
          : mode.value === "outlined"
            ? "odd:bg-white even:bg-surface-50 dark:odd:bg-surface-950 dark:even:bg-surface-900"
            : mode.value === "underlined"
              ? "odd:bg-surface-50 even:bg-surface-100 dark:odd:bg-surface-950 dark:even:bg-surface-900"
              : ""
        : ""
    ])
  const classColumnTd = (_: Record<string, any>, indexRow: number, column: TableColumnPrivate, indexCol: number) =>
    Table.setStyle([
      "ColumnClassTd",
      `td--${indexRow}--${column?.name ?? indexCol}`,
      "first:border-l-0 group-first/tr:border-t-0 last:border-r-0 group-last/tr:border-b-0",
      "text-sm font-medium",
      "px-4 py-1 text-surface-800 dark:text-surface-300",
      borderOf("borderCell"),
      settings.value.verticalLines ? "border-r" : "border-r-0",
      settings.value.horizontalLines ? "border-b" : "border-b-0",
      raw("td"),
      column.classes?.td,
      editableCell.value?.indexRow === indexRow && editableCell.value?.indexCol === indexCol ? "px-1" : ""
    ])
  const styleColumnTd = (column: TableColumnPrivate) =>
    !widthsColumns[column.dataField]
      ? (settings.value.defaultColumnWidth ?? "max-width: 600px;min-width:100px;width:auto")
      : `width: ${widthsColumns[column.dataField]}px;min-width: ${widthsColumns[column.dataField]}px;max-width: ${widthsColumns[column.dataField]}px;`
  const classCellTable = (indexRow: number, column: TableColumnPrivate, indexCol: number) =>
    Table.setStyle([
      "flex items-center whitespace-pre-line overflow-auto",
      raw("cell"),
      column.classes?.cellText,
      editableCell.value?.indexRow === indexRow && editableCell.value?.indexCol === indexCol ? "overflow-visible" : ""
    ])
  const styleCellTable = computed(() => `min-height: ${heightCell.value}px;max-height: ${heightCell.value * 5 + 2}px;`)
  const classTemplate = (column: TableColumnPrivate) =>
    Table.setStyle(["flex items-center whitespace-pre-line overflow-auto", raw("cell"), column.classes?.cellText])
  const classFooterPaddingHeight = ref(Table.setStyle("border-none"))
  const styleFooterPaddingHeight = computed(() => `height: ${footerPaddingHeight.value - 1}px`)
  const classTFoot = computed(() => cls("tfoot", "classTFoot sticky bottom-0", raw("tfoot") ? "" : modeStyle.value))
  const classThSummary = (column: TableColumnPrivate) =>
    Table.setStyle(["px-3 py-3", "border-t", borderOf("borderSummary"), column.classes?.summary])
  const classThSummaryText = (column: TableColumnPrivate) =>
    Table.setStyle([
      "block font-normal text-sm text-left text-surface-400 dark:text-surface-500 truncate",
      column.classes?.summaryText
    ])
  const classIsPagination = computed(() => Table.setStyle([isSummary.value ? "relative sm:px-5" : "", modeStyle.value]))
  const styleIsPagination = computed(() =>
    !slots.footer
      ? `border-bottom-left-radius: ${settings.value.borderRadius - 1}px;border-bottom-right-radius: ${settings.value.borderRadius - 1}px;`
      : ""
  )
  const classIsLoading = ref(
    Table.setStyle(
      "absolute z-30 top-0 bottom-0 left-0 w-full select-none text-center text-sm text-surface-500 print:hidden"
    )
  )
  const classIsLoadingBody = ref(
    Table.setStyle("flex justify-center items-center h-full w-full rounded-lg bg-surface-100/70 dark:bg-surface-800/50")
  )
  const classNoData = ref(
    Table.setStyle(
      "absolute top-[40%] flex flex-col items-center left-0 w-full my-5 pointer-events-none text-center text-sm text-surface-500"
    )
  )
  const classSlotFooterBody = computed(() =>
    Table.setStyle([
      "min-h-[1.5rem] -mt-[1px] text-surface-500",
      isSummary.value || isPagination.value ? "relative sm:px-5" : "",
      modeStyle.value
    ])
  )
  const styleSlotFooterBody = computed(
    () =>
      `border-bottom-left-radius: ${settings.value.borderRadius}px;border-bottom-right-radius: ${settings.value.borderRadius}px;`
  )
  const classSlotFooter = computed(() =>
    Table.setStyle(["classSlotFooter p-2 border-t-2", borderOf("borderFooter"), raw("footer")])
  )
  // ---TABLE_OBSERVER----------------------
  let tableObserver: ResizeObserver
  if (isClient()) tableObserver = new ResizeObserver((entries) => entries.forEach(() => setFooterPaddingHeight()))
  const footerPaddingHeight = ref<number>(0)

  function setFooterPaddingHeight() {
    const result =
      (clientHeightTable.value ?? 0) -
      ((thead.value?.clientHeight ?? 0) + (tbody.value?.clientHeight ?? 0) + (tfoot.value?.clientHeight ?? 0))
    footerPaddingHeight.value = result > 0 ? result : 0
  }

  // ---IS-DARK-----------------------------
  // T3: источник истины о dark-режиме — тот же `optionsTheme.darkModeSelector`, который движок
  // получает как `darkSelector` (lib/component/index.ts:150). Если селектор сконфигурирован,
  // движок скоупит все `dark:*` на него ВМЕСТО `prefers-color-scheme`, поэтому и `isDark` обязан
  // читать DOM, а не OS-preference: иначе при `<html class="dark">` и светлой системной теме
  // isDark === false, и Loading красился бы в light-оттенок посреди тёмной таблицы.
  // Селектор не задан → дефолт движка, fallback на `prefers-color-scheme: dark`.
  // Зеркало Calendar.initDarkModeObserver() (lib/calendar/Calendar.vue:367).
  const isDark = ref<boolean>(false)
  // eslint-disable-next-line no-undef
  let darkObserver: MutationObserver | undefined
  if (isClient()) {
    const darkModeSelector = useFishtVue()?.config?.optionsTheme?.darkModeSelector ?? ""
    if (darkModeSelector) {
      const checkDarkMode = () => (isDark.value = !!document.querySelector(darkModeSelector))
      checkDarkMode()
      // eslint-disable-next-line no-undef
      darkObserver = new MutationObserver(checkDarkMode)
      darkObserver.observe(document.documentElement, {
        attributes: true,
        // селектором может быть и класс (`.dark`), и data-атрибут (`[data-theme='dark']`)
        attributeFilter: ["class", "data-theme"],
        subtree: true
      })
      onUnmounted(() => {
        darkObserver?.disconnect()
        darkObserver = undefined
      })
    } else {
      const colorSchemeQueryList = window.matchMedia("(prefers-color-scheme: dark)")
      const setColorScheme = (e: any) => (isDark.value = e.matches)

      isDark.value = colorSchemeQueryList.matches
      colorSchemeQueryList.addEventListener("change", setColorScheme)

      onUnmounted(() => {
        colorSchemeQueryList.removeEventListener("change", setColorScheme)
      })
    }
  }

  const resizableColumn = ref<string | null>(null)

  // ---FOCUS-------------------------------
  // T1: программный фокус корневого контейнера через exposed `componentTable` — зеркало
  // Pagination/Split focus(). Корень несёт `tabindex="-1"`: фокусируется только программно,
  // в natural tab order не попадает.
  function focus(options?: FocusOptions) {
    componentTable.value?.focus(options)
  }

  // ---EXPOSE------------------------------
  defineExpose({
    // ---REF-LINK----------------------------
    componentTable,
    //---STATE-------------------------
    activeRow,
    sortColumns,
    filterColumns,
    widthsColumns,
    queryTable,
    pageTable,
    sizeTable,
    allData,
    isLoading,
    editableCell,
    resizableColumn,
    // ---PROPS-------------------------------
    mode,
    isVisibleToolbar,
    isSearch,
    isFilterClear,
    isColumns,
    isSummary,
    loadingThreshold,
    classMark,
    emptyText,
    emptyColumnsText,
    emptyFilterText,
    iconSort,
    resizableColumns,
    isEditCells,
    lengthData,
    groupField,
    isFilter,
    isSort,
    isGroup,
    isPagination,
    // ---PAGINATION--------------------------
    startPage,
    modePagination,
    pageSize,
    visibleNumberPages,
    sizesSelector,
    isInfoText,
    isPageSizeSelector,
    isNavigationButtons,
    // ---CELL--------------------------------
    heightCell,
    visibleRows,
    heightTable,
    // ---DATA--------------------------------
    dataSource,
    resultDataSource,
    dataColumns,
    dataSummary,
    summaryColumns,
    // ---STYLE-------------------------------
    settings,
    tableBodyStyle,
    modeStyle,
    isDark,
    classBaseTable,
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
    switchPageSize,
    clearFilter,
    startLoading,
    stopLoading,
    updateHeightTable,
    reloadData: loadDataFromFunction,
    focus
  })
  // ---MOUNT-UNMOUNT-----------------------
  // `Table.initStyle()` НЕ вызывается тут: базовый `Component.__hooks()` уже регистрирует
  // `onServerPrefetch + vueOnMounted` → `initStyle()` (см. lib/component/index.ts:79–84).
  onMounted(() => {
    if (isClient() && tbody.value) tableObserver.observe(tbody.value as Element)
    suppressLoadFromFunctionInWatchers = true
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
    // Reset suppression flag after the queued sortColumns/filterColumns watchers
    // process the initial Object.assign batch.
    Promise.resolve().then(() => {
      suppressLoadFromFunctionInWatchers = false
    })
    // Scroll-listener вешаем синхронно (template-ref уже доступен в onMounted) —
    // иначе cleanup в onUnmounted может не найти элемент при раннем размонтировании.
    virtualScrollEl = (tableBody.value as HTMLElement) ?? null
    virtualScrollEl?.addEventListener("scroll", onVirtualScroll, { passive: true })
    nextTick(() => {
      updateHeightTable()
      onVirtualScroll()
      // virtual заменяет lazy-load: lastRowVisibleObserver не нужен.
      if (!isVirtual.value) startLastRowVisibleObserver()
    })
    setTimeout(() => {
      updateHeightTable()
    }, 10)

    if (isAsyncDataUrl.value) loadDataFromUrl()
    // Function mode: initial load triggered by pageSize/startPage immediate watchers
  })
  onUnmounted(() => {
    if (isClient()) {
      tableObserver?.disconnect()
      // IntersectionObserver lazy-load: без disconnect наблюдатель продолжает держать DOM-узел.
      lastRowVisibleObserver?.disconnect()
      // window-listeners снимаются и в stopResizeColumn, но при unmount во время drag mouseup не приходит.
      window.removeEventListener("mousemove", moveResizedColumns)
      window.removeEventListener("mouseup", stopResizeColumn)
      // virtual scroll listener.
      virtualScrollEl?.removeEventListener("scroll", onVirtualScroll)
      virtualScrollEl = null
    }
  })
  // ---WATCHERS----------------------------
  let loadDataFromFunctionPending = false
  // Suppresses watcher-triggered loadDataFromFunction calls during the initial
  // onMounted column-state initialization (Object.assign on sortColumns/filterColumns).
  // Emits still fire so that tests/external listeners see the initial sort/filter state.
  let suppressLoadFromFunctionInWatchers = false
  watch(
    () => [visibleRows.value, settings.value.height],
    (value, oldValue) => {
      clientHeightTable.value = 0
      const timeout: number = value[0] === oldValue[0] && classRowHover.value !== "transition-none" ? 500 : 1
      setTimeout(() => updateHeightTable(), timeout)
    }
  )
  watch(
    () => props.dataSource,
    () => {
      const dataSourceValue = unref(props.dataSource)
      allData.value = dataSourceValue?.length ? dataSourceValue?.map((item) => ({ ...item, _key: generateUUID() })) : []
      updateDataSource()
    },
    { immediate: true }
  )
  watch(
    () => sortColumns,
    () => {
      emit("sort", { dataColumns: dataColumns.value, sortedFields: getSorted(sortColumns) })
      if (suppressLoadFromFunctionInWatchers) return
      if (isAsyncDataFunction.value) {
        loadDataFromFunction()
      }
    },
    { deep: true }
  )
  watch(
    () => filterColumns,
    () => {
      switchPage(1)
      emit("filter", { dataColumns: dataColumns.value, filteredFields: getFilters(filterColumns) })
      if (suppressLoadFromFunctionInWatchers) return
      if (isAsyncDataFunction.value) {
        loadDataFromFunction()
      }
    },
    { deep: true }
  )
  watch(
    () => queryTable.value,
    (query) => {
      switchPage(1)
      emit("search", query)
      if (isAsyncDataFunction.value) {
        loadDataFromFunction()
      }
    }
  )
  watch(startPage, (numberPage: number) => setTimeout(() => switchPage(numberPage), 1), { immediate: true })
  watch(pageSize, (sizePageValue: number) => switchPageSize(sizePageValue ?? pageSize.value), { immediate: true })

  // ---METHODS-----------------------------
  function getHeightVisibleRows(): number {
    if (visibleRows.value && tbody.value && componentTable.value) {
      const tagTrs: NodeListOf<HTMLTableRowElement> | undefined = (tbody.value as HTMLElement)?.querySelectorAll(
        `tr:nth-child(-n+${visibleRows.value ?? 1})`
      )
      if (tagTrs && tagTrs.length) {
        let sum = 0
        tagTrs.forEach((item) => (sum += item?.offsetHeight ?? 0))
        return sum
      } else return visibleRows.value * (4 * 2 + heightCell.value + 1)
    }
    return 0
  }

  function updateHeightTable(): void {
    if (settings.value.height) {
      function getHeight(el: HTMLElement | undefined): number {
        let height = 0
        if (el)
          height =
            (el?.clientHeight ?? 0) +
            parseFloat(getComputedStyle(el).marginTop) +
            parseFloat(getComputedStyle(el).marginBottom)
        return height
      }

      let componentTableHeight = 0
      if (componentTable.value)
        componentTableHeight = componentTable.value?.clientHeight
          ? (componentTable.value?.clientHeight ?? 0) -
            parseFloat(getComputedStyle(componentTable.value).paddingTop) -
            parseFloat(getComputedStyle(componentTable.value).paddingBottom) -
            3
          : 0
      const height =
        (componentTableHeight ?? 0) -
        (getHeight(tableToolbar.value) ?? 0) -
        (getHeight(tableHeader.value) ?? 0) -
        (getHeight(pager.value) ?? 0) -
        (getHeight(tableFooter.value) ?? 0)
      clientHeightTable.value = height >= 0 ? height : 0
      heightTable.value = `height:${height >= 0 ? height : 0}px;`
    } else if (visibleRows.value) {
      const resultHeight = (thead.value?.clientHeight ?? 0) + (tfoot.value?.clientHeight ?? 0) + getHeightVisibleRows()
      clientHeightTable.value = resultHeight > 0 ? resultHeight : baseTableHeight
      heightTable.value = `height: ${resultHeight > 0 ? resultHeight : baseTableHeight}px;`
    } else {
      clientHeightTable.value = tableBody?.value?.clientHeight ?? 0
      heightTable.value = "height: auto;"
    }
  }

  function getColumn(dataField: TableColumn["dataField"], index?: number): TableColumnPrivate | undefined {
    return dataColumns.value.find((column, item) => (dataField ? column.dataField === dataField : item === index))
  }

  function updateDataSource(): Array<Record<string, any>> {
    if (!(allData.value && allData.value?.length)) return []
    let data = toRaw(allData.value) as Array<Record<string, any>>
    if (!isAsyncDataBoolean.value && !isAsyncDataFunction.value) {
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
    }
    stopLoading()
    dataSource.value = data ?? []
    startLastRowVisibleObserver()
    return data ?? []
  }

  function sorting(dataField: TableColumn["dataField"], value?: Sort) {
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
    const timeout = lengthData.value > loadingThreshold.value ? 800 : 10
    if (timeout > 100) {
      startLoading()
    }
    setTimeout(() => {
      sortColumns[dataField] = value as Sort
      updateDataSource()
    }, timeout)
  }

  function filtering(dataField: TableColumn["dataField"], value: any) {
    if (!dataField) return
    const isLoading =
      typeof value === "object" || typeof value === "number"
        ? true
        : (filterColumns[dataField] as string | Array<any>)?.length > (value as string | Array<any>)?.length
    const timeout =
      (allData.value?.length ?? 0) > loadingThreshold.value
        ? (lengthData.value > loadingThreshold.value || value === null || value === "" || isLoading) &&
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
      (allData.value?.length ?? 0) > loadingThreshold.value
        ? lengthData.value > loadingThreshold.value || value === null || value === "" || isLoading
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

  function switchPage(page: Page | undefined) {
    const newPage = page ?? 1
    const pageChanged = pageTable.value !== newPage
    pageTable.value = newPage
    emit("switch-page", pageTable.value)
    if (isAsyncDataFunction.value && pageChanged) {
      loadDataFromFunction()
    }
  }

  function switchPageSize(pageSize: Page | undefined) {
    sizeTable.value = pageSize ?? 5
    switchPage(1)
    emit("switch-page-size", sizeTable.value)
    if (isAsyncDataFunction.value) {
      loadDataFromFunction()
    }
  }

  function isEqualsValue(column: TableColumnPrivate, columnValue: any, value: any): boolean {
    if (columnValue === null || columnValue === undefined) return false
    switch (column.type) {
      case "string":
        return String(columnValue).includes(value)
      case "number":
        return columnValue === Number(value)
      case "select": {
        if (Array.isArray(value)) return (value as Array<string>).includes(columnValue)
        else return String(columnValue).includes(value)
      }
      case "date": {
        if (value instanceof Date) {
          return isEqual(startOfDay(columnValue), startOfDay(value))
        } else {
          const range = value as CalendarRangeValue
          if (range?.start instanceof Date && range?.end instanceof Date) {
            return isWithinInterval(startOfDay(columnValue), {
              start: startOfDay(range.start),
              end: startOfDay(range.end)
            })
          } else {
            return false
          }
        }
      }
      default:
        return false
    }
  }

  function setSummary(summary: TableSummaryPrivate): string {
    let result: number | string | null | undefined = null
    const columnData: Array<any> = LD.map(dataSource.value, summary.dataField ?? "")
    switch (summary.type) {
      case "sum": {
        if ((["number"] as Array<DataType>).includes(summary.dataType))
          result = LD.sumBy(
            columnData.filter((v) => v !== null && v !== undefined),
            (i) => (!isNaN(Number(i)) ? Number(i) : 0)
          )
        break
      }
      case "count": {
        if ((["string", "select", "number", "date"] as Array<DataType>).includes(summary.dataType))
          result = LD.size(columnData)
        break
      }
      case "min": {
        if ((["string", "select"] as Array<DataType>).includes(summary.dataType))
          result = LD.minBy(columnData, (i) => String(i).length)
        if (summary.dataType === "number") result = LD.minBy(columnData, (i) => (!isNaN(Number(i)) ? Number(i) : 0))
        if (summary.dataType === "date") result = LD.minBy(columnData, (i) => new Date(i).getTime())
        break
      }
      case "max": {
        if ((["string", "select"] as Array<DataType>).includes(summary.dataType))
          result = LD.maxBy(columnData, (i) => String(i).length)
        if (summary.dataType === "number") result = LD.maxBy(columnData, (i) => (!isNaN(Number(i)) ? Number(i) : 0))
        if (summary.dataType === "date") result = LD.maxBy(columnData, (i) => new Date(i).getTime())
        break
      }
      case "avg": {
        if ((["string", "select"] as Array<DataType>).includes(summary.dataType))
          result = LD.round(
            LD.meanBy(columnData, (i) => String(i).length),
            0
          )
        if (summary.dataType === "number")
          result = LD.round(
            LD.meanBy(columnData, (i) => (!isNaN(Number(i)) ? Number(i) : 0)),
            0
          )
        if (summary.dataType === "date") result = LD.meanBy(columnData, (i) => new Date(i).getTime())
        break
      }
    }
    if (result === null || result === undefined) return ""
    const column = getColumn(summary.dataField)
    if (column) result = setCell(column, String(result))
    if (summary?.customizeText && typeof summary.customizeText === "function")
      return summary?.customizeText(summary, `${result}`) ?? ""
    else return String(summary?.displayFormat).replace(/\{0}/g, `${result}`)
  }

  function setCell(column: TableColumnPrivate, value: any, data?: any): string {
    function toMask() {
      if (column?.mask === "phone") return convertToPhone(String(value))
      else if (column?.mask === "number")
        return convertToNumber(
          value,
          (column.filterProps as Partial<BaseInputProps>)?.lengthInteger ?? 20,
          (column.filterProps as Partial<BaseInputProps>)?.lengthDecimal ?? 0,
          ""
        )
      else if (column?.mask === "price")
        return convertToNumber(
          value,
          (column.filterProps as Partial<BaseInputProps>)?.lengthInteger ?? 20,
          (column.filterProps as Partial<BaseInputProps>)?.lengthDecimal ?? 0,
          " "
        )
      else return String(value)
    }

    let valueCell
    if (value === null || value === undefined) valueCell = null
    else if ("setCellValue" in column && typeof column.setCellValue === "function")
      valueCell = column.setCellValue(column, value, data)
    else {
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
          valueCell = formatDate(value, (column as EditDate).editorProps?.datePickerProps?.mask)
          break
        default:
          valueCell = value
      }
    }
    return valueCell
  }

  function setMarker(column: TableColumnPrivate, valueCell: any): string {
    if (valueCell && (filterColumns[column.dataField] || queryTable.value.length))
      valueCell = valueCell.replace(
        new RegExp(escapeRegExp(String(filterColumns[column.dataField] ?? queryTable.value)), "gi"),
        `<span class="${classMark.value}">$&</span>`
      )
    return valueCell
  }

  // Экранирование regex-спецсимволов — query/filter приходят от пользователя.
  function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }

  // Безопасный аналог setMarker: разбивает значение ячейки на текстовые части, отмечая
  // совпадения с query/filter. Рендерится через <mark> + text-node (без v-html) — нет XSS.
  function markerParts(column: TableColumnPrivate, valueCell: any): Array<{ text: string; mark: boolean }> {
    const text = valueCell === null || valueCell === undefined ? "" : String(valueCell)
    const rawQuery = filterColumns[column.dataField] ?? queryTable.value
    const query = typeof rawQuery === "string" ? rawQuery : ""
    if (!text || !query.length) return [{ text, mark: false }]
    const parts: Array<{ text: string; mark: boolean }> = []
    const regex = new RegExp(escapeRegExp(query), "gi")
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push({ text: text.slice(lastIndex, match.index), mark: false })
      parts.push({ text: match[0], mark: true })
      lastIndex = match.index + match[0].length
      if (match.index === regex.lastIndex) regex.lastIndex++
    }
    if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), mark: false })
    return parts.length ? parts : [{ text, mark: false }]
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
      if (editableCell.value?.indexRow === indexRow && editableCell.value?.indexCol === indexCol)
        editableCell.value = null
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

  /**
   * Handles row click event.
   * Sets the clicked row as active by storing its unique identifier (`{_key}-{indexRow}`).
   * This triggers automatic style updates for all table rows via Vue's reactivity system.
   * @param {string} key - CSS class selector for the row element (format: `tr--{indexRow}`)
   * @param {any} data - Row data object containing the row's values
   * @param {number} indexRow - Index of the clicked row
   * @emits click-row - Emitted with row element, data, and index
   */
  function clickRow(key: string, data: any, indexRow: number) {
    activeRow.value = `${data?._key}-${indexRow}`
    emit("click-row", {
      eventEl: ((tbody.value as HTMLElement)?.querySelector(`.${key}`) as HTMLElement) ?? null,
      data,
      indexRow
    })
  }

  function clickCell(
    key: string,
    column: TableColumnPrivate,
    value: any,
    valueWithMarker: any,
    data: any,
    indexRow: number,
    indexCol: number
  ) {
    if (column.hasEditor) editableCell.value = { indexRow, indexCol }
    if (typeof column.onClick === "function") column.onClick(column, data, indexRow)
    emit("click-cell", {
      eventEl: ((tbody.value as HTMLElement)?.querySelector(`.${key}`) as HTMLElement) ?? null,
      column,
      value,
      valueWithMarker,
      data,
      indexRow
    })
  }

  function addRow(data?: any): number | null {
    if (data) {
      const newValueRow: any = { ...data, _key: generateUUID() }
      let index: number | null = null
      if (allData.value?.length) index = allData.value?.push(newValueRow) - 1
      emit("add-row", { value: data, index, _key: newValueRow._key })
      return index
    }
    return null
  }

  function deleteRow(_key?: string): any | null {
    if (_key && Array.isArray(allData.value)) {
      const index = allData.value?.findIndex((i) => i._key === _key) ?? null
      if (index && index >= 0) {
        emit("delete-row", { value: allData.value[index], index, _key })
        return allData.value?.splice(index, 1)
      }
    }
    return null
  }

  function updateRow(_key?: string, data?: any): any | null {
    if (_key && data && Array.isArray(allData.value)) {
      const index = allData.value?.findIndex((i) => i._key === _key)
      if (index && index >= 0) {
        const newValueRow = { ...allData.value[index], ...data }
        emit("before-edit-row", { newValue: newValueRow, oldValue: allData.value[index], _key })
        allData.value[index] = newValueRow
        emit("after-edit-row", { newValue: allData.value[index], oldValue: newValueRow, _key })
        return allData.value[index]
      }
    }
    return null
  }

  function updateCell(_key?: string, column?: TableColumnPrivate, value?: any): any | null {
    if (_key && Array.isArray(allData.value) && column && column?.dataField) {
      const index = allData.value?.findIndex((i) => i._key === _key)
      if (index >= 0 && column.dataField in allData.value[index]) {
        emit("before-edit-cell", { newValue: value, oldValue: allData.value[index][column.dataField], _key, column })
        allData.value[index][column.dataField] = value
        emit("after-edit-cell", { newValue: allData.value[index][column.dataField], oldValue: value, _key, column })
        return value
      }
    }
    return null
  }

  function startLastRowVisibleObserver() {
    if (tbody.value && visibleRows.value > 0) {
      const el = (tbody.value as HTMLElement)?.querySelector(rowSelector)
      if (el) lastRowVisibleObserver.unobserve(el)
      sizeLoadedRows.value =
        visibleRows.value + sizeLoadedRows.value > dataSource.value?.length
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
    sizeLoadedRows.value += loadingRows.value
    nextTick(() => {
      if (!tbody.value) return
      if (sizeLoadedRows.value >= dataSource.value?.length) return
      const el = (tbody.value as HTMLElement)?.querySelector(rowSelector)
      if (el) lastRowVisibleObserver.observe(el)
    })
  }

  // ---INTERSECTION_OBSERVER---------------
  let lastRowVisibleObserver: IntersectionObserver
  if (isClient())
    lastRowVisibleObserver = new IntersectionObserver(
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
      const column = <TableColumnPrivate>dataColumns.value.find((item) => item.id === columnId)
      const rect = columnEl.getBoundingClientRect()
      // Issue 11 (RTL): resize-handle живёт на trailing-крае колонки. В RTL trailing = левый край,
      // поэтому ширину считаем от ПРАВОГО края (rect.right - pageX), а не от левого.
      const isRTL = isClient() && getComputedStyle(columnEl).direction === "rtl"
      let newW = isRTL ? rect.right - $event.pageX : $event.pageX - rect.left
      const maxW = column.maxWidth
      if (maxW && newW > maxW) newW = maxW
      const minW = column.minWidth ?? 100
      if (minW && newW < minW) newW = minW
      widthsColumns[column.dataField] = Math.round(newW)
    }
  }

  function moveResizedColumns(ev: MouseEvent) {
    resizeColumn(ev, resizableColumn.value ?? "")
  }

  function startResizeColumn($event: MouseEvent, column: TableColumnPrivate["id"]) {
    if ($event.stopPropagation) $event.stopPropagation()
    if ($event.preventDefault) $event.preventDefault()
    resizableColumn.value = column
    if (isClient()) {
      window.addEventListener("mousemove", moveResizedColumns)
      window.addEventListener("mouseup", stopResizeColumn)
    }
  }

  function stopResizeColumn() {
    resizableColumn.value = null
    if (isClient()) {
      window.removeEventListener("mousemove", moveResizedColumns)
      window.removeEventListener("mouseup", stopResizeColumn)
    }
  }

  // ---ASYNC-DATA----------------------------
  async function loadDataFromUrl(): Promise<void> {
    const url = asyncDataUrl.value
    if (!url) return

    startLoading()
    try {
      const config = asyncDataConfig.value
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...(config?.headers ?? {})
      }

      let requestUrl = url
      if (config?.query) {
        const queryParams = new URLSearchParams()
        Object.keys(config.query).forEach((key) => {
          if (config.query![key] !== undefined && config.query![key] !== null) {
            queryParams.append(key, String(config.query![key]))
          }
        })
        const queryString = queryParams.toString()
        if (queryString) {
          requestUrl = `${url}${url.includes("?") ? "&" : "?"}${queryString}`
        }
      }

      const response = await fetch(requestUrl, {
        method: "GET",
        headers: requestHeaders
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const dataArray = Array.isArray(data) ? data : []

      allData.value = dataArray.map((item) => ({ ...item, _key: generateUUID() }))
      updateDataSource()
    } catch (error) {
      console.error("Error loading data from URL:", error)
      allData.value = []
      dataSource.value = []
      stopLoading()
    }
  }

  async function loadDataFromFunction(): Promise<void> {
    if (!isAsyncDataFunction.value || typeof asyncData.value !== "function") return
    if (loadDataFromFunctionPending) return
    loadDataFromFunctionPending = true

    startLoading()
    try {
      const params: TableAsyncDataParams = {
        filters: getFilters(filterColumns),
        sort: getSorted(sortColumns),
        search: queryTable.value,
        pagination: {
          page: pageTable.value,
          size: sizeTable.value
        }
      }

      const result = await (asyncData.value as (params: TableAsyncDataParams) => Promise<TableAsyncDataResult>)(params)

      if (result && Array.isArray(result.dataSource)) {
        allData.value = result.dataSource.map((item) => ({ ...item, _key: generateUUID() }))
        totalCountAsync.value = typeof (result.total as unknown) === "number" ? result.total : undefined
        updateDataSource()
      } else {
        allData.value = []
        dataSource.value = []
        totalCountAsync.value = undefined
      }
    } catch (error) {
      console.error("Error loading data from function:", error)
      allData.value = []
      dataSource.value = []
    } finally {
      stopLoading()
      loadDataFromFunctionPending = false
    }
  }
</script>

<template>
  <div
    data-table
    ref="componentTable"
    tabindex="-1"
    :class="classBaseTable"
    :style="`width:${settings.width};height:${settings.height};`">
    <div data-table-aria-live class="sr-only" aria-live="polite" aria-atomic="true">{{ ariaResultsLabel }}</div>
    <div v-if="isVisibleToolbar" data-table-toolbar ref="tableToolbar" :class="classBaseToolbar">
      <slot v-if="slots.toolbar" data-table-toolbar-slot name="toolbar" />
      <div v-if="isSearch" data-table-search :class="classSearch">
        <Input
          :model-value="queryTable"
          :label="Table.t('find') ?? 'Find...'"
          clearable
          :mode="mode"
          label-mode="vanishing"
          autocomplete="off"
          :classes="{
            control:
              'min-w-[5rem] max-w-[5rem] focus:max-w-[8rem] focus:min-w-[8rem] sm:focus:max-w-[15rem] sm:focus:min-w-[15rem] motion-safe:transition-all motion-safe:duration-500'
          }"
          :class="`sticky top-1 rounded-md ease-out ${modeStyle} mb-2`"
          @change:model-value="(v) => searching(v)"
          @update:model-value="(v) => lengthData > 100 || searching(v)">
          <template #before>
            <MagnifyingGlassIcon aria-hidden="true" :class="classIcon" />
          </template>
        </Input>
      </div>
      <transition
        leave-active-class="motion-safe:transition ease-in motion-safe:duration-1000"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
        enter-active-class="motion-safe:transition ease-in motion-safe:duration-1000"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100">
        <Button
          v-if="isFilterClear"
          data-table-clear-filter
          class="group rounded-md ml-2 h-[38px] min-w-[38px] px-2 bg-surface-100 dark:bg-surface-900"
          @click="clearFilter">
          <FunnelIcon aria-hidden="true" :class="classIconClearFilter" />
          <FixWindow :mode="mode">{{ Table.t("clearAllFilters") ?? "Clear all filters" }}</FixWindow>
        </Button>
      </transition>
    </div>
    <div data-table-body :class="classTableBody" :style="`border-radius: ${settings.borderRadius}px;`">
      <div v-if="slots.header" ref="tableHeader" :class="classBodySlotHeader" :style="styleHeader">
        <div data-table-header :class="classSlotHeader">
          <slot name="header" />
        </div>
      </div>
      <div data-table-body-base :class="classBaseTableBody">
        <div ref="tableBody" data-table-viewport :class="classBodyTable" :style="styleBodyTable">
          <table data-table-element ref="table" :class="classTable" :aria-rowcount="isVirtual ? lengthData : undefined">
            <caption v-if="caption || slots.caption" data-table-caption class="sr-only">
              <slot name="caption">{{ caption }}</slot>
            </caption>
            <!-- -------------------------------- -->
            <thead v-if="isColumns" data-table-thead ref="thead" :class="classTHead">
              <tr v-if="hasColumnGroups" data-table-thead-group-tr :class="classHeadTr">
                <th
                  v-for="(g, gi) in headerGroups"
                  :key="`group-${gi}`"
                  data-table-thead-group-col
                  scope="colgroup"
                  :colspan="g.span"
                  :class="classTh({ classes: { th: g.class } } as TableColumnPrivate)">
                  <div :class="classBodyFilter">
                    <div :class="classNotFilter({} as TableColumnPrivate)">{{ g.caption }}</div>
                  </div>
                </th>
              </tr>
              <tr :class="classHeadTr">
                <template v-for="(column, key) in dataColumns" :key="column.id">
                  <th
                    v-if="column.visible"
                    data-table-thead-col
                    scope="col"
                    :aria-sort="ariaSort(column)"
                    :class="classTh(column)"
                    :style="styleTh(column)">
                    <div :class="classBodyFilter">
                      <div v-if="column.filterable" data-table-thead-col-filter :class="classIsFilter(column)">
                        <RenderColumnSlot v-if="column._filterSlot" :render="column._filterSlot" :args="{ column }" />
                        <Input
                          v-else-if="column.type === 'string' || column.type === 'number'"
                          :model-value="filterColumns[column?.dataField]"
                          v-bind="filterControlProps(column)"
                          :label="column.caption"
                          :mode="mode"
                          :classes="filterControlClasses(column)"
                          :class="filterControlClass(column)"
                          :style="`min-width: ${column.minWidth || 70}px;${styleThFilter(column)}`"
                          label-mode="offsetDynamic"
                          clearable
                          @change:model-value="(v) => filtering(column?.dataField, v)"
                          @update:model-value="(v) => lengthData > 100 || filtering(column?.dataField, v)"
                          @clear="filtering(column?.dataField, null)" />
                        <Select
                          v-else-if="column.type === 'select'"
                          :model-value="filterColumns[column?.dataField]"
                          v-bind="{
                            ...filterControlProps(column),
                            fixWindowProps: {
                              scrollableEl: tableBody,
                              ...(column?.filterProps as Partial<BaseSelectProps>)?.fixWindowProps
                            }
                          }"
                          :label="column.caption"
                          :mode="mode"
                          :classes="filterControlClasses(column)"
                          :class="filterControlClass(column)"
                          :style="`min-width: ${column.width || column.minWidth || 50}px;${styleThFilter(column)}`"
                          clearable
                          @update:model-value="(v) => filtering(column?.dataField, v)" />
                        <Calendar
                          v-else-if="column.type === 'date'"
                          :model-value="filterColumns[column?.dataField]"
                          v-bind="{
                            ...filterControlProps(column),
                            fixWindowProps: {
                              scrollableEl: tableBody,
                              ...(column?.filterProps as Partial<BaseCalendarProps>)?.fixWindowProps
                            }
                          }"
                          :label="column.caption"
                          :mode="mode"
                          label-mode="offsetDynamic"
                          :classes="filterControlClasses(column)"
                          :class="filterControlClass(column)"
                          :style="`min-width: ${widthsColumns[column.dataField] ? widthsColumns[column.dataField] - 30 : column.width || column.minWidth || 50}px;${styleThFilter(column)}`"
                          clearable
                          @update:model-value="(v) => filtering(column?.dataField, v)" />
                      </div>
                      <div v-else data-table-thead-col-no-filter :class="classNotFilter(column)">
                        <RenderColumnSlot v-if="column._headerSlot" :render="column._headerSlot" :args="{ column }" />
                        <template v-else>{{ column.caption }}</template>
                      </div>
                      <!--
                        T2 (a11y): нативный <button> — единственный способ получить и tab order,
                        и роль button, и активацию Enter/Space «из коробки». UA-хром кнопки снят
                        глобальным reset'ом (baseStyle: button.fv → background transparent,
                        border-width 0, padding 0), поэтому вёрстка не меняется.
                        `.prevent` на keydown обязателен: он гасит синтетический click, который
                        браузер сам генерирует по Enter/Space, — иначе sorting() отработал бы дважды.
                      -->
                      <button
                        v-if="column.sortable ?? isSort"
                        type="button"
                        data-table-thead-col-sort
                        :class="classIsSort(column)"
                        :aria-label="ariaSortLabel(column)"
                        @click="sorting(column?.dataField)"
                        @keydown.enter.prevent="sorting(column?.dataField)"
                        @keydown.space.prevent="sorting(column?.dataField)">
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
                      </button>
                      <div
                        v-if="column.resizable ?? resizableColumns"
                        data-table-thead-col-resized
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
            <tbody data-table-tbody ref="tbody" :class="classTBody">
              <tr
                v-if="isVirtual && virtualWindow.topPad"
                data-table-virtual-spacer-top
                aria-hidden="true"
                :style="`height:${virtualWindow.topPad}px`">
                <td :colspan="dataColumns.length" class="p-0 border-0"></td>
              </tr>
              <template v-for="(group, key) in renderSource" :key="key">
                <tr v-if="isGroup" data-table-tbody-group>
                  <th
                    :colspan="dataColumns.length"
                    data-table-tbody-colgroup
                    scope="colgroup"
                    :class="classGroup"
                    :style="styleGroup">
                    <div :class="classGroupText" :style="styleGroupText">
                      <slot name="group" :item="key" :length="group.length">{{ key }}</slot>
                    </div>
                  </th>
                </tr>
                <template v-for="(data, indexRow) in group" :key="data?._key">
                  <tr
                    data-table-tbody-tr
                    :class="classTr(data, absIndex(indexRow))"
                    :style="isVirtual ? `height:${virtualRowHeight}px` : undefined"
                    :aria-rowindex="isVirtual ? absIndex(indexRow) + 1 : undefined"
                    @click="clickRow(`tr--${absIndex(indexRow)}`, data, absIndex(indexRow))">
                    <template v-for="(column, indexCol) in dataColumns" :key="`${data?._key}-${indexCol}`">
                      <td
                        v-if="column.visible"
                        data-table-tbody-td
                        :class="classColumnTd(data, absIndex(indexRow), column, indexCol)"
                        :style="styleColumnTd(column)"
                        @click="
                          clickCell(
                            `td--${absIndex(indexRow)}--${column?.name ?? indexCol}`,
                            column,
                            data[column.dataField],
                            setMarker(column, setCell(column, data[column.dataField], data)),
                            data,
                            absIndex(indexRow),
                            indexCol
                          )
                        ">
                        <div
                          v-if="column?._cellSlot"
                          data-table-tbody-cell-slot
                          :class="classTemplate(column)"
                          :style="styleCellTable">
                          <RenderColumnSlot
                            :render="column._cellSlot"
                            :args="{
                              rowData: data,
                              value: setCell(column, data[column.dataField], data),
                              valueWithMarker: setMarker(column, setCell(column, data[column.dataField], data)),
                              column,
                              isCloseEditor: (isActive: boolean) =>
                                isActive || clearEditableCell(absIndex(indexRow), indexCol),
                              editValue: (value: any) => updateCell(data?._key, column, value)
                            }" />
                        </div>
                        <div
                          v-else-if="!column?.cellTemplate"
                          data-table-tbody-not-cell-template
                          :class="classCellTable(indexRow, column, indexCol)"
                          :style="styleCellTable">
                          <div
                            v-if="
                              !(editableCell?.indexRow === absIndex(indexRow) && editableCell?.indexCol === indexCol)
                            ">
                            <template
                              v-for="(part, partIndex) in markerParts(
                                column,
                                setCell(column, data[column.dataField], data)
                              )"
                              :key="partIndex"
                              ><mark v-if="part.mark" :class="classMark">{{ part.text }}</mark
                              ><template v-else>{{ part.text }}</template></template
                            >
                          </div>
                          <template
                            v-if="editableCell?.indexRow === absIndex(indexRow) && editableCell?.indexCol === indexCol">
                            <Input
                              v-if="column.type === 'string' || column.type === 'number'"
                              :model-value="data[column.dataField]"
                              v-bind="{
                                ...(column.editable as EditInput)?.editorProps,
                                classes: {
                                  ...((column.editable as EditInput)?.editorProps?.classes ?? {}),
                                  base: 'border-none font-normal bg-transparent dark:bg-transparent',
                                  control: `pt-[3px] pl-[2px] text-sm font-medium ${classes?.cell ?? ''} ${
                                    (column.editable as EditInput)?.editorProps?.classes?.control ?? ''
                                  }`
                                }
                              }"
                              :mode="mode"
                              class="pt-0 -my-3 w-full"
                              label-mode="vanishing"
                              @active="(active) => active || clearEditableCell(absIndex(indexRow), indexCol)"
                              @change:model-value="(value) => updateCell(data?._key, column, value)" />
                            <Select
                              v-else-if="column.type === 'select'"
                              :model-value="data[column.dataField]"
                              v-bind="{
                                ...(column.editable as EditSelect)?.editorProps,
                                fixWindowProps: {
                                  scrollableEl: tableBody,
                                  ...(column.editable as EditSelect)?.editorProps?.fixWindowProps
                                },
                                classes: {
                                  ...((column.editable as EditSelect)?.editorProps?.classes ?? {}),
                                  base: 'border-none font-normal bg-transparent dark:bg-transparent',
                                  control: `pl-[2px] text-sm font-medium ${classes?.cell ?? ''} ${
                                    (column.editable as EditSelect)?.editorProps?.classes?.control ?? ''
                                  }`
                                }
                              }"
                              :mode="mode"
                              class="pt-[0px] -my-3 w-full"
                              label-mode="vanishing"
                              @active="(active) => active || clearEditableCell(absIndex(indexRow), indexCol)"
                              @update:model-value="
                                (value) => {
                                  updateCell(data?._key, column, value)
                                }
                              " />
                            <Calendar
                              v-else-if="column.type === 'date'"
                              :model-value="data[column.dataField]"
                              v-bind="{
                                ...(column.editable as EditDate)?.editorProps,
                                fixWindowProps: {
                                  scrollableEl: tableBody,
                                  ...(column.editable as EditDate)?.editorProps?.fixWindowProps
                                },
                                classes: {
                                  ...((column.editable as EditDate)?.editorProps?.classes ?? {}),
                                  base: 'border-none font-normal bg-transparent dark:bg-transparent',
                                  text: `pt-[6px] pl-[2px] text-sm font-medium ${classes?.cell ?? ''} ${
                                    (column.editable as EditDate)?.editorProps?.classes?.text ?? ''
                                  }`
                                }
                              }"
                              :mode="mode"
                              class="pt-0 -my-3 w-full"
                              label-mode="vanishing"
                              @active="(active) => active || clearEditableCell(absIndex(indexRow), indexCol)"
                              @update:model-value="(value) => updateCell(data?._key, column, value)" />
                          </template>
                        </div>
                        <div
                          v-else
                          data-table-tbody-cell-template
                          :class="classTemplate(column)"
                          :style="styleCellTable">
                          <slot
                            :name="column?.cellTemplate"
                            :key="data?._key"
                            :column="column"
                            :rowData="data"
                            :value="setCell(column, data[column.dataField], data)"
                            :value-with-marker="setMarker(column, setCell(column, data[column.dataField], data))"
                            :is-close-editor="
                              (isActive: boolean) => isActive || clearEditableCell(absIndex(indexRow), indexCol)
                            "
                            :edit-valiue="(value: any) => updateCell(data?._key, column, value)" />
                        </div>
                      </td>
                    </template>
                  </tr>
                </template>
              </template>
              <tr
                v-if="isVirtual && virtualWindow.bottomPad"
                data-table-virtual-spacer-bottom
                aria-hidden="true"
                :style="`height:${virtualWindow.bottomPad}px`">
                <td :colspan="dataColumns.length" class="p-0 border-0"></td>
              </tr>
            </tbody>
            <!-- -------------------------------- -->
            <tr
              v-if="footerPaddingHeight"
              data-table-padding-height
              :class="classFooterPaddingHeight"
              :style="styleFooterPaddingHeight"></tr>
            <!-- -------------------------------- -->
            <tfoot
              v-if="isSummary && Object.keys(summaryColumns).length"
              data-table-tfoot
              ref="tfoot"
              :class="classTFoot">
              <tr data-table-tfoot-tr>
                <template v-for="column in dataColumns" :key="column.id">
                  <th v-if="column.visible" data-table-tfoot-th scope="col" :class="classThSummary(column)">
                    <div :class="classThSummaryText(column)">{{ summaryColumns[column.dataField] }}</div>
                  </th>
                </template>
              </tr>
            </tfoot>
            <!-- -------------------------------- -->
          </table>
        </div>
        <!-- -------------------------------- -->
        <div
          v-if="isPagination && allData?.length"
          data-table-pagination
          ref="pager"
          :class="classIsPagination"
          :style="styleIsPagination">
          <Pagination
            :model-value="pageTable"
            :page-size="+sizeTable"
            :mode="modePagination"
            :total="lengthData"
            :visible-pages="visibleNumberPages"
            :info-text="isInfoText"
            :page-sizes="sizesSelector"
            :page-size-selector="isPageSizeSelector"
            :navigation-buttons="isNavigationButtons"
            :class="[
              'classPagination border-t sm:px-2',
              ((pagination as TablePagination)?.class as string) ?? '',
              raw('pagination'),
              defaultBorder as string,
              borderOf('borderPagination') as string
            ]"
            :style="styleIsPagination"
            @update:model-value="switchPage"
            @update:page-size="switchPageSize" />
        </div>
        <!-- -------------------------------- -->
        <transition
          leave-active-class="motion-safe:transition ease-in motion-safe:duration-500"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="motion-safe:transition ease-in motion-safe:duration-500"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="isLoading" data-table-loading :class="classIsLoading">
            <div :class="classIsLoadingBody">
              <Loading
                type="FingerprintSpinner"
                :size="100"
                :color="isDark ? 'theme.600' : 'theme.500'"
                v-bind="compoundLoadingProps" />
            </div>
          </div>
        </transition>
        <!-- -------------------------------- -->
        <transition
          leave-active-class="motion-safe:transition ease-in motion-safe:duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="motion-safe:transition ease-in motion-safe:duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="!isLoading && !allData?.length" data-table-no-data :class="classNoData">
            <TableCellsIcon aria-hidden="true" :class="classIcon" />
            <div>
              <slot name="empty">{{ emptyText }}</slot>
            </div>
          </div>
        </transition>
        <transition
          leave-active-class="motion-safe:transition ease-in motion-safe:duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="motion-safe:transition ease-in motion-safe:duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div v-if="!isLoading && allData?.length && !dataColumns?.length" data-table-no-column :class="classNoData">
            <ViewColumnsIcon aria-hidden="true" :class="classIcon" />
            <div>
              <slot name="empty-columns">{{ emptyColumnsText }}</slot>
            </div>
          </div>
        </transition>
        <transition
          leave-active-class="motion-safe:transition-all ease-in motion-safe:duration-200"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="motion-safe:transition-all ease-in motion-safe:duration-200"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100">
          <div
            v-if="!isLoading && allData?.length && dataColumns?.length && !dataSource.length"
            data-table-no-filter
            :class="classNoData">
            <FunnelIcon aria-hidden="true" :class="classIcon" />
            <div>
              <slot name="empty-filter">{{ emptyFilterText }}</slot>
            </div>
          </div>
        </transition>
      </div>
      <div v-if="slots.footer" ref="tableFooter" :class="classSlotFooterBody" :style="styleSlotFooterBody">
        <div data-table-footer :class="classSlotFooter">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Comment, Fragment, Text, computed, onBeforeUnmount, onMounted, ref, unref, useSlots, watch } from "vue"
  import { isClient } from "fishtvue/utils/domHandler"
  import { getActiveLocale } from "fishtvue/config"
  import type { BaseDataItem, IDataItem, SelectEmits, SelectProps } from "./Select"
  import type { FixWindowExpose } from "fishtvue/fixwindow"
  import type { InputLayoutExpose } from "fishtvue/inputlayout"
  import * as LD from "lodash-es"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Input from "fishtvue/input/Input.vue"
  import Badge from "fishtvue/badge/Badge.vue"
  import Icons from "fishtvue/icons/Icons.vue"
  import FixWindow from "fishtvue/fixwindow/FixWindow.vue"
  import Component from "fishtvue/component"
  // ---BASE-COMPONENT----------------------
  const Select = new Component<"Select">()
  const options = Select.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<SelectProps>(), {
    autoFocus: undefined,
    multiple: undefined,
    noQuery: undefined,
    isValue: undefined,
    isInvalid: undefined,
    required: undefined,
    loading: undefined,
    disabled: undefined,
    clear: undefined
  })
  const emit = defineEmits<SelectEmits>()
  const slots = useSlots()
  // ---COMPOUND API (Issue 3) -------------
  // Параллельный декларативный API `<Select><SelectOption>`/`<SelectGroup>` поверх schema-driven
  // `:data-select`. Механизм — VNode-walk `slots.default()` в computed (зеркало Form.vue): renderless-дети
  // не регистрируются в рантайме, родитель читает их VNode-дерево. Schema-driven `dataSelect` выигрывает.
  type CompoundMeta = { disabled: boolean; group: string | null }
  function compoundNormalize(raw: unknown): Array<any> {
    if (raw === null || raw === undefined) return []
    return Array.isArray(raw) ? raw : [raw]
  }
  function isVNodeNamed(vn: any, nameComponent: string): boolean {
    const t = vn?.type
    return !!t && (t?.name === nameComponent || t?.__name === nameComponent)
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
  // Текст из default-slot опции — fallback-label, если нет prop `label`.
  function compoundOptionText(vn: any): string {
    const def = vn?.children?.default
    if (typeof def !== "function") return ""
    let text = ""
    for (const k of compoundNormalize(def())) {
      if (typeof k === "string") text += k
      else if (k && typeof k === "object") {
        if (k.type === Text) text += String(k.children ?? "")
        else if (typeof k.children === "string") text += k.children
      }
    }
    return text.trim()
  }
  const compoundParsed = computed<{
    items: Array<Record<string, any>>
    meta: Map<any, CompoundMeta>
    hasGroups: boolean
  }>(() => {
    const raw = typeof slots.default === "function" ? slots.default() : undefined
    const top = compoundFlatten(compoundNormalize(raw))
    const items: Array<Record<string, any>> = []
    const meta = new Map<any, CompoundMeta>()
    let hasGroups = false
    const pushOption = (vn: any, group: string | null) => {
      const p = (vn?.props ?? {}) as Record<string, any>
      if (!("value" in p)) return
      const value = p.value
      const label = p.label != null ? String(p.label) : compoundOptionText(vn) || String(value)
      items.push({ id: value, value: label })
      meta.set(value, { disabled: p.disabled === "" || p.disabled === true, group })
    }
    for (const vn of top) {
      if (isVNodeNamed(vn, "SelectOption")) pushOption(vn, null)
      else if (isVNodeNamed(vn, "SelectGroup")) {
        hasGroups = true
        const label = String(vn?.props?.label ?? vn?.props?.title ?? "")
        for (const child of compoundFlatten(compoundChildren(vn)))
          if (isVNodeNamed(child, "SelectOption")) pushOption(child, label)
      }
    }
    return { items, meta, hasGroups }
  })
  // schema-driven `dataSelect` выигрывает (даже пустой массив = явный выбор); иначе — compound-опции.
  const schemaActive = computed<boolean>(() => {
    const s = unref(props?.dataSelect)
    return s !== undefined && s !== null
  })
  const sourceData = computed<Array<BaseDataItem>>(() =>
    schemaActive.value
      ? ((unref(props?.dataSelect) ?? []) as Array<BaseDataItem>)
      : (compoundParsed.value.items as Array<BaseDataItem>)
  )
  // ---REF-LINK----------------------------
  const layout = ref<InputLayoutExpose>()
  const selectListWindow = ref<FixWindowExpose>()
  const selectBody = ref<HTMLElement>()
  const selectList = ref<HTMLElement>()
  const selectSearch = ref<HTMLElement>()
  const selectItems = ref<HTMLElement>()
  // ---STATE-------------------------------
  const isFocus = ref<boolean>(false)
  const activeItem = ref<number>(0)
  const query = ref<string>("")
  const isOpenList = ref<boolean>(false)
  const classLayout = ref<SelectProps["class"]>()
  const value = ref<SelectProps["modelValue"]>()
  watch(
    () => props.modelValue,
    () => {
      value.value = props.modelValue ?? ""
    },
    { immediate: true }
  )
  // ---PROPS-------------------------------
  const id = ref<SelectProps["id"] | undefined>((props?.id as SelectProps["id"]) ?? undefined)
  const visibleValue = ref<any[]>([])
  const valueKeys = computed<any[]>(() => {
    return keySelect.value ? visibleValue.value.map((item) => item[keySelect.value ?? ""]) : []
  })
  const keySelect = computed<NonNullable<SelectProps["keySelect"]>>(() => {
    const data = sourceData.value ?? []
    return data && data.length
      ? typeof data[0] === "object"
        ? props?.keySelect && Object.keys(data[0]).includes(props.keySelect)
          ? (props.keySelect as string | "id")
          : Object.keys(data[0])[0]
        : "id"
      : "id"
  })
  const valueSelect = computed<SelectProps["valueSelect"] | null>(() => {
    const dataSelectValue = sourceData.value
    if (dataSelectValue && dataSelectValue.length) {
      if (typeof dataSelectValue[0] === "object") {
        if (props?.valueSelect && Object.keys(dataSelectValue[0]).includes(props.valueSelect)) {
          return props?.valueSelect as SelectProps["valueSelect"]
        } else {
          return Object.keys(dataSelectValue[0])[1]
        }
      } else {
        return "value"
      }
    } else {
      return null
    }
  })
  const dataSelect = computed<Array<BaseDataItem>>(() => {
    const dataSelectValue = sourceData.value as Array<IDataItem> | undefined
    return !!keySelect.value && !!valueSelect.value
      ? (dataSelectValue ?? []).map((item) => ({
          [keySelect.value ?? ""]: typeof item === "object" && keySelect.value ? item[keySelect.value ?? ""] : item,
          [valueSelect.value ?? ""]: typeof item === "object" && keySelect.value ? item[valueSelect.value ?? ""] : item
        }))
      : (dataSelectValue ?? [])
  })
  const autoFocus = computed<NonNullable<SelectProps["autoFocus"]>>(
    () => props?.autoFocus ?? options?.autoFocus ?? false
  )
  const mode = computed<NonNullable<SelectProps["mode"]>>(
    () => (props.mode as SelectProps["mode"]) ?? options?.mode ?? Select.componentsStyle() ?? "outlined"
  )
  const isDisabled = computed<NonNullable<SelectProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<SelectProps["loading"]>>(() => props.loading ?? false)
  const isInvalid = computed<NonNullable<SelectProps["isInvalid"]>>(() => props.isInvalid ?? false)
  const messageInvalid = computed<SelectProps["messageInvalid"]>(() => props.messageInvalid)
  const isValue = computed<boolean>(() =>
    Boolean(
      isMultiple.value ? (value.value ? String(value.value).length : value.value) : (value.value ?? isOpenList.value)
    )
  )
  const isMultiple = computed<NonNullable<SelectProps["multiple"]>>(() => props?.multiple ?? options?.multiple ?? false)
  const maxVisible = computed<SelectProps["maxVisible"] | undefined>(() => {
    const result = props?.maxVisible ?? options?.maxVisible
    return result !== undefined && typeof +result === "number" ? +result : undefined
  })
  const closeButtonBadge = computed<boolean>(() => props?.closeButtonBadge ?? options?.closeButtonBadge ?? false)
  const noData = computed<NonNullable<SelectProps["noData"]>>(
    () => (props?.noData as SelectProps["noData"]) ?? options?.noData ?? Select.t("noData") ?? "No data available"
  )
  const isQuery = computed<NonNullable<SelectProps["noQuery"]>>(() => !(props?.noQuery ?? options?.noQuery))
  const classMaskQuery = computed<NonNullable<SelectProps["classMaskQuery"]>>(() =>
    Select.setStyle(props?.classMaskQuery ?? options?.classMaskQuery ?? "font-bold text-theme-700 dark:text-theme-300")
  )
  // ---ISSUE 10 — Intl.Collator (locale-aware, diacritic-insensitive substring search) ---
  const collator = computed(
    () => new Intl.Collator(getActiveLocale() ?? "en", { sensitivity: "base", usage: "search" })
  )
  function matchesQuery(itemValue: string, q: string): boolean {
    if (!q) return true
    const hay = String(itemValue)
    const needle = q
    if (needle.length > hay.length) return false
    const c = collator.value
    for (let i = 0; i <= hay.length - needle.length; i++) {
      if (c.compare(hay.slice(i, i + needle.length), needle) === 0) return true
    }
    return false
  }
  // ---ISSUE 1 — deprecation warning for `marker` field (XSS surface removed) ---
  const __markerWarnedItems = new WeakSet<object>()
  function warnDeprecatedMarker(item: unknown): void {
    if (!item || typeof item !== "object") return
    const obj = item as Record<string, unknown>
    if (!Object.prototype.hasOwnProperty.call(obj, "marker")) return
    if (__markerWarnedItems.has(obj)) return
    __markerWarnedItems.add(obj)

    console.warn(
      "[FishtVue Select] `IDataItem.marker` is deprecated since 2026-05-11 — the field is ignored to prevent XSS. " +
        "Use the `#marker` scoped slot to customise substring highlighting."
    )
  }
  const dataList = computed<any[]>(() => {
    if (dataSelect.value?.length && valueSelect.value && isQuery.value) {
      return LD.filter(dataSelect.value, (item) => {
        if (typeof item === "object" && item) warnDeprecatedMarker(item)
        const raw = typeof item === "object" ? (item as IDataItem)[valueSelect.value as string] : item
        return matchesQuery(String(raw), query.value)
      }) as any[]
    }
    if (dataSelect.value?.length) {
      for (const item of dataSelect.value) {
        if (typeof item === "object" && item) warnDeprecatedMarker(item)
      }
    }
    return (dataSelect.value ?? []) as any[]
  })
  // ---ISSUE 1 — safe substring highlight helper (replaces v-html marker assembly) ---
  type MarkerPart = { text: string; mark: boolean }
  function splitByQuery(text: string, q: string): MarkerPart[] {
    const hay = String(text ?? "")
    if (!q || !hay) return hay ? [{ text: hay, mark: false }] : []
    const needle = q
    if (needle.length > hay.length) return [{ text: hay, mark: false }]
    const c = collator.value
    const parts: MarkerPart[] = []
    let cursor = 0
    let i = 0
    while (i <= hay.length - needle.length) {
      if (c.compare(hay.slice(i, i + needle.length), needle) === 0) {
        if (i > cursor) parts.push({ text: hay.slice(cursor, i), mark: false })
        parts.push({ text: hay.slice(i, i + needle.length), mark: true })
        cursor = i + needle.length
        i = cursor
      } else {
        i += 1
      }
    }
    if (cursor < hay.length) parts.push({ text: hay.slice(cursor), mark: false })
    return parts
  }
  function markerParts(item: any): MarkerPart[] {
    const raw = typeof item === "object" && valueSelect.value ? item[valueSelect.value as string] : item
    return splitByQuery(String(raw ?? ""), query.value)
  }
  // ---ISSUE 3 — render-rows: вставляет non-selectable group-headers между опциями + несёт disabled-флаг.
  // `index` сохраняет позицию в `dataList` (Enter выбирает dataList[activeItem]); headers исключены из
  // selectable-списка (отдельный data-attr), keyboard-nav таргетит `[data-select-list-item]`.
  type RenderRow = { type: "group"; label: string } | { type: "option"; item: any; index: number; disabled: boolean }
  function isOptionDisabled(item: any): boolean {
    if (schemaActive.value) return false
    return !!compoundParsed.value.meta.get(item?.[keySelect.value ?? ""])?.disabled
  }
  const renderRows = computed<RenderRow[]>(() => {
    const rows: RenderRow[] = []
    const useMeta = !schemaActive.value
    const meta = compoundParsed.value.meta
    const showGroups = useMeta && compoundParsed.value.hasGroups
    let lastGroup: string | null | undefined = undefined
    dataList.value.forEach((item: any, index: number) => {
      const m = useMeta ? meta.get(item?.[keySelect.value ?? ""]) : undefined
      if (showGroups) {
        const g = m?.group ?? null
        if (g !== lastGroup) {
          if (g) rows.push({ type: "group", label: g })
          lastGroup = g
        }
      }
      rows.push({ type: "option", item, index, disabled: !!m?.disabled })
    })
    return rows
  })
  const paramsFixWindow = computed<NonNullable<SelectProps["paramsFixWindow"]>>(() => ({
    position: "bottom-left",
    eventOpen: "click",
    eventClose: "hover",
    marginPx: 5,
    ...options?.paramsFixWindow,
    ...props?.paramsFixWindow
  }))
  const labelInput = computed(() => Select.t("find") ?? "Find...")
  Select.setStyle(
    `motion-safe:transition motion-safe:ease-in-out motion-safe:duration-300 opacity-100 translate-x-0 opacity-0 -translate-x-5`
  )
  const classBase = computed<SelectProps["classSelect"]>(() => {
    return Select.setStyle([
      "selectBody w-46 min-h-[36px] max-h-16 focus:outline-0 focus:ring-0",
      "print:bg-white print:text-black print:shadow-none",
      options?.classSelect ?? "",
      props?.classSelect ?? "",
      "classSelect flex overflow-auto cursor-pointer"
    ])
  })
  const classSelectList = computed<SelectProps["classSelectList"]>(() =>
    Select.setStyle([
      "min-w-[10rem] mt-1 max-h-60 motion-safe:transition-all",
      "text-base rounded-md ring-1 ring-black/5 shadow-xl focus:outline-none sm:text-sm",
      mode.value === "outlined" ? "border border-gray-300 dark:border-gray-600 bg-white dark:bg-black" : "",
      mode.value === "underlined"
        ? "rounded-none border-0 border-gray-300 dark:border-gray-700 border-b bg-stone-50 dark:bg-stone-950"
        : "",
      mode.value === "filled" ? "border-0 bg-stone-100 dark:bg-stone-900" : "",
      options?.classSelectList ?? "",
      props?.classSelectList ?? "",
      "classSelectList overflow-auto"
    ])
  )
  const valueLayout = computed(() =>
    valueSelect.value ? visibleValue.value?.map((item) => item[valueSelect.value as string])?.join(", ") : null
  )
  const classSelectContent = ref(Select.setStyle("flex items-center flex-wrap"))
  const classSelectItem = ref(Select.setStyle("z-1"))
  const classDataListNoData = ref(Select.setStyle("h-9 px-4 text-sm text-gray-500"))
  const classNoData = ref(Select.setStyle("p-4 text-sm text-gray-500"))
  const classGradientSelectList = computed(() =>
    Select.setStyle([
      "w-full h-5 bg-gradient-to-t to-transparent pointer-events-none",
      mode.value === "outlined" ? "from-white dark:from-black via-white dark:via-black" : "",
      mode.value === "underlined" ? "from-stone-50 dark:from-stone-950 via-stone-50 dark:via-stone-950" : "",
      mode.value === "filled" ? "from-stone-100 dark:from-stone-900 via-stone-100 dark:via-stone-900" : "",
      "sticky z-20" // todo need to switch to absolute
    ])
  )
  const iconCheck = computed(() =>
    // ---ISSUE 9 (RTL): логические start-0 / ps-2 вместо физических left-0 / pl-2 (авто-флип при dir="rtl")
    Select.setStyle("flex absolute inset-y-0 start-0 items-center ps-2 text-theme-700 dark:text-theme-400")
  )
  const classGradientSelectListTop = computed(() =>
    Select.setStyle([classGradientSelectList.value, "bg-gradient-to-b top-0"])
  )
  const classGradientSelectListButton = computed(() =>
    Select.setStyle([classGradientSelectList.value, "bg-gradient-to-t top-[220px]"])
  )
  const classUl = computed(() => Select.setStyle("p-0"))
  const classLiItem = computed(() =>
    Select.setStyle([
      // ---ISSUE 9 (RTL): логические ps-8 / pe-4 вместо физических pl-8 / pr-4 (авто-флип при dir="rtl")
      "text-gray-900 dark:text-gray-100 items-center h-9 mt-2 mx-2 ps-8 pe-4 last:mb-5",
      "hover:bg-theme-200 hover:dark:bg-theme-900 hover:text-theme-700 dark:hover:text-theme-100",
      "focus-visible:bg-theme-200 focus-visible:dark:bg-theme-900 focus-visible:text-theme-700 dark:focus-visible:text-theme-100 focus-visible:ring-1 focus-visible:ring-theme-100 focus-visible:dark:ring-theme-800 focus-visible:outline-none",
      mode.value === "outlined" ? "rounded-md" : "",
      mode.value === "filled" ? "rounded-md" : "",
      "group/li relative cursor-default select-none flex motion-safe:transition-colors motion-safe:duration-500"
    ])
  )
  const classItemSelectValue = computed(() =>
    Select.setStyle(
      // ---ISSUE 9 (RTL): rtl:text-right override (движок сохраняет text-left как LTR-default)
      "text-left rtl:text-right text-gray-600 dark:text-gray-300 group-hover/li:text-theme-700 dark:group-hover/li:text-theme-200"
    )
  )
  // ---ISSUE 3 — non-selectable group-header + disabled-опция ---
  const classGroupHeader = computed(() =>
    Select.setStyle("px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 select-none")
  )
  const classOptionDisabled = computed(() => Select.setStyle("opacity-50 cursor-not-allowed"))
  // ---ISSUE 8 — aria-live announcement for filtered results count ---
  // Wave 3.5: локализация + плюрализация одним ключом через Component.t(key, { count }) —
  // CLDR-формы активной локали (см. select.resultsCount в locale messages).
  const ariaResultsLabel = computed<string>(() => {
    if (!isQuery.value || !query.value) return ""
    const n = dataList.value?.length ?? 0
    return Select.t("select.resultsCount", { count: n })
  })
  const inputLayout = computed(() => ({
    id: props.id,
    isValue: isValue.value,
    mode: mode.value,
    label: props.label,
    labelMode: props.labelMode,
    isInvalid: isInvalid.value,
    messageInvalid: messageInvalid.value,
    required: props.required,
    loading: isLoading.value,
    disabled: isDisabled.value,
    help: props.help,
    clear: props.clear,
    width: props.width,
    height: props.height,
    animation: props.animation,
    classBody: props.classBody,
    class: props.class
  }))
  // ---EXPOSE------------------------------
  defineExpose({
    // ---STATE-------------------------
    layout,
    selectListWindow,
    selectBody,
    selectList,
    selectSearch,
    selectItems,
    activeItem,
    query,
    isOpenList,
    classLayout,
    value,
    // ---PROPS-------------------------
    visibleValue,
    valueKeys,
    keySelect,
    valueSelect,
    dataSelect,
    autoFocus,
    mode,
    isDisabled,
    isLoading,
    isInvalid,
    messageInvalid,
    isValue,
    isMultiple,
    maxVisible,
    noData,
    isQuery,
    classMaskQuery,
    dataList,
    paramsFixWindow,
    classBase,
    classSelectList,
    // ---METHODS-----------------------
    focusSelect,
    openSelect,
    closeSelect,
    select
  })
  // ---MOUNT-UNMOUNT-----------------------
  // ---ISSUE 2 — ResizeObserver saved in closure-let so onBeforeUnmount can disconnect.
  // ---Bonus — drop duplicate Select.initStyle() — Component.__hooks() already registers it.
  let resizeObserver: ResizeObserver | undefined
  onMounted(() => {
    if (autoFocus.value) openSelect()
    if (isClient() && selectBody.value) {
      resizeObserver = new ResizeObserver(() => {
        if (isOpenList.value) selectListWindow.value?.updatePosition()
      })
      resizeObserver.observe(selectBody.value as HTMLElement)
    }
  })
  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = undefined
    if (isClient()) {
      document.removeEventListener("keydown", openSelectOnEnter)
      document.removeEventListener("keydown", keydownSelect)
    }
  })
  // ---WATCHERS----------------------------
  watch(isFocus, (value) => {
    if (!isClient()) return
    if (value) document.addEventListener("keydown", openSelectOnEnter)
    else document.removeEventListener("keydown", openSelectOnEnter)
  })
  watch(isOpenList, (value) => {
    if (!isClient()) return
    if (value) document.addEventListener("keydown", keydownSelect)
    else document.removeEventListener("keydown", keydownSelect)
    focusSelect(value)
    emit("isActive", value)
  })
  watch(
    value,
    () => {
      if (dataSelect.value && value.value && keySelect.value) {
        if (isMultiple.value) {
          visibleValue.value =
            dataSelect.value?.filter((item) =>
              Array.isArray(value.value)
                ? value.value?.includes(typeof item === "object" ? item[keySelect.value ?? ""] : item)
                : (typeof item === "object" ? item[keySelect.value ?? ""] : item) === value.value
            ) ?? []
        } else {
          const result = dataSelect.value?.find((item) =>
            Array.isArray(value.value)
              ? value.value?.includes(typeof item === "object" ? item[keySelect.value ?? ""] : item)
              : (typeof item === "object" ? item[keySelect.value ?? ""] : item) === value.value
          )
          visibleValue.value = result ? [result] : []
        }
      } else visibleValue.value = []
    },
    { immediate: true }
  )
  // watch([layout.value?.beforeWidth, layout.value?.afterWidth], () => {
  //   console.log("[layout.value?.beforeWidth, layout.value?.afterWidth],")
  //   selectListWindow.value?.updatePosition()
  // })

  // ---METHODS-----------------------------
  // ---ISSUE 2 (defensive) — guards against undefined refs after unmount-while-open ---
  function changeFocus(currentIndex: number, direction: 1 | -1) {
    const listItems = (selectItems.value as any)?.$el?.querySelectorAll("li[data-select-list-item]") as
      | NodeListOf<HTMLElement>
      | undefined
    if (!listItems || !listItems.length) return
    let newIndex = currentIndex + direction
    const cur = listItems[currentIndex]
    if (cur) {
      cur.setAttribute("tabindex", "-1")
      cur.blur()
    }
    if (newIndex < 0) newIndex = listItems.length - 1
    else if (newIndex >= listItems.length) newIndex = 0
    const next = listItems[newIndex]
    if (next) {
      next.setAttribute("tabindex", "0")
      next.focus()
    }
    activeItem.value = newIndex
  }

  function keydownSelect(event: KeyboardEvent) {
    // ---ISSUE 2 (defensive) — bail out if component already unmounted ---
    if (!selectItems.value) return
    if (event.key === "Tab") activeItem.value += 1
    else if (event.key === "Enter") select(dataList.value[activeItem.value])
    else if (["Escape", "Esc"].includes(event.key)) isOpenList.value = false
    else if (["ArrowDown", "ArrowUp"].includes(event.key)) {
      const items = (selectItems.value as any)?.$el?.querySelectorAll("li[data-select-list-item]") as
        | NodeListOf<HTMLElement>
        | undefined
      if (!items || !items.length) return
      const currentIndex = Array.prototype.indexOf.call(items, document.activeElement)
      if (currentIndex !== -1) {
        event.preventDefault()
        if (event.key === "ArrowDown") changeFocus(currentIndex, 1)
        else if (event.key === "ArrowUp") changeFocus(currentIndex, -1)
      } else changeFocus(1, -1)
    } else if ("which" in event ? event.which : (event as any).keyCode >= 32) selectSearch.value?.focus()
  }

  function openSelectOnEnter(event: KeyboardEvent) {
    if (event.key === "Enter") openSelect()
  }

  // ---------------------------------------
  function focusSelect(focus: boolean) {
    isFocus.value = focus
    classLayout.value =
      (props.class ?? "") +
      (isFocus.value
        ? " border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700"
        : "")
  }

  function openSelect() {
    if (isDisabled.value) return
    isOpenList.value = true
  }

  function closeSelect(event: MouseEvent | undefined): any {
    if (event && isOpenList.value && selectBody.value && selectList) {
      isOpenList.value =
        event.composedPath().includes(selectBody.value as HTMLElement) ||
        event.composedPath().includes(selectList.value as HTMLElement)
      if (isOpenList.value === false) emit("change:modelValue", value.value, visibleValue.value)
    }
  }

  // ---------------------------------------
  function select(selectValue: BaseDataItem | null): void {
    // ---ISSUE 3 — disabled compound-опция не выбирается ---
    if (selectValue && isOptionDisabled(selectValue)) return
    if (selectValue && keySelect.value) {
      activeItem.value = dataList.value.findIndex(
        (value) =>
          value[keySelect.value ?? ""] ===
          (typeof selectValue === "object" ? selectValue[keySelect.value ?? ""] : selectValue)
      )
      const index = visibleValue.value.findIndex(
        (value) =>
          value[keySelect.value ?? ""] ===
          (typeof selectValue === "object" ? selectValue[keySelect.value ?? ""] : selectValue)
      )
      if (index >= 0) visibleValue.value.splice(index, 1)
      else {
        if (!isMultiple.value) visibleValue.value = []
        visibleValue.value.push(selectValue)
      }
    } else visibleValue.value = []
    value.value = valueKeys.value.length ? (isMultiple.value ? valueKeys.value : valueKeys.value[0]) : null
    emit("update:isInvalid", false)
    emit("update:modelValue", value.value, visibleValue.value)
  }

  // ---LAZY GSAP (Wave 2.1)----------------------
  // gsap — optional peerDependency: грузим динамически при первой анимации и кэшируем. Без gsap
  // дропдаун открывается/закрывается мгновенно (анимация = progressive enhancement); bundle без
  // Select не тянет ~50KB gsap.
  let gsapModule: (typeof import("gsap"))["default"] | undefined
  let gsapTried = false
  async function loadGsap() {
    if (gsapTried) return gsapModule
    gsapTried = true
    try {
      gsapModule = (await import("gsap")).default
    } catch {
      gsapModule = undefined
    }
    return gsapModule
  }

  // ---------------------------------------
  function onBeforeEnter(el: any) {
    el.style.opacity = 0
    el.style.height = 0
  }

  async function onEnter(el: any, done: any) {
    const gsap = await loadGsap()
    if (!gsap) {
      // нет gsap → сразу финальные стили (иначе item остаётся opacity:0/height:0 от onBeforeEnter)
      el.style.opacity = 1
      el.style.height = "38px"
      done()
      return
    }
    gsap.to(el, {
      opacity: 1,
      height: "38px",
      delay: (Number(el.dataset.index) || 0) * (dataList.value?.length >= 80 ? 0 : 0.01),
      onComplete: done
    })
  }

  const delay = computed<number>((): number => {
    const d = dataSelect.value?.length
    if (!d) return 0
    if (d >= 0 && d < 10) return 0.15
    else if (d >= 10 && d < 30) return 0.05
    else if (d >= 30 && d < 80) return 0.01
    return 0
  })

  async function onLeave(el: any, done: any) {
    const gsap = await loadGsap()
    if (!gsap) {
      el.style.opacity = 0
      el.style.height = 0
      done()
      return
    }
    gsap.to(el, { opacity: 0, height: 0, delay: (Number(el.dataset.index) || 0) * delay.value, onComplete: done })
  }
</script>

<template>
  <InputLayout ref="layout" :value="valueLayout" :class="classLayout" v-bind="inputLayout" @clear="select(null)">
    <template #default="{ id: fieldId, labelledby }">
      <div
        data-select
        ref="selectBody"
        :id="fieldId"
        role="combobox"
        :aria-labelledby="labelledby"
        :aria-expanded="isOpenList"
        tabindex="0"
        :class="classBase"
        @focusin="focusSelect(true)"
        @focusout="focusSelect(false)"
        @click="openSelect">
        <div data-select-content :class="classSelectContent">
          <template v-if="isMultiple">
            <transition-group
              leave-active-class="motion-safe:transition motion-safe:ease-in-out motion-safe:duration-300"
              leave-from-class="opacity-100 translate-x-0"
              leave-to-class="opacity-0 -translate-x-5"
              enter-active-class="motion-safe:transition motion-safe:ease-in-out motion-safe:duration-300"
              enter-from-class="opacity-0 -translate-x-5"
              enter-to-class="opacity-100 translate-x-0">
              <div
                v-for="item in typeof maxVisible === 'number' ? visibleValue.slice(0, maxVisible) : visibleValue"
                :key="item[keySelect]"
                data-select-item
                :class="classSelectItem">
                <slot
                  name="values"
                  :selected="item"
                  :key="valueSelect ? valueSelect : keySelect"
                  :delete-select="select">
                  <Badge
                    mode="neutral"
                    :close-button="closeButtonBadge"
                    class-content="fill-theme-500"
                    @delete="select(item)"
                    class="mx-1 text-xs bg-theme-50 text-theme-700 ring-theme-600/20 dark:bg-theme-950 dark:text-theme-300 dark:ring-theme-400/20 motion-safe:transition-colors motion-safe:duration-500">
                    {{ valueSelect ? item[valueSelect] : item[keySelect] }}
                  </Badge>
                </slot>
              </div>
              <div v-if="typeof maxVisible === 'number' && visibleValue.length > maxVisible" :class="classSelectItem">
                <slot name="values" :selected="visibleValue.length" :delete-select="select">
                  <Badge
                    mode="neutral"
                    :close-button="closeButtonBadge"
                    class="m-1 ps-2 text-xs bg-theme-50 text-theme-700 ring-theme-600/20 dark:bg-theme-950 dark:text-theme-300 dark:ring-theme-400/20 motion-safe:transition-colors motion-safe:duration-500"
                    class-content="fill-theme-500 flex items-center"
                    @delete="select(null)">
                    <Icons type="Funnel" class="h-3 w-3 me-1 text-theme-400 dark:text-theme-600" />
                    {{ visibleValue.length }}
                  </Badge>
                </slot>
              </div>
            </transition-group>
          </template>
          <template v-else>
            <div v-for="(item, key) in visibleValue" :key="`${item[keySelect]}-${key}`" :class="classSelectItem">
              <slot name="values" :selected="item" :key="valueSelect ? valueSelect : keySelect">
                <div>{{ valueSelect ? item[valueSelect] : item[keySelect] }}</div>
              </slot>
            </div>
          </template>
        </div>
      </div>
    </template>
    <template #body>
      <FixWindow
        ref="selectListWindow"
        v-bind="paramsFixWindow"
        :model-value="isOpenList"
        :class-body="['z-50', `ms-[${layout?.beforeWidth}px]`]"
        @close="closeSelect">
        <div
          data-select-list
          ref="selectList"
          :class="classSelectList"
          :style="`width: ${(selectBody as HTMLElement)?.clientWidth ?? 0}px`">
          <div :class="Select.setStyle('sticky z-20 w-full h-0 top-0')">
            <div :class="classGradientSelectListTop" />
          </div>
          <div :class="Select.setStyle('sticky z-20 w-full h-0 top-[220px]')">
            <div :class="classGradientSelectListButton" />
          </div>
          <Input
            v-if="isQuery"
            ref="selectSearch"
            data-select-search
            v-model="query"
            :label="labelInput"
            :mode="mode"
            label-mode="vanishing"
            clear
            :class-body="[
              `m-2 mb-5 rounded-md`,
              mode === 'outlined' ? 'ring-stone-200 dark:ring-black' : '',
              mode === 'underlined' ? 'ring-stone-200 dark:ring-stone-950' : '',
              mode === 'filled' ? 'ring-stone-100 dark:ring-stone-900' : '',
              'sticky top-2 z-20'
            ]"
            @focus="activeItem = -1">
            <template #before>
              <Icons type="MagnifyingGlass" class="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </template>
          </Input>
          <TransitionGroup
            name="ul"
            tag="ul"
            :class="classUl"
            ref="selectItems"
            data-select-list-items
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @leave="onLeave">
            <template v-if="dataSelect?.length">
              <template
                v-for="row in renderRows"
                :key="row.type === 'group' ? `g:${row.label}` : `${row.item[keySelect]}`">
                <!-- ISSUE 3 — non-selectable group-header (compound <SelectGroup>) -->
                <li v-if="row.type === 'group'" data-select-group role="presentation" :class="classGroupHeader">
                  {{ row.label }}
                </li>
                <li
                  v-else
                  data-select-list-item
                  :tabindex="activeItem === row.index ? 0 : -1"
                  :data-index="row.index"
                  :aria-disabled="row.disabled ? 'true' : undefined"
                  :class="[classLiItem, row.disabled ? classOptionDisabled : '']"
                  @click="row.disabled ? null : select(row.item)">
                  <slot name="item" :item="row.item" :key="valueSelect" :isQuery="isQuery && !!query">
                    <slot
                      name="marker"
                      :item="row.item"
                      :query="query"
                      :isQuery="isQuery && !!query"
                      :valueKey="valueSelect ?? null">
                      <div :class="classItemSelectValue">
                        <template v-if="isQuery && query">
                          <template v-for="(part, pi) in markerParts(row.item)" :key="pi">
                            <mark v-if="part.mark" :class="classMaskQuery">{{ part.text }}</mark>
                            <template v-else>{{ part.text }}</template>
                          </template>
                        </template>
                        <template v-else>{{ valueSelect ? row.item[valueSelect] : row.item }}</template>
                      </div>
                    </slot>
                  </slot>
                  <span
                    v-if="visibleValue?.find((i) => i[keySelect] === row.item[keySelect])"
                    data-select-check
                    :class="iconCheck">
                    <Icons type="Check" class="w-5 h-5" />
                  </span>
                </li>
              </template>
              <slot v-if="!dataList?.length" name="empty" :noData="noData" :query="query" :hasData="true">
                <div :class="classDataListNoData">{{ noData }}</div>
              </slot>
            </template>
            <slot v-else name="empty" :noData="noData" :query="query" :hasData="false">
              <div :class="classNoData">{{ noData }}</div>
            </slot>
          </TransitionGroup>
          <div data-select-aria-live class="sr-only" aria-live="polite" aria-atomic="true">
            {{ ariaResultsLabel }}
          </div>
        </div>
      </FixWindow>
      <slot />
    </template>
    <template #before>
      <slot v-if="slots.before" name="before" />
    </template>
    <template #after>
      <slot v-if="slots.after" name="after" />
    </template>
  </InputLayout>
</template>

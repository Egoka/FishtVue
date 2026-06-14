<script setup lang="ts">
  import { computed, onMounted, onUnmounted, reactive, ref, unref, useId, watch } from "vue"
  import { isClient } from "fishtvue/utils/domHandler"
  import { deepCopyObject, deepMergeSoft } from "fishtvue/utils/objectHandler"
  import type { StyleClass } from "fishtvue/types"
  import type { CursorType, Panel, SplitEmits, SplitProps } from "./Split"
  import Icons from "fishtvue/icons/Icons.vue"
  import Component from "fishtvue/component"

  // ---BASE-COMPONENT----------------------
  const Split = new Component<"Split">()
  const options = Split.getOptions()
  // SSR-safe уникальный префикс для id панелей (aria-controls на separator)
  const uid = useId()
  const panelDomId = (name: Panel["name"]) => `${uid}-split-${name}`

  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<SplitProps>(), {
    separatorNotHoverOpacity: undefined
  })
  const emit = defineEmits<SplitEmits>()

  // ---REF-LINK----------------------------
  let splitObserver: ResizeObserver | undefined
  // teardown window-listeners активного drag (см. startResizePanel) — снимается на stop/unmount
  let stopGlobalDragListeners: (() => void) | null = null
  const resizableGroup = ref<HTMLElement>()
  const resizablePanels = ref<Record<string, HTMLElement>>({})

  // ---STATE-------------------------------
  const sizePanels = reactive<Record<Panel["name"], number>>({})
  const cursorPanels = reactive<Record<Panel["name"], CursorType>>({})
  const activeCursorPanel = ref<CursorType>("center")
  const previousContainerSize = ref<number>(0)

  // ---PROPS-------------------------------
  const units = computed<SplitProps["units"]>(() => props.units ?? "percentages")
  const panels = computed<Panel[]>(() => {
    const panelsValue = unref(props.panels) ?? []
    return (
      panelsValue
        ?.filter((item) => !item?.hidden)
        ?.map((item) => {
          if (item?.size && (typeof item?.size as string) === "string" && +item?.size > 0) item.size = +item.size
          if (item?.minSize && (typeof item?.minSize as string) === "string" && +item?.minSize > 0)
            item.minSize = +item.minSize
          if (item?.maxSize && (typeof item?.maxSize as string) === "string" && +item?.maxSize > 0)
            item.maxSize = +item.maxSize
          if (item?.minSize && item?.maxSize && item?.minSize > item?.maxSize) item.maxSize = item?.minSize
          if (item?.minSize || item?.maxSize) {
            if (item?.size && item?.maxSize && item?.size > item?.maxSize) {
              item.size = item?.maxSize
            } else if (item?.size && item?.minSize && item?.size < item?.minSize) {
              item.size = item?.minSize
            } else if (item?.maxSize && item?.minSize && !item.size) {
              if (panelsValue?.filter((item) => !item?.hidden)?.length > 1)
                item.size = item?.minSize + (item?.maxSize - item?.minSize) / 2
              else item.size = item?.maxSize
            }
          }
          return item
        }) ?? []
    )
  })
  const direction = computed<SplitProps["direction"]>(
    () => (props?.direction as SplitProps["direction"]) ?? "horizontal"
  )
  const separatorType = computed<NonNullable<SplitProps["separatorType"]>>(
    () => (props?.separatorType as SplitProps["separatorType"]) ?? options?.separatorType ?? "strip"
  )
  const separatorNotHoverOpacity = computed<SplitProps["separatorNotHoverOpacity"]>(
    () => props?.separatorNotHoverOpacity ?? options?.separatorNotHoverOpacity
  )

  // ---STYLE-------------------------------
  const styles = computed<SplitProps["styles"]>(() =>
    deepMergeSoft<NonNullable<SplitProps["styles"]>>(deepCopyObject(options?.styles), deepCopyObject(props?.styles))
  )

  const separatorClass = ref<StyleClass>([
    // B10: forced-colors:outline сохраняет разделитель видимым в Windows high-contrast (bg-* там сбрасывается)
    "relative flex w-px items-center justify-center bg-gray-200 dark:bg-gray-800 forced-colors:outline",
    "touch-none select-none",
    "after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2 after:z-10",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1",
    "data-[direction=vertical]:h-px data-[direction=vertical]:w-full data-[direction=vertical]:after:left-0 data-[direction=vertical]:after:h-3 data-[direction=vertical]:after:w-full data-[direction=vertical]:after:-translate-y-1/2 data-[direction=vertical]:after:translate-x-0",
    styles.value?.separator ? (styles.value.separator as string) : ""
  ])

  const separatorIconClass = computed<StyleClass>(() => [
    "split z-10 inset-y-0 flex items-center justify-center",
    separatorNotHoverOpacity.value ? "" : "motion-safe:transition-opacity motion-safe:duration-500 opacity-0",
    direction.value === "vertical" ? "rotate-90" : ""
  ])

  const classBase = computed<StyleClass>(() =>
    Split.setStyle([
      "h-full w-full motion-safe:transition-all",
      options?.class ?? "",
      props?.class ?? "",
      "flex data-[direction=vertical]:flex-col"
    ])
  )

  // overlay покрывает весь viewport во время drag — задаёт глобальный cursor без мутации document.body (Issue 1)
  const classDragOverlay = computed<StyleClass>(() =>
    Split.setStyle(["fixed inset-0 z-[9999]", getStyleCursor(activeCursorPanel.value)])
  )

  const classPanelBody = (panel: Panel) =>
    Split.setStyle([
      "overflow-hidden w-full",
      styles.value && styles.value?.panel ? styles.value?.panel : "",
      panel.class,
      "relative"
    ])

  const classSeparator = (panel: Panel) =>
    Split.setStyle([separatorClass.value, isClient() ? getStyleCursor(cursorPanels[panel.name]) : "", "group"])

  const classSeparatorStrip = (panel: Panel) =>
    Split.setStyle([
      separatorIconClass.value,
      separatorNotHoverOpacity.value ? "" : resizablePanel.value === panel.name && isClient() ? "opacity-100" : ""
    ])

  // B10: грип-акцент через preset-aware токен theme-* (был hardcode bg-neutral-*)
  const classSeparatorStripStyle = ref(Split.setStyle("h-8 w-1.5 bg-theme-300 dark:bg-theme-700 rounded-full"))
  const classSeparatorIcon = (panel: Panel) =>
    Split.setStyle([
      separatorIconClass.value,
      separatorNotHoverOpacity.value ? "" : resizablePanel.value === panel.name && isClient() ? "opacity-100" : "",
      "h-4 w-3 rounded-sm bg-theme-300 dark:bg-theme-700"
    ])

  const classSeparatorHexagonStyle = ref(Split.setStyle("h-2.5 w-2.5 bg-theme-300 dark:bg-theme-700"))
  const classSeparatorDisabled = ref(Split.setStyle([separatorClass.value, "group"]))

  // ---FOCUS-------------------------------
  // G34: программный фокус на первый resize handle (separator tabindex=0) — зеркало Button/Pagination focus()
  function focus() {
    if (!isClient() || !resizableGroup.value) return
    resizableGroup.value.querySelector<HTMLElement>("[data-split-separator]")?.focus()
  }

  // ---EXPOSE------------------------------
  defineExpose({
    // ---REF-LINK----------------------------
    resizableGroup,
    resizablePanels,
    // ---STATE-------------------------------
    sizePanels,
    cursorPanels,
    activeCursorPanel,
    // ---PROPS-------------------------
    units,
    panels,
    direction,
    separatorType,
    separatorNotHoverOpacity,
    styles,
    classBase,
    // ---METHODS-----------------------------
    focus
  })
  // ---MOUNT-UNMOUNT-----------------------
  // initStyle() регистрируется автоматически в Component.__hooks() (dev-patterns §2) — не дублируем здесь
  // на сервере считаем initial sizes сразу; на клиенте — в onMounted, когда resizableGroup забинжен
  // (для units="pixels" getDefaultSize требует offsetWidth контейнера — в setup он ещё 0)
  if (!isClient()) updatePanels()
  onMounted(() => {
    if (!isClient()) return
    setCursorPanels(panels.value)
    restoreSizes()
    updatePanels()
    if (resizableGroup.value) {
      splitObserver = new ResizeObserver(() => updatePanels())
      splitObserver.observe(resizableGroup.value)
    }
  })

  onUnmounted(() => {
    // снять window-listeners drag, если компонент размонтировали во время active resize
    stopGlobalDragListeners?.()
    if (isClient() && splitObserver && resizableGroup.value) {
      splitObserver.unobserve(resizableGroup.value)
      splitObserver.disconnect()
    }
  })

  // ---WATCHERS----------------------------
  watch(
    () => unref(props.panels),
    (array) => {
      const defaultSize = getDefaultSize(panels.value)
      Object.assign(
        sizePanels,
        Object.fromEntries(new Map(array.map((panel) => [panel.name, panel.size ?? defaultSize])))
      )
    },
    {
      deep: true
    }
  )

  // ---METHODS-----------------------------
  function updatePanels() {
    if (units.value === "pixels" && resizableGroup.value) {
      // Get current container size
      const currentContainerSize =
        direction.value === "horizontal" ? resizableGroup.value.offsetWidth : resizableGroup.value.offsetHeight

      // Calculate sum of current sizes of all panels (not hidden and not disabled)
      const totalCurrentSize = panels.value
        .filter((panel) => !panel.hidden && !panel.disabled)
        .reduce((sum, panel) => sum + (sizePanels[panel.name] ?? panel.size ?? 0), 0)

      // If previous size was saved and current total size is greater than 0
      if (
        previousContainerSize.value > 0 &&
        totalCurrentSize > 0 &&
        currentContainerSize !== previousContainerSize.value
      ) {
        const sizeDifference = currentContainerSize - previousContainerSize.value

        // Get list of panels that can be recalculated
        const resizablePanelsList = panels.value.filter((panel) => {
          if (panel.hidden || panel.disabled) return false

          const currentSize = sizePanels[panel.name] ?? panel.size ?? 0

          // On increase: exclude panels that reached maxSize
          if (sizeDifference > 0) {
            if (typeof panel.maxSize === "number" && panel.maxSize > 0) {
              if (currentSize >= panel.maxSize) return false
            }
          }
          // On decrease: exclude panels that reached minSize (already at minimum)
          else if (sizeDifference < 0) {
            if (typeof panel.minSize === "number" && panel.minSize > 0) {
              if (currentSize <= panel.minSize) return false
            }
          }

          return true
        })

        // Calculate sum of sizes of panels that can be recalculated
        const resizableTotalSize = resizablePanelsList.reduce(
          (sum, panel) => sum + (sizePanels[panel.name] ?? panel.size ?? 0),
          0
        )

        // If there are panels to recalculate and their sum is greater than 0
        if (resizablePanelsList.length > 0 && resizableTotalSize > 0) {
          // Recalculate sizes proportionally
          resizablePanelsList.forEach((panel) => {
            const currentSize = sizePanels[panel.name] ?? panel.size ?? 0
            const proportionalSize = (currentSize / resizableTotalSize) * sizeDifference
            let newSize = currentSize + proportionalSize

            // Apply minSize and maxSize constraints
            if (typeof panel.minSize === "number" && panel.minSize > 0) {
              newSize = Math.max(newSize, panel.minSize)
            }
            if (typeof panel.maxSize === "number" && panel.maxSize > 0) {
              newSize = Math.min(newSize, panel.maxSize)
            }

            sizePanels[panel.name] = newSize
          })

          // Check and adjust sum of sizes of all panels
          const newTotalSize = panels.value
            .filter((panel) => !panel.hidden && !panel.disabled)
            .reduce((sum, panel) => sum + (sizePanels[panel.name] ?? 0), 0)

          const sizeDiscrepancy = currentContainerSize - newTotalSize

          // If there is a discrepancy, distribute it among panels that can still be adjusted
          if (Math.abs(sizeDiscrepancy) > 0.1 && resizablePanelsList.length > 0) {
            const adjustablePanels = resizablePanelsList.filter((panel) => {
              const currentSize = sizePanels[panel.name] ?? 0
              if (sizeDiscrepancy > 0) {
                // On increase: exclude panels that reached maxSize
                if (typeof panel.maxSize === "number" && panel.maxSize > 0) {
                  return currentSize < panel.maxSize
                }
              } else {
                // On decrease: exclude panels that reached minSize
                if (typeof panel.minSize === "number" && panel.minSize > 0) {
                  return currentSize > panel.minSize
                }
              }
              return true
            })

            if (adjustablePanels.length > 0) {
              const adjustableTotalSize = adjustablePanels.reduce(
                (sum, panel) => sum + (sizePanels[panel.name] ?? 0),
                0
              )

              if (adjustableTotalSize > 0) {
                adjustablePanels.forEach((panel) => {
                  const currentSize = sizePanels[panel.name] ?? 0
                  const proportionalAdjustment = (currentSize / adjustableTotalSize) * sizeDiscrepancy
                  let adjustedSize = currentSize + proportionalAdjustment

                  // Apply minSize and maxSize constraints
                  if (typeof panel.minSize === "number" && panel.minSize > 0) {
                    adjustedSize = Math.max(adjustedSize, panel.minSize)
                  }
                  if (typeof panel.maxSize === "number" && panel.maxSize > 0) {
                    adjustedSize = Math.min(adjustedSize, panel.maxSize)
                  }

                  sizePanels[panel.name] = adjustedSize
                })
              }
            }
          }
        }

        // Update previous container size
        previousContainerSize.value = currentContainerSize
      } else {
        // First initialization or initialization for panels without sizes
        Object.assign(
          sizePanels,
          Object.fromEntries(
            new Map(
              panels.value.map((panel) => [
                panel.name,
                sizePanels[panel.name] ?? panel.size ?? getDefaultSize(panels.value)
              ])
            )
          )
        )
        // Save current container size
        previousContainerSize.value = currentContainerSize
      }
    } else {
      // For percentages - standard logic
      Object.assign(
        sizePanels,
        Object.fromEntries(
          new Map(
            panels.value.map((panel) => [
              panel.name,
              sizePanels[panel.name] ?? panel.size ?? getDefaultSize(panels.value)
            ])
          )
        )
      )
      // For percentages also save size for consistency
      if (resizableGroup.value) {
        previousContainerSize.value =
          direction.value === "horizontal" ? resizableGroup.value.offsetWidth : resizableGroup.value.offsetHeight
      }
    }
  }
  function setItemRef(el: HTMLElement, namePanel: Panel["name"]) {
    if (isClient()) {
      resizablePanels.value[namePanel] = el
    }
  }

  function setCursorPanels(array: Panel[]) {
    Object.assign(
      cursorPanels,
      Object.fromEntries(new Map(array.map((panel) => [panel.name, cursorPanels[panel.name] ?? "center"])))
    )
  }

  function getDefaultSize(array: Panel[]) {
    const fullSizeSplit =
      units.value === "pixels"
        ? direction.value === "horizontal"
          ? (resizableGroup.value?.offsetWidth ?? 0)
          : (resizableGroup.value?.offsetHeight ?? 0)
        : 100
    const totalDefinedSize = array.reduce((sum, panel) => sum + (panel?.size && panel?.size > 0 ? panel?.size : 0), 0)
    const countNotDefinedSize = array.reduce((sum, panel) => sum + (panel?.size && panel?.size > 0 ? 0 : 1), 0)
    return (fullSizeSplit - totalDefinedSize) / countNotDefinedSize
  }

  function getStyleCursor(cursor: CursorType) {
    switch (cursor) {
      case "center":
        return direction.value === "horizontal"
          ? "cursor-col-resize"
          : direction.value === "vertical"
            ? "cursor-row-resize"
            : ""
      case "right":
        return direction.value === "horizontal"
          ? "cursor-e-resize"
          : direction.value === "vertical"
            ? "cursor-s-resize"
            : ""
      case "left":
        return direction.value === "horizontal"
          ? "cursor-w-resize"
          : direction.value === "vertical"
            ? "cursor-n-resize"
            : ""
    }
  }

  // F31: для horizontal в RTL drag/keyboard считают пиксели от другого края — движок знает rtl:, но математику флипаем тут
  function isRtlHorizontal() {
    return (
      direction.value === "horizontal" &&
      isClient() &&
      !!resizableGroup.value &&
      getComputedStyle(resizableGroup.value).direction === "rtl"
    )
  }

  // ---PERSISTENCE-------------------------
  const storageKey = () => `fv-split-${props.autoSaveName}`

  function persistSizes() {
    if (!isClient() || !props.autoSaveName) return
    try {
      localStorage.setItem(storageKey(), JSON.stringify(sizePanels))
    } catch {
      // localStorage может быть недоступен (quota / private mode) — persistence не критична
    }
  }

  function restoreSizes() {
    if (!isClient() || !props.autoSaveName) return
    try {
      const raw = localStorage.getItem(storageKey())
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== "object") return
      panels.value.forEach((panel) => {
        const value = (parsed as Record<string, unknown>)[panel.name]
        if (typeof value !== "number" || !(value >= 0)) return
        let size = value
        if (typeof panel.maxSize === "number" && panel.maxSize > 0) size = Math.min(size, panel.maxSize)
        if (typeof panel.minSize === "number" && panel.minSize > 0) size = Math.max(size, panel.minSize)
        sizePanels[panel.name] = size
      })
    } catch {
      // повреждённые данные в localStorage игнорируем — остаются initial sizes
    }
  }

  // ---KEYBOARD-RESIZE---------------------
  function keyboardResize(namePanel: Panel["name"], delta: number) {
    const idx = panels.value.findIndex((p) => p.name === namePanel)
    const cur = panels.value[idx]
    const next = panels.value[idx + 1]
    if (!cur || !next || cur.disabled || next.disabled) return
    const curOld = sizePanels[cur.name] ?? 0
    const nextOld = sizePanels[next.name] ?? 0
    let d = delta
    // cur растёт на d
    if (d > 0 && typeof cur.maxSize === "number" && cur.maxSize > 0) d = Math.min(d, cur.maxSize - curOld)
    if (d < 0 && typeof cur.minSize === "number" && cur.minSize > 0) d = Math.max(d, cur.minSize - curOld)
    // next уменьшается на d
    if (d > 0 && typeof next.minSize === "number" && next.minSize > 0) d = Math.min(d, nextOld - next.minSize)
    if (d < 0 && typeof next.maxSize === "number" && next.maxSize > 0) d = Math.max(d, nextOld - next.maxSize)
    // ни одна панель не уходит ниже нуля
    if (d > 0) d = Math.min(d, nextOld)
    if (d < 0) d = Math.max(d, -curOld)
    if (d === 0) return
    sizePanels[cur.name] = curOld + d
    sizePanels[next.name] = nextOld - d
    emit("updated-panels", sizePanels)
    emit("updated-size-panel", sizePanels[cur.name], cur.name)
    persistSizes()
  }

  function onSeparatorKeydown(event: KeyboardEvent, namePanel: Panel["name"]) {
    if (!isClient()) return
    const step = event.shiftKey ? 50 : 10
    const horizontal = direction.value === "horizontal"
    const rtl = isRtlHorizontal()
    const nextKey = horizontal ? (rtl ? "ArrowLeft" : "ArrowRight") : "ArrowDown"
    const prevKey = horizontal ? (rtl ? "ArrowRight" : "ArrowLeft") : "ArrowUp"
    if (event.key === nextKey) {
      event.preventDefault()
      keyboardResize(namePanel, step)
    } else if (event.key === prevKey) {
      event.preventDefault()
      keyboardResize(namePanel, -step)
    } else if (event.key === "Home") {
      event.preventDefault()
      keyboardResize(namePanel, -1e9)
    } else if (event.key === "End") {
      event.preventDefault()
      keyboardResize(namePanel, 1e9)
    }
  }

  // ---RESIZE-PANELS-----------------------
  function resizePanel($event: MouseEvent, namePanel: Panel["name"]) {
    if (!isClient() || !resizableGroup.value || !resizablePanels.value[namePanel]) return
    //------------------
    const getNewSize = (panel: Panel, oldSize: number, addedSize: number): number => {
      if (
        (typeof panel.maxSize === "number" && panel.maxSize > 0) ||
        (typeof panel.minSize === "number" && panel.minSize > 0)
      ) {
        if (oldSize + addedSize > (panel.maxSize as number)) {
          return panel.maxSize as number
        } else if (oldSize + addedSize < (panel.minSize as number)) {
          return panel.minSize as number
        }
      }
      if (oldSize + addedSize > 0) {
        return oldSize + addedSize
      }
      return 0
    }
    const updateAddedDistance = (panel: Panel, addedSize: number, oldSize: number): number => {
      if (
        (typeof panel.maxSize === "number" && panel.maxSize > 0) ||
        (typeof panel.minSize === "number" && panel.minSize > 0)
      ) {
        if (oldSize + addedSize > (panel.maxSize as number)) {
          return oldSize + addedSize - (panel.maxSize as number)
        } else if (oldSize + addedSize < (panel.minSize as number)) {
          return oldSize + addedSize - (panel.minSize as number)
        }
      }
      if (-addedSize - oldSize > 0) {
        return -(-addedSize - oldSize)
      }
      return 0
    }
    const addedDistanceToSum = (panel: Panel, added: number): number =>
      added > 0
        ? sizePanels[panel.name] - (panel?.minSize ?? 0)
        : (sizePanels[panel.name] - (panel?.maxSize ?? 0)) * (panel?.maxSize ? -1 : 1)
    const setAddedDistance = (added: number, sum: number, oppositeSum: number, realSum: number): number =>
      added > 0
        ? added > sum
          ? sum > oppositeSum
            ? oppositeSum
            : sum
          : added > oppositeSum
            ? oppositeSum > 0
              ? oppositeSum
              : added
            : added
        : -added > sum
          ? sum > 0
            ? -sum
            : realSum === sum
              ? added
              : -sum
          : added
    //------------------
    const group = resizableGroup.value?.getBoundingClientRect()
    const panel = resizablePanels.value[namePanel]?.getBoundingClientRect()
    const indexNamePanel = panels.value.findIndex((item) => item.name === namePanel)
    //------------------
    let addedDistance =
      direction.value === "horizontal"
        ? isRtlHorizontal()
          ? panel.x - $event.clientX
          : $event.clientX - panel.x - panel.width
        : $event.clientY - panel.y - panel.height
    addedDistance = units.value === "percentages" ? addedDistance / ((group?.width ?? 0) / 100) : addedDistance
    //------------------
    let rightAddedDistance = addedDistance * -1
    let leftAddedDistance = addedDistance
    //------------------
    let sumLeftPanels = 0
    let indexLastLeft = 0
    for (let i = indexNamePanel; i >= 0; i--) {
      if (panels.value[i].disabled) break
      sumLeftPanels += addedDistanceToSum(panels.value[i], rightAddedDistance)
      indexLastLeft = i
    }
    let sumRightPanels = 0
    let indexRightLeft = panels.value.length - 1
    for (let i = indexNamePanel + 1; i < panels.value.length; i++) {
      if (panels.value[i].disabled) break
      sumRightPanels += addedDistanceToSum(panels.value[i], leftAddedDistance)
      indexRightLeft = i
    }
    //------------------
    rightAddedDistance = setAddedDistance(
      rightAddedDistance,
      sumLeftPanels,
      sumRightPanels,
      sizePanels[panels.value[indexLastLeft].name]
    )
    leftAddedDistance = setAddedDistance(
      leftAddedDistance,
      sumRightPanels,
      sumLeftPanels,
      sizePanels[panels.value[indexRightLeft].name]
    )
    //------------------
    if (rightAddedDistance === 0) {
      cursorPanels[namePanel] = addedDistance < 0 ? "right" : addedDistance > 0 ? "left" : "center"
    } else if (leftAddedDistance === 0) {
      cursorPanels[namePanel] = addedDistance > 0 ? "left" : addedDistance < 0 ? "right" : "center"
    } else {
      cursorPanels[namePanel] = "center"
    }
    activeCursorPanel.value = cursorPanels[namePanel]
    //------------------
    for (let i = indexNamePanel + 1; i < panels.value.length; i++) {
      if (panels.value[i]?.disabled || panels.value[i - 1]?.disabled) break
      if (rightAddedDistance < 0 && sizePanels[panels.value[i].name] === (panels.value[i]?.minSize ?? 0)) continue
      const oldSize = sizePanels[panels.value[i].name]
      sizePanels[panels.value[i].name] = getNewSize(panels.value[i], oldSize, rightAddedDistance)
      rightAddedDistance = updateAddedDistance(panels.value[i], rightAddedDistance, oldSize)
      if (rightAddedDistance === 0) break
    }
    //------------------
    for (let i = indexNamePanel; i >= 0; i--) {
      if (panels.value[i]?.disabled || panels.value[i + 1]?.disabled) break
      if (leftAddedDistance < 0 && sizePanels[panels.value[i].name] === (panels.value[i]?.minSize ?? 0)) continue
      const oldSize = sizePanels[panels.value[i].name]
      sizePanels[panels.value[i].name] = getNewSize(panels.value[i], oldSize, leftAddedDistance)
      leftAddedDistance = updateAddedDistance(panels.value[i], leftAddedDistance, oldSize)
      if (leftAddedDistance === 0) break
    }
  }

  // ---ON-RESIZE-PANELS--------------------
  const resizablePanel = ref<Panel["name"] | null>(null)
  const isStartResize = ref<boolean>(false)
  const isStartMove = ref<boolean>(false)

  function startResizePanel($event: PointerEvent, namePanel: Panel["name"]) {
    if (!isClient()) return
    resizablePanel.value = namePanel
    isStartResize.value = true
    // pointerId === 0 — валидный id (touch/pen), поэтому проверяем именно != null, а не truthy
    if ($event.target instanceof HTMLElement && $event.pointerId != null)
      ($event.target as HTMLElement).setPointerCapture($event.pointerId)
    // safety-net: завершить drag, даже если pointerup/pointercancel пришёл вне separator
    // (курсор ушёл за пределы компонента/viewport) — иначе overlay с cursor-*-resize залипает
    const onWindowEnd = (event: Event) => stopResizePanel(event as PointerEvent, namePanel)
    window.addEventListener("pointerup", onWindowEnd)
    window.addEventListener("pointercancel", onWindowEnd)
    stopGlobalDragListeners = () => {
      window.removeEventListener("pointerup", onWindowEnd)
      window.removeEventListener("pointercancel", onWindowEnd)
      stopGlobalDragListeners = null
    }
    emit("start-resize-panel", $event, namePanel)
  }

  function stopResizePanel($event: PointerEvent, namePanel?: Panel["name"]) {
    if (!isClient()) return
    // идемпотентность: при release внутри компонента separator @pointerup и window-safety-net
    // могут вызвать stop дважды — второй вызов не должен повторно эмитить/писать persistence
    if (!isStartResize.value) return
    stopGlobalDragListeners?.()
    if ($event.target instanceof HTMLElement && $event.pointerId != null)
      $event.target.releasePointerCapture($event.pointerId)
    isStartResize.value = false
    if (!isStartMove.value) resizablePanel.value = null
    persistSizes()
    emit("stop-resize-panel", $event, namePanel as Panel["name"])
  }

  function moveResizePanel($event: PointerEvent, namePanel: Panel["name"]) {
    if (!isClient()) return
    isStartMove.value = true
    if (!isStartResize.value) resizablePanel.value = namePanel
    emit("move-resize-panel", $event, namePanel)
    if (!isStartResize.value) return
    resizePanel($event, namePanel)
    emit("updated-panels", sizePanels)
    emit("updated-size-panel", sizePanels[namePanel], namePanel)
  }

  function outResizePanel($event: PointerEvent, namePanel: Panel["name"]) {
    if (!isClient()) return
    isStartMove.value = false
    if (!isStartResize.value) resizablePanel.value = null
    emit("out-resize-panel", $event, namePanel)
  }
</script>

<template>
  <div
    data-split
    ref="resizableGroup"
    :class="classBase"
    :data-direction="direction"
    :data-name="props.autoSaveName ?? null"
    :data-units="units ?? null">
    <template v-for="(panel, key) in panels" :key="key">
      <div
        data-split-item
        :id="panelDomId(panel.name)"
        :ref="(el) => setItemRef(el as HTMLElement, panel.name)"
        :class="classPanelBody(panel)"
        :data-name="panel.name"
        :data-size="sizePanels[panel.name]"
        :style="`flex: ${units === 'percentages' ? (sizePanels?.[panel.name] ?? '0') : '0'} 1 ${units === 'pixels' ? sizePanels[panel.name] + 'px' : '0px'}`">
        <slot :name="panel.name" :size="sizePanels[panel.name]" :panel="panel" />
      </div>
      <div
        v-if="!(panel.disabled || panels[key + 1]?.disabled) && key !== panels?.length - 1"
        data-split-separator
        role="separator"
        tabindex="0"
        :class="classSeparator(panel)"
        :data-direction="direction"
        :data-unit="units"
        :data-now="sizePanels[panel.name]"
        :data-max="panel.maxSize"
        :data-min="panel.minSize"
        :aria-orientation="direction"
        :aria-controls="panelDomId(panel.name)"
        :aria-valuenow="Math.round(sizePanels[panel.name] ?? panel.size ?? 0)"
        :aria-valuemax="panel.maxSize"
        :aria-valuemin="panel.minSize"
        data-panel-resize-handle-enabled="true"
        @pointerdown="startResizePanel($event, panel.name)"
        @pointermove="moveResizePanel($event, panel.name)"
        @pointerup="stopResizePanel($event, panel.name)"
        @pointercancel="stopResizePanel($event, panel.name)"
        @pointerout="outResizePanel($event, panel.name)"
        @keydown="onSeparatorKeydown($event, panel.name)">
        <div v-if="separatorType === 'strip'" data-split-separator-strip :class="classSeparatorStrip(panel)">
          <div :class="classSeparatorStripStyle"></div>
        </div>
        <div v-else data-split-separator-icon :class="classSeparatorIcon(panel)">
          <svg
            v-if="separatorType === 'hexagon'"
            width="15"
            height="15"
            viewBox="0 0 15 15"
            xmlns="http://www.w3.org/2000/svg"
            :class="classSeparatorHexagonStyle">
            <path
              d="M5.5 4.625C6.12132 4.625 6.625 4.12132 6.625 3.5C6.625 2.87868 6.12132 2.375 5.5 2.375C4.87868 2.375 4.375 2.87868 4.375 3.5C4.375 4.12132 4.87868 4.625 5.5 4.625ZM9.5 4.625C10.1213 4.625 10.625 4.12132 10.625 3.5C10.625 2.87868 10.1213 2.375 9.5 2.375C8.87868 2.375 8.375 2.87868 8.375 3.5C8.375 4.12132 8.87868 4.625 9.5 4.625ZM10.625 7.5C10.625 8.12132 10.1213 8.625 9.5 8.625C8.87868 8.625 8.375 8.12132 8.375 7.5C8.375 6.87868 8.87868 6.375 9.5 6.375C10.1213 6.375 10.625 6.87868 10.625 7.5ZM5.5 8.625C6.12132 8.625 6.625 8.12132 6.625 7.5C6.625 6.87868 6.12132 6.375 5.5 6.375C4.87868 6.375 4.375 6.87868 4.375 7.5C4.375 8.12132 4.87868 8.625 5.5 8.625ZM10.625 11.5C10.625 12.1213 10.1213 12.625 9.5 12.625C8.87868 12.625 8.375 12.1213 8.375 11.5C8.375 10.8787 8.87868 10.375 9.5 10.375C10.1213 10.375 10.625 10.8787 10.625 11.5ZM5.5 12.625C6.12132 12.625 6.625 12.1213 6.625 11.5C6.625 10.8787 6.12132 10.375 5.5 10.375C4.87868 10.375 4.375 10.8787 4.375 11.5C4.375 12.1213 4.87868 12.625 5.5 12.625Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd" />
          </svg>
          <Icons
            v-else
            :type="separatorType"
            :class="['h-2.5 w-2.5 text-theme-500', direction === 'vertical' ? 'rotate-90' : '']" />
        </div>
      </div>
      <div
        v-else-if="key !== panels?.length - 1"
        data-split-separator-disabled
        role="separator"
        aria-disabled="true"
        :aria-orientation="direction"
        :class="classSeparatorDisabled" />
    </template>
    <div v-if="isStartResize" data-split-drag-overlay :class="classDragOverlay" />
  </div>
</template>

<script setup lang="ts">
  import { computed, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from "vue"
  import Component from "fishtvue/component"
  import { isClient } from "fishtvue/utils/domHandler"
  import { useStyle } from "fishtvue/theme"
  import { useVirtualScroll, type VirtualItemSize } from "./useVirtualScroll"
  import type { VirtualScrollerProps, VirtualScrollerEmits, VirtualScrollerScrollDirection } from "./VirtualScroller"

  // ---BASE-COMPONENT----------------------
  const VirtualScroller = new Component<"VirtualScroller">()
  const options = VirtualScroller.getOptions()

  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<VirtualScrollerProps>(), {
    items: () => []
  })
  const emit = defineEmits<VirtualScrollerEmits>()

  // ---OPTIONS-RESOLUTION (props → componentsOptions → defaults) ---
  const items = computed<any[]>(() => props.items ?? [])
  const itemSizeResolved = computed<VirtualItemSize>(() => props.itemSize ?? options?.itemSize ?? "auto")
  const estimatedItemSize = computed<number>(() => props.estimatedItemSize ?? options?.estimatedItemSize ?? 40)
  const orientation = computed(() => props.orientation ?? options?.orientation ?? "vertical")
  const overscan = computed<number>(() => props.overscan ?? options?.overscan ?? 6)
  const threshold = computed<number>(() => props.threshold ?? options?.threshold ?? 100)
  const delay = computed<number>(() => props.delay ?? options?.delay ?? 0)
  const lazy = computed<boolean>(() => props.lazy ?? false)
  const appendOnly = computed<boolean>(() => props.appendOnly ?? false)
  const loading = computed<boolean>(() => props.loading ?? false)
  const showLoader = computed<boolean>(() => props.showLoader ?? false)
  const scrollbarMode = computed(() => props.scrollbar ?? options?.scrollbar ?? "macos")

  const isHorizontal = computed(() => orientation.value === "horizontal")
  const isGrid = computed(() => orientation.value === "both")

  // ---STATE-------------------------------
  const viewportRef = ref<HTMLElement>()
  const contentRef = ref<HTMLElement>()
  const mounted = ref(false)
  const scrollTop = ref(0)
  const scrollLeft = ref(0)
  const viewportH = ref(0)
  const viewportW = ref(0)
  const isScrolling = ref(false)

  // Grid: размер ячейки (px) — для `both` itemSize должен быть числом, иначе fallback на estimated.
  const gridCell = computed<number>(() =>
    typeof itemSizeResolved.value === "number" ? (itemSizeResolved.value as number) : estimatedItemSize.value
  )
  const columns = computed<number>(() =>
    isGrid.value ? Math.max(1, Math.floor((viewportW.value || gridCell.value) / gridCell.value)) : 1
  )
  // Единица виртуализации: строка (grid) либо элемент.
  const unitCount = computed<number>(() =>
    isGrid.value ? Math.ceil(items.value.length / columns.value) : items.value.length
  )
  const axisViewport = computed<number>(() => (isHorizontal.value ? viewportW.value : viewportH.value))
  const axisScroll = computed<number>(() => (isHorizontal.value ? scrollLeft.value : scrollTop.value))

  const isVirtual = computed(() => items.value.length > threshold.value)
  const ready = computed(() => mounted.value && axisViewport.value > 0)
  const useWindow = computed(() => isVirtual.value && ready.value)

  // ---CORE (headless windowing) ----------
  const vs = useVirtualScroll({
    count: () => unitCount.value,
    itemSize: () => (isGrid.value ? gridCell.value : itemSizeResolved.value),
    estimatedItemSize: () => estimatedItemSize.value,
    overscan: () => overscan.value,
    viewportSize: () => axisViewport.value,
    scrollOffset: () => axisScroll.value,
    enabled: () => isVirtual.value,
    getItem: (i: number) => items.value[i]
  })

  // Эффективный диапазон единиц: окно (ready) / SSR-slice / полный.
  const range = computed(() => {
    let start: number
    let end: number
    if (useWindow.value) {
      start = vs.range.value.start
      end = vs.range.value.end
    } else if (isVirtual.value) {
      start = 0
      end = Math.min(unitCount.value, threshold.value)
    } else {
      start = 0
      end = unitCount.value
    }
    if (appendOnly.value) start = 0
    return { start, end }
  })

  const topPad = computed(() => (useWindow.value ? vs.getOffset(range.value.start) : 0))
  const bottomPad = computed(() => (useWindow.value ? vs.totalSize.value - vs.getOffset(range.value.end) : 0))

  function isUnitActive(unit: number): boolean {
    if (!useWindow.value) return true
    const top = axisScroll.value
    const bottom = top + axisViewport.value
    return vs.getOffset(unit) < bottom && vs.getOffset(unit + 1) > top
  }

  // Видимые элементы (с абсолютным индексом и флагом active).
  const visibleItems = computed(() => {
    const arr = items.value
    const out: Array<{ item: any; index: number; active: boolean }> = []
    if (isGrid.value) {
      const cols = columns.value
      for (let row = range.value.start; row < range.value.end; row++) {
        const active = isUnitActive(row)
        for (let col = 0; col < cols; col++) {
          const index = row * cols + col
          if (index < arr.length) out.push({ item: arr[index], index, active })
        }
      }
    } else {
      for (let i = range.value.start; i < range.value.end; i++)
        out.push({ item: arr[i], index: i, active: isUnitActive(i) })
    }
    return out
  })

  // ---STYLES------------------------------
  const classBase = computed(() => VirtualScroller.setStyle(["relative"]))

  const resolvedHeight = computed(() =>
    props.scrollHeight == null
      ? undefined
      : typeof props.scrollHeight === "number"
        ? `${props.scrollHeight}px`
        : props.scrollHeight
  )
  const resolvedWidth = computed(() =>
    props.scrollWidth == null
      ? undefined
      : typeof props.scrollWidth === "number"
        ? `${props.scrollWidth}px`
        : props.scrollWidth
  )

  const viewportStyle = computed<CSSProperties>(() => {
    const s: CSSProperties = { position: "relative" }
    if (isHorizontal.value) {
      s.overflowX = "auto"
      s.overflowY = "hidden"
    } else if (isGrid.value) {
      s.overflow = "auto"
    } else {
      s.overflowY = "auto"
      s.overflowX = "hidden"
    }
    if (resolvedHeight.value != null) s.height = resolvedHeight.value
    if (resolvedWidth.value != null) s.width = resolvedWidth.value
    return s
  })

  const contentStyle = computed<CSSProperties>(() => {
    if (isGrid.value) return { display: "grid", gridTemplateColumns: `repeat(${columns.value}, ${gridCell.value}px)` }
    if (isHorizontal.value) return { display: "flex", flexDirection: "row" }
    return {}
  })

  function padStyle(px: number): CSSProperties {
    if (isGrid.value) return { height: `${px}px`, gridColumn: "1 / -1" }
    if (isHorizontal.value) return { width: `${px}px`, flex: "0 0 auto" }
    return { height: `${px}px` }
  }
  const spacerTopStyle = computed(() => padStyle(topPad.value))
  const spacerBottomStyle = computed(() => padStyle(bottomPad.value))

  const getItemOptions = (index: number) => ({
    index,
    active: isUnitActive(isGrid.value ? Math.floor(index / columns.value) : index)
  })

  const loaderLabel = computed(() => VirtualScroller.t("virtualScroller.loading"))

  // ---SCROLL HANDLING --------------------
  let scrollingTimer: ReturnType<typeof setTimeout> | undefined
  let emitTimer: ReturnType<typeof setTimeout> | undefined
  let pendingScroll: { scrollTop: number; scrollLeft: number; direction: VirtualScrollerScrollDirection } | null = null
  let lazyEmittedAt = -1
  let ro: ResizeObserver | undefined

  function measureViewport(): void {
    const el = viewportRef.value
    if (!el) return
    viewportH.value = el.clientHeight || 0
    viewportW.value = el.clientWidth || 0
  }

  function markScrolling(): void {
    isScrolling.value = true
    if (scrollingTimer) clearTimeout(scrollingTimer)
    scrollingTimer = setTimeout(() => (isScrolling.value = false), 600)
  }

  function scheduleScrollEmit(payload: {
    scrollTop: number
    scrollLeft: number
    direction: VirtualScrollerScrollDirection
  }): void {
    pendingScroll = payload
    if (delay.value > 0) {
      if (emitTimer) return
      emitTimer = setTimeout(() => {
        emitTimer = undefined
        if (pendingScroll) emit("scroll", pendingScroll)
      }, delay.value)
    } else {
      emit("scroll", payload)
    }
  }

  function maybeLazy(): void {
    if (!lazy.value || loading.value || !useWindow.value) return
    const n = items.value.length
    if (n === 0) return
    if (range.value.end >= unitCount.value - overscan.value) {
      if (lazyEmittedAt === n) return
      lazyEmittedAt = n
      emit("lazy-load", { first: range.value.start, last: range.value.end })
    }
  }

  function onScroll(): void {
    const el = viewportRef.value
    if (!el) return
    measureViewport()
    const top = el.scrollTop || 0
    const left = el.scrollLeft || 0
    const direction: VirtualScrollerScrollDirection = isHorizontal.value
      ? left > scrollLeft.value
        ? "right"
        : "left"
      : top > scrollTop.value
        ? "down"
        : "up"
    scrollTop.value = top
    scrollLeft.value = left
    markScrolling()
    scheduleScrollEmit({ scrollTop: top, scrollLeft: left, direction })
    maybeLazy()
    syncMeasure()
  }

  // Замер реальных размеров для itemSize="auto" + anti-jump.
  function syncMeasure(): void {
    if (itemSizeResolved.value !== "auto" || !useWindow.value) return
    const content = contentRef.value
    const el = viewportRef.value
    if (!content || !el) return
    const start = range.value.start
    const anchor = Math.min(unitCount.value, start + overscan.value)
    const kids = Array.from(content.children).filter((c) => {
      const e = c as HTMLElement
      return !e.hasAttribute("data-vs-spacer") && !e.hasAttribute("data-vs-loader")
    })
    let aboveDelta = 0
    kids.forEach((c, k) => {
      const e = c as HTMLElement
      const index = start + k
      const size = isHorizontal.value ? e.offsetWidth : e.offsetHeight
      if (size > 0) {
        const d = vs.measure(index, size)
        if (index < anchor) aboveDelta += d
      }
    })
    if (aboveDelta && !appendOnly.value) {
      if (isHorizontal.value) {
        el.scrollLeft += aboveDelta
        scrollLeft.value = el.scrollLeft
      } else {
        el.scrollTop += aboveDelta
        scrollTop.value = el.scrollTop
      }
    }
  }

  // ---SCROLLBAR (raw CSS, two-mode macOS) ---
  // `::-webkit-scrollbar` — псевдоэлемент, не выразим Tailwind-утилитами через setStyle().
  // Инжектится один раз через useStyle() (precedent: config/baseStyle.ts). Толщина меняется
  // визуально через border thumb'а (no-reflow, постоянная ширина трека). Transition — только
  // motion-safe (@media prefers-reduced-motion: no-preference).
  function ensureScrollbarStyles(): void {
    if (!isClient() || (window as any).__fvVirtualScrollerScrollbar) return
    ;(window as any).__fvVirtualScrollerScrollbar = true
    useStyle(SCROLLBAR_CSS, { name: "VirtualScrollerScrollbar" })
  }

  // ---LIFECYCLE---------------------------
  onMounted(() => {
    mounted.value = true
    ensureScrollbarStyles()
    measureViewport()
    if (typeof ResizeObserver !== "undefined" && viewportRef.value) {
      ro = new ResizeObserver(() => measureViewport())
      ro.observe(viewportRef.value)
    }
  })

  onBeforeUnmount(() => {
    ro?.disconnect()
    ro = undefined
    if (scrollingTimer) clearTimeout(scrollingTimer)
    if (emitTimer) clearTimeout(emitTimer)
  })

  // Сброс lazy-гейта при смене длины данных (новые данные пришли — можно снова догружать).
  watch(
    () => items.value.length,
    (n) => {
      if (lazyEmittedAt !== n) lazyEmittedAt = -1
    }
  )

  // scroll-index-change на смену видимого диапазона.
  watch(
    () => [range.value.start, range.value.end] as const,
    ([s, e], [ps, pe]) => {
      if (s !== ps || e !== pe) emit("scroll-index-change", { first: s, last: e })
    }
  )

  // ---METHODS-----------------------------
  function applyScroll(off: number, behavior: ScrollBehavior): void {
    const el = viewportRef.value
    if (!el) return
    if (isHorizontal.value) {
      el.scrollTo?.({ left: off, behavior })
      el.scrollLeft = off
      scrollLeft.value = off
    } else {
      el.scrollTo?.({ top: off, behavior })
      el.scrollTop = off
      scrollTop.value = off
    }
  }
  function unitOf(index: number): number {
    return isGrid.value ? Math.floor(index / columns.value) : index
  }
  function scrollTo(opts: ScrollToOptions): void {
    viewportRef.value?.scrollTo?.(opts)
  }
  function scrollToIndex(index: number, behavior: ScrollBehavior = "auto"): void {
    applyScroll(vs.scrollOffsetForIndex(unitOf(index), "to-start"), behavior)
  }
  function scrollInView(
    index: number,
    to: "to-start" | "to-end" | "auto" = "auto",
    behavior: ScrollBehavior = "auto"
  ): void {
    applyScroll(vs.scrollOffsetForIndex(unitOf(index), to), behavior)
  }
  function getRenderedRange() {
    return { first: range.value.start, last: range.value.end }
  }
  function refresh(): void {
    vs.refresh()
  }

  // ---EXPOSE------------------------------
  defineExpose({
    isVirtual,
    orientation,
    scrollbar: scrollbarMode,
    overscan,
    threshold,
    delay,
    estimatedItemSize,
    classBase,
    viewportRef,
    scrollTo,
    scrollToIndex,
    scrollInView,
    getRenderedRange,
    refresh
  })

  const SCROLLBAR_CSS = `
[data-vs-viewport]{scrollbar-width:thin;scrollbar-color:var(--vs-thumb,rgba(120,120,120,.5)) transparent}
[data-vs-viewport][data-vs-scrollbar="hidden"]{scrollbar-width:none}
[data-vs-viewport][data-vs-scrollbar="native"]{scrollbar-width:auto;scrollbar-color:auto}
[data-vs-viewport]::-webkit-scrollbar{width:10px;height:10px;background:transparent}
[data-vs-viewport]::-webkit-scrollbar-thumb{background-color:var(--vs-thumb,rgba(120,120,120,.5));background-clip:padding-box;border:3px solid transparent;border-radius:9999px;opacity:0}
@media (prefers-reduced-motion: no-preference){[data-vs-viewport]::-webkit-scrollbar-thumb{transition:opacity .2s ease,border-width .15s ease}}
[data-vs-viewport][data-vs-scrollbar="thin"]::-webkit-scrollbar-thumb{opacity:.4}
[data-vs-viewport][data-vs-scrollbar="macos"]:hover::-webkit-scrollbar-thumb,[data-vs-viewport][data-vs-scrollbar="macos"][data-scrolling]::-webkit-scrollbar-thumb,[data-vs-viewport][data-vs-scrollbar="thin"]:hover::-webkit-scrollbar-thumb,[data-vs-viewport][data-vs-scrollbar="thin"][data-scrolling]::-webkit-scrollbar-thumb{opacity:.6;border-width:1px}
[data-vs-viewport][data-vs-scrollbar="hidden"]::-webkit-scrollbar{display:none}
[data-vs-viewport][data-vs-scrollbar="native"]::-webkit-scrollbar{width:auto;height:auto}
[data-vs-viewport][data-vs-scrollbar="native"]::-webkit-scrollbar-thumb{opacity:1;border:0;background-clip:border-box}
`.trim()
</script>

<template>
  <div data-virtual-scroller :class="[classBase, props.class]">
    <slot name="header" />
    <div
      ref="viewportRef"
      data-vs-viewport
      role="presentation"
      :data-vs-scrollbar="scrollbarMode"
      :data-scrolling="isScrolling || undefined"
      :style="viewportStyle"
      @scroll="onScroll">
      <div ref="contentRef" data-vs-content role="presentation" :class="props.classContent" :style="contentStyle">
        <div v-if="topPad > 0" data-vs-spacer="top" aria-hidden="true" :style="spacerTopStyle" />
        <slot
          v-if="$slots.content"
          name="content"
          :items="visibleItems.map((v) => v.item)"
          :first="range.start"
          :last="range.end"
          :style-content="contentStyle"
          :get-item-options="getItemOptions" />
        <template v-else>
          <slot
            v-for="vi in visibleItems"
            :key="vi.index"
            name="item"
            :item="vi.item"
            :index="vi.index"
            :active="vi.active" />
        </template>
        <div v-if="bottomPad > 0" data-vs-spacer="bottom" aria-hidden="true" :style="spacerBottomStyle" />
        <div v-if="showLoader && loading" data-vs-loader role="status" :aria-label="loaderLabel">
          <slot name="loader" :index="items.length">
            <div data-vs-loader-default aria-hidden="true" />
          </slot>
        </div>
      </div>
    </div>
    <slot name="footer" />
  </div>
</template>

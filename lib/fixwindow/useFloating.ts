import { computed, onScopeDispose, ref, toValue, watch, type ComputedRef, type MaybeRefOrGetter, type Ref } from "vue"
import { isClient, getParentNode } from "fishtvue/utils/domHandler"

// ---------------------------------------------------------------------------
// Собственный движок позиционирования FixWindow (замена @floating-ui/vue).
// Чистое геометрическое ядро `computePosition` (DOM-free, Vue-free) + реактивная
// обёртка `useFloating` (rects через getBoundingClientRect, autoUpdate listeners).
// Полный паритет: placement + offset + flip + shift + autoUpdate, RTL, fixed/absolute.
// ---------------------------------------------------------------------------

/** Прямоугольник в координатах (px). Совместим с `DOMRect` по `x/y/width/height`. */
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

/** Физическая сторона размещения относительно reference. */
export type Side = "top" | "bottom" | "left" | "right"
/** Выравнивание вдоль cross-оси (логическое для inline-осей при RTL). */
export type Alignment = "start" | "end" | null
/** Стратегия CSS-позиционирования. */
export type Strategy = "absolute" | "fixed"

/**
 * Placement в нотации Floating UI: сторона + опц. `-start`/`-end`.
 * `center`-Position (FixWindow) мапится снаружи в `"top"` (см. `positionToPlacement`).
 */
export type Placement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  | "left-start"
  | "left-end"
  | "right-start"
  | "right-end"

/** Конфиг чистого ядра `computePosition`. */
export interface ComputePositionConfig {
  /** Желаемый placement (до flip). */
  placement: Placement
  /** Стратегия — влияет на вычитание `offsetParent` (см. `offsetParent`). */
  strategy: Strategy
  /** Смещение по main-оси (px) — это `translatePx` (НЕ marginPx). */
  offset: number
  /** Внутренний отступ от границы для flip/shift (px) — это `paddingWindow`. */
  padding: number
  /** RTL-документ: зеркалит inline-alignment (start↔end) для top/bottom. */
  rtl: boolean
  /** Граница для flip/shift: viewport (fixed) или rect scroll-контейнера (absolute). */
  boundary: Rect
  /** Rect offsetParent (только absolute) — его `{x,y}` вычитается из результата. */
  offsetParent?: Rect | null
}

/** Результат ядра: координаты + фактический placement (после flip). */
export interface ComputePositionResult {
  x: number
  y: number
  placement: Placement
}

// ---PURE HELPERS------------------------------------------------------------

/** Сторона placement. */
export function getSide(placement: Placement): Side {
  return placement.split("-")[0] as Side
}

/** Выравнивание placement (`null` для не-выровненных). */
export function getAlignment(placement: Placement): Alignment {
  const a = placement.split("-")[1]
  return a === "start" || a === "end" ? a : null
}

/** Противоположная сторона (для flip). */
export function oppositeSide(side: Side): Side {
  return ({ top: "bottom", bottom: "top", left: "right", right: "left" } as const)[side]
}

/** `true` если main-ось горизонтальна (left/right). */
export function isHorizontalSide(side: Side): boolean {
  return side === "left" || side === "right"
}

/**
 * Зеркалит inline-alignment при RTL. Зеркалим только когда cross-ось — inline
 * (side top/bottom); для left/right (cross-ось — block) alignment не меняется.
 */
export function mirrorAlignment(placement: Placement, rtl: boolean): Alignment {
  const alignment = getAlignment(placement)
  if (!rtl || alignment === null) return alignment
  if (isHorizontalSide(getSide(placement))) return alignment
  return alignment === "start" ? "end" : "start"
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/** Значение cross-оси по выравниванию. */
function crossValue(alignment: Alignment, cStart: number, cSize: number, fSize: number): number {
  if (alignment === "start") return cStart
  if (alignment === "end") return cStart + cSize - fSize
  return cStart + (cSize - fSize) / 2
}

/**
 * Базовое размещение floating-border-box относительно reference (без flip/shift).
 * `physicalAlignment` уже учитывает RTL (см. `mirrorAlignment`).
 */
export function placeFloating(
  side: Side,
  physicalAlignment: Alignment,
  reference: Rect,
  floating: Rect,
  offset: number
): { x: number; y: number } {
  if (isHorizontalSide(side)) {
    // main-ось — X; cross-ось — Y
    const x = side === "left" ? reference.x - floating.width - offset : reference.x + reference.width + offset
    const y = crossValue(physicalAlignment, reference.y, reference.height, floating.height)
    return { x, y }
  }
  // main-ось — Y; cross-ось — X
  const y = side === "top" ? reference.y - floating.height - offset : reference.y + reference.height + offset
  const x = crossValue(physicalAlignment, reference.x, reference.width, floating.width)
  return { x, y }
}

/** Превышение границы (`boundary − padding`) по main-оси стороны. Положительное = overflow. */
function mainOverflow(side: Side, coords: { x: number; y: number }, f: Rect, boundary: Rect, padding: number): number {
  switch (side) {
    case "top":
      return boundary.y + padding - coords.y
    case "bottom":
      return coords.y + f.height - (boundary.y + boundary.height - padding)
    case "left":
      return boundary.x + padding - coords.x
    case "right":
      return coords.x + f.width - (boundary.x + boundary.width - padding)
  }
}

/**
 * Flip по main-оси: если текущая сторона выходит за `boundary − padding`, пробуем
 * противоположную; меняем только если она overflow-ит МЕНЬШЕ. Возвращает финальную сторону.
 */
export function applyFlip(
  side: Side,
  coords: { x: number; y: number },
  reference: Rect,
  floating: Rect,
  physicalAlignment: Alignment,
  offset: number,
  boundary: Rect,
  padding: number
): { side: Side; x: number; y: number } {
  const curOverflow = mainOverflow(side, coords, floating, boundary, padding)
  if (curOverflow <= 0) return { side, x: coords.x, y: coords.y }
  const opp = oppositeSide(side)
  const oppCoords = placeFloating(opp, physicalAlignment, reference, floating, offset)
  const oppOverflow = mainOverflow(opp, oppCoords, floating, boundary, padding)
  if (oppOverflow < curOverflow) return { side: opp, x: oppCoords.x, y: oppCoords.y }
  return { side, x: coords.x, y: coords.y }
}

/**
 * Shift по cross-оси: clamp в `boundary − padding`; если floating больше доступного
 * места — пин к ближнему краю (`min`). Main-ось и сторона не меняются.
 */
export function applyShift(
  side: Side,
  coords: { x: number; y: number },
  floating: Rect,
  boundary: Rect,
  padding: number
): { x: number; y: number } {
  if (isHorizontalSide(side)) {
    // cross-ось — Y
    const min = boundary.y + padding
    const max = boundary.y + boundary.height - floating.height - padding
    const y = max < min ? min : clamp(coords.y, min, max)
    return { x: coords.x, y }
  }
  // cross-ось — X
  const min = boundary.x + padding
  const max = boundary.x + boundary.width - floating.width - padding
  const x = max < min ? min : clamp(coords.x, min, max)
  return { x, y: coords.y }
}

/**
 * ## computePosition
 * Чистое ядро: rects на вход → координаты на выход. Без DOM/Vue.
 * Порядок: offset → flip → shift. Для `absolute` вычитает `offsetParent.{x,y}`.
 */
export function computePosition(reference: Rect, floating: Rect, config: ComputePositionConfig): ComputePositionResult {
  const { placement, strategy, offset, padding, rtl, boundary, offsetParent } = config
  const side0 = getSide(placement)
  const physAlign = mirrorAlignment(placement, rtl)

  // offset → flip → shift
  const placed = placeFloating(side0, physAlign, reference, floating, offset)
  const flipped = applyFlip(side0, placed, reference, floating, physAlign, offset, boundary, padding)
  let coords = applyShift(flipped.side, { x: flipped.x, y: flipped.y }, floating, boundary, padding)

  // absolute: координаты относительно offsetParent
  if (strategy === "absolute" && offsetParent) {
    coords = { x: coords.x - offsetParent.x, y: coords.y - offsetParent.y }
  }

  // placement в логической нотации: фактическая сторона + исходное (логическое) выравнивание
  const align = getAlignment(placement)
  const finalPlacement = (align ? `${flipped.side}-${align}` : flipped.side) as Placement
  return { x: coords.x, y: coords.y, placement: finalPlacement }
}

// ---REACTIVE WRAPPER--------------------------------------------------------

/** Reference: реальный элемент или virtual (только `getBoundingClientRect`). */
export type ReferenceElement = HTMLElement | { getBoundingClientRect(): DOMRect } | null | undefined
/** Floating: реальный DOM-элемент. */
export type FloatingElement = HTMLElement | null | undefined

/** Опции реактивной обёртки `useFloating`. */
export interface UseFloatingOptions {
  placement: MaybeRefOrGetter<Placement>
  strategy: MaybeRefOrGetter<Strategy>
  /** main-ось offset (`translatePx`). */
  offset: MaybeRefOrGetter<number>
  /** отступ границы (`paddingWindow`). */
  padding: MaybeRefOrGetter<number>
  /** scroll-контейнер для absolute-стратегии. */
  scrollableEl?: MaybeRefOrGetter<HTMLElement | Element | null | undefined>
  /** гейт autoUpdate (whileElementsMounted): трекинг только когда открыто. */
  open?: MaybeRefOrGetter<boolean>
}

/** Публичный контракт `useFloating` (форма совместима с прежней деструктуризацией SFC). */
export interface UseFloatingReturn {
  /** Координата X (null до первого расчёта / когда закрыто → SFC рендерит `"auto"`). */
  x: Ref<number | null>
  /** Координата Y (null до первого расчёта / когда закрыто). */
  y: Ref<number | null>
  /** Фактический placement (после flip). */
  placement: ComputedRef<Placement>
  /** Текущая стратегия. */
  strategy: ComputedRef<Strategy>
  /** Императивный пересчёт позиции (backward-compat `updatePosition()`). */
  update: () => void
}

/** `Rect` из `DOMRect`-подобного объекта (x/y или left/top). */
function rectOf(
  r: DOMRect | { x?: number; y?: number; left?: number; top?: number; width: number; height: number }
): Rect {
  return { x: r.x ?? r.left ?? 0, y: r.y ?? r.top ?? 0, width: r.width, height: r.height }
}

/** Viewport-граница для `fixed` (layout viewport, как в дофлоат-каноне FixWindow). */
function viewportRect(): Rect {
  return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
}

/** Является ли узел собственным scroll-контейнером (overflow auto/scroll/overlay). */
function isScrollable(el: HTMLElement): boolean {
  const s = getComputedStyle(el)
  return /(auto|scroll|overlay)/.test(s.overflow + s.overflowX + s.overflowY)
}

/** scroll-родители узла (overflow-предки) + `window`. */
function getScrollParents(node: ReferenceElement | FloatingElement): Array<HTMLElement | Window> {
  const result: Array<HTMLElement | Window> = []
  let current: ParentNode | Element | null = node instanceof HTMLElement ? node : null
  while (current && current instanceof HTMLElement) {
    if (isScrollable(current)) result.push(current)
    current = getParentNode(current)
  }
  result.push(window)
  return result
}

/** RTL-детект: `direction === "rtl"` у reference (или `document` для virtual-ref). */
function isRTL(referenceEl: ReferenceElement): boolean {
  if (!isClient()) return false
  const el = referenceEl instanceof HTMLElement ? referenceEl : document.documentElement
  return getComputedStyle(el).direction === "rtl"
}

/**
 * ## useFloating
 * Реактивная обёртка вокруг `computePosition`: читает rects элементов, строит boundary,
 * детектит RTL, подписывается на scroll/resize (autoUpdate-эквивалент) пока открыто.
 */
export function useFloating(
  reference: Ref<ReferenceElement>,
  floating: Ref<FloatingElement>,
  options: UseFloatingOptions
): UseFloatingReturn {
  const x = ref<number | null>(null)
  const y = ref<number | null>(null)
  const resolvedPlacement = ref<Placement>(toValue(options.placement))
  const strategy = computed<Strategy>(() => toValue(options.strategy))
  const placement = computed<Placement>(() => resolvedPlacement.value)

  let cleanup: (() => void) | null = null

  function update(): void {
    if (!isClient()) return
    const refEl = reference.value
    const floatEl = floating.value
    if (!refEl || !floatEl) return
    const refRect = rectOf(refEl.getBoundingClientRect())
    const floatRect = rectOf(floatEl.getBoundingClientRect())

    const strat = toValue(options.strategy)
    let boundary = viewportRect()
    let offsetParent: Rect | null = null
    let adjustX = 0
    let adjustY = 0
    if (strat === "absolute") {
      const sc = toValue(options.scrollableEl) as HTMLElement | undefined
      if (sc) boundary = rectOf(sc.getBoundingClientRect())
      const op = (floatEl as HTMLElement).offsetParent as HTMLElement | null
      if (op) {
        offsetParent = rectOf(op.getBoundingClientRect())
        adjustX = op.scrollLeft - op.clientLeft
        adjustY = op.scrollTop - op.clientTop
      } else if (sc) {
        offsetParent = rectOf(sc.getBoundingClientRect())
      }
    }

    const res = computePosition(refRect, floatRect, {
      placement: toValue(options.placement),
      strategy: strat,
      offset: toValue(options.offset),
      padding: toValue(options.padding),
      rtl: isRTL(refEl),
      boundary,
      offsetParent
    })
    x.value = res.x + adjustX
    y.value = res.y + adjustY
    resolvedPlacement.value = res.placement
  }

  // autoUpdate-эквивалент: scroll всех scroll-родителей + window resize + ResizeObserver.
  function start(): void {
    stop()
    if (!isClient()) return
    update()
    const onChange = () => update()
    const targets = new Set<HTMLElement | Window>([
      ...getScrollParents(reference.value),
      ...getScrollParents(floating.value)
    ])
    for (const t of targets) t.addEventListener("scroll", onChange, { passive: true, capture: true })
    window.addEventListener("resize", onChange)

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onChange)
      if (reference.value instanceof HTMLElement) ro.observe(reference.value)
      if (floating.value instanceof HTMLElement) ro.observe(floating.value)
    }

    cleanup = () => {
      for (const t of targets) t.removeEventListener("scroll", onChange, { capture: true } as EventListenerOptions)
      window.removeEventListener("resize", onChange)
      ro?.disconnect()
    }
  }

  function stop(): void {
    if (cleanup) {
      cleanup()
      cleanup = null
    }
    x.value = null
    y.value = null
  }

  watch(
    () => [reference.value, floating.value, toValue(options.open ?? true)] as const,
    ([refEl, floatEl, open]) => {
      if (refEl && floatEl && open) start()
      else stop()
    },
    { immediate: true, flush: "post" }
  )
  onScopeDispose(stop)

  return { x, y, placement, strategy, update }
}

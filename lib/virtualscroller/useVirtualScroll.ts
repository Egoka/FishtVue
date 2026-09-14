import { computed, ref, toValue, type ComputedRef, type MaybeRefOrGetter } from "vue"

/**
 * Размер элемента вдоль оси виртуализации: фикс. число (px), функция от индекса/элемента,
 * либо `"auto"` (замер через `ResizeObserver` на стороне SFC, прокидывается через `measure()`).
 */
export type VirtualItemSize = number | ((index: number, item?: any) => number) | "auto"

/** Параметры headless-ядра. Каждый вход — `ref`/getter/значение (`MaybeRefOrGetter`). */
export interface UseVirtualScrollParams {
  /** Количество элементов (`items.length`). */
  count: MaybeRefOrGetter<number>
  /** Размер элемента. */
  itemSize: MaybeRefOrGetter<VirtualItemSize>
  /** Оценка размера незамеренных элементов (стабилизирует `total` в `"auto"`/variable). */
  estimatedItemSize: MaybeRefOrGetter<number>
  /** Буфер элементов вне viewport с каждой стороны. */
  overscan: MaybeRefOrGetter<number>
  /** Размер viewport вдоль оси (px). */
  viewportSize: MaybeRefOrGetter<number>
  /** Текущая позиция скролла вдоль оси (px). */
  scrollOffset: MaybeRefOrGetter<number>
  /** Включена ли виртуализация. `false` → отдаётся полный диапазон `{0, n}`. */
  enabled?: MaybeRefOrGetter<boolean>
  /** Доступ к элементу по индексу — для `itemSize(index, item)`. */
  getItem?: (index: number) => any
}

/** Диапазон отрендеренных элементов: `[start, end)`. */
export interface VirtualRange {
  start: number
  end: number
}

/** Публичный контракт composable. */
export interface UseVirtualScrollReturn {
  /** Реактивный видимый диапазон `[start, end)` с учётом overscan. */
  range: ComputedRef<VirtualRange>
  /** Высота/ширина spacer'а до окна (px). */
  topPad: ComputedRef<number>
  /** Высота/ширина spacer'а после окна (px). */
  bottomPad: ComputedRef<number>
  /** Суммарный размер всех элементов (виртуальная высота/ширина). */
  totalSize: ComputedRef<number>
  /** Смещение начала элемента с индексом (prefix-sum / аналитика для fixed). */
  getOffset: (index: number) => number
  /**
   * Записать измеренный размер элемента (`"auto"`-режим). Возвращает дельту размера
   * (`next - prev`) — SFC применяет её к `scrollTop`, если элемент выше текущего `start`
   * (anti-jump). Для не-`"auto"` режимов и при отсутствии изменения возвращает `0`.
   */
  measure: (index: number, size: number) => number
  /** Целевой `scrollOffset`, чтобы элемент стал видимым с заданным выравниванием. */
  scrollOffsetForIndex: (index: number, align?: "to-start" | "to-end" | "auto") => number
  /** Сбросить кэш измеренных размеров и пересчитать модель. */
  refresh: () => void
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}

/** Положительный конечный размер либо fallback (guard против `0`/отрицательных/`NaN`). */
function sizeGuard(v: unknown, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/** Наибольший индекс `i ∈ [0, len-1]` с `arr[i] <= pos`. */
function lastLE(arr: number[], pos: number): number {
  let lo = 0
  let hi = arr.length - 1
  let res = 0
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] <= pos) {
      res = mid
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return res
}

/** Наименьший индекс `i ∈ [0, len-1]` с `arr[i] >= pos` (иначе `len-1`). */
function firstGE(arr: number[], pos: number): number {
  let lo = 0
  let hi = arr.length - 1
  let res = arr.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (arr[mid] >= pos) {
      res = mid
      hi = mid - 1
    } else {
      lo = mid + 1
    }
  }
  return res
}

/**
 * ## useVirtualScroll
 *
 * Headless-ядро виртуализации: offset-модель на prefix-sum + binary search по диапазону.
 * Не зависит от DOM и component instance — пригодно к юнит-тестам и переиспользованию
 * (`VirtualScroller` SFC, в перспективе `Table`/`Select`/`Menu`).
 *
 * - `itemSize: number` — аналитический путь (`offset = i * size`, `start = floor(pos/size)`).
 * - `itemSize: fn` — prefix-sum `offsets`, перестраивается при смене `items`/`itemSize`.
 * - `itemSize: "auto"` — `offsets` из `estimatedItemSize`, реальные размеры пишет `measure()`.
 *
 * Тяжёлая O(n) перестройка `offsets` живёт в computed `model` и **не** триггерится скроллом —
 * на каждый scroll работает только O(log n) `range`.
 */
export function useVirtualScroll(params: UseVirtualScrollParams): UseVirtualScrollReturn {
  const { count, itemSize, estimatedItemSize, overscan, viewportSize, scrollOffset, enabled, getItem } = params

  // Измеренные размеры (`"auto"`-режим). version — триггер реактивности модели.
  const measured = new Map<number, number>()
  const version = ref(0)

  const model = computed(() => {
    version.value // dep: measure()/refresh() инвалидируют модель
    const n = Math.max(0, Math.trunc(toValue(count) || 0))
    const est = sizeGuard(toValue(estimatedItemSize), 1)
    const is = toValue(itemSize)

    if (typeof is === "number") {
      const s = sizeGuard(is, est)
      return { n, est, fixed: s, total: n * s, offsets: null as number[] | null }
    }

    const auto = is === "auto"
    const offsets = new Array<number>(n + 1)
    offsets[0] = 0
    for (let i = 0; i < n; i++) {
      const sz = auto
        ? measured.has(i)
          ? (measured.get(i) as number)
          : est
        : sizeGuard((is as (index: number, item?: any) => number)(i, getItem?.(i)), est)
      offsets[i + 1] = offsets[i] + sz
    }
    return { n, est, fixed: null, total: n > 0 ? offsets[n] : 0, offsets }
  })

  function getOffset(index: number): number {
    const m = model.value
    const i = clamp(Math.trunc(index) || 0, 0, m.n)
    return m.fixed != null ? i * m.fixed : (m.offsets as number[])[i]
  }

  const range = computed<VirtualRange>(() => {
    const m = model.value
    const n = m.n
    if (n === 0) return { start: 0, end: 0 }
    if (toValue(enabled ?? true) === false) return { start: 0, end: n }

    const pos = Math.max(0, toValue(scrollOffset) || 0)
    const vp = Math.max(0, toValue(viewportSize) || 0)
    const ov = Math.max(0, Math.trunc(toValue(overscan) || 0))

    let start: number
    let end: number
    if (m.fixed != null) {
      start = Math.floor(pos / m.fixed)
      end = Math.ceil((pos + vp) / m.fixed)
    } else {
      const offsets = m.offsets as number[]
      start = lastLE(offsets, pos)
      end = firstGE(offsets, pos + vp)
    }
    start = clamp(start - ov, 0, n)
    end = clamp(end + ov, start, n)
    if (end === start && start < n) end = start + 1
    return { start, end }
  })

  const totalSize = computed(() => model.value.total)
  const topPad = computed(() => getOffset(range.value.start))
  const bottomPad = computed(() => model.value.total - getOffset(range.value.end))

  function measure(index: number, size: number): number {
    if (toValue(itemSize) !== "auto") return 0
    const i = Math.trunc(index)
    if (i < 0) return 0
    const est = sizeGuard(toValue(estimatedItemSize), 1)
    const next = sizeGuard(size, est)
    const prev = measured.has(i) ? (measured.get(i) as number) : est
    if (prev === next) return 0
    measured.set(i, next)
    version.value++
    return next - prev
  }

  function scrollOffsetForIndex(index: number, align: "to-start" | "to-end" | "auto" = "to-start"): number {
    const m = model.value
    if (m.n === 0) return 0
    const i = clamp(Math.trunc(index) || 0, 0, m.n - 1)
    const start = getOffset(i)
    const endOff = getOffset(i + 1)
    const vp = Math.max(0, toValue(viewportSize) || 0)
    if (align === "to-end") return Math.max(0, endOff - vp)
    if (align === "auto") {
      const pos = Math.max(0, toValue(scrollOffset) || 0)
      if (start < pos) return start
      if (endOff > pos + vp) return Math.max(0, endOff - vp)
      return pos
    }
    return start
  }

  function refresh(): void {
    measured.clear()
    version.value++
  }

  return { range, topPad, bottomPad, totalSize, getOffset, measure, scrollOffsetForIndex, refresh }
}

import { describe, expect, it } from "vitest"
import { ref } from "vue"
import { useVirtualScroll, type VirtualItemSize } from "fishtvue/virtualscroller/useVirtualScroll"

type Over = {
  count?: number
  itemSize?: VirtualItemSize
  estimatedItemSize?: number
  overscan?: number
  viewportSize?: number
  scrollOffset?: number
  enabled?: boolean
  getItem?: (index: number) => any
}

// Базовые reactive-входы для composable.
function setup(over: Over = {}) {
  const count = ref<number>(over.count ?? 1000)
  const itemSize = ref<VirtualItemSize>(over.itemSize ?? 20)
  const estimatedItemSize = ref<number>(over.estimatedItemSize ?? 40)
  const overscan = ref<number>(over.overscan ?? 0)
  const viewportSize = ref<number>(over.viewportSize ?? 200)
  const scrollOffset = ref<number>(over.scrollOffset ?? 0)
  const enabled = ref<boolean>(over.enabled ?? true)
  const vs = useVirtualScroll({
    count,
    itemSize,
    estimatedItemSize,
    overscan,
    viewportSize,
    scrollOffset,
    enabled,
    getItem: over.getItem
  })
  return { count, itemSize, estimatedItemSize, overscan, viewportSize, scrollOffset, enabled, vs }
}

describe("useVirtualScroll — fixed itemSize", () => {
  it("window slice at scroll=0", () => {
    const { vs } = setup({ itemSize: 20, count: 1000, viewportSize: 200, scrollOffset: 0, overscan: 0 })
    expect(vs.range.value).toEqual({ start: 0, end: 10 })
    expect(vs.totalSize.value).toBe(20000)
    expect(vs.topPad.value).toBe(0)
    expect(vs.bottomPad.value).toBe(19800)
  })

  it("applies overscan buffer on both sides", () => {
    const { vs } = setup({ itemSize: 20, count: 1000, viewportSize: 200, scrollOffset: 400, overscan: 2 })
    expect(vs.range.value).toEqual({ start: 18, end: 32 })
    expect(vs.topPad.value).toBe(360)
    expect(vs.bottomPad.value).toBe(19360)
  })

  it("reacts to scroll offset changes", () => {
    const { scrollOffset, vs } = setup({ itemSize: 20, count: 1000, viewportSize: 200, overscan: 0 })
    expect(vs.range.value.start).toBe(0)
    scrollOffset.value = 1000
    expect(vs.range.value).toEqual({ start: 50, end: 60 })
  })

  it("getOffset is analytic for fixed size", () => {
    const { vs } = setup({ itemSize: 20, count: 1000 })
    expect(vs.getOffset(18)).toBe(360)
    expect(vs.getOffset(0)).toBe(0)
  })
})

describe("useVirtualScroll — variable itemSize (function)", () => {
  const sizeFn = (i: number) => (i < 5 ? 100 : 10)

  it("prefix-sum offsets + binary search slice", () => {
    const { vs } = setup({
      itemSize: sizeFn,
      count: 10,
      estimatedItemSize: 40,
      viewportSize: 250,
      scrollOffset: 0,
      overscan: 0
    })
    expect(vs.totalSize.value).toBe(550)
    expect(vs.range.value).toEqual({ start: 0, end: 3 })
    expect(vs.topPad.value).toBe(0)
    expect(vs.bottomPad.value).toBe(250)
  })

  it("binary search finds correct start/end at mid-scroll", () => {
    const { vs } = setup({ itemSize: sizeFn, count: 10, viewportSize: 250, scrollOffset: 150, overscan: 0 })
    expect(vs.range.value).toEqual({ start: 1, end: 4 })
    expect(vs.topPad.value).toBe(100)
    expect(vs.bottomPad.value).toBe(150)
  })

  it("getOffset reads prefix sums", () => {
    const { vs } = setup({ itemSize: sizeFn, count: 10 })
    expect(vs.getOffset(5)).toBe(500)
    expect(vs.getOffset(10)).toBe(550)
  })
})

describe("useVirtualScroll — auto measure", () => {
  it("measure() patches size, totalSize grows, returns delta", () => {
    const { vs } = setup({ itemSize: "auto", count: 10, estimatedItemSize: 40, viewportSize: 200, overscan: 0 })
    expect(vs.totalSize.value).toBe(400)
    const delta = vs.measure(2, 90)
    expect(delta).toBe(50)
    expect(vs.totalSize.value).toBe(450)
  })

  it("measure on first elements shifts the window math", () => {
    const { vs } = setup({
      itemSize: "auto",
      count: 10,
      estimatedItemSize: 40,
      viewportSize: 200,
      scrollOffset: 0,
      overscan: 0
    })
    vs.measure(0, 100)
    // offsets: [0,100,140,180,220,...]; first offset >= 200 is index 4
    expect(vs.range.value).toEqual({ start: 0, end: 4 })
  })

  it("measure returns 0 when size unchanged", () => {
    const { vs } = setup({ itemSize: "auto", count: 10, estimatedItemSize: 40 })
    expect(vs.measure(0, 40)).toBe(0)
  })

  it("measure is a no-op for non-auto itemSize", () => {
    const { vs } = setup({ itemSize: 20, count: 10 })
    expect(vs.measure(0, 999)).toBe(0)
    expect(vs.totalSize.value).toBe(200)
  })

  it("refresh() clears measured sizes", () => {
    const { vs } = setup({ itemSize: "auto", count: 10, estimatedItemSize: 40 })
    vs.measure(0, 100)
    expect(vs.totalSize.value).toBe(460)
    vs.refresh()
    expect(vs.totalSize.value).toBe(400)
  })
})

describe("useVirtualScroll — scroll-to math", () => {
  it("scrollOffsetForIndex to-start (fixed)", () => {
    const { vs } = setup({ itemSize: 20, count: 1000, viewportSize: 200 })
    expect(vs.scrollOffsetForIndex(50, "to-start")).toBe(1000)
  })

  it("scrollOffsetForIndex to-end (fixed)", () => {
    const { vs } = setup({ itemSize: 20, count: 1000, viewportSize: 200 })
    // offset(51) - viewport = 1020 - 200
    expect(vs.scrollOffsetForIndex(50, "to-end")).toBe(820)
  })

  it("scrollOffsetForIndex auto keeps position when already visible", () => {
    const { vs } = setup({ itemSize: 20, count: 1000, viewportSize: 200, scrollOffset: 980 })
    // item 50 spans [1000,1020); viewport [980,1180) — visible → no change
    expect(vs.scrollOffsetForIndex(50, "auto")).toBe(980)
  })
})

describe("useVirtualScroll — boundaries", () => {
  it("empty list", () => {
    const { vs } = setup({ count: 0 })
    expect(vs.range.value).toEqual({ start: 0, end: 0 })
    expect(vs.totalSize.value).toBe(0)
    expect(vs.topPad.value).toBe(0)
    expect(vs.bottomPad.value).toBe(0)
  })

  it("single element", () => {
    const { vs } = setup({ itemSize: 20, count: 1, viewportSize: 200 })
    expect(vs.range.value).toEqual({ start: 0, end: 1 })
    expect(vs.totalSize.value).toBe(20)
  })

  it("itemSize=0 falls back to estimatedItemSize", () => {
    const { vs } = setup({ itemSize: 0, count: 5, estimatedItemSize: 40 })
    expect(vs.totalSize.value).toBe(200)
  })

  it("negative itemSize falls back to estimatedItemSize", () => {
    const { vs } = setup({ itemSize: -10, count: 5, estimatedItemSize: 40 })
    expect(vs.totalSize.value).toBe(200)
  })

  it("disabled → renders full range", () => {
    const { vs } = setup({ itemSize: 20, count: 1000, viewportSize: 200, scrollOffset: 400, enabled: false })
    expect(vs.range.value).toEqual({ start: 0, end: 1000 })
    expect(vs.topPad.value).toBe(0)
    expect(vs.bottomPad.value).toBe(0)
  })
})

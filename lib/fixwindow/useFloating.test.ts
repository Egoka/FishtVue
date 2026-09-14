import { afterEach, describe, expect, it, vi } from "vitest"
import { effectScope, nextTick, ref } from "vue"
import {
  computePosition,
  getSide,
  getAlignment,
  oppositeSide,
  mirrorAlignment,
  useFloating,
  type Placement,
  type Rect,
  type ComputePositionConfig
} from "fishtvue/fixwindow/useFloating"

const rect = (x: number, y: number, width: number, height: number): Rect => ({ x, y, width, height })

// Большая граница — flip/shift не срабатывают (изолируем placement-математику).
const BIG: Rect = rect(0, 0, 10000, 10000)

const cfg = (over: Partial<ComputePositionConfig> = {}): ComputePositionConfig => ({
  placement: "bottom",
  strategy: "fixed",
  offset: 0,
  padding: 0,
  rtl: false,
  boundary: BIG,
  offsetParent: null,
  ...over
})

// reference: x100 y100 50×20 → right150 bottom120 centerX125 centerY110
const R = rect(100, 100, 50, 20)
// floating: 80×40
const F = rect(0, 0, 80, 40)

describe("useFloating core — pure helpers", () => {
  it("getSide / getAlignment", () => {
    expect(getSide("top-start")).toBe("top")
    expect(getSide("right")).toBe("right")
    expect(getAlignment("top-start")).toBe("start")
    expect(getAlignment("bottom-end")).toBe("end")
    expect(getAlignment("left")).toBeNull()
  })

  it("oppositeSide", () => {
    expect(oppositeSide("top")).toBe("bottom")
    expect(oppositeSide("bottom")).toBe("top")
    expect(oppositeSide("left")).toBe("right")
    expect(oppositeSide("right")).toBe("left")
  })

  it("mirrorAlignment mirrors inline-axis (top/bottom) only under rtl", () => {
    expect(mirrorAlignment("top-start", true)).toBe("end")
    expect(mirrorAlignment("top-end", true)).toBe("start")
    expect(mirrorAlignment("top-start", false)).toBe("start")
    // left/right — cross-ось block, не зеркалится
    expect(mirrorAlignment("left-start", true)).toBe("start")
    expect(mirrorAlignment("left", true)).toBeNull()
  })
})

describe("useFloating core — placement math (offset 0, no flip/shift)", () => {
  it.each<[Placement, number, number]>([
    ["top", 85, 60],
    ["bottom", 85, 120],
    ["left", 20, 90],
    ["right", 150, 90],
    ["top-start", 100, 60],
    ["top-end", 70, 60],
    ["bottom-start", 100, 120],
    ["bottom-end", 70, 120],
    ["left-start", 20, 100],
    ["left-end", 20, 80],
    ["right-start", 150, 100],
    ["right-end", 150, 80]
  ])("places %s at (%i,%i)", (placement, x, y) => {
    const res = computePosition(R, F, cfg({ placement }))
    expect(res.placement).toBe(placement)
    expect(res.x).toBe(x)
    expect(res.y).toBe(y)
  })
})

describe("useFloating core — offset (main-axis only)", () => {
  it.each<[Placement, number, number]>([
    ["top", 85, 50],
    ["bottom", 85, 130],
    ["left", 10, 90],
    ["right", 160, 90]
  ])("offset 10 on %s → (%i,%i)", (placement, x, y) => {
    const res = computePosition(R, F, cfg({ placement, offset: 10 }))
    expect(res.x).toBe(x)
    expect(res.y).toBe(y)
  })
})

describe("useFloating core — flip (main-axis)", () => {
  it("flips top → bottom near top edge", () => {
    const ref = rect(100, 10, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "top" }))
    expect(res.placement).toBe("bottom")
    expect(res.y).toBe(30) // ref.y + ref.h
  })

  it("flips bottom → top near bottom edge", () => {
    const ref = rect(100, 970, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "bottom", boundary: rect(0, 0, 10000, 1000) }))
    expect(res.placement).toBe("top")
    expect(res.y).toBe(930) // ref.y - F.h
  })

  it("flips left → right near left edge", () => {
    const ref = rect(10, 100, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "left" }))
    expect(res.placement).toBe("right")
    expect(res.x).toBe(60) // ref.x + ref.w
  })

  it("keeps the less-overflowing side when BOTH overflow", () => {
    // boundary height 50; top overflow 20 < bottom overflow 30 → keep top
    const ref = rect(100, 20, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "top", boundary: rect(0, 0, 10000, 50) }))
    expect(res.placement).toBe("top")
    expect(res.y).toBe(-20)
  })

  it("preserves alignment across flip (top-start → bottom-start)", () => {
    const ref = rect(100, 10, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "top-start" }))
    expect(res.placement).toBe("bottom-start")
    expect(res.x).toBe(100)
    expect(res.y).toBe(30)
  })
})

describe("useFloating core — shift (cross-axis clamp)", () => {
  it("clamps to the right boundary", () => {
    const ref = rect(180, 100, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "bottom", boundary: rect(0, 0, 200, 10000) }))
    // center x = 165, right edge 245 > 200 → max = 200-80 = 120
    expect(res.x).toBe(120)
    expect(res.y).toBe(120)
  })

  it("clamps to the left boundary", () => {
    const ref = rect(-30, 100, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "bottom", boundary: rect(0, 0, 200, 10000) }))
    expect(res.x).toBe(0)
  })

  it("pins to min when floating is wider than the boundary", () => {
    const ref = rect(180, 100, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "bottom", boundary: rect(0, 0, 50, 10000) }))
    // max = 50-80 = -30 < min 0 → pin to min (0)
    expect(res.x).toBe(0)
  })

  it("honors padding in the clamp", () => {
    const ref = rect(180, 100, 50, 20)
    const res = computePosition(ref, F, cfg({ placement: "bottom", padding: 10, boundary: rect(0, 0, 200, 10000) }))
    // max = 200-80-10 = 110
    expect(res.x).toBe(110)
  })
})

describe("useFloating core — RTL mirroring", () => {
  it("top-start under rtl positions like top-end (placement name stays logical)", () => {
    const res = computePosition(R, F, cfg({ placement: "top-start", rtl: true }))
    expect(res.x).toBe(70) // = top-end x
    expect(res.y).toBe(60)
    expect(res.placement).toBe("top-start")
  })

  it("left-start under rtl is unchanged (block-axis alignment)", () => {
    const res = computePosition(R, F, cfg({ placement: "left-start", rtl: true }))
    expect(res.x).toBe(20)
    expect(res.y).toBe(100)
  })
})

describe("useFloating core — byCursor (0×0 virtual reference)", () => {
  it("centers under the cursor point", () => {
    const cursor = rect(300, 400, 0, 0)
    const res = computePosition(cursor, F, cfg({ placement: "bottom" }))
    expect(res.x).toBe(260) // 300 - 80/2
    expect(res.y).toBe(400)
  })
})

describe("useFloating core — strategy (offsetParent subtraction)", () => {
  it("fixed leaves viewport coords intact", () => {
    const res = computePosition(R, F, cfg({ placement: "bottom", strategy: "fixed", offsetParent: null }))
    expect(res.x).toBe(85)
    expect(res.y).toBe(120)
  })

  it("absolute subtracts offsetParent origin", () => {
    const res = computePosition(
      R,
      F,
      cfg({ placement: "bottom", strategy: "absolute", offsetParent: rect(100, 50, 500, 500), boundary: BIG })
    )
    expect(res.x).toBe(-15) // 85 - 100
    expect(res.y).toBe(70) // 120 - 50
  })
})

// --- Реактивная обёртка (jsdom) ---

const domRect = (x: number, y: number, w: number, h: number) =>
  ({ x, y, width: w, height: h, top: y, left: x, right: x + w, bottom: y + h, toJSON() {} }) as DOMRect

function makeEls(refRect = domRect(100, 100, 50, 20), floatRect = domRect(0, 0, 80, 40)) {
  const refEl = document.createElement("div")
  const floatEl = document.createElement("div")
  document.body.append(refEl, floatEl)
  refEl.getBoundingClientRect = () => refRect
  floatEl.getBoundingClientRect = () => floatRect
  return { refEl, floatEl }
}

const baseOpts = (open: any, over: any = {}) => ({
  placement: () => "bottom" as Placement,
  strategy: () => "fixed" as const,
  offset: () => 0,
  padding: () => 0,
  open,
  ...over
})

describe("useFloating wrapper — lifecycle", () => {
  afterEach(() => {
    document.body.innerHTML = ""
    vi.restoreAllMocks()
  })

  it("x/y are null until open=true, then numeric", async () => {
    const { refEl, floatEl } = makeEls()
    const open = ref(false)
    const scope = effectScope()
    let f: any
    scope.run(() => (f = useFloating(ref(refEl), ref(floatEl), baseOpts(open))))
    await nextTick()
    expect(f.x.value).toBeNull()
    expect(f.y.value).toBeNull()

    open.value = true
    await nextTick()
    expect(typeof f.x.value).toBe("number")
    expect(typeof f.y.value).toBe("number")
    expect(f.y.value).toBe(120) // bottom: ref.y + ref.h
    scope.stop()
  })

  it("update() recomputes after the reference rect changes", async () => {
    let y = 100
    const refEl = document.createElement("div")
    const floatEl = document.createElement("div")
    document.body.append(refEl, floatEl)
    refEl.getBoundingClientRect = () => domRect(100, y, 50, 20)
    floatEl.getBoundingClientRect = () => domRect(0, 0, 80, 40)
    const scope = effectScope()
    let f: any
    scope.run(() => (f = useFloating(ref(refEl), ref(floatEl), baseOpts(ref(true)))))
    await nextTick()
    expect(f.y.value).toBe(120)
    y = 200
    f.update()
    expect(f.y.value).toBe(220)
    scope.stop()
  })

  it("attaches scroll+resize listeners while open and detaches when closed", async () => {
    const addSpy = vi.spyOn(window, "addEventListener")
    const removeSpy = vi.spyOn(window, "removeEventListener")
    const { refEl, floatEl } = makeEls()
    const open = ref(true)
    const scope = effectScope()
    scope.run(() => useFloating(ref(refEl), ref(floatEl), baseOpts(open)))
    await nextTick()
    expect(addSpy.mock.calls.some((c) => c[0] === "resize")).toBe(true)
    expect(addSpy.mock.calls.some((c) => c[0] === "scroll")).toBe(true)

    open.value = false
    await nextTick()
    expect(removeSpy.mock.calls.some((c) => c[0] === "resize")).toBe(true)
    expect(removeSpy.mock.calls.some((c) => c[0] === "scroll")).toBe(true)
    scope.stop()
  })

  it("does not throw when ResizeObserver is unavailable", async () => {
    const orig = globalThis.ResizeObserver
    // @ts-ignore — эмулируем окружение без ResizeObserver
    globalThis.ResizeObserver = undefined
    try {
      const { refEl, floatEl } = makeEls()
      const scope = effectScope()
      let f: any
      expect(() => scope.run(() => (f = useFloating(ref(refEl), ref(floatEl), baseOpts(ref(true)))))).not.toThrow()
      await nextTick()
      expect(typeof f.x.value).toBe("number")
      scope.stop()
    } finally {
      globalThis.ResizeObserver = orig
    }
  })

  it("placement reflects the post-flip side", async () => {
    // reference у верхнего края → bottom-флип
    const { refEl, floatEl } = makeEls(domRect(100, 5, 50, 20), domRect(0, 0, 80, 40))
    const scope = effectScope()
    let f: any
    scope.run(
      () => (f = useFloating(ref(refEl), ref(floatEl), baseOpts(ref(true), { placement: () => "top" as Placement })))
    )
    await nextTick()
    expect(f.placement.value).toBe("bottom")
    scope.stop()
  })

  it("is a no-op when elements are absent (SSR / pre-mount)", async () => {
    const scope = effectScope()
    let f: any
    scope.run(() => (f = useFloating(ref(null), ref(null), baseOpts(ref(true)))))
    await nextTick()
    expect(f.x.value).toBeNull()
    expect(() => f.update()).not.toThrow()
    expect(f.x.value).toBeNull()
    scope.stop()
  })
})

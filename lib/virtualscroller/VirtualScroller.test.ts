import { mount, type VueWrapper } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import { h, nextTick } from "vue"
import FishtVue from "fishtvue/config"
import VirtualScroller from "fishtvue/virtualscroller/VirtualScroller.vue"
import type { VirtualScrollerClassKey, VirtualScrollerExpose } from "fishtvue/virtualscroller/VirtualScroller"

type Row = { id: number; label: string }
const makeItems = (n: number): Row[] => Array.from({ length: n }, (_, i) => ({ id: i, label: `row ${i}` }))

// item-слот: помечаем абсолютный index + active для проверок
const itemSlot = (p: any) =>
  h("div", { class: "vs-row", "data-idx": String(p.index), "data-active": String(p.active) }, p.item.label)

const createAppWithFishtVue = (options: Record<string, any> = {}, extra: Record<string, any> = {}) => ({
  install(app: any) {
    app.use(FishtVue, { componentsOptions: { VirtualScroller: options }, ...extra })
  }
})

// Симуляция layout'а jsdom: clientHeight/scrollTop не вычисляются — подменяем вручную и шлём scroll.
async function drive(
  wrapper: VueWrapper<any>,
  v: { height?: number; width?: number; scrollTop?: number; scrollLeft?: number }
) {
  const el = wrapper.find("[data-vs-viewport]").element as HTMLElement
  if (v.height != null) Object.defineProperty(el, "clientHeight", { configurable: true, value: v.height })
  if (v.width != null) Object.defineProperty(el, "clientWidth", { configurable: true, value: v.width })
  if (v.scrollTop != null)
    Object.defineProperty(el, "scrollTop", { configurable: true, writable: true, value: v.scrollTop })
  if (v.scrollLeft != null)
    Object.defineProperty(el, "scrollLeft", { configurable: true, writable: true, value: v.scrollLeft })
  el.dispatchEvent(new Event("scroll"))
  await nextTick()
}

const rows = (w: VueWrapper<any>) => w.findAll(".vs-row")

afterEach(() => {
  // window.FishtVue — singleton, протекает между файлами Vitest (см. memory)
  delete (window as any).FishtVue
  vi.useRealTimers()
})

describe("VirtualScroller — rendering & threshold", () => {
  it("renders correctly with default props", () => {
    const wrapper = mount(VirtualScroller)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find("[data-virtual-scroller]").exists()).toBe(true)
    expect(wrapper.find("[data-vs-viewport]").exists()).toBe(true)
  })

  it("renders all items when count <= threshold (no virtualization)", () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(5), itemSize: 20 },
      slots: { item: itemSlot }
    })
    expect(rows(wrapper)).toHaveLength(5)
  })

  it("renders SSR-fallback slice [0, threshold] when virtual but not measured", () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(20), itemSize: 20, threshold: 5 },
      slots: { item: itemSlot }
    })
    // virtual (20 > 5), но viewport ещё не измерен → slice min(n, threshold)
    expect(rows(wrapper)).toHaveLength(5)
  })
})

describe("VirtualScroller — windowing", () => {
  it("windows the visible range with overscan once measured", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(1000), itemSize: 20, threshold: 100, overscan: 6 },
      slots: { item: itemSlot }
    })
    await drive(wrapper, { height: 200, scrollTop: 0 })
    // start 0, end ceil(200/20)=10, +overscan 6 → [0,16)
    expect(rows(wrapper)).toHaveLength(16)
  })

  it("reacts to scrollTop and emits scroll + scroll-index-change", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(1000), itemSize: 20, threshold: 100, overscan: 6 },
      slots: { item: itemSlot }
    })
    await drive(wrapper, { height: 200, scrollTop: 0 })
    await drive(wrapper, { height: 200, scrollTop: 400 })
    // start floor(400/20)=20-6=14, end ceil(600/20)=30+6=36 → 22 элемента
    expect(rows(wrapper)).toHaveLength(22)
    expect((rows(wrapper)[0].element as HTMLElement).getAttribute("data-idx")).toBe("14")

    const sic = wrapper.emitted("scroll-index-change") as any[]
    expect(sic.at(-1)?.[0]).toEqual({ first: 14, last: 36 })
    const scroll = wrapper.emitted("scroll") as any[]
    expect(scroll.at(-1)?.[0].scrollTop).toBe(400)
    expect(scroll.at(-1)?.[0].direction).toBe("down")
  })

  it("appendOnly keeps start pinned at 0", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(50), itemSize: 20, threshold: 10, overscan: 2, appendOnly: true },
      slots: { item: itemSlot }
    })
    await drive(wrapper, { height: 200, scrollTop: 400 })
    expect((rows(wrapper)[0].element as HTMLElement).getAttribute("data-idx")).toBe("0")
  })
})

describe("VirtualScroller — lazy load", () => {
  it("emits lazy-load at tail once and not again while loading", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(50), itemSize: 20, threshold: 10, overscan: 6, lazy: true },
      slots: { item: itemSlot }
    })
    await drive(wrapper, { height: 200, scrollTop: 800 }) // конец ленты
    expect((wrapper.emitted("lazy-load") as any[]).length).toBe(1)

    await wrapper.setProps({ loading: true })
    await drive(wrapper, { height: 200, scrollTop: 800 })
    expect((wrapper.emitted("lazy-load") as any[]).length).toBe(1)
  })
})

describe("VirtualScroller — slots", () => {
  it("renders content slot instead of item loop", () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(5), itemSize: 20 },
      slots: {
        item: itemSlot,
        content: (p: any) => h("div", { class: "custom-content" }, `first:${p.first} n:${p.items.length}`)
      }
    })
    expect(wrapper.find(".custom-content").exists()).toBe(true)
    expect(wrapper.find(".custom-content").text()).toContain("first:0")
    expect(rows(wrapper)).toHaveLength(0)
  })

  it("renders loader (custom slot) when loader && loading", () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(5), itemSize: 20, loader: true, loading: true },
      slots: { item: itemSlot, loader: () => h("div", { class: "my-loader" }, "…") }
    })
    expect(wrapper.find("[data-vs-loader]").exists()).toBe(true)
    expect(wrapper.find(".my-loader").exists()).toBe(true)
  })

  it("renders header and footer slots", () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(5), itemSize: 20 },
      slots: {
        item: itemSlot,
        header: () => h("div", { class: "vs-head" }, "H"),
        footer: () => h("div", { class: "vs-foot" }, "F")
      }
    })
    expect(wrapper.find(".vs-head").exists()).toBe(true)
    expect(wrapper.find(".vs-foot").exists()).toBe(true)
  })
})

describe("VirtualScroller — reactivity", () => {
  it("re-renders when items change", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(5), itemSize: 20 },
      slots: { item: itemSlot }
    })
    expect(rows(wrapper)).toHaveLength(5)
    await wrapper.setProps({ items: makeItems(3) })
    expect(rows(wrapper)).toHaveLength(3)
  })

  it("recomputes window when itemSize changes", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(1000), itemSize: 20, threshold: 100, overscan: 0 },
      slots: { item: itemSlot }
    })
    await drive(wrapper, { height: 200, scrollTop: 0 })
    expect(rows(wrapper)).toHaveLength(10) // 200/20
    await wrapper.setProps({ itemSize: 50 })
    await drive(wrapper, { height: 200, scrollTop: 0 })
    expect(rows(wrapper)).toHaveLength(4) // ceil(200/50)
  })
})

describe("VirtualScroller — accessibility", () => {
  it("spacers are aria-hidden and item slot receives absolute index", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(1000), itemSize: 20, threshold: 100, overscan: 6 },
      slots: { item: itemSlot }
    })
    await drive(wrapper, { height: 200, scrollTop: 400 })
    const top = wrapper.find('[data-vs-spacer="top"]')
    expect(top.exists()).toBe(true)
    expect(top.attributes("aria-hidden")).toBe("true")
    expect((rows(wrapper)[0].element as HTMLElement).getAttribute("data-idx")).toBe("14")
  })
})

describe("VirtualScroller — scrollbar", () => {
  it("default mode is macos and marks the viewport", () => {
    const wrapper = mount(VirtualScroller, { props: { items: makeItems(5), itemSize: 20 } })
    expect(wrapper.find("[data-vs-viewport]").attributes("data-vs-scrollbar")).toBe("macos")
  })

  it("respects scrollbar prop (thin / hidden)", () => {
    const thin = mount(VirtualScroller, { props: { items: makeItems(5), itemSize: 20, scrollbar: "thin" } })
    expect(thin.find("[data-vs-viewport]").attributes("data-vs-scrollbar")).toBe("thin")
    const hidden = mount(VirtualScroller, { props: { items: makeItems(5), itemSize: 20, scrollbar: "hidden" } })
    expect(hidden.find("[data-vs-viewport]").attributes("data-vs-scrollbar")).toBe("hidden")
  })

  it("toggles data-scrolling on scroll and clears it after timeout", async () => {
    vi.useFakeTimers()
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(1000), itemSize: 20, threshold: 100 },
      slots: { item: itemSlot }
    })
    await drive(wrapper, { height: 200, scrollTop: 100 })
    expect(wrapper.find("[data-vs-viewport]").attributes("data-scrolling")).toBeDefined()
    vi.advanceTimersByTime(700)
    await nextTick()
    expect(wrapper.find("[data-vs-viewport]").attributes("data-scrolling")).toBeUndefined()
  })
})

describe("VirtualScroller — option resolution", () => {
  it("uses defaults without library init", () => {
    const wrapper = mount(VirtualScroller, { props: { items: makeItems(5) } })
    const vm = wrapper.vm as unknown as VirtualScrollerExpose
    expect(vm.orientation).toBe("vertical")
    expect(vm.scrollbar).toBe("macos")
    expect(vm.overscan).toBe(6)
    expect(vm.threshold).toBe(100)
  })

  it("applies global componentsOptions", () => {
    const app = createAppWithFishtVue({ overscan: 3, scrollbar: "thin", threshold: 50 })
    const wrapper = mount(VirtualScroller, { props: { items: makeItems(5) }, global: { plugins: [app as any] } })
    const vm = wrapper.vm as unknown as VirtualScrollerExpose
    expect(vm.overscan).toBe(3)
    expect(vm.scrollbar).toBe("thin")
    expect(vm.threshold).toBe(50)
  })

  it("local props override global options", () => {
    const app = createAppWithFishtVue({ overscan: 3 })
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(5), overscan: 2 },
      global: { plugins: [app as any] }
    })
    expect((wrapper.vm as unknown as VirtualScrollerExpose).overscan).toBe(2)
  })
})

describe("VirtualScroller — configuration support (unstyled)", () => {
  it("classBase is empty when unstyled", () => {
    const app = createAppWithFishtVue({}, { unstyled: true })
    const wrapper = mount(VirtualScroller, { props: { items: makeItems(5) }, global: { plugins: [app as any] } })
    expect((wrapper.vm as unknown as VirtualScrollerExpose).classBase).toBe("fv")
  })

  it("classBase carries component class when styled", () => {
    const wrapper = mount(VirtualScroller, { props: { items: makeItems(5) } })
    expect((wrapper.vm as unknown as VirtualScrollerExpose).classBase).toContain("fishtvue-virtual-scroller")
  })
})

describe("VirtualScroller — locale", () => {
  it("localizes the loader aria-label (en)", () => {
    const app = createAppWithFishtVue({}, { locale: { activeLocale: "en", defaultLocale: "en" } })
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(3), loader: true, loading: true },
      global: { plugins: [app as any] }
    })
    expect(wrapper.find("[data-vs-loader]").attributes("aria-label")).toBe("Loading…")
  })
})

describe("VirtualScroller — expose methods", () => {
  it("getRenderedRange + scrollToIndex + refresh", async () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: makeItems(1000), itemSize: 20, threshold: 100, overscan: 6 },
      slots: { item: itemSlot }
    })
    await drive(wrapper, { height: 200, scrollTop: 0 })
    const vm = wrapper.vm as unknown as VirtualScrollerExpose
    expect(vm.getRenderedRange()).toEqual({ first: 0, last: 16 })

    vm.scrollToIndex(50)
    await nextTick()
    const r = vm.getRenderedRange()
    expect(r.first).toBeLessThanOrEqual(50)
    expect(r.last).toBeGreaterThanOrEqual(50)
    expect(() => vm.refresh()).not.toThrow()
  })
})

// Контракт props 1.0.0 (dev-patterns §2 A–E): до 1.0.0 `class`/`classContent` клались в DOM
// мимо `setStyle`, поэтому ни `componentsOptions`, ни `unstyled` на них не действовали.
describe("VirtualScroller — контракт props 1.0.0", () => {
  afterEach(() => {
    delete (window as any).FishtVue
  })

  const ITEMS = makeItems(3)

  it("отсутствующие булевы приходят `undefined`, а не скастованными в false", () => {
    const wrapper = mount(VirtualScroller, { props: { items: ITEMS } })

    expect(wrapper.props("lazy")).toBeUndefined()
    expect(wrapper.props("appendOnly")).toBeUndefined()
    expect(wrapper.props("loading")).toBeUndefined()
    expect(wrapper.props("loader")).toBeUndefined()
  })

  it("`class` уходит только на корень и не протекает во внутренние элементы", () => {
    const wrapper = mount(VirtualScroller, {
      props: { items: ITEMS, class: "probe-root", loading: true, loader: true }
    })
    const root = wrapper.find("[data-virtual-scroller]")

    expect(root.classes()).toContain("probe-root")
    expect(root.element.querySelectorAll("[class~='probe-root']")).toHaveLength(0)
  })

  it.each([
    ["viewport", "[data-vs-viewport]"],
    ["content", "[data-vs-content]"],
    ["loader", "[data-vs-loader]"]
  ] as Array<[VirtualScrollerClassKey, string]>)("classes.%s доезжает до своего элемента", (key, selector) => {
    const wrapper = mount(VirtualScroller, {
      props: { items: ITEMS, loading: true, loader: true, classes: { [key]: "probe-key" } }
    })

    expect(wrapper.find(selector).classes()).toContain("probe-key")
    expect(wrapper.find("[data-virtual-scroller]").classes()).not.toContain("probe-key")
  })

  it("корень получает setStyle-префикс — классы компилируются, а не просто попадают в DOM", () => {
    const wrapper = mount(VirtualScroller, { props: { items: ITEMS } })

    expect(wrapper.find("[data-virtual-scroller]").classes()).toContain("fishtvue-virtual-scroller")
  })

  it("componentsOptions.VirtualScroller.class и .classes теперь достижимы", () => {
    const app = createAppWithFishtVue({ class: "opt-root", classes: { content: "opt-content" } })
    const wrapper = mount(VirtualScroller, { props: { items: ITEMS }, global: { plugins: [app] } })

    expect(wrapper.find("[data-virtual-scroller]").classes()).toContain("opt-root")
    expect(wrapper.find("[data-vs-content]").classes()).toContain("opt-content")
  })

  it("props.classes перебивает options.classes, неконфликтный класс options остаётся", () => {
    const app = createAppWithFishtVue({ classes: { content: "p-2 italic" } })
    const wrapper = mount(VirtualScroller, {
      props: { items: ITEMS, classes: { content: "p-8" } },
      global: { plugins: [app] }
    })
    const classes = wrapper.find("[data-vs-content]").classes()

    expect(classes).toContain("p-8")
    expect(classes).not.toContain("p-2")
    expect(classes).toContain("italic")
  })

  it("unstyled сохраняет классы потребителя и режет тему", () => {
    const app = createAppWithFishtVue({}, { unstyled: true })
    const wrapper = mount(VirtualScroller, {
      props: { items: ITEMS, class: "probe-root", classes: { content: "probe-content" } },
      global: { plugins: [app] }
    })

    expect(wrapper.find("[data-virtual-scroller]").classes()).toEqual(["fv", "probe-root"])
    expect(wrapper.find("[data-vs-content]").classes()).toEqual(["fv", "probe-content"])
  })

  it("`throttle` заменил `delay`: options-слой достижим, expose отдаёт новое имя", () => {
    const app = createAppWithFishtVue({ throttle: 120 })
    const wrapper = mount(VirtualScroller, { props: { items: ITEMS }, global: { plugins: [app] } })
    const vm = wrapper.vm as unknown as VirtualScrollerExpose & { delay?: number }

    expect(vm.throttle).toBe(120)
    expect(vm.delay).toBeUndefined()
  })

  it("снятый `showLoader` больше не показывает loader — работает только `loader`", () => {
    const stale = mount(VirtualScroller, {
      props: { items: ITEMS, loading: true, showLoader: true } as any
    })
    expect(stale.find("[data-vs-loader]").exists()).toBe(false)

    const fresh = mount(VirtualScroller, { props: { items: ITEMS, loading: true, loader: true } })
    expect(fresh.find("[data-vs-loader]").exists()).toBe(true)
  })
})

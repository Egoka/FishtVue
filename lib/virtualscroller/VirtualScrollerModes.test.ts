import { mount, flushPromises } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import VirtualScroller from "fishtvue/virtualscroller/VirtualScroller.vue"

/**
 * Режимы и императивный API VirtualScroller (virtualscroller.md Issue 1 — coverage ниже порога).
 *
 * Базовая суита покрывала вертикальный список. Непокрытыми оставались именно те ветки, где
 * ошибка тише всего: grid-раскладка, горизонтальная ось, отложенный `scroll`-эмит, гейт
 * `lazy-load`, методы скролла и снятие слушателей при unmount.
 *
 * jsdom не считает layout — `clientHeight`/`offsetHeight` всегда 0, — поэтому размеры viewport'а
 * подставляются вручную. Это не имитация «как в браузере», а способ довести код до тех же ветвей.
 */
const ITEMS = Array.from({ length: 200 }, (_, i) => ({ id: i, title: `item ${i}` }))

const mounted: Array<{ unmount: () => void }> = []
const patchedProto: string[] = []

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  patchedProto.splice(0).forEach((prop) => delete (HTMLElement.prototype as any)[prop])
  delete (window as any).__fvVirtualScrollerScrollbar
})

/**
 * Монтирует скроллер с измеримым viewport'ом.
 *
 * Размеры подставляются на `HTMLElement.prototype` **до** mount: `measureViewport()` читает
 * `clientHeight`/`clientWidth` уже в `onMounted`, и подмена на самом элементе после монтирования
 * до него не доезжает — окно осталось бы нулевым, а grid не посчитал бы число колонок.
 */
async function mountScroller(props: Record<string, any> = {}, size = { height: 300, width: 400 }) {
  for (const [prop, value] of [
    ["clientHeight", size.height],
    ["clientWidth", size.width]
  ] as const) {
    Object.defineProperty(HTMLElement.prototype, prop, { value, configurable: true })
    patchedProto.push(prop)
  }

  const wrapper = mount(VirtualScroller as any, {
    props: { items: ITEMS, itemSize: 40, height: "300px", ...props },
    slots: { item: "<div class='row'>row</div>" }
  })
  mounted.push(wrapper)
  await flushPromises()

  return { wrapper, viewport: wrapper.find("[data-vs-viewport]").element as HTMLElement }
}

/** Прокручивает viewport и отдаёт управление обработчику. */
async function scrollTo(wrapper: any, viewport: HTMLElement, offset: { top?: number; left?: number }) {
  if (offset.top !== undefined) viewport.scrollTop = offset.top
  if (offset.left !== undefined) viewport.scrollLeft = offset.left
  await wrapper.find("[data-vs-viewport]").trigger("scroll")
  await flushPromises()
}

describe("VirtualScroller — вертикальный режим (базовый)", () => {
  it("виртуализирует список: в DOM попадает окно, а не все 200 строк", async () => {
    const { wrapper } = await mountScroller()
    const rendered = wrapper.findAll(".row").length

    // Обе границы обязательны: проверка «меньше 200» одна проходит и при нуле отрендеренных
    // строк — то есть при полностью сломанном рендере.
    expect(rendered).toBeGreaterThan(0)
    expect(rendered).toBeLessThan(ITEMS.length)
  })

  it("ставит overflow по вертикальной оси", async () => {
    const { wrapper } = await mountScroller()
    const style = wrapper.find("[data-vs-viewport]").attributes("style") ?? ""

    expect(style).toContain("overflow-y: auto")
    expect(style).toContain("overflow-x: hidden")
  })

  it("эмитит scroll с направлением down при прокрутке вниз", async () => {
    const { wrapper, viewport } = await mountScroller()
    await scrollTo(wrapper, viewport, { top: 400 })

    const scrolls = wrapper.emitted("scroll") as any[]
    expect(scrolls?.at(-1)?.[0]).toMatchObject({ direction: "down", scrollTop: 400 })
  })

  it("эмитит scroll-index-change при смене видимого диапазона", async () => {
    const { wrapper, viewport } = await mountScroller()
    await scrollTo(wrapper, viewport, { top: 1200 })

    expect(wrapper.emitted("scroll-index-change")).toBeTruthy()
  })
})

describe("VirtualScroller — горизонтальный режим", () => {
  it("ставит overflow по горизонтальной оси", async () => {
    const { wrapper } = await mountScroller({ orientation: "horizontal", width: "400px" })
    const style = wrapper.find("[data-vs-viewport]").attributes("style") ?? ""

    expect(style).toContain("overflow-x: auto")
    expect(style).toContain("overflow-y: hidden")
  })

  it("раскладывает контент во flex-строку", async () => {
    const { wrapper } = await mountScroller({ orientation: "horizontal", width: "400px" })
    const style = wrapper.find("[data-vs-content]").attributes("style") ?? ""

    expect(style).toContain("display: flex")
    expect(style).toContain("flex-direction: row")
  })

  it("считает направление по горизонтали", async () => {
    const { wrapper, viewport } = await mountScroller({ orientation: "horizontal", width: "400px" })
    await scrollTo(wrapper, viewport, { left: 500 })

    expect((wrapper.emitted("scroll") as any[])?.at(-1)?.[0]).toMatchObject({ direction: "right", scrollLeft: 500 })
  })
})

describe("VirtualScroller — grid-режим", () => {
  it("раскладывает контент в CSS-grid с посчитанным числом колонок", async () => {
    // gridCell = itemSize (число); columns = floor(viewportW / gridCell) = floor(400/100) = 4.
    const { wrapper } = await mountScroller({ orientation: "both", itemSize: 100 }, { height: 300, width: 400 })
    const style = wrapper.find("[data-vs-content]").attributes("style") ?? ""

    expect(style).toContain("display: grid")
    expect(style).toMatch(/repeat\(\d+, 100px\)/)
  })

  it("рендерит несколько элементов на строку", async () => {
    const { wrapper } = await mountScroller({ orientation: "both", itemSize: 100 }, { height: 300, width: 400 })
    // В grid единица виртуализации — строка, поэтому видимых элементов больше, чем строк окна.
    expect(wrapper.findAll(".row").length).toBeGreaterThan(4)
  })

  it("ставит overflow по обеим осям", async () => {
    const { wrapper } = await mountScroller({ orientation: "both", itemSize: 100 })
    expect(wrapper.find("[data-vs-viewport]").attributes("style") ?? "").toContain("overflow: auto")
  })
})

describe("VirtualScroller — отложенный scroll-эмит", () => {
  it("при delay > 0 схлопывает серию событий в одно", async () => {
    vi.useFakeTimers()
    try {
      const { wrapper, viewport } = await mountScroller({ delay: 100 })

      for (const top of [100, 200, 300]) {
        viewport.scrollTop = top
        await wrapper.find("[data-vs-viewport]").trigger("scroll")
      }
      expect(wrapper.emitted("scroll")).toBeUndefined()

      vi.advanceTimersByTime(150)
      await flushPromises()

      const scrolls = wrapper.emitted("scroll") as any[]
      expect(scrolls).toHaveLength(1)
      // Долетает ПОСЛЕДНЕЕ состояние, а не первое — иначе потребитель отставал бы на серию.
      expect(scrolls[0][0].scrollTop).toBe(300)
    } finally {
      vi.useRealTimers()
    }
  })

  it("при delay = 0 эмитит синхронно на каждое событие", async () => {
    const { wrapper, viewport } = await mountScroller({ delay: 0 })
    await scrollTo(wrapper, viewport, { top: 100 })
    await scrollTo(wrapper, viewport, { top: 200 })

    expect((wrapper.emitted("scroll") as any[]).length).toBe(2)
  })
})

describe("VirtualScroller — lazy-load", () => {
  it("эмитит lazy-load при подходе к концу списка", async () => {
    const { wrapper, viewport } = await mountScroller({ lazy: true, threshold: 5, items: ITEMS.slice(0, 20) })
    await scrollTo(wrapper, viewport, { top: 10_000 })

    expect(wrapper.emitted("lazy-load")).toBeTruthy()
  })

  it("не эмитит повторно на той же длине данных", async () => {
    const { wrapper, viewport } = await mountScroller({ lazy: true, threshold: 5, items: ITEMS.slice(0, 20) })
    await scrollTo(wrapper, viewport, { top: 10_000 })
    await scrollTo(wrapper, viewport, { top: 10_100 })

    // Гейт по длине: без него каждый пиксель прокрутки у дна порождал бы новый запрос.
    expect((wrapper.emitted("lazy-load") as any[]).length).toBe(1)
  })

  it("снова разрешает загрузку, когда данных стало больше", async () => {
    const { wrapper, viewport } = await mountScroller({ lazy: true, threshold: 5, items: ITEMS.slice(0, 20) })
    await scrollTo(wrapper, viewport, { top: 10_000 })

    await wrapper.setProps({ items: ITEMS.slice(0, 40) })
    await flushPromises()
    await scrollTo(wrapper, viewport, { top: 20_000 })

    expect((wrapper.emitted("lazy-load") as any[]).length).toBe(2)
  })

  it("молчит при loading: true", async () => {
    const { wrapper, viewport } = await mountScroller({
      lazy: true,
      loading: true,
      threshold: 5,
      items: ITEMS.slice(0, 20)
    })
    await scrollTo(wrapper, viewport, { top: 10_000 })

    expect(wrapper.emitted("lazy-load")).toBeUndefined()
  })
})

describe("VirtualScroller — императивный API", () => {
  it("scrollToIndex ставит offset по индексу", async () => {
    const { wrapper, viewport } = await mountScroller()
    viewport.scrollTo = vi.fn() as any
    ;(wrapper.vm as any).scrollToIndex(50)
    // itemSize 40 → 50-й элемент начинается на 2000px.
    expect(viewport.scrollTop).toBe(2000)
  })

  it("scrollInView уважает выравнивание to-end", async () => {
    const { wrapper, viewport } = await mountScroller()
    const vm = wrapper.vm as any
    viewport.scrollTo = vi.fn() as any

    vm.scrollInView(50, "to-start")
    const atStart = viewport.scrollTop

    vm.scrollInView(50, "to-end")
    // to-end подводит элемент к нижней кромке окна, поэтому offset обязан отличаться от to-start.
    expect(viewport.scrollTop).not.toBe(atStart)
  })

  it("scrollTo делегирует нативному scrollTo viewport'а", async () => {
    const { wrapper, viewport } = await mountScroller()
    const spy = vi.fn()
    viewport.scrollTo = spy as any
    ;(wrapper.vm as any).scrollTo({ top: 120 })
    expect(spy).toHaveBeenCalledWith({ top: 120 })
  })

  it("getRenderedRange отдаёт текущее окно", async () => {
    const { wrapper } = await mountScroller()
    const range = (wrapper.vm as any).getRenderedRange()

    expect(range.first).toBe(0)
    expect(range.last).toBeGreaterThan(0)
  })

  it("refresh не падает и сохраняет работоспособность", async () => {
    const { wrapper, viewport } = await mountScroller()
    expect(() => (wrapper.vm as any).refresh()).not.toThrow()

    await scrollTo(wrapper, viewport, { top: 200 })
    expect(wrapper.emitted("scroll")).toBeTruthy()
  })
})

describe("VirtualScroller — очистка при unmount", () => {
  it("снимает ResizeObserver и таймеры", async () => {
    const disconnect = vi.fn()
    const original = window.ResizeObserver
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {
        disconnect()
      }
    } as any

    try {
      const { wrapper } = await mountScroller()
      wrapper.unmount()
      mounted.length = 0

      expect(disconnect).toHaveBeenCalled()
    } finally {
      window.ResizeObserver = original
    }
  })

  it("не эмитит отложенный scroll после размонтирования", async () => {
    vi.useFakeTimers()
    try {
      const { wrapper, viewport } = await mountScroller({ delay: 200 })
      viewport.scrollTop = 100
      await wrapper.find("[data-vs-viewport]").trigger("scroll")

      wrapper.unmount()
      mounted.length = 0
      vi.advanceTimersByTime(500)

      expect(wrapper.emitted("scroll")).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })
})

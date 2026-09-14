import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import { h } from "vue"
import Select from "fishtvue/select/Select.vue"
import SelectItem from "fishtvue/select/SelectItem.vue"
import SelectGroup from "fishtvue/select/SelectGroup.vue"

/**
 * Issue 7 — виртуализация списка опций.
 *
 * Ядро окна (`useVirtualScroll`) подключено безусловно, а включается по внутреннему порогу
 * (100 строк). Поэтому набор проверок двусторонний: короткий список обязан остаться
 * побайтово прежним, длинный — рендерить срез.
 *
 * jsdom не считает layout, поэтому `clientHeight` скролл-контейнера подменяется на прототипе
 * **до** mount: `measureListViewport()` читает его в `nextTick` после открытия дропдауна.
 * Без подмены `listViewportSize` остаётся нулевым и окно не включается — это же поведение
 * работает как SSR-guard в реальном рантайме.
 */

const VIEWPORT = 240
const ROW = 44 // h-9 (36) + mt-2 (8)

function bigData(n: number) {
  return Array.from({ length: n }, (_, i) => ({ id: i, value: `Item ${String(i).padStart(4, "0")}` }))
}

let restoreClientHeight: (() => void) | undefined

function stubViewportHeight(px: number) {
  const proto = HTMLElement.prototype as any
  const original = Object.getOwnPropertyDescriptor(proto, "clientHeight")
  Object.defineProperty(proto, "clientHeight", { configurable: true, get: () => px })
  restoreClientHeight = () => {
    if (original) Object.defineProperty(proto, "clientHeight", original)
    else delete proto.clientHeight
    restoreClientHeight = undefined
  }
}

/** Делает `scrollTop` реально записываемым — в jsdom штатный сеттер ничего не сохраняет. */
function makeScrollable(el: HTMLElement, value = 0) {
  Object.defineProperty(el, "scrollTop", { configurable: true, writable: true, value })
}

async function openDropdown(wrapper: any) {
  await wrapper.find("[data-select-control]").trigger("click")
  await flushPromises()
  await flushPromises()
}

afterEach(() => {
  restoreClientHeight?.()
})

describe("Select — Issue 7: виртуализация списка опций", () => {
  describe("короткий список (ниже внутреннего порога)", () => {
    it("рендерит все опции и не добавляет spacer'ов", async () => {
      stubViewportHeight(VIEWPORT)
      const wrapper = mount(Select, {
        props: { options: bigData(30), modelValue: null },
        attachTo: document.body
      })
      await openDropdown(wrapper)

      expect(wrapper.findAll("[data-select-list-item]")).toHaveLength(30)
      expect(wrapper.find("[data-select-virtual-pad]").exists()).toBe(false)
      wrapper.unmount()
    })
  })

  describe("длинный список (выше порога)", () => {
    it("рендерит только окно и компенсирует остальное spacer'ами", async () => {
      stubViewportHeight(VIEWPORT)
      const wrapper = mount(Select, {
        props: { options: bigData(500), modelValue: null },
        attachTo: document.body
      })
      await openDropdown(wrapper)

      const items = wrapper.findAll("[data-select-list-item]")
      expect(items.length).toBeGreaterThan(0)
      expect(items.length).toBeLessThan(500)
      // видимая часть + overscan с обеих сторон, но никак не весь список
      expect(items.length).toBeLessThan(40)

      // окно в начале списка → верхнего spacer'а нет, нижний компенсирует хвост
      expect(wrapper.find('[data-select-virtual-pad="top"]').exists()).toBe(false)
      const bottom = wrapper.find('[data-select-virtual-pad="bottom"]')
      expect(bottom.exists()).toBe(true)
      const bottomPx = Number((bottom.attributes("style") ?? "").replace(/\D+/g, ""))
      expect(bottomPx).toBe(500 * ROW - items.length * ROW)

      wrapper.unmount()
    })

    it("сдвигает окно при прокрутке контейнера", async () => {
      stubViewportHeight(VIEWPORT)
      const wrapper = mount(Select, {
        props: { options: bigData(500), modelValue: null },
        attachTo: document.body
      })
      await openDropdown(wrapper)

      const list = wrapper.find("[data-select-list]").element as HTMLElement
      makeScrollable(list, 100 * ROW)
      list.dispatchEvent(new Event("scroll"))
      await flushPromises()

      const first = wrapper.findAll("[data-select-list-item]")[0]
      expect(Number(first.attributes("data-index"))).toBeGreaterThan(0)

      const top = wrapper.find('[data-select-virtual-pad="top"]')
      expect(top.exists()).toBe(true)
      const topPx = Number((top.attributes("style") ?? "").replace(/\D+/g, ""))
      expect(topPx).toBe(Number(first.attributes("data-index")) * ROW)

      wrapper.unmount()
    })

    it("не анимирует появление строк окна (R18 — GSAP-stagger только для коротких списков)", async () => {
      stubViewportHeight(VIEWPORT)
      const wrapper = mount(Select, {
        props: { options: bigData(500), modelValue: null },
        attachTo: document.body
      })
      await openDropdown(wrapper)

      const list = wrapper.find("[data-select-list]").element as HTMLElement
      makeScrollable(list, 100 * ROW)
      list.dispatchEvent(new Event("scroll"))
      await flushPromises()

      // onBeforeEnter в windowed-режиме не трогает стили: строки не «схлопнуты» в opacity/height 0
      const styles = wrapper.findAll("[data-select-list-item]").map((i) => i.attributes("style") ?? "")
      expect(styles.every((s) => !s.includes("opacity: 0") && !s.includes("height: 0"))).toBe(true)

      wrapper.unmount()
    })

    it("End прыгает на последнюю опцию, даже если она не была отрисована (R17 — index-math)", async () => {
      stubViewportHeight(VIEWPORT)
      const wrapper = mount(Select, {
        props: { options: bigData(500), modelValue: null },
        attachTo: document.body
      })
      await openDropdown(wrapper)

      const list = wrapper.find("[data-select-list]").element as HTMLElement
      makeScrollable(list, 0)

      // до нажатия последней опции в DOM нет
      expect(wrapper.find('[data-select-list-item][data-index="499"]').exists()).toBe(false)

      await wrapper.trigger("keydown", { key: "End" })
      await flushPromises()

      const last = wrapper.find('[data-select-list-item][data-index="499"]')
      expect(last.exists()).toBe(true)
      expect(last.attributes("tabindex")).toBe("0")
      expect(list.scrollTop).toBeGreaterThan(0)

      wrapper.unmount()
    })
  })

  describe("группы (R20 — окно не включается)", () => {
    it("сгруппированный список выше порога рендерится целиком", async () => {
      stubViewportHeight(VIEWPORT)
      const wrapper = mount(Select, {
        props: { modelValue: null },
        slots: {
          default: () => [
            h(
              SelectGroup,
              { label: "Numbers" },
              { default: () => bigData(150).map((o) => h(SelectItem, { value: o.id, label: o.value })) }
            )
          ]
        },
        attachTo: document.body
      })
      await openDropdown(wrapper)

      expect(wrapper.findAll("[data-select-list-item]")).toHaveLength(150)
      expect(wrapper.find("[data-select-virtual-pad]").exists()).toBe(false)
      wrapper.unmount()
    })
  })

  describe("a11y виртуализированного listbox", () => {
    it("объявляет реальный размер списка, а не размер окна", async () => {
      stubViewportHeight(VIEWPORT)
      const wrapper = mount(Select, {
        props: { options: bigData(500), modelValue: null },
        attachTo: document.body
      })
      await openDropdown(wrapper)

      const list = wrapper.find("[data-select-list-items]")
      expect(list.attributes("role")).toBe("listbox")

      const items = wrapper.findAll("[data-select-list-item]")
      expect(items.length).toBeLessThan(500)
      for (const item of items) {
        expect(item.attributes("role")).toBe("option")
        // размер объявляется по всему списку, позиция — абсолютная, а не позиция в окне
        expect(item.attributes("aria-setsize")).toBe("500")
        expect(Number(item.attributes("aria-posinset"))).toBe(Number(item.attributes("data-index")) + 1)
      }
      wrapper.unmount()
    })

    it("отражает выбранную опцию через aria-selected", async () => {
      const wrapper = mount(Select, {
        props: { options: bigData(5), modelValue: 2 },
        attachTo: document.body
      })
      await openDropdown(wrapper)

      const items = wrapper.findAll("[data-select-list-item]")
      expect(items[2].attributes("aria-selected")).toBe("true")
      expect(items[0].attributes("aria-selected")).toBe("false")
      wrapper.unmount()
    })

    it("multiple-режим помечает listbox как aria-multiselectable", async () => {
      const wrapper = mount(Select, {
        props: { options: bigData(5), modelValue: null, multiple: true },
        attachTo: document.body
      })
      await openDropdown(wrapper)
      expect(wrapper.find("[data-select-list-items]").attributes("aria-multiselectable")).toBe("true")
      wrapper.unmount()
    })
  })

  describe("порог остаётся внутренним (R19)", () => {
    it("публичный контракт не объявляет prop'ов виртуализации", () => {
      const dts = readFileSync(resolve(process.cwd(), "lib/select/Select.d.ts"), "utf8")
      const propsBlock = dts.slice(dts.indexOf("export interface SelectProps"))
      expect(propsBlock).not.toMatch(/^\s*virtual\??:/m)
      expect(propsBlock).not.toMatch(/^\s*virtualThreshold\??:/m)
    })
  })
})

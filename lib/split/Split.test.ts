import { afterAll, beforeEach, describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"
import FishtVue from "fishtvue/config"
import Split from "fishtvue/split/Split.vue"
import { SplitOption } from "fishtvue/split/Split"

describe("Split Component", () => {
  beforeEach(() => {
    // isolation: cursor-классы больше не должны попадать на body, persistence — на localStorage,
    // а unstyled-leak через window.FishtVue не должен утекать между тестами (см. test-isolation memory)
    document.body.className = ""
    localStorage.clear()
    delete (window as any).FishtVue
  })

  // защищаем соседние test-файлы от unstyled-leak, выставленного тестом unstyled:true
  afterAll(() => {
    delete (window as any).FishtVue
  })

  describe("Without Library Initialization", () => {
    it("renders panels based on the `panels` prop", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        }
      })

      const panels = wrapper.findAll("[data-split-item]")
      expect(panels).toHaveLength(2)
      expect(panels[0].attributes("data-name")).toBe("panel1")
      expect(panels[1].attributes("data-name")).toBe("panel2")
    })

    it("emits `updated-size-panel` when a panel is resized", async () => {
      ;(window as any).innerWidth = 1920
      ;(window as any).innerHeight = 1080
      const container = document.createElement("div")
      container.style.width = "100px"
      container.style.height = "100px"
      container.style.padding = "100px"
      document.body.appendChild(container)
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        },
        slots: {
          panel1: '<div class="slot-content">Slot panel1</div>',
          panel2: '<div class="slot-content">Slot panel2</div>'
        },
        attachTo: container
      })

      const separator = wrapper.find("[data-split-separator]")
      await separator.trigger("pointerdown")
      expect(wrapper.emitted("start-resize-panel")?.[0][1]).toBe("panel1")
      await separator.trigger("pointermove", { clientX: 100 })
      expect(wrapper.emitted("move-resize-panel")?.[0][1]).toBe("panel1")
      await separator.trigger("pointerout")
      expect(wrapper.emitted("out-resize-panel")?.[0][1]).toBe("panel1")
      await separator.trigger("pointerup")
      expect(wrapper.emitted("stop-resize-panel")?.[0][1]).toBe("panel1")

      expect(wrapper.emitted()).toHaveProperty("updated-size-panel")
      expect(wrapper.emitted("updated-size-panel")?.[0]).toEqual([100, "panel1"])
    })

    it("renders slots for each panel", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        },
        slots: {
          panel1: "<div>Panel 1 Content</div>",
          panel2: "<div>Panel 2 Content</div>"
        }
      })

      expect(wrapper.html()).toContain("Panel 1 Content")
      expect(wrapper.html()).toContain("Panel 2 Content")
    })

    it("updates `sizePanels` when panels prop changes", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        }
      })

      await wrapper.setProps({
        panels: [
          { name: "panel1", size: 75 },
          { name: "panel2", size: 25 }
        ]
      })

      const panel1 = wrapper.find('[data-name="panel1"]')
      expect(panel1.attributes("data-size")).toBe("75")

      const panel2 = wrapper.find('[data-name="panel2"]')
      expect(panel2.attributes("data-size")).toBe("25")
    })

    it("applies `direction` prop correctly", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [{ name: "panel1", size: 50 }],
          direction: "vertical"
        }
      })

      expect(wrapper.attributes("data-direction")).toBe("vertical")
    })

    it("handles `separatorType` prop", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [{ name: "panel1" }, { name: "panel2" }],
          separatorType: "hexagon"
        }
      })

      const separator = wrapper.find("[data-split-separator-icon]")
      expect(separator.exists()).toBe(true)
    })
  })

  // ---ISSUE 1 — drag overlay вместо document.body.classList--------------
  describe("Issue 1 — drag overlay (no document.body mutation)", () => {
    const mountAttached = () => {
      const container = document.createElement("div")
      container.style.width = "200px"
      container.style.height = "200px"
      document.body.appendChild(container)
      return mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        },
        attachTo: container
      })
    }

    it("renders a full-screen drag overlay only while resizing", async () => {
      const wrapper = mountAttached()
      expect(wrapper.find("[data-split-drag-overlay]").exists()).toBe(false)

      const separator = wrapper.find("[data-split-separator]")
      await separator.trigger("pointerdown")
      const overlay = wrapper.find("[data-split-drag-overlay]")
      expect(overlay.exists()).toBe(true)
      expect(overlay.attributes("class")).toContain("cursor-col-resize")

      await separator.trigger("pointerup")
      expect(wrapper.find("[data-split-drag-overlay]").exists()).toBe(false)
    })

    it("never mutates document.body.classList with cursor classes", async () => {
      const wrapper = mountAttached()
      const separator = wrapper.find("[data-split-separator]")
      await separator.trigger("pointerdown")
      await separator.trigger("pointermove", { clientX: 80 })
      const hasCursorClassDuringDrag = Array.from(document.body.classList).some((c) => c.startsWith("cursor-"))
      await separator.trigger("pointerup")
      const hasCursorClassAfterDrag = Array.from(document.body.classList).some((c) => c.startsWith("cursor-"))

      expect(hasCursorClassDuringDrag).toBe(false)
      expect(hasCursorClassAfterDrag).toBe(false)
    })
  })

  // ---ISSUE 4 — ARIA separator-------------------------------------------
  describe("Issue 4 — ARIA on resize handle", () => {
    it("exposes aria-orientation matching direction", () => {
      const horizontal = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ],
          direction: "horizontal"
        }
      })
      expect(horizontal.find("[data-split-separator]").attributes("aria-orientation")).toBe("horizontal")

      const vertical = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ],
          direction: "vertical"
        }
      })
      expect(vertical.find("[data-split-separator]").attributes("aria-orientation")).toBe("vertical")
    })

    it("links the handle to the panel it controls via aria-controls / id", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ]
        }
      })
      const separator = wrapper.find("[data-split-separator]")
      const controls = separator.attributes("aria-controls")
      expect(controls).toBeTruthy()
      const panelBody = wrapper.find('[data-name="a"]')
      expect(panelBody.attributes("id")).toBe(controls)
    })

    it("keeps aria-valuenow/min/max on the handle", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50, minSize: 10, maxSize: 90 },
            { name: "b", size: 50 }
          ]
        }
      })
      const separator = wrapper.find("[data-split-separator]")
      expect(separator.attributes("aria-valuenow")).toBe("50")
      expect(separator.attributes("aria-valuemin")).toBe("10")
      expect(separator.attributes("aria-valuemax")).toBe("90")
    })

    it("marks a disabled separator with aria-disabled", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50, disabled: true },
            { name: "b", size: 50 }
          ]
        }
      })
      const disabled = wrapper.find("[data-split-separator-disabled]")
      expect(disabled.exists()).toBe(true)
      expect(disabled.attributes("aria-disabled")).toBe("true")
      expect(disabled.attributes("role")).toBe("separator")
    })
  })

  // ---ISSUE 5 — keyboard resize-----------------------------------------
  describe("Issue 5 — keyboard resize", () => {
    it("grows the panel on ArrowRight and shrinks on ArrowLeft (horizontal)", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ],
          direction: "horizontal"
        }
      })
      const separator = wrapper.find("[data-split-separator]")

      await separator.trigger("keydown", { key: "ArrowRight" })
      expect((wrapper.vm as any).sizePanels.a).toBe(60)
      expect((wrapper.vm as any).sizePanels.b).toBe(40)
      expect(wrapper.emitted("updated-size-panel")?.at(-1)).toEqual([60, "a"])

      await separator.trigger("keydown", { key: "ArrowLeft" })
      expect((wrapper.vm as any).sizePanels.a).toBe(50)
      expect((wrapper.vm as any).sizePanels.b).toBe(50)
    })

    it("uses a larger step with Shift", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ]
        }
      })
      await wrapper.find("[data-split-separator]").trigger("keydown", { key: "ArrowRight", shiftKey: true })
      expect((wrapper.vm as any).sizePanels.a).toBe(100)
      expect((wrapper.vm as any).sizePanels.b).toBe(0)
    })

    it("respects min/max constraints", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50, maxSize: 55 },
            { name: "b", size: 50, minSize: 30 }
          ]
        }
      })
      const separator = wrapper.find("[data-split-separator]")
      await separator.trigger("keydown", { key: "ArrowRight", shiftKey: true })
      // a clamped to maxSize 55, b clamped to minSize 30 → выигрывает наименьший допустимый сдвиг (5)
      expect((wrapper.vm as any).sizePanels.a).toBe(55)
      expect((wrapper.vm as any).sizePanels.b).toBe(45)
    })

    it("maps ArrowUp/ArrowDown for vertical direction", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ],
          direction: "vertical"
        }
      })
      const separator = wrapper.find("[data-split-separator]")
      await separator.trigger("keydown", { key: "ArrowDown" })
      expect((wrapper.vm as any).sizePanels.a).toBe(60)
      await separator.trigger("keydown", { key: "ArrowUp" })
      expect((wrapper.vm as any).sizePanels.a).toBe(50)
    })

    it("Home/End move to the extremes", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50, minSize: 20, maxSize: 80 },
            { name: "b", size: 50 }
          ]
        }
      })
      const separator = wrapper.find("[data-split-separator]")
      await separator.trigger("keydown", { key: "End" })
      expect((wrapper.vm as any).sizePanels.a).toBe(80)
      await separator.trigger("keydown", { key: "Home" })
      expect((wrapper.vm as any).sizePanels.a).toBe(20)
    })

    it("ignores keyboard resize when neighbour is disabled", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50, disabled: true }
          ]
        }
      })
      // separator между a и b отрисован как disabled — интерактивного нет
      expect(wrapper.find("[data-split-separator]").exists()).toBe(false)
    })
  })

  // ---ISSUE 6 — persistence через localStorage--------------------------
  describe("Issue 6 — localStorage persistence", () => {
    it("saves sizes under fv-split-<autoSaveName> after a keyboard resize", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ],
          autoSaveName: "layout"
        }
      })
      await wrapper.find("[data-split-separator]").trigger("keydown", { key: "ArrowRight" })

      const raw = localStorage.getItem("fv-split-layout")
      expect(raw).toBeTruthy()
      expect(JSON.parse(raw as string)).toMatchObject({ a: 60, b: 40 })
    })

    it("restores sizes from localStorage on mount (overrides panel.size)", () => {
      localStorage.setItem("fv-split-layout", JSON.stringify({ a: 70, b: 30 }))
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ],
          autoSaveName: "layout"
        }
      })
      expect((wrapper.vm as any).sizePanels.a).toBe(70)
      expect((wrapper.vm as any).sizePanels.b).toBe(30)
    })

    it("clamps restored sizes to min/max", () => {
      localStorage.setItem("fv-split-layout", JSON.stringify({ a: 999, b: 1 }))
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50, maxSize: 80 },
            { name: "b", size: 50, minSize: 20 }
          ],
          autoSaveName: "layout"
        }
      })
      expect((wrapper.vm as any).sizePanels.a).toBe(80)
      expect((wrapper.vm as any).sizePanels.b).toBe(20)
    })

    it("does nothing without autoSaveName", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ]
        }
      })
      await wrapper.find("[data-split-separator]").trigger("keydown", { key: "ArrowRight" })
      expect(localStorage.length).toBe(0)
    })

    it("ignores malformed stored data", () => {
      localStorage.setItem("fv-split-layout", "{ not json")
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ],
          autoSaveName: "layout"
        }
      })
      expect((wrapper.vm as any).sizePanels.a).toBe(50)
    })
  })

  // ---ISSUE 3 / 8 — unstyled + motion-safe------------------------------
  describe("Issue 3 / 8 — unstyled & reduced-motion", () => {
    it("respects unstyled: true via Component.setStyle guard", () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, { unstyled: true })
        }
      }
      const wrapper = mount(Split, {
        global: { plugins: [app as any] },
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ]
        }
      })
      expect((wrapper.vm as any).classBase).toBe("")
    })

    it("wraps root transition in motion-safe:", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ]
        }
      })
      expect((wrapper.vm as any).classBase).toContain("motion-safe:transition-all")
      expect((wrapper.vm as any).classBase).not.toContain(" transition-all")
    })
  })

  // ---boundary----------------------------------------------------------
  describe("Boundary cases", () => {
    it("renders with pixels units + vertical direction", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 200, minSize: 100 },
            { name: "b", size: 300 }
          ],
          units: "pixels",
          direction: "vertical"
        }
      })
      expect(wrapper.attributes("data-units")).toBe("pixels")
      expect(wrapper.attributes("data-direction")).toBe("vertical")
    })

    it("excludes hidden panels from the rendered output", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50, hidden: true },
            { name: "b", size: 50 }
          ]
        }
      })
      expect(wrapper.findAll("[data-split-item]")).toHaveLength(1)
      expect(wrapper.find('[data-name="b"]').exists()).toBe(true)
    })

    // регрессия: pixels-панель без явного size должна получать положительный default
    // из offsetWidth контейнера (в onMounted, не в setup где resizableGroup ещё undefined)
    it("computes a positive pixel default size for panels without explicit size", () => {
      const proto = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 800 })
      try {
        const wrapper = mount(Split, {
          props: {
            panels: [{ name: "menu", size: 75, minSize: 75, maxSize: 200 }, { name: "main" }],
            units: "pixels",
            direction: "horizontal"
          }
        })
        const vm = wrapper.vm as any
        expect(vm.sizePanels.menu).toBe(75)
        expect(vm.sizePanels.main).toBeGreaterThan(0) // (800 - 75) / 1 = 725, не отрицательное
      } finally {
        if (proto) Object.defineProperty(HTMLElement.prototype, "offsetWidth", proto)
        else delete (HTMLElement.prototype as any).offsetWidth
      }
    })
  })

  // ---ISSUE 2 — coverage geometry-dependent branches (mocked layout)----
  describe("Resize math & pixel recalc (mocked geometry)", () => {
    const setRect = (el: Element, rect: Partial<DOMRect>) => {
      ;(el as any).getBoundingClientRect = () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        toJSON() {},
        ...rect
      })
    }
    const setOffset = (el: Element, prop: "offsetWidth" | "offsetHeight", value: number) => {
      Object.defineProperty(el, prop, { configurable: true, get: () => value })
    }

    it("redistributes sizes on a horizontal pointer drag with min/max", async () => {
      const container = document.createElement("div")
      document.body.appendChild(container)
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 40, minSize: 10, maxSize: 60 },
            { name: "b", size: 30 },
            { name: "c", size: 30, minSize: 10 }
          ],
          direction: "horizontal"
        },
        attachTo: container
      })
      setRect(wrapper.element, { x: 0, width: 1000 })
      setRect(wrapper.find('[data-name="a"]').element, { x: 0, width: 400 })

      const sep = wrapper.findAll("[data-split-separator]")[0]
      await sep.trigger("pointerdown")
      await sep.trigger("pointermove", { clientX: 500 }) // тянем вправо
      await sep.trigger("pointermove", { clientX: 200 }) // и влево
      await sep.trigger("pointerup")

      const vm = wrapper.vm as any
      expect(vm.sizePanels.a).toBeGreaterThanOrEqual(10)
      expect(vm.sizePanels.a).toBeLessThanOrEqual(60)
      expect(wrapper.emitted("updated-panels")).toBeTruthy()
    })

    it("drives the vertical drag branch (clientY / row cursor)", async () => {
      const container = document.createElement("div")
      document.body.appendChild(container)
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "a", size: 50 },
            { name: "b", size: 50 }
          ],
          direction: "vertical"
        },
        attachTo: container
      })
      setRect(wrapper.element, { y: 0, height: 1000 })
      setRect(wrapper.find('[data-name="a"]').element, { y: 0, height: 500 })

      const sep = wrapper.find("[data-split-separator]")
      await sep.trigger("pointerdown")
      await sep.trigger("pointermove", { clientY: 600 })
      await sep.trigger("pointerup")

      expect(wrapper.emitted("updated-panels")).toBeTruthy()
    })

    it("recalculates pixel sizes proportionally when the container grows then shrinks", () => {
      const original = globalThis.ResizeObserver
      let cb: () => void = () => {}
      ;(globalThis as any).ResizeObserver = class {
        constructor(c: any) {
          cb = c
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      try {
        const container = document.createElement("div")
        document.body.appendChild(container)
        const wrapper = mount(Split, {
          props: {
            panels: [
              { name: "a", size: 100, maxSize: 150 },
              { name: "b", size: 100, minSize: 50 }
            ],
            units: "pixels",
            direction: "horizontal"
          },
          attachTo: container
        })
        const vm = wrapper.vm as any

        setOffset(wrapper.element, "offsetWidth", 200)
        cb() // фиксируем previousContainerSize = 200
        setOffset(wrapper.element, "offsetWidth", 400)
        cb() // рост контейнера → пропорциональный пересчёт + clamp maxSize
        expect(vm.sizePanels.a).toBeLessThanOrEqual(150)
        expect(vm.sizePanels.a + vm.sizePanels.b).toBeGreaterThan(200)

        setOffset(wrapper.element, "offsetWidth", 250)
        cb() // сжатие контейнера → decrease-ветка + clamp minSize
        expect(vm.sizePanels.b).toBeGreaterThanOrEqual(50)
      } finally {
        ;(globalThis as any).ResizeObserver = original
      }
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options: SplitOption = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Split: options
          }
        })
      }
    })

    // Test with global options from library
    it("applies default options from library", () => {
      const app = createAppWithFishtVue({
        separatorType: "hexagon",
        separatorNotHoverOpacity: true,
        class: "classSplitOption",
        styles: {
          panel: "stylesPanel"
        }
      })

      const wrapper = mount(Split, {
        global: { plugins: [app] },
        props: {
          panels: [{ name: "panel1" }, { name: "panel2" }]
        }
      })

      const selectedItems = wrapper.findAll("[data-split-item]")
      expect(selectedItems).toHaveLength(2)
      expect(wrapper.vm.separatorType)
      expect(wrapper.vm.separatorNotHoverOpacity)
      expect(wrapper.vm.classBase).toContain("classSplitOption")
      expect(wrapper.vm.styles).toEqual({ panel: "stylesPanel" })
    })
  })
})

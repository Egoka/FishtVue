import { mount, flushPromises } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { nextTick } from "vue"
import FishtVue from "fishtvue/config"
import Select from "fishtvue/select/Select.vue"
import { SelectProps } from "fishtvue/select/Select"

describe("Select Component Tests", () => {
  describe("Select Component - Without Library Initialization", () => {
    // Test rendering with props
    it("renders correctly with default props", () => {
      const wrapper = mount(Select, {
        props: {
          dataSelect: ["Option 1", "Option 2", "Option 3"],
          modelValue: null
        }
      })

      const options = wrapper.findAll("[data-select-list-item]")
      expect(options.length).toBe(3)
    })

    it("renders multiple select mode", () => {
      const wrapper = mount(Select, {
        props: {
          dataSelect: ["Option 1", "Option 2"],
          multiple: true
        }
      })

      expect(wrapper.findAll("[data-select-item]").length).toBe(0)
    })

    it("sets default keySelect and valueSelect when dataSelect is empty", () => {
      const wrapper = mount(Select, {
        props: {
          dataSelect: []
        }
      })

      const keySelect = wrapper.vm.keySelect
      const valueSelect = wrapper.vm.valueSelect

      expect(keySelect).toBe("id")
      expect(valueSelect).toBe(null)
    })

    it("uses provided keySelect and valueSelect when they exist in dataSelect", () => {
      const dataSelect = [
        { id: 1, value: "Option 1" },
        { id: 2, value: "Option 2" }
      ]

      const wrapper = mount(Select, {
        props: {
          dataSelect,
          keySelect: "id",
          valueSelect: "value"
        }
      })

      const keySelect = wrapper.vm.keySelect
      const valueSelect = wrapper.vm.valueSelect

      expect(keySelect).toBe("id")
      expect(valueSelect).toBe("value")
    })

    it("falls back to defaults when keySelect and valueSelect do not exist in dataSelect", () => {
      const dataSelect = [
        { name: "Option 1", description: "First option" },
        { name: "Option 2", description: "Second option" }
      ]

      const wrapper = mount(Select, {
        props: {
          dataSelect,
          keySelect: "id", // Doesn't exist in dataSelect
          valueSelect: "value" // Doesn't exist in dataSelect
        }
      })

      const keySelect = wrapper.vm.keySelect
      const valueSelect = wrapper.vm.valueSelect

      // Check fallback behavior
      expect(keySelect).toBe("name") // Default to the first key in the dataSelect object
      expect(valueSelect).toBe("description") // Default to the second key in the dataSelect object
    })

    it("opens the dropdown automatically when autoFocus is true", async () => {
      const wrapper = mount(Select, {
        props: {
          dataSelect: ["Option 1", "Option 2", "Option 3"],
          autoFocus: true
        },
        attachTo: document.body // Ensure events like focus are handled properly
      })
      expect(wrapper.vm.isOpenList).toBe(true)
    })

    describe("Select Component - mode variations", () => {
      const modes: SelectProps["mode"][] = ["outlined", "underlined", "filled"]

      it.each(modes)("applies correct styles for mode '%s'", (mode) => {
        const wrapper = mount(Select, {
          props: {
            mode
          }
        })

        const selectElement = wrapper.find("[data-select-list]")
        const classList = selectElement.attributes("class")

        if (mode === "outlined") {
          expect(classList).toContain("border border-gray-300 dark:border-gray-600 bg-white dark:bg-black")
          expect(classList).not.toContain("rounded-none")
          expect(classList).not.toContain("bg-stone-100")
        } else if (mode === "underlined") {
          expect(classList).toContain(
            "rounded-none border-0 border-gray-300 dark:border-gray-700 border-b bg-stone-50 dark:bg-stone-950"
          )
          expect(classList).toContain("rounded-none")
          expect(classList).toContain("border-b")
        } else if (mode === "filled") {
          expect(classList).toContain("border-0 bg-stone-100 dark:bg-stone-900")
          expect(classList).not.toContain("border-0 border-gray-300")
          expect(classList).not.toContain("rounded-none")
        }
      })
    })
  })
  describe("Select Component - With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Select: options
          }
        })
      }
    })
    // Test with global options from library
    it("applies default options from library", () => {
      const app = createAppWithFishtVue({
        multiple: true,
        closeButtonBadge: true,
        noData: "No data",
        maxVisible: 2
      })

      const wrapper = mount(Select, {
        global: { plugins: [app] },
        props: {
          dataSelect: ["Option 1", "Option 2", "Option 3"],
          modelValue: ["Option 1", "Option 2"]
        }
      })

      const selectedItems = wrapper.findAll("[data-select-item]")
      expect(selectedItems).toHaveLength(2)
    })
  })
  describe("Select Component - custom strategies", () => {
    // Simulating user interaction
    it("handles user interaction", async () => {
      // Устанавливаем размер окна
      ;(window as any).innerWidth = 1920
      ;(window as any).innerHeight = 1080

      const wrapper = mount(Select, {
        props: {
          dataSelect: ["Apple", "Banana", "Cherry"],
          modelValue: null,
          multiple: true,
          paramsFixWindow: {
            el: "[data-v-app]",
            eventClose: "click"
          }
        },
        attachTo: document.body // Mounting to body for simulating global events
      })

      // Open the select dropdown
      expect(wrapper.find("[data-fix-window]").isVisible()).toBe(false)
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      const componentFixWindow = wrapper.findComponent({ name: "FixWindow" })
      expect(componentFixWindow.vm.isOpen).toBe(true)
      expect(wrapper.find("[data-select-list]").exists()).toBe(true)

      // switch selector on first item
      await wrapper.trigger("keydown", { key: "ArrowDown" })
      await wrapper.trigger("keydown", { key: "ArrowDown" })
      await wrapper.trigger("keydown", { key: "ArrowUp" })
      let listItems = wrapper.findAll("[data-select-list-item]")
      expect(listItems[0].attributes("tabindex")).toBe("0")
      expect(listItems[1].attributes("tabindex")).toBe("-1")
      expect(listItems[2].attributes("tabindex")).toBe("-1")
      // Type into the searRch field
      const searchInput = wrapper.find("[data-select-search] input")
      await searchInput.setValue("Ban")
      await searchInput.trigger("input")

      listItems = wrapper.findAll("[data-select-list-item]")
      expect(listItems).toHaveLength(1) // Only "Banana" should be visible
      expect(listItems[0].text()).toBe("Banana")

      // Select the first item
      await listItems[0].trigger("click")
      const selectedContent = wrapper.find("[data-select-content]")
      expect(selectedContent.text()).toContain("Banana")

      // Simulate Escape key press
      await wrapper.trigger("keydown", { key: "Escape" })
      expect(componentFixWindow.vm.isOpen).toBe(false)
      expect(wrapper.vm.isOpenList).toBe(false)

      // Open the select dropdown
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      expect(componentFixWindow.vm.isOpen).toBe(true)

      // Создаём событие клика в точке (50, 50) на div
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 500,
        clientY: 500
      })

      // Эмитируем событие клика
      document.body?.dispatchEvent(clickEvent)

      expect(wrapper.emitted("change:modelValue")?.[0][0]).toEqual(["Banana"])
      // Issue 1 (2026-05-11): `item.marker` HTML-сборка убрана как XSS surface — substring highlight теперь рендерится через
      // безопасный template helper, а не мутирует data. selectItem payload — оригинальный объект из dataSelect.
      const selectItem = (wrapper.emitted("change:modelValue")?.[0][1] as any)[0]
      expect(selectItem.marker).toBeUndefined()
      wrapper.unmount()
    })
  })

  describe("Audit fixes 2026-05-11 (Issues 1, 2, 5, 6, 8, 10, 11)", () => {
    let warnSpy: ReturnType<typeof vi.spyOn>
    let removeListenerSpy: ReturnType<typeof vi.spyOn>
    let resizeObserverDisconnectSpy: ReturnType<typeof vi.fn>
    let originalResizeObserver: typeof ResizeObserver

    beforeEach(() => {
      warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
      removeListenerSpy = vi.spyOn(document, "removeEventListener")
      resizeObserverDisconnectSpy = vi.fn()
      originalResizeObserver = (globalThis as any).ResizeObserver
      const disconnect = resizeObserverDisconnectSpy
      class MockResizeObserver {
        public cb: unknown
        constructor(cb: unknown) {
          this.cb = cb
        }
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = disconnect
      }
      ;(globalThis as any).ResizeObserver = MockResizeObserver
    })

    afterEach(() => {
      warnSpy.mockRestore()
      removeListenerSpy.mockRestore()
      ;(globalThis as any).ResizeObserver = originalResizeObserver
      delete (globalThis as any).__xssTriggered
      // Очистка window.FishtVue — он мутируется FishtVue plugin'ом и pollutes following tests.
      delete (window as any).FishtVue
    })

    // ---ISSUE 1 — XSS guard ---------------------------------------
    it("does not execute XSS payload from item.marker (legacy field is ignored)", async () => {
      const xssPayload = '<img src=x onerror="window.__xssTriggered=true">'
      ;(globalThis as any).__xssTriggered = false
      const wrapper = mount(Select, {
        props: {
          dataSelect: [{ id: 1, value: "alpha", marker: xssPayload }],
          modelValue: null
        }
      })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      const html = wrapper.html()
      expect(html).not.toContain("onerror=")
      expect(html).not.toMatch(/<img[^>]*src=x/)
      expect((globalThis as any).__xssTriggered).toBe(false)
      expect(warnSpy).toHaveBeenCalled()
      wrapper.unmount()
    })

    it("does not execute XSS payload from noData prop", async () => {
      const xssPayload = "<img src=x onerror=alert(1)><script>alert(2)</script>"
      const wrapper = mount(Select, {
        props: {
          dataSelect: [],
          noData: xssPayload
        }
      })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      const html = wrapper.html()
      // Raw `<img>` или `<script>` теги (как DOM-узлы) не должны быть в выводе — только escaped text.
      expect(html).not.toMatch(/<img\s+src=x/i)
      expect(html).not.toMatch(/<script\b/i)
      // Payload должен присутствовать как escaped текст — это подтверждает, что Vue text-interpolation guard сработал.
      expect(html).toContain("&lt;img")
      expect(html).toContain("&lt;script")
      wrapper.unmount()
    })

    it("renders custom #marker scoped slot when provided", async () => {
      const wrapper = mount(Select, {
        props: {
          dataSelect: [{ id: 1, value: "Apple" }],
          modelValue: null
        },
        slots: {
          marker: `<template #marker="{ item, query }">
            <span data-custom-marker>{{ item.value }}-q={{ query }}</span>
          </template>`
        }
      })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      expect(wrapper.find("[data-custom-marker]").exists()).toBe(true)
      expect(wrapper.find("[data-custom-marker]").text()).toContain("Apple")
      wrapper.unmount()
    })

    // ---ISSUE 2 — memory leak cleanup -----------------------------
    it("removes keydown listeners on unmount-while-focused", async () => {
      const wrapper = mount(Select, {
        props: { dataSelect: ["a", "b"], modelValue: null },
        attachTo: document.body
      })
      await wrapper.find("[data-select]").trigger("focusin")
      await nextTick()
      removeListenerSpy.mockClear()
      wrapper.unmount()
      const removed = removeListenerSpy.mock.calls.map((c: unknown[]) => c[0])
      expect(removed).toContain("keydown")
    })

    it("disconnects ResizeObserver on unmount", async () => {
      const wrapper = mount(Select, {
        props: { dataSelect: ["a"], modelValue: null },
        attachTo: document.body
      })
      await nextTick()
      resizeObserverDisconnectSpy.mockClear()
      wrapper.unmount()
      expect(resizeObserverDisconnectSpy).toHaveBeenCalled()
    })

    // ---ISSUE 5 — componentsStyle fallback ------------------------
    it("falls back to global componentsStyle when props.mode not provided", () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, { componentsStyle: "filled" })
        }
      }
      const wrapper = mount(Select, {
        global: { plugins: [app as any] },
        props: { dataSelect: ["a"] }
      })
      expect(wrapper.vm.mode).toBe("filled")
    })

    it("prop.mode wins over global componentsStyle", () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, { componentsStyle: "filled" })
        }
      }
      const wrapper = mount(Select, {
        global: { plugins: [app as any] },
        props: { dataSelect: ["a"], mode: "outlined" }
      })
      expect(wrapper.vm.mode).toBe("outlined")
    })

    // ---ISSUE 6 — unstyled enforcement (base class fix) -----------
    it("respects unstyled: true via Component.setStyle guard", () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, { unstyled: true })
        }
      }
      const wrapper = mount(Select, {
        global: { plugins: [app as any] },
        props: { dataSelect: ["a"] }
      })
      const root = wrapper.find("[data-select]")
      const classAttr = root.attributes("class") ?? ""
      expect(classAttr).not.toContain("fishtvue-select")
      expect(classAttr).not.toContain("selectBody")
    })

    // ---ISSUE 8 — aria-live -------------------------------------
    it("renders aria-live region with results count when query is active", async () => {
      const wrapper = mount(Select, {
        props: { dataSelect: ["Apple", "Banana", "Bandana"], modelValue: null },
        attachTo: document.body
      })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      const search = wrapper.find("[data-select-search] input")
      await search.setValue("an")
      await search.trigger("input")
      await flushPromises()
      const live = wrapper.find("[data-select-aria-live]")
      expect(live.exists()).toBe(true)
      expect(live.attributes("aria-live")).toBe("polite")
      // Two matches: "Banana" + "Bandana" — оба содержат substring "an".
      expect(live.text()).toMatch(/2/)
      wrapper.unmount()
    })

    // ---ISSUE 10 — Intl.Collator (diacritic-insensitive) ----------
    it("filters dataList through Intl.Collator (diacritic-insensitive)", async () => {
      const wrapper = mount(Select, {
        props: {
          dataSelect: [
            { id: 1, value: "Müller" },
            { id: 2, value: "Smith" }
          ],
          modelValue: null
        },
        attachTo: document.body
      })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      const search = wrapper.find("[data-select-search] input")
      await search.setValue("muller")
      await search.trigger("input")
      await flushPromises()
      expect(wrapper.vm.dataList.length).toBe(1)
      expect(wrapper.vm.dataList[0].value).toBe("Müller")
      wrapper.unmount()
    })

    // ---ISSUE 11 — motion-safe prefix -----------------------------
    it("uses motion-safe: prefix on transition classes", () => {
      const wrapper = mount(Select, {
        props: { dataSelect: ["a"] }
      })
      // Корневой контейнер должен иметь print:* классы, что зеркалит Input pattern.
      const root = wrapper.find("[data-select]")
      const html = wrapper.html()
      // motion-safe: появляется хотя бы один раз в style sheet корневых классов
      expect(html).toMatch(/motion-safe:/)
      // print: классы добавлены для печати
      expect(root.attributes("class")).toMatch(/print:/)
    })
  })
})

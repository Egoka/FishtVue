import { mount, flushPromises } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { h, nextTick } from "vue"
import FishtVue from "fishtvue/config"
import Select from "fishtvue/select/Select.vue"
import SelectOption from "fishtvue/select/SelectOption.vue"
import SelectGroup from "fishtvue/select/SelectGroup.vue"
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
      // Force dataList computed evaluation — warnDeprecatedMarker fires only on access.
      // Template open-path может не дойти до dataList в jsdom раньше assertion'а.
      // Type in search box to flip isQuery + dataSelect filter branch (where warn fires).
      const search = wrapper.find("[data-select-search] input")
      if (search.exists()) {
        await search.setValue("a")
        await search.trigger("input")
        await flushPromises()
      }
      void (wrapper.vm as any).dataList
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
      // Issue 3 (2026-05-20): Component.t() возвращает key как last resort без плагина.
      // Чтобы %d template из en messages применился, подключаем FishtVue plugin.
      const wrapper = mount(Select, {
        props: { dataSelect: ["Apple", "Banana", "Bandana"], modelValue: null },
        attachTo: document.body,
        global: { plugins: [[FishtVue as any, {}]] }
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

    it("localizes the results count via Russian pluralization (Wave 3.5)", async () => {
      const wrapper = mount(Select, {
        props: { dataSelect: ["Apple", "Banana", "Bandana"], modelValue: null },
        attachTo: document.body,
        global: { plugins: [[FishtVue as any, { locale: { defaultLocale: "ru" } }]] }
      })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      const search = wrapper.find("[data-select-search] input")
      await search.setValue("an")
      await search.trigger("input")
      await flushPromises()
      // Two matches → Russian "few" form: "2 результата".
      expect(wrapper.find("[data-select-aria-live]").text()).toBe("2 результата")
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

// =====================================================================================================================
// Audit fixes 2026-06-13 — Issue 3 (compound API) + Issue 9 (RTL)
// =====================================================================================================================
describe("Select — Issue 3: compound <SelectOption>/<SelectGroup> API", () => {
  // ---HAPPY PATH ------------------------------------------------------------
  it("renders options from compound <SelectOption> children", async () => {
    const wrapper = mount(Select, {
      slots: {
        default: () => [h(SelectOption, { value: "a" }, () => "Apple"), h(SelectOption, { value: "b" }, () => "Banana")]
      }
    })
    await nextTick()
    const options = wrapper.findAll("[data-select-list-item]")
    expect(options.length).toBe(2)
    expect(wrapper.text()).toContain("Apple")
    expect(wrapper.text()).toContain("Banana")
  })

  it("uses `label` prop as display text when provided", async () => {
    const wrapper = mount(Select, {
      slots: { default: () => [h(SelectOption, { value: "a", label: "Custom Label" }, () => "ignored")] }
    })
    await nextTick()
    expect(wrapper.text()).toContain("Custom Label")
  })

  // ---SCHEMA WINS ----------------------------------------------------------
  it("schema-driven dataSelect wins over compound children", async () => {
    const wrapper = mount(Select, {
      props: { dataSelect: ["Schema 1", "Schema 2", "Schema 3"] },
      slots: { default: () => [h(SelectOption, { value: "a" }, () => "Compound A")] }
    })
    await nextTick()
    const options = wrapper.findAll("[data-select-list-item]")
    expect(options.length).toBe(3)
    expect(wrapper.text()).toContain("Schema 1")
    expect(wrapper.text()).not.toContain("Compound A")
  })

  // ---SELECTION ------------------------------------------------------------
  it("selecting a compound option emits its `value` as modelValue", async () => {
    const wrapper = mount(Select, {
      slots: {
        default: () => [h(SelectOption, { value: "a" }, () => "Apple"), h(SelectOption, { value: "b" }, () => "Banana")]
      }
    })
    await nextTick()
    await wrapper.findAll("[data-select-list-item]")[1].trigger("click")
    const emitted = wrapper.emitted("update:modelValue")
    expect(emitted).toBeTruthy()
    expect(emitted?.[emitted.length - 1][0]).toBe("b")
  })

  it("infers value type — numeric `value` round-trips through modelValue", async () => {
    const wrapper = mount(Select, {
      slots: { default: () => [h(SelectOption, { value: 42 }, () => "Answer")] }
    })
    await nextTick()
    await wrapper.findAll("[data-select-list-item]")[0].trigger("click")
    const emitted = wrapper.emitted("update:modelValue")
    expect(emitted?.[emitted.length - 1][0]).toBe(42)
  })

  // ---DISABLED -------------------------------------------------------------
  it("disabled compound option is marked aria-disabled and is not selectable", async () => {
    const wrapper = mount(Select, {
      slots: {
        default: () => [
          h(SelectOption, { value: "a", disabled: true }, () => "Locked"),
          h(SelectOption, { value: "b" }, () => "Free")
        ]
      }
    })
    await nextTick()
    const items = wrapper.findAll("[data-select-list-item]")
    expect(items[0].attributes("aria-disabled")).toBe("true")
    await items[0].trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeFalsy()
    // не-disabled опция по-прежнему выбирается
    await items[1].trigger("click")
    expect(wrapper.emitted("update:modelValue")).toBeTruthy()
  })

  // ---GROUPS ---------------------------------------------------------------
  it("renders <SelectGroup> label header above its options", async () => {
    const wrapper = mount(Select, {
      slots: {
        default: () => [
          h(SelectGroup, { label: "Fruits" }, () => [
            h(SelectOption, { value: "a" }, () => "Apple"),
            h(SelectOption, { value: "b" }, () => "Banana")
          ])
        ]
      }
    })
    await nextTick()
    expect(wrapper.find("[data-select-group]").exists()).toBe(true)
    expect(wrapper.find("[data-select-group]").text()).toContain("Fruits")
    // опции группы — выбираемы и НЕ включают header в selectable-список
    expect(wrapper.findAll("[data-select-list-item]").length).toBe(2)
  })

  // ---BOUNDARY -------------------------------------------------------------
  it("falls back to empty state when no children and no dataSelect", async () => {
    const wrapper = mount(Select)
    await nextTick()
    expect(wrapper.findAll("[data-select-list-item]").length).toBe(0)
  })
})

describe("Select — Issue 9: RTL via logical Tailwind properties", () => {
  it("option row uses logical padding (ps-/pe-), not physical (pl-/pr-)", async () => {
    const wrapper = mount(Select, { props: { dataSelect: ["a", "b"] } })
    await nextTick()
    const li = wrapper.find("[data-select-list-item]")
    const cls = li.attributes("class") ?? ""
    expect(cls).toMatch(/\bps-8\b/)
    expect(cls).toMatch(/\bpe-4\b/)
    expect(cls).not.toMatch(/\bpl-8\b/)
    expect(cls).not.toMatch(/\bpr-4\b/)
  })

  it("item value uses rtl:text-right override for alignment", async () => {
    const wrapper = mount(Select, { props: { dataSelect: ["a"] } })
    await nextTick()
    expect(wrapper.html()).toMatch(/rtl:text-right/)
  })

  it("check icon uses logical start-0 / ps-2 (not left-0 / pl-2)", async () => {
    const wrapper = mount(Select, {
      props: { dataSelect: ["a"], modelValue: "a", keySelect: "id", valueSelect: "value" }
    })
    await nextTick()
    await flushPromises()
    // выбранный элемент показывает check-иконку с логическими классами (scoped на сам span,
    // т.к. left-0 встречается в разметке вложенного InputLayout-search — не относится к Select)
    const check = wrapper.find("[data-select-check]")
    expect(check.exists()).toBe(true)
    const cls = check.attributes("class") ?? ""
    expect(cls).toMatch(/\bstart-0\b/)
    expect(cls).toMatch(/\bps-2\b/)
    expect(cls).not.toMatch(/\bleft-0\b/)
    expect(cls).not.toMatch(/\bpl-2\b/)
  })

  it("dropdown offset uses logical margin ms-[...] (not physical ml-[...])", async () => {
    const wrapper = mount(Select, { props: { dataSelect: ["a"] }, attachTo: document.body })
    await wrapper.find("[data-select]").trigger("click")
    await flushPromises()
    const html = wrapper.html()
    expect(html).toMatch(/ms-\[/)
    expect(html).not.toMatch(/ml-\[/)
    wrapper.unmount()
  })

  describe("Accessibility — combobox role & label association (Wave 4)", () => {
    it("marks the trigger as role=combobox with aria-expanded reflecting the closed state", () => {
      const wrapper = mount(Select, { props: { dataSelect: [], label: "Country" } })
      const trigger = wrapper.find("[data-select]")
      expect(trigger.attributes("role")).toBe("combobox")
      expect(trigger.attributes("aria-expanded")).toBe("false")
    })

    it("links the trigger to the label via aria-labelledby and a shared id", () => {
      const wrapper = mount(Select, { props: { dataSelect: [], label: "Country", id: "country" } })
      const trigger = wrapper.find("[data-select]")
      expect(trigger.attributes("id")).toBe("country")
      expect(trigger.attributes("aria-labelledby")).toBe("country-label")
      // Select's dropdown carries its own search <Input> (with an auto-id label),
      // so scope to the label the trigger actually references.
      expect(wrapper.find("label[data-label]#country-label").exists()).toBe(true)
    })

    it("toggles aria-expanded to true when the dropdown opens", async () => {
      const wrapper = mount(Select, { props: { dataSelect: ["a"], label: "Country" }, attachTo: document.body })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      expect(wrapper.find("[data-select]").attributes("aria-expanded")).toBe("true")
      wrapper.unmount()
    })
  })

  // gsap = optional peerDependency (Wave 2.1): не должен быть top-level eager-импортом, иначе
  // ~50KB тянутся в каждый bundle с `fishtvue/select` даже без анимации. Грузится lazy через
  // `import("gsap")` в transition-хуках; без gsap анимация деградирует до мгновенной (но список
  // обязан стать видимым). Прямой mock-reject здесь не годится — hoisted `vi.mock("gsap")`
  // протёк бы на весь файл и сломал остальные Select-тесты с реальным gsap; поэтому lazy + ветка
  // graceful-fallback проверяются на уровне source, а видимость списка — поведенчески (real gsap).
  describe("Lazy gsap (Wave 2.1 — optional peer)", () => {
    it("loads gsap lazily with a graceful no-gsap fallback in transition hooks", async () => {
      const fs = await import("node:fs/promises")
      const path = await import("node:path")
      const url = await import("node:url")
      const here = path.dirname(url.fileURLToPath(import.meta.url))
      const src = await fs.readFile(path.join(here, "Select.vue"), "utf8")
      // нет top-level `import gsap from "gsap"`
      expect(src).not.toMatch(/^\s*import\s+gsap\s+from\s+["']gsap["']/m)
      // lazy dynamic import + try/catch graceful degradation
      expect(src).toMatch(/import\(["']gsap["']\)/)
      // fallback без gsap выставляет финальные стили (иначе onBeforeEnter оставит список невидимым)
      expect(src).toMatch(/el\.style\.opacity/)
      expect(src).toMatch(/el\.style\.height/)
    })

    it("still renders dropdown items when opened (animation = progressive enhancement)", async () => {
      const wrapper = mount(Select, {
        props: { dataSelect: ["Option 1", "Option 2", "Option 3"], modelValue: null },
        attachTo: document.body
      })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      await nextTick()
      expect(wrapper.vm.isOpenList).toBe(true)
      expect(wrapper.findAll("[data-select-list-item]").length).toBe(3)
      wrapper.unmount()
    })
  })

  // Wave 4.3 — keyboard nav: Home/End прыжки + first-char typeahead (для noQuery-listbox).
  describe("Select Component - Keyboard Home/End/typeahead (Wave 4.3)", () => {
    async function openList(props: Record<string, unknown>) {
      const wrapper = mount(Select, { props, attachTo: document.body })
      await wrapper.find("[data-select]").trigger("click")
      await flushPromises()
      await nextTick()
      expect(wrapper.vm.isOpenList).toBe(true)
      return wrapper
    }

    it("End focuses the last list item, Home focuses the first", async () => {
      const wrapper = await openList({ dataSelect: ["Apple", "Banana", "Cherry"], modelValue: null })

      await wrapper.trigger("keydown", { key: "End" })
      await nextTick()
      let items = wrapper.findAll("[data-select-list-item]")
      expect(items[items.length - 1].attributes("tabindex")).toBe("0")
      expect(items[0].attributes("tabindex")).toBe("-1")

      await wrapper.trigger("keydown", { key: "Home" })
      await nextTick()
      items = wrapper.findAll("[data-select-list-item]")
      expect(items[0].attributes("tabindex")).toBe("0")
      expect(items[items.length - 1].attributes("tabindex")).toBe("-1")

      wrapper.unmount()
    })

    it("noQuery: true renders no search input (typeahead branch reachable)", async () => {
      const wrapper = await openList({ dataSelect: ["Apple", "Banana"], modelValue: null, noQuery: true })
      expect(wrapper.find("[data-select-search]").exists()).toBe(false)
      wrapper.unmount()
    })

    it("typeahead (noQuery) focuses first item starting with the typed character", async () => {
      const wrapper = await openList({ dataSelect: ["Apple", "Banana", "Cherry"], modelValue: null, noQuery: true })

      await wrapper.trigger("keydown", { key: "b" })
      await nextTick()
      const items = wrapper.findAll("[data-select-list-item]")
      expect(items[1].attributes("tabindex")).toBe("0") // Banana
      expect(items[0].attributes("tabindex")).toBe("-1")
      expect(items[2].attributes("tabindex")).toBe("-1")

      wrapper.unmount()
    })

    it("typeahead (noQuery) cycles through items sharing the first character on repeat", async () => {
      const wrapper = await openList({ dataSelect: ["Apple", "Avocado", "Banana"], modelValue: null, noQuery: true })

      await wrapper.trigger("keydown", { key: "a" })
      await nextTick()
      let items = wrapper.findAll("[data-select-list-item]")
      expect(items[0].attributes("tabindex")).toBe("0") // Apple

      await wrapper.trigger("keydown", { key: "a" })
      await nextTick()
      items = wrapper.findAll("[data-select-list-item]")
      expect(items[1].attributes("tabindex")).toBe("0") // Avocado
      expect(items[0].attributes("tabindex")).toBe("-1")

      wrapper.unmount()
    })
  })

  describe("FixWindow class-body — guard ms-[…px] (uno-engine fail-closed regression)", () => {
    it("не рендерит ms-[undefinedpx] до готовности layout.beforeWidth", async () => {
      const wrapper = mount(Select, {
        props: { dataSelect: ["Option 1"], modelValue: null }
      })
      // Первый рендер — template ref `layout` ещё не привязан (beforeWidth undefined);
      // без guard'а класс интерполируется как ms-[undefinedpx] и дропается движком с warn.
      expect(wrapper.html()).not.toContain("undefinedpx")
      expect(document.body.innerHTML).not.toContain("undefinedpx")
      await nextTick()
      expect(wrapper.html()).not.toContain("undefinedpx")
      wrapper.unmount()
    })
  })
})

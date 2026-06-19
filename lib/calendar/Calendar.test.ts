import { mount, flushPromises } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Calendar from "fishtvue/calendar/Calendar.vue"
import { CalendarProps } from "fishtvue/calendar/Calendar"
import FishtVue from "fishtvue/config"
import { DatePicker } from "v-calendar"
import "v-calendar/style.css"
import { nextTick } from "vue"

describe("Calendar Component", () => {
  describe("Basic functionality", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Calendar)
      expect(wrapper.exists()).toBe(true)
    })

    it("handles open and close calendar methods", async () => {
      const wrapper = mount(Calendar)

      const calendarRef: any = wrapper.vm

      // Initially calendar should not be open
      expect(calendarRef.isOpenPicker).toBe(false)

      // Open calendar
      calendarRef.openCalendar()
      expect(calendarRef.isOpenPicker).toBe(true)

      // Close calendar
      calendarRef.closeCalendar()
      expect(calendarRef.isOpenPicker).toBe(false)
    })

    it("clears the calendar picker value", async () => {
      const wrapper = mount(Calendar, {
        props: {
          modelValue: "2024-11-23"
        }
      })

      const calendarRef: any = wrapper.vm

      // Clear value
      calendarRef.clearDataPicker()
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(null)
    })
    it("renders the correct placeholder when no value is provided", () => {
      const placeholderText = "Select a date"
      const wrapper = mount(Calendar, {
        props: {
          placeholder: placeholderText
        }
      })

      // Открываем календарь
      const inputElement = wrapper.find("[data-calendar] div")
      expect(inputElement.exists()).toBe(true)

      // Проверяем, отображается ли placeholder
      expect(wrapper.attributes("placeholder")).toBe(placeholderText)
    })

    it("does not display placeholder when value is provided", async () => {
      const placeholderText = "Select a date"
      const value = "2024-11-30"

      const wrapper = mount(Calendar, {
        props: {
          placeholder: placeholderText,
          modelValue: value
        }
      })
      await flushPromises() // DatePicker — defineAsyncComponent (Wave 2.1): дожидаемся mount
      await nextTick()
      // Открываем календарь
      const inputElement = wrapper.find("[data-calendar]")
      await nextTick()
      expect(inputElement.exists()).toBe(true)

      // Проверяем, что placeholder не отображается
      expect(inputElement.text()).not.toContain(placeholderText)

      // Проверяем, что отображается значение
      expect(inputElement.text()).toContain("30 November 2024")
    })

    describe("Calendar Component - Mode Variants", () => {
      const modes: CalendarProps["mode"][] = ["outlined", "filled", "underlined"]

      it.each(modes)("renders correctly with mode: %s", (mode) => {
        const wrapper = mount(Calendar, {
          props: {
            mode,
            placeholder: "Select a date"
          }
        })

        const layout = wrapper.find("[data-calendar-picker]")
        expect(layout.exists()).toBe(true)

        // Проверяем, что класс для текущего режима установлен
        if (mode === "outlined") {
          expect(layout.classes().join(" ")).toContain("border-gray-300")
          expect(layout.classes().join(" ")).toContain("dark:border-gray-600")
        } else if (mode === "filled") {
          expect(layout.classes().join(" ")).toContain("bg-stone-100")
          expect(layout.classes().join(" ")).toContain("dark:bg-stone-900")
        } else if (mode === "underlined") {
          expect(layout.classes().join(" ")).toContain("border-b")
          expect(layout.classes().join(" ")).toContain("dark:border-gray-700")
        }
      })
    })
    describe("Calendar Component - Date Selection", () => {
      it.todo(
        "triggers update:isInvalid, update:modelValue, and change:modelValue events on date selection",
        async () => {
          const wrapper = mount(Calendar, {
            props: {
              clear: true,
              modelValue: null,
              isInvalid: true,
              paramsDatePicker: {
                isRange: false,
                mask: "DD.MM.YYYY"
              }
            }
          })

          // Найти элемент календаря
          const calendarTrigger = wrapper.find("[data-calendar]")
          expect(calendarTrigger.exists()).toBe(true)

          // Кликнуть по элементу для открытия календаря
          await calendarTrigger.trigger("click")

          // Найти и выбрать дату из календаря
          const dateElement = wrapper.find(".vc-pane-container .vc-day:not(.vc-disabled) .vc-day-content")
          expect(dateElement.exists()).toBe(true)
          // Нажать на дату
          await dateElement.trigger("click")
          // Проверить события
          expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])

          expect(wrapper.emitted("update:modelValue")).toBeTruthy()
          const emittedModelValue = wrapper.emitted("update:modelValue")?.[0][0]
          expect(typeof emittedModelValue).toBe("object") // Должна быть строка формата "DD.MM.YYYY"

          expect(wrapper.emitted("change:modelValue")).toBeTruthy()
          const emittedChangeValue = wrapper.emitted("change:modelValue")?.[0][0]
          expect(emittedChangeValue).toEqual(emittedModelValue) // Значения должны совпадать
          const clearButton = wrapper.find("[data-input-layout-clear] i")
          await clearButton.trigger("click")
          expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])
          expect(wrapper.emitted("change:modelValue")?.[2][0]).toBeUndefined()
        }
      )
    })
  })

  describe("Slots", () => {
    it.todo("renders slot content in the footer", () => {
      const wrapper = mount(Calendar, {
        slots: {
          footerPicker: "<div class='footer-slot'>Footer Content</div>"
        }
      })

      const footerSlot = wrapper.find(".footer-slot")
      expect(footerSlot.exists()).toBe(true)
      expect(footerSlot.text()).toBe("Footer Content")
    })

    it("renders slot content in before and after", () => {
      const wrapper = mount(Calendar, {
        slots: {
          before: "<div class='before-slot'>Before Content</div>",
          after: "<div class='after-slot'>After Content</div>"
        }
      })

      const beforeSlot = wrapper.find(".before-slot")
      const afterSlot = wrapper.find(".after-slot")

      expect(beforeSlot.exists()).toBe(true)
      expect(beforeSlot.text()).toBe("Before Content")

      expect(afterSlot.exists()).toBe(true)
      expect(afterSlot.text()).toBe("After Content")
    })
  })

  describe("Date range selection", () => {
    it("renders correct range dates", async () => {
      const wrapper = mount(Calendar, {
        props: {
          modelValue: { start: "2024-11-23", end: "2024-11-25" },
          paramsDatePicker: {
            isRange: true,
            mask: "YYYY-MM-DD"
          }
        }
      })
      await flushPromises() // DatePicker — defineAsyncComponent (Wave 2.1): дожидаемся mount
      await nextTick()
      const dateDisplay = wrapper.find("[data-calendar]")
      await nextTick()
      expect(dateDisplay.text()).toContain("2024-11-23")
      expect(dateDisplay.text()).toContain("2024-11-25")
    })
  })

  describe("Masks and placeholders", () => {
    it("applies mask correctly", async () => {
      vi.useFakeTimers()
      const wrapper = mount(Calendar, {
        props: {
          modelValue: "2024-11-23",
          paramsDatePicker: {
            mask: "DD.MM.YYYY"
          }
        }
      })
      await flushPromises() // DatePicker — defineAsyncComponent (Wave 2.1): дожидаемся mount
      await nextTick()
      const dateDisplay = wrapper.find("[data-calendar]")
      await nextTick()
      expect(dateDisplay.text()).toBe("23.11.2024")
      vi.clearAllTimers()
      vi.useRealTimers()
    })

    it("renders placeholder if no value is provided", () => {
      const wrapper = mount(Calendar, {
        props: {
          placeholder: "Select a date"
        }
      })

      const dateDisplay = wrapper.find("[data-input-layout]")
      expect(dateDisplay.attributes("placeholder")).toBe("Select a date")
    })
  })

  describe("Audit fixes 2026-05-11 (Issues 1, 6, 8)", () => {
    let removeListenerSpy: ReturnType<typeof vi.spyOn>
    let mutationDisconnectSpy: ReturnType<typeof vi.fn>
    // eslint-disable-next-line no-undef
    let originalMutationObserver: typeof MutationObserver

    beforeEach(() => {
      removeListenerSpy = vi.spyOn(document, "removeEventListener")
      mutationDisconnectSpy = vi.fn()
      originalMutationObserver = (globalThis as any).MutationObserver
      const disconnect = mutationDisconnectSpy
      class MockMutationObserver {
        public cb: unknown
        constructor(cb: unknown) {
          this.cb = cb
        }
        observe = vi.fn()
        takeRecords = vi.fn(() => [])
        disconnect = disconnect
      }
      ;(globalThis as any).MutationObserver = MockMutationObserver
    })

    afterEach(() => {
      removeListenerSpy.mockRestore()
      ;(globalThis as any).MutationObserver = originalMutationObserver
      // Очистка window.FishtVue — он мутируется FishtVue plugin'ом и pollutes following tests.
      delete (window as any).FishtVue
    })

    // ---ISSUE 1 — memory leak cleanup ---------------------------------------
    it("disconnects MutationObserver on unmount", async () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, { optionsTheme: { darkModeSelector: ".dark" } })
        }
      }
      const wrapper = mount(Calendar, {
        global: { plugins: [app as any] }
      })
      await nextTick()
      mutationDisconnectSpy.mockClear()
      wrapper.unmount()
      expect(mutationDisconnectSpy).toHaveBeenCalled()
    })

    it("removes keydown listeners on unmount-while-open", async () => {
      const wrapper = mount(Calendar, {
        props: { modelValue: null },
        attachTo: document.body
      })
      const calendarRef: any = wrapper.vm
      calendarRef.openCalendar()
      await nextTick()
      calendarRef.focus(true)
      await nextTick()
      removeListenerSpy.mockClear()
      wrapper.unmount()
      const removed = removeListenerSpy.mock.calls.map((c: unknown[]) => c[0])
      expect(removed).toContain("keydown")
    })

    // ---ISSUE 6 — componentsStyle fallback ----------------------------------
    it("falls back to global componentsStyle when props.mode not provided", () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, { componentsStyle: "filled" })
        }
      }
      const wrapper = mount(Calendar, {
        global: { plugins: [app as any] }
      })
      expect((wrapper.vm as any).mode).toBe("filled")
    })

    it("prop.mode wins over global componentsStyle", () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, { componentsStyle: "filled" })
        }
      }
      const wrapper = mount(Calendar, {
        global: { plugins: [app as any] },
        props: { mode: "outlined" }
      })
      expect((wrapper.vm as any).mode).toBe("outlined")
    })

    it('falls back to "outlined" when nothing is set', () => {
      const wrapper = mount(Calendar)
      expect((wrapper.vm as any).mode).toBe("outlined")
    })

    // ---ISSUE 8 — locale propagation ----------------------------------------
    it("passes FishtVue active locale to DatePicker", async () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, {
            locale: { activeLocale: "ru", defaultLocale: "ru", messages: { ru: {}, en: {} } }
          })
        }
      }
      const wrapper = mount(Calendar, {
        global: { plugins: [app as any] }
      })
      // DatePicker — defineAsyncComponent (v-calendar = optional peer, Wave 2.1): резолвится async.
      await flushPromises()
      const datePicker = wrapper.findComponent(DatePicker as any)
      expect(datePicker.exists()).toBe(true)
      expect(datePicker.props("locale")).toBe("ru")
    })

    it("paramsDatePicker.locale (consumer override) wins over active locale", async () => {
      const app = {
        install(app: any) {
          app.use(FishtVue, {
            locale: { activeLocale: "ru", defaultLocale: "ru", messages: { ru: {}, en: {} } }
          })
        }
      }
      const wrapper = mount(Calendar, {
        global: { plugins: [app as any] },
        props: {
          paramsDatePicker: { locale: "en" }
        }
      })
      await flushPromises()
      const datePicker = wrapper.findComponent(DatePicker as any)
      expect(datePicker.exists()).toBe(true)
      expect(datePicker.props("locale")).toBe("en")
    })
  })

  describe("Accessibility — label association (Wave 4)", () => {
    it("links the calendar trigger to the label via aria-labelledby", () => {
      const wrapper = mount(Calendar, { props: { label: "Date", id: "date" } })
      const trigger = wrapper.find("[data-calendar]")
      expect(trigger.exists()).toBe(true)
      expect(trigger.attributes("aria-labelledby")).toBe("date-label")
      expect(wrapper.find("label[data-label]").attributes("id")).toBe("date-label")
    })
  })

  // v-calendar = optional peerDependency (Wave 2.1): не должен быть top-level eager-импортом,
  // иначе тянется в каждый bundle с `fishtvue/calendar`. DatePicker грузится динамически в
  // onMounted (ref-based, зеркало TextEditor/QuillEditor — чтобы template-ref указывал на реальный
  // инстанс), CSS — lazy там же (client-only, SSR-safe).
  describe("Lazy v-calendar (Wave 2.1 — optional peer)", () => {
    it("loads DatePicker via a dynamic import, not a top-level static import", async () => {
      const fs = await import("node:fs/promises")
      const path = await import("node:path")
      const url = await import("node:url")
      const here = path.dirname(url.fileURLToPath(import.meta.url))
      const src = await fs.readFile(path.join(here, "Calendar.vue"), "utf8")
      // нет eager `import { DatePicker } from "v-calendar"`
      expect(src).not.toMatch(/import\s*\{[^}]*\bDatePicker\b[^}]*\}\s*from\s*["']v-calendar["']/)
      // DatePicker — ref, заполняемый dynamic-импортом; рендерится через <component :is>
      expect(src).toMatch(/const\s+DatePicker\s*=\s*ref/)
      expect(src).toMatch(/import\(["']v-calendar["']\)/)
    })

    it("loads v-calendar CSS lazily (not a top-level side-effect import)", async () => {
      const fs = await import("node:fs/promises")
      const path = await import("node:path")
      const url = await import("node:url")
      const here = path.dirname(url.fileURLToPath(import.meta.url))
      const src = await fs.readFile(path.join(here, "Calendar.vue"), "utf8")
      expect(src).not.toMatch(/^\s*import\s+["']v-calendar\/style\.css["']/m)
      expect(src).toMatch(/import\(["']v-calendar\/style\.css["']\)/)
    })
  })
})

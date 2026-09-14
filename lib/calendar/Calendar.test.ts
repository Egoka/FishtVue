import { mount, flushPromises } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import Calendar from "fishtvue/calendar/Calendar.vue"
import { CalendarProps } from "fishtvue/calendar/Calendar"
import FishtVue from "fishtvue/config"
import { DatePicker } from "v-calendar"
import "v-calendar/style.css"
import { nextTick } from "vue"

// Wave 2.1: DatePicker (v-calendar, optional peer) резолвится через async dynamic import
// в onMounted — сколько реального времени нужно до полного рендера, не детерминировано
// (свой рендер-цикл внутри v-calendar + скорость самого dynamic import) и на медленном/
// холодном CI runner может занять заметно больше, чем локально (был источником CI-only
// флаки на этом файле). Poll реального условия вместо фиксированного числа тиков — оба
// flushPromises()/nextTick() реально проворачивают event loop (flushPromises идёт через
// setImmediate/setTimeout), так что дожидаемся именно события, с запасом по time-budget
// с большим запасом от дефолтного testTimeout (5000ms), а не гадаем сколько раз его прокрутить.
const waitFor = async (condition: () => boolean, timeoutMs = 3000) => {
  const start = Date.now()
  while (!condition() && Date.now() - start < timeoutMs) {
    await flushPromises()
    await nextTick()
  }
}

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

      // `placeholder` — не prop Calendar: он падает fallthrough-атрибутом на корень (`[data-calendar]`).
      // `wrapper.attributes()` у компонента с компонентным корнем читает контейнер mount'а, поэтому
      // проверяем сам корень.
      expect(wrapper.find("[data-calendar]").attributes("placeholder")).toBe(placeholderText)
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
      const inputElement = wrapper.find("[data-calendar-control]")
      await waitFor(() => inputElement.text().length > 0)
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
        // ---B10 (2026-07-04) — структурные классы мигрированы gray-*/stone-* → surface-* (тот же tone).
        if (mode === "outlined") {
          expect(layout.classes().join(" ")).toContain("border-surface-300")
          expect(layout.classes().join(" ")).toContain("dark:border-surface-600")
        } else if (mode === "filled") {
          expect(layout.classes().join(" ")).toContain("bg-surface-100")
          expect(layout.classes().join(" ")).toContain("dark:bg-surface-900")
        } else if (mode === "underlined") {
          expect(layout.classes().join(" ")).toContain("border-b")
          expect(layout.classes().join(" ")).toContain("dark:border-surface-700")
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
              datePickerProps: {
                isRange: false,
                mask: "DD.MM.YYYY"
              }
            }
          })

          // Найти элемент календаря
          const calendarTrigger = wrapper.find("[data-calendar-control]")
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
          range: true,
          datePickerProps: {
            mask: "YYYY-MM-DD"
          }
        }
      })
      const dateDisplay = wrapper.find("[data-calendar-control]")
      await waitFor(() => dateDisplay.text().length > 0)
      expect(dateDisplay.text()).toContain("2024-11-23")
      expect(dateDisplay.text()).toContain("2024-11-25")
    })
  })

  describe("Masks and placeholders", () => {
    it("applies mask correctly", async () => {
      const wrapper = mount(Calendar, {
        props: {
          modelValue: "2024-11-23",
          datePickerProps: {
            mask: "DD.MM.YYYY"
          }
        }
      })
      const dateDisplay = wrapper.find("[data-calendar-control]")
      await waitFor(() => dateDisplay.text().length > 0)
      expect(dateDisplay.text()).toBe("23.11.2024")
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
      await waitFor(() => wrapper.findComponent(DatePicker as any).exists())
      const datePicker = wrapper.findComponent(DatePicker as any)
      expect(datePicker.exists()).toBe(true)
      expect(datePicker.props("locale")).toBe("ru")
    })

    it("datePickerProps.locale (consumer override) wins over active locale", async () => {
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
          datePickerProps: { locale: "en" }
        }
      })
      await waitFor(() => wrapper.findComponent(DatePicker as any).exists())
      const datePicker = wrapper.findComponent(DatePicker as any)
      expect(datePicker.exists()).toBe(true)
      expect(datePicker.props("locale")).toBe("en")
    })
  })

  describe("Accessibility — label association (Wave 4)", () => {
    it("links the calendar trigger to the label via aria-labelledby", () => {
      const wrapper = mount(Calendar, { props: { label: "Date", id: "date" } })
      const trigger = wrapper.find("[data-calendar-control]")
      expect(trigger.exists()).toBe(true)
      expect(trigger.attributes("aria-labelledby")).toBe("date-label")
      expect(wrapper.find("label[data-label]").attributes("id")).toBe("date-label")
    })
  })

  // ---B10 (2026-07-04) — миграция structural gray-*/stone-*/slate-* → semantic surface-* (тот же
  // числовой tone, только family rename). `surface` — 23-й named color в lib/theme/primitive.ts,
  // дефолт = точная копия gray. Source-scan (не mount) — часть классов вычисляется в computed/ref
  // style-строках (classText, classPicker, classPlaceholder) и в inline :class-биндингах шаблона
  // (separator-иконки), которые не всегда достижимы через один DOM-снимок за один mount.
  // v-calendar's OWN internal theming (--vc-accent-*, vc-primary) — не в scope, не трогалось.
  describe("B10 — semantic surface-* tokens (2026-07-04)", () => {
    it("does not use hardcoded gray-*/stone-*/slate-*/zinc-*/neutral-* classes in Calendar.vue", async () => {
      const fs = await import("node:fs/promises")
      const path = await import("node:path")
      const url = await import("node:url")
      const here = path.dirname(url.fileURLToPath(import.meta.url))
      const src = await fs.readFile(path.join(here, "Calendar.vue"), "utf8")
      // Структурные Tailwind color-primitive классы FishtVue-обёртки не должны остаться.
      expect(src).not.toMatch(
        /\b(?:text|bg|border|placeholder|fill|ring|divide)-(?:gray|stone|slate|zinc|neutral)-\d{2,3}\b/
      )
    })

    it("uses surface-* in place of the former gray-*/stone-*/slate-* classes (same numeric tone)", async () => {
      const fs = await import("node:fs/promises")
      const path = await import("node:path")
      const url = await import("node:url")
      const here = path.dirname(url.fileURLToPath(import.meta.url))
      const src = await fs.readFile(path.join(here, "Calendar.vue"), "utf8")
      // date text + placeholder (было text-gray-900/dark:text-gray-100 + placeholder:text-gray-400/dark:text-gray-600)
      expect(src).toMatch(/text-surface-900/)
      expect(src).toMatch(/dark:text-surface-100/)
      expect(src).toMatch(/placeholder:text-surface-400/)
      expect(src).toMatch(/placeholder:dark:text-surface-600/)
      // outlined border (было border-gray-300/dark:border-gray-600)
      expect(src).toMatch(/border-surface-300/)
      expect(src).toMatch(/dark:border-surface-600/)
      // underlined border (было border-gray-300/dark:border-gray-700)
      expect(src).toMatch(/dark:border-surface-700/)
      // filled background (было bg-stone-100/dark:bg-stone-900)
      expect(src).toMatch(/bg-surface-100/)
      expect(src).toMatch(/dark:bg-surface-900/)
      // underlined background (было bg-stone-50/dark:bg-stone-950)
      expect(src).toMatch(/bg-surface-50/)
      expect(src).toMatch(/dark:bg-surface-950/)
      // placeholder icon (было text-gray-400/dark:text-gray-600)
      expect(src).toMatch(/text-surface-400 dark:text-surface-600/)
      // disabled state (было text-slate-500 dark:text-slate-500) — появляется несколько раз
      const disabledMatches = src.match(/text-surface-500 dark:text-surface-500/g) ?? []
      expect(disabledMatches.length).toBeGreaterThanOrEqual(3)
      // separator icon, conditional non-disabled branch (было text-gray-400 dark:text-gray-400 / text-gray-600 dark:text-gray-400)
      expect(src).toMatch(/text-surface-400 dark:text-surface-400/)
      expect(src).toMatch(/text-surface-600 dark:text-surface-400/)
    })

    it("renders surface-* border/background classes for each mode (DOM assertion)", () => {
      const outlined = mount(Calendar, { props: { mode: "outlined" } })
      const outlinedPicker = outlined.find("[data-calendar-picker]")
      expect(outlinedPicker.classes().join(" ")).toContain("border-surface-300")
      expect(outlinedPicker.classes().join(" ")).toContain("dark:border-surface-600")
      expect(outlinedPicker.classes().join(" ")).not.toMatch(/\bborder-gray-300\b/)

      const filled = mount(Calendar, { props: { mode: "filled" } })
      const filledPicker = filled.find("[data-calendar-picker]")
      expect(filledPicker.classes().join(" ")).toContain("bg-surface-100")
      expect(filledPicker.classes().join(" ")).toContain("dark:bg-surface-900")
      expect(filledPicker.classes().join(" ")).not.toMatch(/\bbg-stone-100\b/)

      const underlined = mount(Calendar, { props: { mode: "underlined" } })
      const underlinedPicker = underlined.find("[data-calendar-picker]")
      expect(underlinedPicker.classes().join(" ")).toContain("dark:border-surface-700")
      expect(underlinedPicker.classes().join(" ")).not.toMatch(/\bdark:border-gray-700\b/)
    })

    it("does not touch v-calendar's own internal theming (--vc-accent-*, vc-primary class)", async () => {
      const fs = await import("node:fs/promises")
      const path = await import("node:path")
      const url = await import("node:url")
      const here = path.dirname(url.fileURLToPath(import.meta.url))
      const src = await fs.readFile(path.join(here, "Calendar.vue"), "utf8")
      // v-calendar's own CSS-var accent tokens must remain untouched by this migration.
      expect(src).toMatch(/--vc-accent-50/)
      expect(src).toMatch(/vc-primary/)
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

// =====================================================================================================================
// Wave 13 / W2 — контракт props 1.0: `class` → корень `[data-calendar]`, `classes` → карта
// (семейные + `control`/`text`/`picker`), `datePickerProps`/`range`/`closeOnSelect`/`fixWindowProps`,
// emits `ready`/`active`/`update:invalid`.
// =====================================================================================================================
describe("Calendar — props 1.0 (Wave 13, W2)", () => {
  const withOptions = (options: Record<string, unknown>) => ({
    install(app: any) {
      app.use(FishtVue, { componentsOptions: { Calendar: options } })
    }
  })
  afterEach(() => {
    delete (window as any).FishtVue
  })

  it("публичный набор props — контракт 1.0 (paramsDatePicker/isNotCloseOnDateChange/class*/paramsFixWindow сняты)", () => {
    const wrapper = mount(Calendar)
    expect(wrapper.props()).toEqual({
      id: undefined,
      modelValue: undefined,
      classes: undefined,
      mode: undefined,
      label: undefined,
      labelMode: undefined,
      invalid: undefined,
      messageInvalid: undefined,
      required: undefined,
      loading: undefined,
      disabled: undefined,
      help: undefined,
      clearable: undefined,
      width: undefined,
      height: undefined,
      class: undefined,
      offsetTop: undefined,
      datePickerProps: undefined,
      range: undefined,
      autoFocus: undefined,
      closeOnSelect: undefined,
      fixWindowProps: undefined
    })
  })

  it("корень Calendar — корень InputLayout с data-calendar; триггер получил data-calendar-control", () => {
    const wrapper = mount(Calendar, { props: { label: "L", class: "probe-root" } })
    const root = wrapper.find("[data-calendar]")
    expect(root.attributes("data-input-layout")).toBeDefined()
    expect(root.classes()).toContain("probe-root")
    expect(root.element.querySelectorAll("[class~='probe-root']").length).toBe(0)
    expect(wrapper.find("[data-calendar-control]").exists()).toBe(true)
  })

  it.each([
    ["base", "[data-input-layout-base]"],
    ["label", "[data-calendar] > [data-label]"],
    ["control", "[data-calendar-control]"],
    ["text", "[data-calendar-text]"],
    ["picker", "[data-calendar-picker]"]
  ])("classes.%s → %s", (key, selector) => {
    const wrapper = mount(Calendar, { props: { label: "L", classes: { [key]: "probe-key" } } })
    expect(wrapper.find(selector).classes()).toContain("probe-key")
    expect(wrapper.find("[data-calendar]").classes()).not.toContain("probe-key")
  })

  it("componentsOptions.Calendar.classes сливается по ключу под props.classes", () => {
    const wrapper = mount(Calendar, {
      global: { plugins: [withOptions({ class: "opt-root", classes: { control: "p-2 opt-ctl" } })] },
      props: { class: "prop-root", classes: { control: "p-4" } }
    })
    const control = wrapper.find("[data-calendar-control]").classes()
    expect(control).toContain("p-4")
    expect(control).toContain("opt-ctl")
    expect(control).not.toContain("p-2")
    expect(wrapper.find("[data-calendar]").classes()).toEqual(expect.arrayContaining(["opt-root", "prop-root"]))
  })

  it("range вместо datePickerProps.isRange: включает range-разметку и уходит в DatePicker", () => {
    const single = mount(Calendar)
    expect((single.vm as any).isRange).toBe(false)
    expect((single.vm as any).datePickerOptions.isRange).toBe(false)
    const ranged = mount(Calendar, { props: { range: true } })
    expect((ranged.vm as any).isRange).toBe(true)
    expect((ranged.vm as any).datePickerOptions.isRange).toBe(true)
    // legacy-путь через bag больше не включает диапазон
    const legacy = mount(Calendar, { props: { datePickerProps: { isRange: true } as any } })
    expect((legacy.vm as any).isRange).toBe(false)
  })

  it("closeOnSelect: default true закрывает picker при выборе, false — оставляет открытым", async () => {
    const wrapper = mount(Calendar)
    expect(wrapper.props("closeOnSelect")).toBeUndefined()
    expect((wrapper.vm as any).isCloseOnSelect).toBe(true)
    ;(wrapper.vm as any).openCalendar()
    await nextTick()
    ;(wrapper.vm as any).changeDate("01.01.2026")
    expect((wrapper.vm as any).isOpenPicker).toBe(false)
    const kept = mount(Calendar, { props: { closeOnSelect: false } })
    ;(kept.vm as any).openCalendar()
    await nextTick()
    ;(kept.vm as any).changeDate("01.01.2026")
    expect((kept.vm as any).isOpenPicker).toBe(true)
  })

  it("closeOnSelect достижим через componentsOptions", async () => {
    const wrapper = mount(Calendar, { global: { plugins: [withOptions({ closeOnSelect: false })] } })
    ;(wrapper.vm as any).openCalendar()
    await nextTick()
    ;(wrapper.vm as any).changeDate("01.01.2026")
    expect((wrapper.vm as any).isOpenPicker).toBe(true)
  })

  it("fixWindowProps заменяет paramsFixWindow", () => {
    const wrapper = mount(Calendar, { props: { fixWindowProps: { position: "top-right" } } })
    expect((wrapper.vm as any).fixWindowProps.position).toBe("top-right")
    expect(wrapper.findComponent({ name: "FixWindow" }).props("position")).toBe("top-right")
  })

  it("emits ready / active / update:invalid вместо getCalendar / isActive / update:isInvalid", async () => {
    const wrapper = mount(Calendar)
    ;(wrapper.vm as any).openCalendar()
    await nextTick()
    expect(wrapper.emitted("active")?.[0]).toEqual([true])
    expect(wrapper.emitted("isActive")).toBeUndefined()
    ;(wrapper.vm as any).changeDate("01.01.2026")
    expect(wrapper.emitted("update:invalid")?.[0]).toEqual([false])
    expect(wrapper.emitted("update:isInvalid")).toBeUndefined()
    expect(wrapper.emitted("getCalendar")).toBeUndefined()
  })

  it("focus-ring триггера живёт в classes.base у InputLayout и уступает рамке ошибки", async () => {
    const wrapper = mount(Calendar, { attachTo: document.body })
    const base = () => wrapper.find("[data-input-layout-base]").classes()
    await wrapper.find("[data-calendar-control]").trigger("focusin")
    expect(base()).toContain("ring-theme-600")
    await wrapper.setProps({ invalid: true })
    expect(base()).toContain("ring-red-500")
    expect(base()).not.toContain("ring-theme-600")
    wrapper.unmount()
  })

  it("clearable достижим через componentsOptions и уезжает в InputLayout", () => {
    const wrapper = mount(Calendar, {
      global: { plugins: [withOptions({ clearable: true })] },
      props: { modelValue: "01.01.2026" }
    })
    expect(wrapper.props("clearable")).toBeUndefined()
    expect((wrapper.vm as any).isClearable).toBe(true)
    expect(wrapper.findComponent({ name: "InputLayout" }).props("clearable")).toBe(true)
  })

  it("unstyled: классы потребителя остаются на корне, control и picker, темы нет", () => {
    const wrapper = mount(Calendar, {
      global: { plugins: [{ install: (app: any) => app.use(FishtVue, { unstyled: true }) }] },
      props: { class: "probe-root", classes: { control: "probe-ctl", picker: "probe-picker" } }
    })
    expect(wrapper.find("[data-calendar]").classes()).toEqual(["fv", "probe-root"])
    expect(wrapper.find("[data-calendar-control]").classes()).toEqual(["fv", "probe-ctl"])
    const picker = wrapper.find("[data-calendar-picker]").classes()
    expect(picker).toContain("probe-picker")
    expect(picker.some((c) => c.startsWith("fishtvue-"))).toBe(false)
  })
})

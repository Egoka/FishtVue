import { mount } from "@vue/test-utils"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import FishtVue from "fishtvue/config"
import Pagination from "fishtvue/pagination/Pagination.vue"
import { nextTick } from "vue"
import { PaginationProps } from "fishtvue/pagination/Pagination"

describe("Pagination Component Tests", () => {
  describe("Pagination Component - Without Library Initialization", () => {
    it("renders with default props", () => {
      const wrapper = mount(Pagination)
      expect(wrapper.exists()).toBe(true)

      const buttons = wrapper.findAll("button")
      expect(buttons).toHaveLength(4) // Previous, Next, and one page button by default
    })

    it("displays the correct number of pages", () => {
      const wrapper = mount(Pagination, {
        props: { total: 50, pageSize: 10 }
      })

      const pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(5) // 50 items, 10 items per page = 5 pages
    })

    it('emits "update:modelValue" on page change', async () => {
      const wrapper = mount(Pagination, {
        props: { total: 30, pageSize: 10 }
      })

      const nextButton = wrapper.find("[data-pagination-nav-next] button")
      await nextButton.trigger("click")

      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([2])
    })

    it('renders page size selector when "pageSizeSelector" is true', () => {
      const wrapper = mount(Pagination, {
        props: { pageSizeSelector: true, pageSizes: [5, 10, 20] }
      })

      const selector = wrapper.find("[data-pagination-selector]")
      expect(selector.exists()).toBe(true)
    })

    it.each([
      [1, 10, 50, 5], // 50 total, 10 per page
      [2, 5, 25, 5], // 25 total, 5 per page
      [3, 20, 100, 5] // 100 total, 20 per page
    ])(
      "displays the correct number of pages for activePage: %i, pageSize: %i, total: %i",
      (activePage, pageSize, total, expectedPages) => {
        const wrapper = mount(Pagination, {
          props: { modelValue: activePage, pageSize, total }
        })

        const pages = wrapper.findAll("[data-pagination-nav-pages] button")
        expect(pages).toHaveLength(expectedPages)
      }
    )

    describe("Pagination Component - Mode Prop", () => {
      it.each([
        [
          "outlined",
          "bg-white dark:bg-surface-950 ring-1 ring-inset rounded-lg",
          "border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-950"
        ], // Expected class for "outlined"
        ["filled", "bg-surface-100 dark:bg-surface-900 rounded-lg", "bg-surface-100 dark:bg-surface-900"], // Expected class for "filled"
        ["underlined", "border-t-2 border-transparent", ""], // Expected class for "underlined"
        ["custom", "", ""] // Default or fallback class for custom modes
      ] as [PaginationProps["mode"], string, string][])(
        'renders correctly with mode="%s"',
        (mode, expectedClass, expectedModeStyleSelect) => {
          const wrapper = mount(Pagination, {
            props: { mode }
          })

          const paginationButtons = wrapper.findAll("[data-pagination-nav-pages] button")
          paginationButtons.forEach((button) => {
            expect(button.classes().join(" ")).toContain(expectedClass)
          })
          expect(wrapper.vm.modeStyleSelect).toBe(expectedModeStyleSelect)
        }
      )

      it("applies default mode when mode is not provided", () => {
        const wrapper = mount(Pagination)

        const paginationButtons = wrapper.findAll("[data-pagination-nav-pages] button")
        paginationButtons.forEach((button) => {
          expect(button.classes().join(" ")).toContain("bg-white dark:bg-surface-950 ring-1 ring-inset rounded-lg") // Default "outlined" mode
        })
      })
    })
    describe("Pagination Component - Function Testing", () => {
      let wrapper: ReturnType<typeof mount>

      beforeEach(() => {
        wrapper = mount(Pagination, {
          props: {
            modelValue: 1,
            total: 100,
            pageSize: 5,
            visiblePages: 7
          }
        })
      })

      afterEach(() => {
        wrapper.unmount()
      })

      it.each([
        [1, [1, 2, 3, 4, 0, 23], 2],
        [2, [1, 2, 3, 4, 0, 23], 3],
        [3, [1, 0, 3, 4, 5, 0, 23], 4],
        [4, [1, 0, 4, 5, 6, 0, 23], 5]
      ])("handles array input %s correctly", async (modelValue, inputArray, expectedActivePage) => {
        await wrapper.setProps({ modelValue })
        const instance = wrapper.vm as any
        instance.switchPage(inputArray)
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(expectedActivePage)
      })

      it.each([
        [1, 1], // Number test case with expected active page
        [10, 10],
        [23, 23]
      ])("handles number input %s correctly", (inputNumber, expectedActivePage) => {
        const instance = wrapper.vm as any
        instance.switchPage(inputNumber)

        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(expectedActivePage)
      })
    })

    describe("Pagination Component - Next and Previous Buttons", () => {
      let wrapper: any

      beforeEach(() => {
        wrapper = mount(Pagination, {
          props: {
            modelValue: 1,
            total: 100,
            pageSize: 10,
            visiblePages: 5
          }
        })
      })

      afterEach(() => {
        wrapper.unmount()
      })

      it("navigates to the next page when Next button is clicked", async () => {
        const nextButton = wrapper.find("[data-pagination-nav-next] button")

        expect(nextButton.exists()).toBe(true)
        expect(wrapper.props("modelValue")).toBe(1)

        await nextButton.trigger("click")

        const emitted = wrapper.emitted("update:modelValue")
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(2) // Expect the next page to be 2
      })

      it("navigates to the previous page when Previous button is clicked", async () => {
        // Update to a middle page
        await wrapper.setProps({ modelValue: 2 })

        const prevButton = wrapper.find("[data-pagination-nav-previous] button")

        expect(prevButton.exists()).toBe(true)
        expect(wrapper.props("modelValue")).toBe(2)

        await prevButton.trigger("click")

        const emitted = wrapper.emitted("update:modelValue")
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(1) // Expect the previous page to be 1
      })

      it("disables Previous button on the first page", () => {
        const prevButton = wrapper.find("[data-pagination-nav-previous] button")
        expect(prevButton.attributes("disabled")).toBeDefined()
      })

      it("disables Next button on the last page", async () => {
        const total = 100
        const pageSize = 10
        const lastPage = total / pageSize

        await wrapper.setProps({ modelValue: lastPage })

        const nextButton = wrapper.find("[data-pagination-nav-next] button")
        expect(nextButton.attributes("disabled")).toBeDefined()
      })
      it("switching pagination pages", async () => {
        expect(wrapper.props("modelValue")).toBe(1)
        await wrapper.find("[data-pagination-short-version] button[data-pagination-short-next]").trigger("click")
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(2)
        await wrapper.find("[data-pagination-short-version] button[data-pagination-short-previous]").trigger("click")
        expect(wrapper.emitted("update:modelValue")?.[1][0]).toBe(1)
        await wrapper.find("[data-pagination-nav-next] button").trigger("click")
        expect(wrapper.emitted("update:modelValue")?.[2][0]).toBe(2)
        await wrapper.find("[data-pagination-nav-previous] button").trigger("click")
        expect(wrapper.emitted("update:modelValue")?.[3][0]).toBe(1)

        expect(wrapper.findAll("[data-pagination-nav-pages] [data-pagination-nav-page]").length).toBe(5)

        await wrapper.findAll("[data-pagination-nav-pages] [data-pagination-nav-page]")[3].trigger("click")
        await nextTick()
        expect(wrapper.emitted("update:modelValue")?.[4][0]).toBe(4)
        await wrapper.findAll("[data-pagination-nav-pages] [data-pagination-nav-page]")[4].trigger("click")
        await nextTick()
        expect(wrapper.emitted("update:modelValue")?.[5][0]).toBe(10)
      })
    })
  })
  describe("Pagination Component - ResizeObserver cleanup (memory leak guard)", () => {
    it("observes both navigation links on mount and does not disconnect early", () => {
      const observeSpy = vi.spyOn(global.ResizeObserver.prototype, "observe")
      const disconnectSpy = vi.spyOn(global.ResizeObserver.prototype, "disconnect")

      const wrapper = mount(Pagination, {
        props: { modelValue: 1, total: 100, pageSize: 10 }
      })

      // оба nav-link (previous + next) должны наблюдаться
      expect(observeSpy).toHaveBeenCalledTimes(2)
      expect(disconnectSpy).not.toHaveBeenCalled()

      wrapper.unmount()
      observeSpy.mockRestore()
      disconnectSpy.mockRestore()
    })

    it("disconnects every ResizeObserver on unmount", () => {
      const disconnectSpy = vi.spyOn(global.ResizeObserver.prototype, "disconnect")

      const wrapper = mount(Pagination, {
        props: { modelValue: 1, total: 100, pageSize: 10 }
      })
      expect(disconnectSpy).not.toHaveBeenCalled()

      wrapper.unmount()
      // оба observer'а отключены — heap не растёт
      expect(disconnectSpy).toHaveBeenCalledTimes(2)

      disconnectSpy.mockRestore()
    })

    it("scales disconnect count across repeated mount/unmount cycles", () => {
      const disconnectSpy = vi.spyOn(global.ResizeObserver.prototype, "disconnect")

      for (let i = 0; i < 5; i++) {
        const wrapper = mount(Pagination, {
          props: { modelValue: 1, total: 100, pageSize: 10 }
        })
        expect(() => wrapper.unmount()).not.toThrow()
      }

      // 5 циклов × 2 observer'а = 10 disconnect-вызовов
      expect(disconnectSpy).toHaveBeenCalledTimes(10)

      disconnectSpy.mockRestore()
    })
  })

  describe("Pagination Component - With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Pagination: options
          }
        })
      }
    })

    it("applies default options from library", () => {
      const app = createAppWithFishtVue({
        pageSize: 20,
        total: 100
      })

      const wrapper = mount(Pagination, {
        global: { plugins: [app] }
      })

      const pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(5) // 100 total, 20 per page = 5 pages
    })

    it("overrides library defaults with local props", () => {
      const app = createAppWithFishtVue({
        pageSize: 10,
        total: 50
      })

      const wrapper = mount(Pagination, {
        global: { plugins: [app] },
        props: { pageSize: 5, total: 25 }
      })

      const pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(5) // 25 total, 5 per page = 5 pages
    })

    it('renders visible number of pages based on "visiblePages"', async () => {
      const app = createAppWithFishtVue()

      const wrapper = mount(Pagination, {
        global: { plugins: [app] },
        // @ts-ignore
        props: { visiblePages: 3, total: 200, pageSize: 10 }
      })

      let pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(5) // Restricts to visiblePages
      await wrapper.setProps({ visiblePages: 6 })
      pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(6) // Restricts to visiblePages
    })

    it("emits size change event on size selector", async () => {
      const app = createAppWithFishtVue()

      const wrapper = mount(Pagination, {
        global: { plugins: [app] },
        props: { pageSizeSelector: true, pageSizes: [5, 10, 20] }
      })

      await wrapper.find("[data-pagination-selector]").trigger("click")
      const SelectComponent = wrapper.findComponent({ name: "Select" })
      expect(SelectComponent.vm.isOpenList).toBe(true)
      expect(SelectComponent.vm.value).toBe(5)

      await SelectComponent.findAll("[data-select-list-item]")[2].trigger("click")
      expect(SelectComponent.vm.value).toBe(20)
      expect(SelectComponent.emitted("update:modelValue")?.[0]).toEqual([20, [{ key: 20, value: "20 rows" }]])

      expect(wrapper.emitted("update:pageSize")).toBeTruthy()
      expect(wrapper.emitted("update:pageSize")?.[0]).toEqual([20])
    })
  })

  // ---AUDIT CLOSE-OUT (Issues 2–8)--------------------------------------------

  // Issue 2 (C17 / Wave 2.3) — SSR-инжекция наследуется от Component.__hooks();
  // ручной initStyle() в SFC запрещён каноном (dev-patterns §2).
  describe("Pagination Component - Initialization (no duplicate initStyle)", () => {
    it("SFC does not call initStyle() manually (relies on Component.__hooks)", () => {
      const here = dirname(fileURLToPath(import.meta.url))
      // отбрасываем line-комментарии перед проверкой: comment-marker канона сам
      // упоминает `Pagination.initStyle()`, иначе был бы false positive.
      const code = readFileSync(join(here, "Pagination.vue"), "utf8").replace(/\/\/[^\n]*/g, "")
      expect(code).not.toMatch(/Pagination\.initStyle\s*\(/)
    })
  })

  // Issue 3 (L53) — cross-cutting unstyled guard в Component.setStyle().
  describe("Pagination Component - Configuration support (unstyled)", () => {
    afterEach(() => {
      delete (window as any).FishtVue
    })

    it("renders empty root class when unstyled: true", () => {
      const app = {
        install(a: any) {
          a.use(FishtVue, { unstyled: true })
        }
      }
      const wrapper = mount(Pagination, {
        global: { plugins: [app] },
        props: { total: 50, pageSize: 10 }
      })
      expect(wrapper.find("[data-pagination]").classes()).toEqual(["fv"])
    })

    it("renders styled root class when unstyled is not set", () => {
      const wrapper = mount(Pagination, { props: { total: 50, pageSize: 10 } })
      expect(wrapper.find("[data-pagination]").classes().join(" ")).toContain("fishtvue-pagination")
    })
  })

  // Issues 4 & 5 (E29.1 / E29.5) — ARIA landmark, labels, live region.
  describe("Pagination Component - Accessibility (ARIA)", () => {
    const mountWithLocale = (props: Record<string, any> = {}) =>
      mount(Pagination, {
        global: {
          plugins: [
            {
              install(app: any) {
                app.use(FishtVue, {
                  locale: {
                    activeLocale: "en",
                    defaultLocale: "en",
                    messages: { en: { of: "of", pagination: { label: "Pagination", page: "Page" } } }
                  }
                })
              }
            }
          ]
        },
        props
      })

    it("root is a <nav> landmark with role and localized aria-label", () => {
      const wrapper = mountWithLocale({ total: 50, pageSize: 10, modelValue: 1 })
      const root = wrapper.find("[data-pagination]")
      expect(root.element.tagName).toBe("NAV")
      expect(root.attributes("role")).toBe("navigation")
      expect(root.attributes("aria-label")).toBe("Pagination")
    })

    it("does not render a nested second navigation landmark", () => {
      const wrapper = mountWithLocale({ total: 50, pageSize: 10, modelValue: 1 })
      expect(wrapper.findAll("nav")).toHaveLength(1)
      // внутренний контейнер страниц больше не <nav>
      expect(wrapper.find("[data-pagination-nav]").element.tagName).not.toBe("NAV")
    })

    it("page buttons expose aria-label and aria-current", () => {
      const wrapper = mountWithLocale({ total: 50, pageSize: 10, modelValue: 2 })
      const pageButtons = wrapper.findAll("button[data-pagination-nav-page]")
      expect(pageButtons.length).toBeGreaterThan(0)
      pageButtons.forEach((btn) => {
        expect(btn.attributes("aria-label")).toMatch(/^Page \d+$/)
      })
      const active = pageButtons.find((b) => b.text() === "2")
      expect(active?.attributes("aria-current")).toBe("page")
    })

    it("renders a polite live region announcing the active page", async () => {
      const wrapper = mountWithLocale({ total: 100, pageSize: 10, modelValue: 1 })
      const live = wrapper.find("[data-pagination-live]")
      expect(live.exists()).toBe(true)
      expect(live.attributes("aria-live")).toBe("polite")
      expect(live.attributes("role")).toBe("status")
      expect(live.text()).toContain("1")
      expect(live.text()).toContain("10")
      await wrapper.setProps({ modelValue: 3 })
      expect(wrapper.find("[data-pagination-live]").text()).toContain("3")
    })
  })

  // Issue 6 (F31) — RTL: directional иконки флипаются, физический ml-3 → logical ms-3.
  describe("Pagination Component - RTL (direction-aware icons)", () => {
    it("compact chevron icon carries rtl flip", () => {
      const wrapper = mount(Pagination, {
        props: { total: 100, pageSize: 10, modelValue: 1, infoText: true }
      })
      const prevIcon = wrapper.find("[data-pagination-nav-previous] svg")
      expect(prevIcon.exists()).toBe(true)
      expect(prevIcon.classes().join(" ")).toContain("rtl:-scale-x-100")
    })

    it("long-form arrow uses logical margin (ms) not physical (ml)", () => {
      const wrapper = mount(Pagination, { props: { total: 100, pageSize: 10, modelValue: 5 } })
      const nextIcon = wrapper.find("[data-pagination-nav-next] svg")
      expect(nextIcon.exists()).toBe(true)
      const cls = nextIcon.classes().join(" ")
      expect(cls).toContain("ms-3")
      expect(cls).not.toContain("ml-3")
      expect(cls).toContain("rtl:-scale-x-100")
    })
  })

  // Issue 7 (G34) — expose root ref + focus().
  describe("Pagination Component - Expose (paginationRef & focus)", () => {
    it("exposes paginationRef pointing to the root nav and a focus() method", () => {
      const wrapper = mount(Pagination, { props: { total: 50, pageSize: 10 } })
      const vm = wrapper.vm as any
      expect(vm.paginationRef).toBe(wrapper.find("[data-pagination]").element)
      expect(typeof vm.focus).toBe("function")
      expect(() => vm.focus()).not.toThrow()
    })
  })

  // Issue 8 (N59 / B10) — print styles + forced-colors high-contrast.
  describe("Pagination Component - Print & forced-colors", () => {
    it("root container carries print styles", () => {
      const wrapper = mount(Pagination, { props: { total: 50, pageSize: 10 } })
      expect(wrapper.find("[data-pagination]").classes().join(" ")).toMatch(/print:/)
    })

    it("active page indicator is distinguishable in forced-colors mode", () => {
      const wrapper = mount(Pagination, { props: { total: 100, pageSize: 10, modelValue: 1 } })
      const active = wrapper.findAll("button[data-pagination-nav-page]").find((b) => b.text() === "1")
      expect(active?.classes().join(" ")).toMatch(/forced-colors:/)
    })
  })

  // ---B10 (Wave 9, 2026-07-05) — semantic surface tokens вместо hardcoded gray/stone/neutral-family classes ---
  // Family rename только: та же тональность (50-950), только смена имени палитры. theme-* (active-состояние,
  // preset-aware) остаётся нетронутым — см. Documentation/issues/pagination.md.
  describe("Pagination Component - B10 semantic surface tokens", () => {
    const legacyGrayFamily = /\b(?:bg|text|border|ring|from|via)-(?:neutral|stone|zinc|slate|gray)-\d+/

    it("outlined mode: modeStyleSelect + page-size selector wrapper use surface-family (not gray)", () => {
      const wrapper = mount(Pagination, { props: { mode: "outlined", total: 50, pageSize: 10 } })
      const cls = wrapper.vm.modeStyleSelect as string
      expect(cls).toBe("border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-950")
      expect(cls).not.toMatch(legacyGrayFamily)
    })

    it("filled mode: modeStyleSelect + button surface uses surface-family (not stone)", () => {
      const wrapper = mount(Pagination, { props: { mode: "filled", total: 50, pageSize: 10 } })
      const cls = wrapper.vm.modeStyleSelect as string
      expect(cls).toBe("bg-surface-100 dark:bg-surface-900")
      expect(cls).not.toMatch(legacyGrayFamily)

      // modeStyle (prev/next nav Button'ы) — Pagination-вклад в class Button'а, не merged DOM-класс целиком:
      // сам <Button> несёт собственные hardcoded neutral-* internals (disabled/active/focus-visible state),
      // это отдельная зона ответственности Button.vue, не входит в область этой миграции.
      const prevButton = wrapper.find("[data-pagination-nav-previous] button")
      expect(prevButton.classes().join(" ")).toContain("bg-surface-100 dark:bg-surface-900")

      // inactive page-кнопки (не текущая modelValue) — исключаем активную страницу: она идёт по theme-* ветке.
      const inactivePages = wrapper
        .findAll("button[data-pagination-nav-page]")
        .filter((b) => b.attributes("aria-current") !== "page")
      expect(inactivePages.length).toBeGreaterThan(0)
      inactivePages.forEach((button) => {
        expect(button.classes().join(" ")).toContain("bg-surface-100 dark:bg-surface-900")
      })
    })

    it("underlined mode: hover border/text on nav buttons use surface-family (not gray)", () => {
      const wrapper = mount(Pagination, { props: { mode: "underlined", total: 50, pageSize: 10 } })
      const prevButton = wrapper.find("[data-pagination-nav-previous] button")
      const cls = prevButton.classes().join(" ")
      expect(cls).toContain("hover:border-surface-300")
      expect(cls).toContain("hover:text-surface-700")
      expect(cls).toContain("dark:hover:border-surface-700")
      expect(cls).toContain("dark:hover:text-surface-300")
    })

    it("page-size selector text + select classes.control use surface-family (not gray)", () => {
      const wrapper = mount(Pagination, {
        props: { pageSizeSelector: true, pageSizes: [5, 10, 20], total: 50, pageSize: 10 }
      })
      const selectorText = wrapper.find("[data-pagination-selector] p")
      expect(selectorText.classes().join(" ")).toContain("text-surface-400 dark:text-surface-500")

      const selectProps = (wrapper.vm as any).selectProps
      expect(selectProps.classes.control).toBe("font-bold text-surface-600 dark:text-surface-500")
      expect(selectProps.classes.control).not.toMatch(legacyGrayFamily)
    })

    it("root border + short-content + info-text use surface-family (not gray/neutral)", () => {
      const wrapper = mount(Pagination, {
        props: { total: 100, pageSize: 10, modelValue: 1, infoText: true }
      })
      const root = wrapper.find("[data-pagination]")
      expect(root.classes().join(" ")).toContain("border-surface-200 dark:border-surface-800")
      expect(root.classes().join(" ")).not.toMatch(legacyGrayFamily)

      const infoTextContent = wrapper.find("[data-pagination-content-info] p")
      expect(infoTextContent.classes().join(" ")).toContain("text-surface-600 dark:text-surface-500")
      const infoTextPage = wrapper.findAll("[data-pagination-content-info] span").find((s) => s.text() === "100")
      expect(infoTextPage?.classes().join(" ")).toContain("dark:text-surface-400")
    })

    it("short-version content (mobile) counters use surface-family (not neutral)", () => {
      const wrapper = mount(Pagination, { props: { total: 100, pageSize: 10, modelValue: 1 } })
      // classShortContent рендерится дважды: mobile short-version (первым — несёт data-pagination-content)
      // и desktop short-content (bare <div> внутри data-pagination-nav, без своего data-атрибута).
      const mobileShortContent = wrapper.find("[data-pagination-short-version] [data-pagination-content]")
      expect(mobileShortContent.classes().join(" ")).toContain("text-surface-500")

      const desktopShortContent = wrapper.find("[data-pagination-nav] > div:nth-child(3)")
      expect(desktopShortContent.classes().join(" ")).toContain("text-surface-500")
    })

    it("nav prev/next icon (content variant) uses surface-family (not gray)", () => {
      const wrapper = mount(Pagination, { props: { total: 100, pageSize: 10, modelValue: 5 } })
      const nextIcon = wrapper.find("[data-pagination-nav-next] svg")
      expect(nextIcon.classes().join(" ")).toContain("text-surface-400")
      expect(nextIcon.classes().join(" ")).not.toMatch(legacyGrayFamily)
    })

    it("ellipsis (not-page) icon uses surface-family (not gray)", () => {
      const wrapper = mount(Pagination, {
        props: { total: 1000, pageSize: 10, modelValue: 50, visiblePages: 5 }
      })
      const ellipsisIcon = wrapper.find("[data-pagination-nav-pages] svg")
      expect(ellipsisIcon.exists()).toBe(true)
      expect(ellipsisIcon.classes().join(" ")).toContain("text-surface-400")
      expect(ellipsisIcon.classes().join(" ")).not.toMatch(legacyGrayFamily)
    })

    it.each(["filled", "outlined"] as PaginationProps["mode"][])(
      "mode: %s — inactive page button background/ring uses surface-family (not stone/neutral)",
      (mode) => {
        const wrapper = mount(Pagination, { props: { mode, total: 100, pageSize: 10, modelValue: 1 } })
        const inactivePage = wrapper
          .findAll("button[data-pagination-nav-page]")
          .find((b) => b.text() === "2" && b.attributes("aria-current") !== "page")
        expect(inactivePage).toBeTruthy()
        const cls = inactivePage!.classes().join(" ")
        if (mode === "filled") {
          expect(cls).toContain("bg-surface-100 dark:bg-surface-900")
          expect(cls).toContain("hover:bg-surface-200 dark:hover:bg-surface-800")
        } else {
          expect(cls).toContain("bg-white dark:bg-surface-950")
          expect(cls).toContain("ring-surface-300 dark:ring-surface-700")
          expect(cls).toContain("hover:bg-surface-100 dark:hover:bg-surface-900")
        }
      }
    )

    it("outlined mode: active page button keeps theme-* untouched but structural bg/ring use surface-family", () => {
      const wrapper = mount(Pagination, { props: { mode: "outlined", total: 100, pageSize: 10, modelValue: 1 } })
      const activePageButton = wrapper
        .findAll("button[data-pagination-nav-page]")
        .find((b) => b.attributes("aria-current") === "page")
      expect(activePageButton).toBeTruthy()
      const cls = activePageButton!.classes().join(" ")
      // theme-* preset-aware ring/hover — не трогаем
      expect(cls).toContain("ring-theme-300")
      expect(cls).toContain("dark:ring-theme-700")
      expect(cls).toContain("hover:bg-theme-100")
      expect(cls).toContain("dark:hover:bg-theme-950")
      // structural bg — мигрирован на surface
      expect(cls).toContain("bg-white dark:bg-surface-950")
    })

    it("default (gray) page-button label fallback uses surface-family while active theme-* branch is untouched", () => {
      const wrapper = mount(Pagination, { props: { total: 100, pageSize: 10, modelValue: 1 } })
      const inactivePage = wrapper
        .findAll("button[data-pagination-nav-page]")
        .find((b) => b.attributes("aria-current") !== "page" && b.text() === "2")
      const activePage = wrapper
        .findAll("button[data-pagination-nav-page]")
        .find((b) => b.attributes("aria-current") === "page")
      expect(inactivePage!.classes().join(" ")).toContain("text-surface-600 dark:text-surface-400")
      // active page — theme-* branch, не surface
      expect(activePage!.classes().join(" ")).toContain("text-theme-600 dark:text-theme-400")
    })

    it("short/compact nav buttons (mobile + desktop prev/next label) use surface-family (not gray)", () => {
      const wrapper = mount(Pagination, { props: { total: 100, pageSize: 10, modelValue: 1 } })
      const labelButtons = [
        wrapper.find("[data-pagination-short-previous]"),
        wrapper.find("[data-pagination-short-next]"),
        wrapper.find("[data-pagination-nav-previous] button"),
        wrapper.find("[data-pagination-nav-next] button")
      ]
      labelButtons.forEach((button) => {
        expect(button.exists()).toBe(true)
        const cls = button.classes().join(" ")
        expect(cls).toContain("text-surface-600 dark:text-surface-400")
      })
    })

    // Полнодеревные HTML-guard'ы намеренно ограничены non-Button узлами (root <nav>, plain <div>/<span>/<svg>/<p>):
    // сам <Button> несёт собственные hardcoded neutral-* internals (disabled/active/focus-visible state,
    // см. lib/button/Button.vue) — отдельная зона ответственности, не входит в область этой миграции (Pagination
    // мигрирует только свой собственный `:class`-вклад, передаваемый в Button через modeStyle/classNavPageActiveState).
    it("no residual gray/stone/neutral-family classes on non-Button structural nodes (outlined mode)", () => {
      const wrapper = mount(Pagination, {
        props: { total: 100, pageSize: 10, modelValue: 1, infoText: true, pageSizeSelector: true }
      })
      const root = wrapper.find("[data-pagination]")
      expect(root.classes().join(" ")).not.toMatch(legacyGrayFamily)
      wrapper.findAll("div, span, svg, p").forEach((node) => {
        expect(node.classes().join(" ")).not.toMatch(legacyGrayFamily)
      })
    })

    it("no residual gray/stone/neutral-family classes on non-Button structural nodes (filled mode)", () => {
      const wrapper = mount(Pagination, {
        props: { mode: "filled", total: 100, pageSize: 10, modelValue: 1, infoText: true, pageSizeSelector: true }
      })
      wrapper.findAll("div, span, svg, p").forEach((node) => {
        expect(node.classes().join(" ")).not.toMatch(legacyGrayFamily)
      })
    })

    it("no residual gray/stone/neutral-family classes on non-Button structural nodes (underlined mode)", () => {
      const wrapper = mount(Pagination, {
        props: {
          mode: "underlined",
          total: 100,
          pageSize: 10,
          modelValue: 1,
          infoText: true,
          pageSizeSelector: true
        }
      })
      wrapper.findAll("div, span, svg, p").forEach((node) => {
        expect(node.classes().join(" ")).not.toMatch(legacyGrayFamily)
      })
    })
  })
})

// Контракт props 1.0.0: Hungarian-имена сняты, негативный булев инвертирован, корень реактивен.
describe("Pagination — контракт props 1.0.0", () => {
  afterEach(() => {
    delete (window as any).FishtVue
  })

  const withOptions = (options: any = {}, extra: any = {}) => ({
    install(app: any) {
      app.use(FishtVue, { componentsOptions: { Pagination: options }, ...extra })
    }
  })

  it("объявляет ровно набор props 1.0.0", () => {
    const wrapper = mount(Pagination, { props: { total: 100 } })

    expect(Object.keys(wrapper.props()).sort()).toEqual(
      [
        "class",
        "infoText",
        "mode",
        "modelValue",
        "navigationButtons",
        "pageSize",
        "pageSizeSelector",
        "pageSizes",
        "selectProps",
        "total",
        "visiblePages"
      ].sort()
    )
  })

  it("отсутствующие булевы приходят `undefined`, а не скастованными в false", () => {
    const wrapper = mount(Pagination, { props: { total: 100 } })

    expect(wrapper.props("infoText")).toBeUndefined()
    expect(wrapper.props("pageSizeSelector")).toBeUndefined()
    expect(wrapper.props("navigationButtons")).toBeUndefined()
  })

  it("`navigationButtons` — positive-инверсия: default true, `false` прячет кнопки", () => {
    const shown = mount(Pagination, { props: { total: 100 } })
    expect((shown.vm as any).isNavigationButtons).toBe(true)

    const hidden = mount(Pagination, { props: { total: 100, navigationButtons: false } })
    expect((hidden.vm as any).isNavigationButtons).toBe(false)
  })

  it("componentsOptions достижимы для каждого переименованного поля", () => {
    const app = withOptions({ pageSize: 20, pageSizes: [20, 40], visiblePages: 7, infoText: true })
    const wrapper = mount(Pagination, { props: { total: 100 }, global: { plugins: [app] } })
    const vm = wrapper.vm as any

    expect(vm.pageSize).toBe(20)
    expect(vm.visiblePages).toBe(7)
    expect(vm.isInfoText).toBe(true)
    expect(vm.arrayPageSizes.map((s: any) => s.key)).toEqual([20, 40])
  })

  it("prop перебивает option", () => {
    const app = withOptions({ pageSize: 20, visiblePages: 7 })
    const wrapper = mount(Pagination, {
      props: { total: 100, pageSize: 50, visiblePages: 9 },
      global: { plugins: [app] }
    })

    expect((wrapper.vm as any).pageSize).toBe(50)
    expect((wrapper.vm as any).visiblePages).toBe(9)
  })

  it("эмитит `update:pageSize`, снятый `update:sizePage` больше не эмитится", async () => {
    const wrapper = mount(Pagination, { props: { total: 100 } })

    ;(wrapper.vm as any).switchPageSize(20)
    await nextTick()

    expect(wrapper.emitted("update:pageSize")).toEqual([[20]])
    expect(wrapper.emitted("update:sizePage")).toBeUndefined()
  })

  it("payload обоих v-model-каналов — число, и `update:pageSize` несёт размер, а не активную страницу", async () => {
    const wrapper = mount(Pagination, { props: { total: 100, modelValue: 3, pageSize: 10 } })

    // Смена страницы: канал `modelValue` несёт номер страницы
    ;(wrapper.vm as any).switchPage(5)
    await nextTick()
    const page = wrapper.emitted("update:modelValue")?.[0]?.[0]
    expect(typeof page).toBe("number")
    expect(page).toBe(5)

    // Смена размера: канал `pageSize` несёт именно размер (до 1.0 тип ссылался на `modelValue`)
    ;(wrapper.vm as any).switchPageSize(25)
    await nextTick()
    const size = wrapper.emitted("update:pageSize")?.[0]?.[0]
    expect(typeof size).toBe("number")
    expect(size).toBe(25)
    expect(size).not.toBe(page)
  })

  it("никогда не эмитит `undefined` в v-model-каналы (защитные ветки switchPage/switchPageSize)", async () => {
    const app = withOptions({ pageSize: 15 })
    const wrapper = mount(Pagination, { props: { total: 100 }, global: { plugins: [app] } })

    // Select может отдать не число и не строку — внутренний ref уходит в undefined,
    // но наружу канал обязан отдать резолвленный размер (`options.pageSize`), а не «пусто»
    ;(wrapper.vm as any).switchPageSize(null)
    await nextTick()
    expect(wrapper.emitted("update:pageSize")?.at(-1)).toEqual([15])

    // Array-ветка switchPage: reduce может не найти соседнюю страницу и вернуть свой init.
    // `0` здесь — легальный sentinel компонента («страниц нет», см. computed `pages`),
    // контракт требует только одного: наружу уходит число, а не undefined.
    ;(wrapper.vm as any).switchPage([])
    await nextTick()
    expect(typeof wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toBe("number")

    for (const event of ["update:modelValue", "update:pageSize"] as const) {
      for (const call of wrapper.emitted(event) ?? []) expect(call[0]).not.toBeUndefined()
    }
  })

  it("корень реактивен: смена props.class пересчитывает класс (был нереактивный ref)", async () => {
    const wrapper = mount(Pagination, { props: { total: 100, class: "probe-one" } })
    expect(wrapper.find("[data-pagination]").classes()).toContain("probe-one")

    await wrapper.setProps({ class: "probe-two" })

    expect(wrapper.find("[data-pagination]").classes()).toContain("probe-two")
    expect(wrapper.find("[data-pagination]").classes()).not.toContain("probe-one")
  })

  it("options.class на корне, props.class перебивает его последним сегментом", () => {
    const app = withOptions({ class: "p-2 opt-only" })
    const wrapper = mount(Pagination, { props: { total: 100, class: "p-8" }, global: { plugins: [app] } })
    const classes = wrapper.find("[data-pagination]").classes()

    expect(classes).toContain("p-8")
    expect(classes).toContain("opt-only")
    expect(classes).not.toContain("p-2")
  })

  it("`selectProps` кладётся поверх базы селектора, база сохраняется", () => {
    const wrapper = mount(Pagination, {
      props: { total: 100, pageSizeSelector: true, selectProps: { classes: { list: "probe-list" }, clearable: true } }
    })
    const resolved = (wrapper.vm as any).selectProps

    expect(resolved.searchable).toBe(false)
    expect(resolved.clearable).toBe(true)
    expect(resolved.classes.list).toContain("probe-list")
    expect(resolved.classes.control).toContain("font-bold")
    expect(resolved.fixWindowProps.position).toBe("top-right")
  })

  it("unstyled сохраняет класс потребителя на корне и режет тему", () => {
    const app = withOptions({}, { unstyled: true })
    const wrapper = mount(Pagination, { props: { total: 100, class: "probe-root" }, global: { plugins: [app] } })

    expect(wrapper.find("[data-pagination]").classes()).toEqual(["fv", "probe-root"])
  })
})

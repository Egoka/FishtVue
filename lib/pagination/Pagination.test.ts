import { mount } from "@vue/test-utils"
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import FishtVue from "fishtvue/config"
import Pagination from "fishtvue/pagination/pagination.vue"
import { nextTick } from "vue"

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
        props: { total: 50, sizePage: 10 }
      })

      const pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(5) // 50 items, 10 items per page = 5 pages
    })

    it('emits "update:modelValue" on page change', async () => {
      const wrapper = mount(Pagination, {
        props: { total: 30, sizePage: 10 }
      })

      const nextButton = wrapper.find("[data-pagination-nav-next] button")
      await nextButton.trigger("click")

      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([2])
    })

    it('renders page size selector when "isPageSizeSelector" is true', () => {
      const wrapper = mount(Pagination, {
        props: { isPageSizeSelector: true, sizesSelector: [5, 10, 20] }
      })

      const selector = wrapper.find("[data-pagination-selector]")
      expect(selector.exists()).toBe(true)
    })

    it.each([
      [1, 10, 50, 5], // 50 total, 10 per page
      [2, 5, 25, 5], // 25 total, 5 per page
      [3, 20, 100, 5] // 100 total, 20 per page
    ])(
      "displays the correct number of pages for activePage: %i, sizePage: %i, total: %i",
      (activePage, sizePage, total, expectedPages) => {
        const wrapper = mount(Pagination, {
          props: { modelValue: activePage, sizePage, total }
        })

        const pages = wrapper.findAll("[data-pagination-nav-pages] button")
        expect(pages).toHaveLength(expectedPages)
      }
    )

    describe("Pagination Component - Mode Prop", () => {
      it.each([
        [
          "outlined",
          "bg-white dark:bg-neutral-950 ring-1 ring-inset rounded-lg",
          "border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-950"
        ], // Expected class for "outlined"
        ["filled", "bg-stone-100 dark:bg-stone-900 rounded-lg", "bg-stone-100 dark:bg-stone-900"], // Expected class for "filled"
        ["underlined", "border-t-2 border-transparent", ""], // Expected class for "underlined"
        ["custom", "", ""] // Default or fallback class for custom modes
      ])('renders correctly with mode="%s"', (mode, expectedClass, expectedModeStyleSelect) => {
        const wrapper = mount(Pagination, {
          props: { mode }
        })

        const paginationButtons = wrapper.findAll("[data-pagination-nav-pages] button")
        paginationButtons.forEach((button) => {
          expect(button.classes().join(" ")).toContain(expectedClass)
        })
        expect(wrapper.vm.modeStyleSelect).toBe(expectedModeStyleSelect)
      })

      it("applies default mode when mode is not provided", () => {
        const wrapper = mount(Pagination)

        const paginationButtons = wrapper.findAll("[data-pagination-nav-pages] button")
        paginationButtons.forEach((button) => {
          expect(button.classes().join(" ")).toContain("bg-white dark:bg-neutral-950 ring-1 ring-inset rounded-lg") // Default "outlined" mode
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
            sizePage: 5,
            visibleNumberPages: 7
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
            sizePage: 10,
            visibleNumberPages: 5
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
        const sizePage = 10
        const lastPage = total / sizePage

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
        sizePage: 20,
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
        sizePage: 10,
        total: 50
      })

      const wrapper = mount(Pagination, {
        global: { plugins: [app] },
        props: { sizePage: 5, total: 25 }
      })

      const pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(5) // 25 total, 5 per page = 5 pages
    })

    it('renders visible number of pages based on "visibleNumberPages"', async () => {
      const app = createAppWithFishtVue()

      const wrapper = mount(Pagination, {
        global: { plugins: [app] },
        props: { visibleNumberPages: 3, total: 200, sizePage: 10 }
      })

      let pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(5) // Restricts to visibleNumberPages
      await wrapper.setProps({ visibleNumberPages: 6 })
      pages = wrapper.findAll("[data-pagination-nav-pages] button")
      expect(pages).toHaveLength(6) // Restricts to visibleNumberPages
    })

    it("emits size change event on size selector", async () => {
      const app = createAppWithFishtVue()

      const wrapper = mount(Pagination, {
        global: { plugins: [app] },
        props: { isPageSizeSelector: true, sizesSelector: [5, 10, 20] }
      })

      await wrapper.find("[data-pagination-selector]").trigger("click")
      const SelectComponent = wrapper.findComponent({ name: "Select" })
      expect(SelectComponent.vm.isOpenList).toBe(true)
      expect(SelectComponent.vm.value).toBe(5)

      await SelectComponent.findAll("[data-select-list-item]")[2].trigger("click")
      expect(SelectComponent.vm.value).toBe(20)
      expect(SelectComponent.emitted("update:modelValue")?.[0]).toEqual([20, [{ key: 20, value: "20 rows" }]])

      expect(wrapper.emitted("update:sizePage")).toBeTruthy()
      expect(wrapper.emitted("update:sizePage")?.[0]).toEqual([20])
    })
  })
})

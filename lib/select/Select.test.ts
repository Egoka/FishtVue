import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Select from "fishtvue/select/Select.vue"

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
      const modes = ["outlined", "underlined", "filled"]

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
      expect(wrapper.find("[data-fix-window]").isVisible()).toBe(true)
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
      const componentFixWindow = wrapper.findComponent({ name: "FixWindow" })
      expect(componentFixWindow.vm.isOpen).toBe(false)
      expect(wrapper.vm.isOpenList).toBe(false)

      // Open the select dropdown
      await wrapper.find("[data-select]").trigger("click")
      expect(wrapper.find("[data-fix-window]").isVisible()).toBe(true)

      // Создаём событие клика в точке (50, 50) на div
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: 500,
        clientY: 500
      })

      // Эмитируем событие клика
      document.body?.dispatchEvent(clickEvent)

      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual([
        ["Banana"],
        [
          {
            id: "Banana",
            marker: `<span class="fishtvue-select font-bold text-theme-700 dark:text-theme-300">Ban</span>ana`,
            value: "Banana"
          }
        ]
      ])
    })
  })
})

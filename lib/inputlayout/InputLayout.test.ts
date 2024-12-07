import { mount } from "@vue/test-utils"
import { describe, it, expect, vi } from "vitest"
import FishtVue from "fishtvue/config"
import InputLayout from "fishtvue/inputlayout/InputLayout.vue"

describe("InputLayout Component", () => {
  describe("Without Library Initialization", () => {
    it("renders with default props", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find("[data-input-layout]").exists()).toBe(true)
    })

    it("displays label when provided", () => {
      const label = "Test Label"
      const wrapper = mount(InputLayout, {
        props: { value: "", label }
      })
      const labelElement = wrapper.find("[data-label]")
      expect(labelElement.exists()).toBe(true)
      expect(labelElement.text()).toBe(label)
    })

    it("shows required asterisk when required prop is true", () => {
      const label = "Test Label"
      const wrapper = mount(InputLayout, {
        props: { value: "", required: true, label }
      })
      expect(wrapper.find("[data-label]").text()).toContain(label)
      expect(wrapper.vm.isRequired).toBe(true)
      expect(wrapper.find("[data-label]").classes()).toContain("after:content-['*']")
    })

    it.each([
      {
        mode: "outlined",
        expected:
          "fishtvue-input-layout classLayout rounded-md w-full max-h-20 text-gray-900 dark:text-gray-100 sm:text-sm sm:leading-6 focus-visible:ring-0 border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-950 transition-all duration-550 block peer overflow-auto"
      },
      {
        mode: "underlined",
        expected:
          "fishtvue-input-layout classLayout w-full max-h-20 text-gray-900 dark:text-gray-100 sm:text-sm sm:leading-6 focus-visible:ring-0 rounded-none border-0 border-gray-300 dark:border-gray-700 border-b bg-stone-50 dark:bg-stone-950 transition-all duration-550 block peer overflow-auto"
      },
      {
        mode: "filled",
        expected:
          "fishtvue-input-layout classLayout rounded-md w-full max-h-20 text-gray-900 dark:text-gray-100 sm:text-sm sm:leading-6 focus-visible:ring-0 border-0 border-transparent bg-stone-100 dark:bg-stone-900 transition-all duration-550 block peer overflow-auto"
      }
    ])("applies mode: %s", ({ mode, expected }) => {
      const wrapper = mount(InputLayout, {
        props: { value: "", mode }
      })
      const baseClass = wrapper.find("[data-input-layout-base]")
      expect(baseClass.classes().join(" ")).toContain(expected)
    })

    it("renders help icon when help prop is provided", () => {
      const helpText = "This is a help text."
      const wrapper = mount(InputLayout, {
        props: { value: "", help: helpText }
      })
      const helpIcon = wrapper.find("[data-input-layout-help]")
      expect(helpIcon.exists()).toBe(true)
    })

    it("renders loading spinner when loading prop is true", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "", loading: true }
      })
      const loadingSpinner = wrapper.find("[data-loading]")
      expect(loadingSpinner.exists()).toBe(true)
    })

    it("renders clear button when clear prop is true", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "test", clear: true }
      })
      const clearButton = wrapper.find("[data-input-layout-clear]")
      expect(clearButton.exists()).toBe(true)
    })

    it("emits clear event when clear button is clicked", async () => {
      const wrapper = mount(InputLayout, {
        props: { value: "test", clear: true }
      })
      const clearButton = wrapper.find("[data-input-layout-clear] svg")
      await clearButton.trigger("click")
      expect(wrapper.emitted("clear")).toBeTruthy()
    })

    it("copies value to clipboard on copy icon click", async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      })

      const wrapper = mount(InputLayout, {
        props: { value: "test value", disabled: true }
      })

      const copyButton = wrapper.find("[data-input-layout-copy] svg")
      await copyButton.trigger("click")

      // Assert that navigator.clipboard.writeText was called with the correct value
      expect(writeTextMock).toHaveBeenCalledWith("test value")

      // Clean up the spy
      writeTextMock.mockRestore()
    })

    it("logs an error if clipboard writeText fails", async () => {
      // Mock clipboard API to throw an error
      const writeTextMock = vi.fn(() => Promise.reject(new Error("Copy failed")))
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock
        }
      })

      // Mock console.error
      const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {})

      const wrapper = mount(InputLayout, {
        props: { value: "test value", disabled: true }
      })

      const copyButton = wrapper.find("[data-input-layout-copy] svg")
      await copyButton.trigger("click")

      // Assert that navigator.clipboard.writeText was called with the correct value
      expect(writeTextMock).toHaveBeenCalledWith("test value")

      // Assert that console.error was called with the expected error
      expect(consoleErrorMock).toHaveBeenCalledWith("Failed to copy: ", expect.any(Error))

      // Clean up mocks
      writeTextMock.mockRestore()
      consoleErrorMock.mockRestore()
    })
    describe("InputLayout - labelMode behavior when isValue is true", () => {
      const testCases = [
        { labelMode: "offsetDynamic", expected: "offsetStatic" },
        { labelMode: "offsetStatic", expected: "offsetStatic" },
        { labelMode: "vanishing", expected: "none" },
        { labelMode: "static", expected: "static" },
        { labelMode: "none", expected: "static" } // Default fallback
      ]

      it.each(testCases)(
        "returns correct label type for isValue: true and labelMode: $labelMode",
        ({ labelMode, expected }) => {
          // Монтируем компонент
          const wrapper = mount(InputLayout, {
            props: {
              value: "Test value", // Устанавливаем значение
              isValue: true,
              label: "Test Label",
              labelMode
            }
          })

          // Извлекаем скомпилированное значение `labelType`
          const labelType = wrapper.vm.labelType

          // Проверяем результат
          expect(labelType).toBe(expected)
        }
      )
    })
    describe("InputLayout - isInvalid behavior", () => {
      it("applies the correct styles and displays the error message when isInvalid is true", () => {
        const messageInvalid = "This field is required"
        const wrapper = mount(InputLayout, {
          props: {
            value: "",
            isInvalid: true,
            messageInvalid
          }
        })

        // Проверяем, что сообщение об ошибке отображается
        const errorMessage = wrapper.find("[data-input-layout-message-invalid]")
        expect(errorMessage.exists()).toBe(true)
        expect(errorMessage.text()).toBe(messageInvalid)

        // Проверяем, что класс для невалидного состояния применяется
        expect(wrapper.classes()).toContain("is-invalid")
        expect(wrapper.find(".ring-red-500").exists()).toBe(true) // Класс для красного выделения
      })

      it("does not display the error message when isInvalid is false", () => {
        const wrapper = mount(InputLayout, {
          props: {
            value: "Valid input",
            isInvalid: false
          }
        })

        // Проверяем, что сообщение об ошибке не отображается
        const errorMessage = wrapper.find("[data-input-layout-message-invalid]")
        expect(errorMessage.exists()).toBe(true) // Элемент существует
        expect(errorMessage.classes()).toContain("invisible") // Но он скрыт
      })

      it("does not apply invalid styles when isInvalid is false", () => {
        const wrapper = mount(InputLayout, {
          props: {
            value: "Valid input",
            isInvalid: false
          }
        })

        // Проверяем, что класс для невалидного состояния отсутствует
        expect(wrapper.classes()).not.toContain("is-invalid")
        expect(wrapper.find(".ring-red-500").exists()).toBe(false) // Класс для красного выделения отсутствует
      })
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            InputLayout: options
          }
        })
      }
    })

    it("renders correctly with global styles applied", () => {
      const app = createAppWithFishtVue()
      const wrapper = mount(InputLayout, {
        global: {
          plugins: [app]
        },
        props: { value: "test" }
      })
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe("Slots", () => {
    it("renders content in the default slot", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" },
        slots: {
          default: "<div>Default Content</div>"
        }
      })
      const defaultSlot = wrapper.find("[data-input-layout-base]")
      expect(defaultSlot.html()).toContain("Default Content")
    })

    it("renders content in the before slot", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" },
        slots: {
          before: "<div>Before Slot</div>"
        }
      })
      const beforeSlot = wrapper.find("[data-input-layout-before]")
      expect(beforeSlot.html()).toContain("Before Slot")
    })

    it("renders content in the after slot", () => {
      const wrapper = mount(InputLayout, {
        props: { value: "" },
        slots: {
          after: "<div>After Slot</div>"
        }
      })
      const afterSlot = wrapper.find("[data-input-layout-after]")
      expect(afterSlot.html()).toContain("After Slot")
    })
  })
})

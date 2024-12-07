import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import Aria from "fishtvue/aria/Aria.vue"
import FishtVue from "fishtvue/config"
import { createApp } from "vue"

describe("Aria Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Aria)
      expect(wrapper.exists()).toBe(true)
    })

    it("handles prop: modelValue", async () => {
      const wrapper = mount(Aria, {
        props: { modelValue: "Test value" }
      })
      const textarea = wrapper.find("textarea")
      expect(textarea.element.value).toBe("Test value")

      await wrapper.setProps({ modelValue: "Updated value" })
      expect(textarea.element.value).toBe("Updated value")
    })

    it("emits correct events on input and change", async () => {
      const wrapper = mount(Aria, {
        props: { modelValue: "" }
      })
      const textarea = wrapper.find("textarea")

      await textarea.setValue("New value")
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["New value"])
      expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])

      await textarea.trigger("change")
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual(["New value"])
    })

    it("applies correct attributes for props", () => {
      const wrapper = mount(Aria, {
        props: {
          placeholder: "Enter text",
          autocomplete: "off",
          wrap: "hard",
          rows: 5,
          maxLength: 50
        }
      })

      const textarea = wrapper.find("textarea")
      expect(textarea.attributes("placeholder")).toBe("Enter text")
      expect(textarea.attributes("autocomplete")).toBe("off")
      expect(textarea.attributes("wrap")).toBe("hard")
      expect(textarea.attributes("rows")).toBe("5")
      expect(textarea.attributes("maxlength")).toBe("50")
    })

    it("handles focus and blur events correctly", async () => {
      const wrapper = mount(Aria)
      const textarea = wrapper.find("textarea")

      await textarea.trigger("focus")
      expect(wrapper.emitted("focus")).toBeTruthy()

      await textarea.trigger("blur")
      expect(wrapper.emitted("blur")).toBeTruthy()
    })

    it("clears the value and emits clear event when clear button is clicked", async () => {
      const wrapper = mount(Aria, {
        props: { modelValue: "Test value", clear: true }
      })

      const clearButton = wrapper.find("[data-input-layout-clear] i")
      await clearButton.trigger("click")
      expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""])
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual([""])
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Aria: options
        }
      })
      return app
    }

    it("applies global component-specific options to Aria", () => {
      const app: any = createAppWithFishtVue({
        rows: 3,
        maxLength: 100
      })

      const wrapper = mount(Aria, {
        global: { plugins: [app] },
        props: {
          placeholder: "Global Placeholder"
        }
      })

      const textarea = wrapper.find("textarea")
      expect(textarea.attributes("placeholder")).toBe("Global Placeholder")
      expect(textarea.attributes("rows")).toBe("3")
      expect(textarea.attributes("maxlength")).toBe("100")
    })

    it("overrides global options with local props", () => {
      const app: any = createAppWithFishtVue({
        placeholder: "Global Placeholder",
        rows: 5
      })

      const wrapper = mount(Aria, {
        global: { plugins: [app] },
        props: {
          placeholder: "Local Placeholder",
          rows: 10
        }
      })

      const textarea = wrapper.find("textarea")
      expect(textarea.attributes("placeholder")).toBe("Local Placeholder")
      expect(textarea.attributes("rows")).toBe("10")
    })

    it("emits correct events on input when initialized with options", async () => {
      const app: any = createAppWithFishtVue({
        isInvalid: true
      })

      const wrapper = mount(Aria, {
        global: { plugins: [app] },
        props: { modelValue: "Initial value" }
      })

      const textarea = wrapper.find("textarea")
      await textarea.setValue("New value")
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["New value"])
    })
  })
})

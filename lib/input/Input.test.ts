import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import Input from "fishtvue/input/Input.vue"
import FishtVue from "fishtvue/config"
import { createApp } from "vue"

describe("Input Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Input)
      expect(wrapper.exists()).toBe(true)
    })

    it("applies props and renders input attributes", () => {
      const wrapper = mount(Input, {
        props: {
          id: "input-id",
          type: "email",
          autoFocus: true,
          placeholder: "Enter email",
          autocomplete: "off",
          maskInput: "number",
          lengthInteger: 5,
          lengthDecimal: 2
        }
      })

      const input = wrapper.find("input[data-input]")
      expect(input.attributes("id")).toBe("input-id")
      expect(input.attributes("type")).toBe("email")
      expect(input.attributes("placeholder")).toBe("Enter email")
      expect(input.attributes("autocomplete")).toBe("off")
    })

    it("handles focus and blur events", async () => {
      const wrapper = mount(Input)
      const input = wrapper.find("input[data-input]")

      await input.trigger("focus")
      expect(wrapper.emitted("focus")).toBeTruthy()

      await input.trigger("blur")
      expect(wrapper.emitted("blur")).toBeTruthy()
    })

    it("handles modelValue and emits updates", async () => {
      const wrapper = mount(Input, {
        props: { modelValue: "" }
      })

      const input = wrapper.find("input[data-input]")
      await input.setValue("New value")

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["New value"])
      expect(wrapper.emitted("update:isInvalid")?.[0]).toEqual([false])
    })

    it("applies maskInput: 'number' correctly", async () => {
      const wrapper = mount(Input, {
        props: { maskInput: "number", lengthInteger: 3, lengthDecimal: 2 }
      })

      const input = wrapper.find("input[data-input]")
      await input.setValue("123.45")

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["123.45"])
    })

    it("toggles password visibility", async () => {
      const wrapper = mount(Input, {
        props: { type: "password" }
      })

      let input = wrapper.find("input[data-input]")
      expect(input.attributes("type")).toBe("password")

      const toggleButton = wrapper.find("[data-eye-slash]")
      await toggleButton.trigger("click")

      input = wrapper.find("input[data-input]")
      expect(input.attributes("type")).toBe("text")

      const toggleButtonAgain = wrapper.find("[data-eye]")
      await toggleButtonAgain.trigger("click")

      input = wrapper.find("input[data-input]")
      expect(input.attributes("type")).toBe("password")
    })

    it("clears the input when clear button is clicked", async () => {
      const wrapper = mount(Input, {
        props: { modelValue: "Test value", clear: true }
      })

      const clearButton = wrapper.find("[data-input-layout-clear] i")
      await clearButton.trigger("click")

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""])
      expect(wrapper.emitted("clear")).toBeTruthy()
    })

    it("renders slots correctly", () => {
      const wrapper = mount(Input, {
        slots: {
          default: '<span class="default-slot">Default Slot Content</span>',
          before: '<span class="before-slot">Before Slot Content</span>',
          after: '<span class="after-slot">After Slot Content</span>'
        }
      })

      // Проверка содержимого default слота
      const defaultSlot = wrapper.find(".default-slot")
      expect(defaultSlot.exists()).toBe(true)
      expect(defaultSlot.text()).toBe("Default Slot Content")

      // Проверка содержимого before слота
      const beforeSlot = wrapper.find(".before-slot")
      expect(beforeSlot.exists()).toBe(true)
      expect(beforeSlot.text()).toBe("Before Slot Content")

      // Проверка содержимого after слота
      const afterSlot = wrapper.find(".after-slot")
      expect(afterSlot.exists()).toBe(true)
      expect(afterSlot.text()).toBe("After Slot Content")
    })
    it("handles text input and clearing correctly", async () => {
      const wrapper = mount(Input, {
        props: { modelValue: "" }
      })

      const inputElement = wrapper.find("input[data-input]")

      // Набор текста
      await inputElement.setValue("Test Input")
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["Test Input"])
      expect((inputElement.element as any).value).toBe("Test Input")

      // Удаление текста через кнопку очистки
      await wrapper.setProps({ clear: true })
      const clearButton = wrapper.find("[data-input-layout-clear] .cursor-pointer")
      expect(clearButton.exists()).toBe(true)

      await clearButton.trigger("click")
      expect(wrapper.emitted("clear")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([""])
      expect((inputElement.element as any).value).toBe("")
    })

    describe("Input Component - mask functionality", () => {
      const testCases = [
        { mask: "phone", input: "1234567890", expected: "+1 (234) 567-89-0" },
        { mask: "number", input: "1234.567", expected: "1234" },
        { mask: "price", input: "1234.567", expected: "1 234" },
        { mask: "custom", input: "CustomText123", expected: "CustomText123" }, // Assuming no specific transformation
        { mask: null, input: "Text123", expected: "Text123" } // No mask applied
      ]

      it.each(testCases)("applies the correct mask for mask: $mask", async ({ mask, input, expected }) => {
        const wrapper = mount(Input, {
          props: { maskInput: mask, modelValue: "" }
        })

        const inputElement = wrapper.find("input[data-input]")

        await inputElement.setValue(input)

        expect(wrapper.emitted("update:modelValue")).toBeTruthy()
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(expected)
        expect((inputElement.element as any).value).toBe(expected)
        await wrapper.setProps({ modelValue: "" })
        await wrapper.setProps({ modelValue: input })
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe(expected)
      })

      it("handles unrecognized mask gracefully", async () => {
        const wrapper = mount(Input, {
          props: { maskInput: "unknown", modelValue: "" }
        })

        const inputElement = wrapper.find("input[data-input]")

        await inputElement.setValue("RandomInput")
        expect(wrapper.emitted("update:modelValue")).toBeTruthy()
        expect(wrapper.emitted("update:modelValue")?.[0][0]).toBe("RandomInput")
        expect((inputElement.element as any).value).toBe("RandomInput")
      })
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Input: options
        }
      })
      return app
    }

    it("overrides local props", () => {
      const app: any = createAppWithFishtVue({
        type: "text"
      })

      const wrapper = mount(Input, {
        global: { plugins: [app] },
        props: {
          placeholder: "Local Placeholder",
          type: "number"
        }
      })

      const input = wrapper.find("input[data-input]")
      expect(input.attributes("placeholder")).toBe("Local Placeholder")
      expect(input.attributes("type")).toBe("number")
    })

    it("handles clear event correctly", async () => {
      const app: any = createAppWithFishtVue()

      const wrapper = mount(Input, {
        global: { plugins: [app] },
        props: {
          clear: true,
          modelValue: "Test value"
        }
      })

      const clearButton = wrapper.find("[data-input-layout-clear] i")
      await clearButton.trigger("click")

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([""])
      expect(wrapper.emitted("clear")).toBeTruthy()
    })
  })
})

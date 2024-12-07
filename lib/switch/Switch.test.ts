import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Switch from "fishtvue/switch/Switch.vue"

describe("Switch Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Switch)
      expect(wrapper.exists()).toBe(true)
    })

    it("handles the modelValue prop correctly", async () => {
      const wrapper: any = mount(Switch, {
        props: { modelValue: true, switchingType: "switch" }
      })
      expect(wrapper.props("modelValue")).toBe(true)

      const button = wrapper.find("[data-input-switch]")
      expect(button.attributes("aria-checked")).toBe("true")

      await button.trigger("click")
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    })

    it("supports switchingType as 'checkbox'", async () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox", modelValue: false }
      })

      const checkbox = wrapper.find("[data-input-checkbox]")
      expect(checkbox.exists()).toBe(true)
      expect((checkbox.element as any).checked).toBe(false)

      await (checkbox as any).setChecked(true)
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true])
    })

    it("supports the rounded prop", () => {
      const wrapper = mount(Switch, {
        props: { rounded: 5, switchingType: "checkbox" }
      })

      const checkbox = wrapper.find("[data-input-checkbox]")
      expect(checkbox.attributes("style")).toContain("border-radius: 4px")
    })

    it("emits change:modelValue when value changes", async () => {
      const wrapper = mount(Switch, {
        props: { modelValue: false, switchingType: "checkbox" }
      })

      const checkbox = wrapper.find("[data-input-checkbox]")
      await (checkbox as any).setChecked(true)
      expect(wrapper.emitted("change:modelValue")?.[0]).toEqual([true])
    })

    it("disables the switch when the disabled prop is true", () => {
      const wrapper = mount(Switch, {
        props: { disabled: true, switchingType: "switch" }
      })

      const button = wrapper.find("[data-input-switch]")
      expect(button.attributes("disabled")).toBeDefined()
    })

    it("renders label and help text correctly", () => {
      const wrapper = mount(Switch, {
        props: { label: "Test Label", help: "Help text" }
      })

      const label = wrapper.find("[data-switch-label]")
      const help = wrapper.find("[data-switch-help]")
      expect(label.text()).toBe("Test Label")
      expect(help.exists()).toBe(true)
    })

    describe("Switch Component Focus and Blur Tests", () => {
      it.each(["checkbox", "switch"])("handles focus and blur events for type '%s'", async (switchingType) => {
        const wrapper = mount(Switch, {
          props: { switchingType, modelValue: false },
          attachTo: document.body // Монтируем в body
        })

        const input =
          switchingType === "checkbox" ? wrapper.find("[data-input-checkbox]") : wrapper.find("[data-input-switch]")

        // Проверяем, что элемент существует
        expect(input.exists()).toBe(true)

        // Проверяем событие focus
        await input.trigger("focus")
        expect(wrapper.vm.isActiveSwitch).toBe(true)

        // Проверяем событие blur
        await input.trigger("blur")
        expect(wrapper.vm.isActiveSwitch).toBe(false)

        wrapper.unmount() // Удаляем из body после теста
      })
    })
  })

  describe("Switch Component Tests with Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Switch: options
          }
        })
      }
    })

    it("applies global options to Switch", () => {
      const app = createAppWithFishtVue({
        mode: "outlined",
        rounded: 10,
        iconActive: "Check",
        iconInactive: "X"
      })

      const wrapper = mount(Switch, { global: { plugins: [app] } })
      expect(wrapper.vm.mode).toBe("outlined")
      expect(wrapper.vm.rounded).toBe(10)
      expect(wrapper.vm.iconActive).toBe("Check")
      expect(wrapper.vm.iconInactive).toBe("X")
    })

    it("overrides global options with local props", () => {
      const app = createAppWithFishtVue({
        mode: "filled",
        rounded: 5
      })

      const wrapper = mount(Switch, {
        global: { plugins: [app] },
        props: { mode: "underlined", rounded: 8 }
      })

      expect(wrapper.vm.mode).toBe("underlined")
      expect(wrapper.vm.rounded).toBe(8)
    })

    it("inherits and applies global styles from options", () => {
      const app = createAppWithFishtVue({
        class: "global-class"
      })

      const wrapper = mount(Switch, { global: { plugins: [app] } })
      const baseSwitch = wrapper.find("[data-switch]")
      expect(baseSwitch.classes()).toContain("global-class")
    })
  })
})

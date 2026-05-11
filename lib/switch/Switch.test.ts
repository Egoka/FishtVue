import { mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
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
      it.each(["checkbox", "switch"] as const)("handles focus and blur events for type '%s'", async (switchingType) => {
        const wrapper = mount(Switch, {
          props: { switchingType, modelValue: false },
          attachTo: document.body
        })

        const input =
          switchingType === "checkbox" ? wrapper.find("[data-input-checkbox]") : wrapper.find("[data-input-switch]")

        expect(input.exists()).toBe(true)

        await input.trigger("focus")
        expect(wrapper.vm.isActiveSwitch).toBe(true)

        await input.trigger("blur")
        expect(wrapper.vm.isActiveSwitch).toBe(false)

        wrapper.unmount()
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

  // ---------------------------------------------------------------------------
  // Security — XSS guard in help prop (Issue 1)
  // ---------------------------------------------------------------------------
  describe("Security — XSS in help prop", () => {
    it("renders help as text, not HTML, when no slot provided", () => {
      const payload = "<img src=x onerror=\"alert('xss')\">"
      const wrapper = mount(Switch, {
        props: { help: payload, switchingType: "switch" }
      })

      expect(wrapper.html()).not.toContain("<img")
      expect(wrapper.text()).toContain(payload)
    })

    it("does not execute <script> payload in help prop", () => {
      const payload = "<script>window.__xssTriggered=true</script>"
      const wrapper = mount(Switch, {
        props: { help: payload, switchingType: "switch" }
      })

      expect(wrapper.find("script").exists()).toBe(false)
      expect((window as any).__xssTriggered).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // Help slot (Issue 1, Option A — slot pattern)
  // ---------------------------------------------------------------------------
  describe("Help slot", () => {
    it("renders help slot content when provided (overrides text fallback)", () => {
      const wrapper = mount(Switch, {
        props: { help: "fallback", switchingType: "switch" },
        slots: { help: "<strong>custom slot</strong>" }
      })

      expect(wrapper.find("strong").exists()).toBe(true)
      expect(wrapper.text()).toContain("custom slot")
      expect(wrapper.text()).not.toContain("fallback")
    })

    it("shows help icon trigger when only slot is provided (no help prop)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        slots: { help: "<em>slot-only</em>" }
      })

      const help = wrapper.find("[data-switch-help]")
      expect(help.exists()).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Emits — no duplicate updateModelValue (Issue 2)
  // ---------------------------------------------------------------------------
  describe("Emits — no duplicate updateModelValue", () => {
    it("does NOT emit camelCase updateModelValue alongside update:modelValue (switch mode)", async () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", modelValue: false }
      })

      await wrapper.find("[data-input-switch]").trigger("click")
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("updateModelValue")).toBeUndefined()
    })

    it("does NOT emit camelCase updateModelValue (checkbox mode)", async () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox", modelValue: false }
      })

      await (wrapper.find("[data-input-checkbox]") as any).setChecked(true)
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("updateModelValue")).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // Native form integration (Issue 3)
  // ---------------------------------------------------------------------------
  describe("Native form integration", () => {
    it("submits value via FormData in switch mode (modelValue=true)", () => {
      const wrapper = mount(
        {
          components: { Switch },
          template: `<form><Switch id="enabled" :model-value="true" switching-type="switch" /></form>`
        },
        { attachTo: document.body }
      )

      const form = wrapper.find("form").element as any
      const data = new (globalThis as any).FormData(form)
      expect(data.get("enabled")).toBe("on")

      wrapper.unmount()
    })

    it("omits value from FormData when modelValue=false in switch mode", () => {
      const wrapper = mount(
        {
          components: { Switch },
          template: `<form><Switch id="enabled" :model-value="false" switching-type="switch" /></form>`
        },
        { attachTo: document.body }
      )

      const form = wrapper.find("form").element as any
      const data = new (globalThis as any).FormData(form)
      expect(data.get("enabled")).toBeNull()

      wrapper.unmount()
    })

    it("omits value from FormData when disabled in switch mode", () => {
      const wrapper = mount(
        {
          components: { Switch },
          template: `<form><Switch id="enabled" :model-value="true" :disabled="true" switching-type="switch" /></form>`
        },
        { attachTo: document.body }
      )

      const form = wrapper.find("form").element as any
      const data = new (globalThis as any).FormData(form)
      expect(data.get("enabled")).toBeNull()

      wrapper.unmount()
    })

    it("regression — checkbox mode still submits FormData correctly", () => {
      const wrapper = mount(
        {
          components: { Switch },
          template: `<form><Switch id="agree" :model-value="true" switching-type="checkbox" /></form>`
        },
        { attachTo: document.body }
      )

      const form = wrapper.find("form").element as any
      const data = new (globalThis as any).FormData(form)
      expect(data.get("agree")).toBe("on")

      wrapper.unmount()
    })
  })

  // ---------------------------------------------------------------------------
  // Expose — inputRef / focus / blur (Issue 11)
  // ---------------------------------------------------------------------------
  describe("Expose — inputRef + focus/blur", () => {
    it("exposes inputRef pointing to the native button in switch mode", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        attachTo: document.body
      })

      const input = wrapper.find("[data-input-switch]").element
      expect((wrapper.vm as any).inputRef).toBe(input)

      wrapper.unmount()
    })

    it("exposes inputRef pointing to the native input in checkbox mode", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox" },
        attachTo: document.body
      })

      const input = wrapper.find("[data-input-checkbox]").element
      expect((wrapper.vm as any).inputRef).toBe(input)

      wrapper.unmount()
    })

    it("focus() programmatically focuses the native control (switch mode)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        attachTo: document.body
      })

      ;(wrapper.vm as any).focus()
      expect(document.activeElement).toBe(wrapper.find("[data-input-switch]").element)

      wrapper.unmount()
    })

    it("focus() programmatically focuses the native control (checkbox mode)", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "checkbox" },
        attachTo: document.body
      })

      ;(wrapper.vm as any).focus()
      expect(document.activeElement).toBe(wrapper.find("[data-input-checkbox]").element)

      wrapper.unmount()
    })

    it("blur() removes focus from the native control", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        attachTo: document.body
      })

      const el = wrapper.find("[data-input-switch]").element as HTMLElement
      el.focus()
      expect(document.activeElement).toBe(el)
      ;(wrapper.vm as any).blur()
      expect(document.activeElement).not.toBe(el)

      wrapper.unmount()
    })

    it("focus(options) forwards FocusOptions to native focus()", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch" },
        attachTo: document.body
      })

      const el = wrapper.find("[data-input-switch]").element as HTMLElement
      const spy = vi.spyOn(el, "focus")

      ;(wrapper.vm as any).focus({ preventScroll: true })
      expect(spy).toHaveBeenCalledWith({ preventScroll: true })

      spy.mockRestore()
      wrapper.unmount()
    })
  })

  // ---------------------------------------------------------------------------
  // Logical properties — RTL friendliness (Issue 8)
  // ---------------------------------------------------------------------------
  describe("Logical CSS properties (RTL)", () => {
    it("uses logical end-0 instead of right-0 on the after-input container", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", help: "h" }
      })

      const after = wrapper.find("[data-switch-after]")
      const cls = after.attributes("class") ?? ""
      expect(cls).toMatch(/(^|\s)end-0(\s|$)/)
      expect(cls).not.toMatch(/(^|\s)right-0(\s|$)/)
    })

    it("uses logical me-2 instead of mr-2 on the help icon body", () => {
      const wrapper = mount(Switch, {
        props: { switchingType: "switch", help: "h" }
      })

      const help = wrapper.find("[data-switch-help]")
      const cls = help.attributes("class") ?? ""
      expect(cls).toMatch(/(^|\s)me-2(\s|$)/)
      expect(cls).not.toMatch(/(^|\s)mr-2(\s|$)/)
    })
  })
})

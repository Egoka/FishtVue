import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Button from "fishtvue/button/Button.vue"

describe("Button Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Button)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props()).toEqual({
        icon: undefined,
        iconPosition: undefined,
        disabled: undefined,
        loading: undefined,
        mode: undefined,
        size: undefined,
        rounded: undefined,
        color: undefined,
        class: undefined,
        classIcon: undefined
      })
    })

    it("handles props correctly", () => {
      const wrapper = mount(Button, {
        props: {
          icon: "check",
          iconPosition: "left",
          disabled: true,
          loading: true,
          mode: "outline",
          size: "lg",
          rounded: "full",
          color: "destructive"
        }
      })

      expect(wrapper.props()).toMatchObject({
        icon: "check",
        iconPosition: "left",
        disabled: true,
        loading: true,
        mode: "outline",
        size: "lg",
        rounded: "full",
        color: "destructive"
      })

      const button = wrapper.find("[data-button]")
      expect(button.attributes("disabled")).not.toBeUndefined()
      expect(button.attributes("data-loading")).toBe("true")
    })

    it("renders icon and loading indicators", () => {
      const wrapper = mount(Button, {
        props: {
          icon: "check",
          loading: true
        }
      })

      const icon = wrapper.findComponent({ name: "Icons" })
      expect(icon.exists()).toBe(true)

      const loading = wrapper.findComponent({ name: "Loading" })
      expect(loading.exists()).toBe(true)
    })

    it("renders slots correctly", () => {
      const wrapper = mount(Button, {
        slots: {
          default: '<span class="slot-content">Slot Content</span>'
        }
      })

      const slot = wrapper.find(".slot-content")
      expect(slot.exists()).toBe(true)
      expect(slot.text()).toBe("Slot Content")
    })

    it("exposes properties correctly via ref", () => {
      const wrapper = mount(Button, {
        props: {
          mode: "ghost",
          size: "sm",
          rounded: "lg",
          color: "creative"
        }
      })

      const buttonRef = wrapper.vm
      expect(buttonRef.mode).toBe("ghost")
      expect(buttonRef.size).toBe("sm")
      expect(buttonRef.rounded).toBe("lg")
      expect(buttonRef.color).toBe("creative")
    })

    it('renders correctly when type is "icon"', () => {
      const wrapper = mount(Button, {
        props: {
          type: "icon",
          icon: "check"
        }
      })

      const button = wrapper.find("[data-button]")
      expect(button.exists()).toBe(true)

      const icon = wrapper.findComponent({ name: "Icons" })
      expect(icon.exists()).toBe(true)
      expect(icon.props("type")).toBe("check")
    })

    it("shows loading indicator when loading is true", () => {
      const wrapper = mount(Button, {
        props: {
          type: "icon",
          loading: true
        }
      })

      const loading = wrapper.findComponent({ name: "Loading" })
      expect(loading.exists()).toBe(true)
    })

    it('renders slot content inside FixWindow when type is "icon"', () => {
      const wrapper = mount(Button, {
        props: {
          type: "icon"
        },
        slots: {
          default: '<span class="slot-content">Slot Content</span>'
        }
      })

      const slot = wrapper.find(".slot-content")
      expect(slot.exists()).toBe(true)
      expect(slot.text()).toBe("Slot Content")

      const fixWindow = wrapper.findComponent({ name: "FixWindow" })
      expect(fixWindow.exists()).toBe(true)
    })

    it('applies rounded style to FixWindow when type is "icon"', () => {
      const wrapper = mount(Button, {
        props: {
          type: "icon",
          rounded: "full"
        },
        slots: {
          default: "<span>Slot Content</span>"
        }
      })

      const fixWindow = wrapper.findComponent({ name: "FixWindow" })
      expect(fixWindow.exists()).toBe(true)
      expect(fixWindow.props("mode")).toBe("filled")
      expect(fixWindow.props("class")).toContain("rounded-full")
    })

    it("does not render slot content if no slot is provided", () => {
      const wrapper = mount(Button, {
        props: {
          type: "icon"
        }
      })

      const fixWindow = wrapper.findComponent({ name: "FixWindow" })
      expect(fixWindow.exists()).toBe(false)
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Button: options
          }
        })
      }
    })

    it("applies global options correctly", () => {
      const app = createAppWithFishtVue({
        mode: "primary",
        size: "xl",
        rounded: "full",
        color: "theme"
      })

      const wrapper = mount(Button, {
        global: {
          plugins: [app]
        }
      })

      expect(wrapper.vm.mode).toBe("primary")
      expect(wrapper.vm.size).toBe("xl")
      expect(wrapper.vm.rounded).toBe("full")
      expect(wrapper.vm.color).toBe("theme")
    })

    it("overrides global options with local props", () => {
      const app = createAppWithFishtVue({
        mode: "neutral",
        size: "md",
        rounded: "lg",
        color: "destructive"
      })

      const wrapper = mount(Button, {
        global: {
          plugins: [app as any]
        },
        props: {
          mode: "outline",
          size: "sm",
          rounded: "none",
          color: "creative"
        }
      })

      expect(wrapper.vm.mode).toBe("outline")
      expect(wrapper.vm.size).toBe("sm")
      expect(wrapper.vm.rounded).toBe("none")
      expect(wrapper.vm.color).toBe("creative")
    })

    it("inherits global styles correctly", () => {
      const app = createAppWithFishtVue({
        class: "global-button-class"
      })

      const wrapper = mount(Button, {
        global: {
          plugins: [app as any]
        }
      })

      const button = wrapper.find(".global-button-class")
      expect(button.exists()).toBe(true)
    })
  })
})

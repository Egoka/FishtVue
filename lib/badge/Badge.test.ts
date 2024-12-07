import { createApp } from "vue"
import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Badge from "fishtvue/badge/Badge.vue"

describe("Badge Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Badge)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props()).toEqual({
        mode: undefined,
        class: undefined,
        classContent: undefined,
        point: undefined,
        closeButton: undefined
      })
    })

    it("handles props correctly", () => {
      const wrapper = mount(Badge, {
        props: {
          mode: "secondary",
          point: true,
          closeButton: true
        }
      })
      expect(wrapper.props()).toMatchObject({
        mode: "secondary",
        point: true,
        closeButton: true
      })

      const badge = wrapper.find("[data-badge]")
      expect(badge.exists()).toBe(true)

      const point = wrapper.find("[data-badge-point]")
      expect(point.exists()).toBe(true)

      const button = wrapper.findComponent({ name: "Button" })
      expect(button.exists()).toBe(true)
    })

    it("handles props correctly only tag", () => {
      const wrapper = mount(Badge, {
        props: {
          mode: "",
          point: true,
          closeButton: false
        }
      })
      expect(wrapper.props()).toMatchObject({
        mode: "",
        point: true,
        closeButton: false
      })

      const badge = wrapper.find("[data-badge]")
      expect(badge.exists()).toBe(true)

      const point = wrapper.find("[data-badge-point]")
      expect(point.exists()).toBe(true)

      const button = wrapper.findComponent({ name: "Button" })
      expect(button.exists()).toBe(false)
    })

    it("handles props correctly only tag and mode is outline", () => {
      const wrapper = mount(Badge, {
        props: {
          mode: "outline",
          point: false,
          closeButton: false
        }
      })
      expect(wrapper.props()).toMatchObject({
        mode: "outline",
        point: false,
        closeButton: false
      })

      const badge = wrapper.find("[data-badge]")
      expect(badge.exists()).toBe(true)

      const point = wrapper.find("[data-badge-point]")
      expect(point.exists()).toBe(false)

      const button = wrapper.findComponent({ name: "Button" })
      expect(button.exists()).toBe(false)
    })

    it("emits delete event when delete button is clicked", async () => {
      const wrapper = mount(Badge, {
        props: {
          closeButton: true
        }
      })

      const button = wrapper.find("button")
      await button.trigger("click")
      expect(wrapper.emitted("delete")).toBeTruthy()
    })

    it("renders slots correctly", () => {
      const wrapper = mount(Badge, {
        slots: {
          default: '<span class="slot-content">Slot Content</span>'
        }
      })

      const slot = wrapper.find(".slot-content")
      expect(slot.exists()).toBe(true)
      expect(slot.text()).toBe("Slot Content")
    })

    it("exposes properties and methods via ref", () => {
      const wrapper = mount(Badge, {
        props: {
          mode: "outline",
          point: true
        }
      })

      const badgeRef = wrapper.vm
      expect(badgeRef.mode).toBe("outline")
      expect(badgeRef.isPoint).toBe(true)
      expect(typeof badgeRef.deleteBadge).toBe("function")
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Badge: options
        }
      })
      return app
    }

    it("applies global options correctly", () => {
      const app = createAppWithFishtVue({
        mode: "neutral",
        closeButton: true
      })

      const wrapper = mount(Badge, {
        global: {
          plugins: [app as any]
        }
      })

      expect(wrapper.vm.mode).toBe("neutral")
      expect(wrapper.vm.isCloseButton).toBe(true)
    })

    it("overrides global options with local props", () => {
      const app = createAppWithFishtVue({
        mode: "neutral",
        point: true
      })

      const wrapper = mount(Badge, {
        global: {
          plugins: [app as any]
        },
        props: {
          mode: "primary",
          point: false
        }
      })

      expect(wrapper.vm.mode).toBe("primary")
      expect(wrapper.vm.isPoint).toBe(false)
    })

    it("inherits global styles correctly", () => {
      const app = createAppWithFishtVue({
        class: "global-badge-class"
      })

      const wrapper = mount(Badge, {
        global: {
          plugins: [app as any]
        }
      })

      const badge = wrapper.find(".global-badge-class")
      expect(badge.exists()).toBe(true)
    })

    it("emits delete event correctly with global options", async () => {
      const app = createAppWithFishtVue({
        closeButton: true
      })

      const wrapper = mount(Badge, {
        global: {
          plugins: [app as any]
        }
      })

      const button = wrapper.find("button")
      await button.trigger("click")
      expect(wrapper.emitted("delete")).toBeTruthy()
    })
  })
})

import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Separator from "fishtvue/separator/Separator.vue"

describe("Separator Component", () => {
  describe("Without Library Initialization", () => {
    it("renders with default props", () => {
      const wrapper = mount(Separator)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find("[data-separator]").classes()).toContain("relative")
    })

    it.each([true, false])("renders vertical: %s", (vertical) => {
      const wrapper = mount(Separator, {
        props: { vertical }
      })
      const separator = wrapper.find("[data-separator]")
      if (vertical) {
        expect(separator.classes()).toContain("flex-col")
      } else {
        expect(separator.classes()).not.toContain("flex-col")
      }
    })

    it.each(["left", "right", "center", "full"])("renders content position: %s", (content) => {
      const wrapper = mount(Separator, {
        props: { content }
      })
      const left = wrapper.find("[data-separator-left]")
      const right = wrapper.find("[data-separator-right]")
      if (content === "left") {
        expect(left.exists()).toBe(false)
        expect(right.exists()).toBe(true)
      } else if (content === "right") {
        expect(right.exists()).toBe(false)
        expect(left.exists()).toBe(true)
      } else if (content === "center" || content === "full") {
        expect(left.exists()).toBe(content === "center")
        expect(right.exists()).toBe(content === "center")
      }
    })

    it.each([0, 5, 10, 20, 30, 40, 50])("renders with gradient: %s", (gradient) => {
      const wrapper = mount(Separator, {
        props: { gradient }
      })
      const leftLine = wrapper.find("[data-separator-left] div")
      const gradientStyle = leftLine.attributes("style")
      expect(gradientStyle).toContain(`--tw-gradient-from-position: ${gradient}%`)
    })

    it("renders with gradient array", () => {
      const wrapper = mount(Separator, {
        props: { gradient: [10, 15] }
      })
      const leftLine = wrapper.find("[data-separator-left] div")
      const gradientStyle = leftLine.attributes("style")
      expect(gradientStyle).toContain("--tw-gradient-from-position: 10%")
      expect(gradientStyle).toContain("--tw-gradient-via-position: 25%")
    })

    it.each([
      { depth: 0, expected: 1 },
      { depth: 1, expected: 1 },
      { depth: 2, expected: 2 },
      { depth: 3, expected: 3 },
      { depth: 4, expected: 4 },
      { depth: 5, expected: 5 },
      { depth: 6, expected: 6 },
      { depth: 7, expected: 7 }
    ])("renders with depth: %s", ({ depth, expected }) => {
      const wrapper = mount(Separator, {
        props: { depth }
      })
      const leftLine = wrapper.find("[data-separator-left] div")
      const depthStyle = leftLine.attributes("style")
      expect(depthStyle).toContain(`height: ${expected}px;`)
    })

    it("renders with slot content", () => {
      const wrapper = mount(Separator, {
        slots: { default: "Separator Content" }
      })
      const content = wrapper.find("[data-separator-content]")
      expect(content.exists()).toBe(true)
      expect(content.text()).toBe("Separator Content")
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Separator: options
          }
        })
      }
    })
    it("applies library styles and renders correctly", () => {
      const app = createAppWithFishtVue()

      const wrapper = mount(Separator, {
        global: { plugins: [app] }
      })
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find("[data-separator]").classes()).toContain("relative")
    })
  })
})

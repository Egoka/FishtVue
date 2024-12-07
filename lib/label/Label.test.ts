import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Label from "fishtvue/label/Label.vue"

describe("Icons Component Tests", () => {
  describe("Label Component - Without Library Initialization", () => {
    it("renders with default props", () => {
      const wrapper = mount(Label, {
        props: {
          title: "Default Label"
        }
      })

      expect(wrapper.find("[data-label]").exists()).toBe(true)
      expect(wrapper.text()).toBe("Default Label")
    })

    it("applies correct styles for type 'dynamic'", () => {
      const wrapper = mount(Label, {
        props: {
          title: "Dynamic Label",
          type: "dynamic"
        }
      })

      expect(wrapper.find("[data-label]").classes()).toContain("peer-focus:-translate-y-[60px]")
    })

    it("applies required marker when 'isRequired' is true", () => {
      const wrapper = mount(Label, {
        props: {
          title: "Required Label",
          isRequired: true
        }
      })

      expect(wrapper.text()).toContain("Required Label")
      expect(wrapper.find("[data-label]").classes()).toContain("after:content-['*']")
    })

    it("computes dynamic translateX style", () => {
      const wrapper = mount(Label, {
        props: {
          title: "Translate Label",
          translateX: 20
        }
      })

      expect(wrapper.find("[data-label]").attributes("style")).toContain("--tw-translate-x: 20px;")
    })

    it("computes correct maxWidth style", () => {
      const wrapper = mount(Label, {
        props: {
          title: "MaxWidth Label",
          maxWidth: 100
        }
      })

      const span = wrapper.find("span")
      expect(span.attributes("style")).toContain("max-width: 62px")
    })

    describe("Label Component - Mode Variants", () => {
      it.each([
        ["outlined", "from-white dark:from-neutral-950"],
        ["underlined", "from-stone-50 dark:from-stone-950"],
        ["filled", "from-stone-100 dark:from-stone-900"]
      ])('applies correct background style for mode "%s"', (mode, expectedBackground) => {
        const wrapper = mount(Label, {
          props: {
            title: "Test Label",
            type: "offsetDynamic",
            mode
          }
        })

        const classList = wrapper.find("[data-label]")
        expect(classList.classes().join(" ")).toContain(expectedBackground)
      })
    })

    describe("Label Component - Type Variants", () => {
      it.each([
        ["dynamic", "peer-focus:-translate-y-[60px] peer-focus:translate-x-4 -translate-y-7"],
        ["offsetDynamic", "peer-focus:-translate-y-[48px] peer-focus:translate-x-4 -translate-y-7"],
        ["offsetStatic", "-translate-y-[48px] translate-x-4"],
        ["static", "-translate-y-[60px] translate-x-4"],
        ["vanishing", "-translate-y-[28px]"],
        ["none", "opacity-0 -translate-y-[28px] translate-x-8"]
      ])('applies correct class for type "%s"', (type, expectedClass) => {
        const wrapper = mount(Label, {
          props: {
            title: "Test Label",
            type
          }
        })

        const classList = wrapper.find("[data-label]")
        expect(classList.classes().join(" ")).toContain(expectedClass)
      })
    })
  })

  describe("Label Component - With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Label: options
          }
        })
      }
    })
    it("applies global styles from library initialization", () => {
      const app = createAppWithFishtVue({
        classBody: "global-class-body",
        class: "global-class-content"
      })

      const wrapper = mount(Label, {
        props: {
          title: "Global Styled Label"
        },
        global: {
          plugins: [app]
        }
      })

      const labelElement = wrapper.find("[data-label]")
      expect(labelElement.classes()).toContain("global-class-body")

      const contentElement = wrapper.find("span")
      expect(contentElement.classes()).toContain("global-class-content")
    })

    it("overrides global styles with local props", () => {
      const app = createAppWithFishtVue({
        classBody: "global-class-body"
      })

      const wrapper = mount(Label, {
        props: {
          title: "Override Styled Label",
          classBody: "local-class-body"
        },
        global: {
          plugins: [app]
        }
      })

      const labelElement = wrapper.find("[data-label]")
      expect(labelElement.classes()).toContain("local-class-body")
      expect(labelElement.classes()).toContain("global-class-body")
    })

    it("uses global 'type' when not provided locally", () => {
      const app = createAppWithFishtVue({
        type: "offsetDynamic"
      })

      const wrapper = mount(Label, {
        props: {
          title: "Global Type Label"
        },
        global: {
          plugins: [app]
        }
      })

      expect(wrapper.find("[data-label]").classes()).toContain("peer-focus:-translate-y-[48px]")
    })

    it("local 'type' overrides global 'type'", () => {
      const app = createAppWithFishtVue({
        type: "offsetDynamic"
      })

      const wrapper = mount(Label, {
        props: {
          title: "Local Type Label",
          type: "vanishing"
        },
        global: {
          plugins: [app]
        }
      })

      expect(wrapper.find("[data-label]").classes()).toContain("-translate-y-[28px]")
      expect(wrapper.find("[data-label]").classes()).not.toContain("peer-focus:-translate-y-[48px]")
    })
  })
})

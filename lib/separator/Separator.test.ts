import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Separator from "fishtvue/separator/Separator.vue"
import { SeparatorProps } from "fishtvue/separator/Separator"

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

    it.each(["left", "right", "center", "full"] as SeparatorProps["contentPosition"][])(
      "renders content position: %s",
      (content) => {
        const wrapper = mount(Separator, {
          props: { contentPosition: content }
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
      }
    )

    it.each([0, 5, 10, 20, 30, 40, 50] as SeparatorProps["gradient"][])("renders with gradient: %s", (gradient) => {
      const wrapper = mount(Separator, {
        props: { gradient }
      })
      const leftLine = wrapper.find("[data-separator-left] div")
      const gradientStyle = leftLine.attributes("style")
      expect(gradientStyle).toContain(`--fv-gradient-from-position: ${gradient}%`)
    })

    it("renders with gradient array", () => {
      const wrapper = mount(Separator, {
        props: { gradient: [10, 20] }
      })
      const leftLine = wrapper.find("[data-separator-left] div")
      const gradientStyle = leftLine.attributes("style")
      expect(gradientStyle).toContain("--fv-gradient-from-position: 10%")
      expect(gradientStyle).toContain("--fv-gradient-via-position: 20%")
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
    ] as { depth: SeparatorProps["depth"]; expected: number }[])("renders with depth: %s", ({ depth, expected }) => {
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

  describe("Accessibility", () => {
    it('sets role="separator" on the root', () => {
      const wrapper = mount(Separator)
      expect(wrapper.find("[data-separator]").attributes("role")).toBe("separator")
    })

    it('sets aria-orientation="horizontal" by default', () => {
      const wrapper = mount(Separator)
      expect(wrapper.find("[data-separator]").attributes("aria-orientation")).toBe("horizontal")
    })

    it('sets aria-orientation="vertical" when vertical', () => {
      const wrapper = mount(Separator, { props: { vertical: true } })
      expect(wrapper.find("[data-separator]").attributes("aria-orientation")).toBe("vertical")
    })

    it("keeps decorative line segments aria-hidden", () => {
      const wrapper = mount(Separator)
      expect(wrapper.find("[data-separator-left]").attributes("aria-hidden")).toBe("true")
      expect(wrapper.find("[data-separator-right]").attributes("aria-hidden")).toBe("true")
    })

    it("exposes slot content as the accessible name (not aria-hidden)", () => {
      const wrapper = mount(Separator, { slots: { default: "OR" } })
      const content = wrapper.find("[data-separator-content]")
      expect(content.exists()).toBe(true)
      expect(content.attributes("aria-hidden")).toBeUndefined()
      expect(content.text()).toBe("OR")
    })
  })

  describe("RTL & logical contentPosition (Issue 3 / F31)", () => {
    it.each([
      { position: "start", hidden: "left", visible: "right" },
      { position: "end", hidden: "right", visible: "left" }
    ] as const)("logical $position hides $hidden segment, keeps $visible", ({ position, hidden, visible }) => {
      const wrapper = mount(Separator, { props: { contentPosition: position } })
      expect(wrapper.find(`[data-separator-${hidden}]`).exists()).toBe(false)
      expect(wrapper.find(`[data-separator-${visible}]`).exists()).toBe(true)
      expect((wrapper.vm as any).content).toBe(position)
    })

    it.each([
      { deprecated: "left", logical: "start" },
      { deprecated: "right", logical: "end" }
    ] as const)("normalizes deprecated $deprecated → $logical (backward compat)", ({ deprecated, logical }) => {
      const wrapper = mount(Separator, { props: { contentPosition: deprecated as any } })
      // exposed value нормализован в logical
      expect((wrapper.vm as any).content).toBe(logical)
      // рендеринг идентичен logical-эквиваленту
      const hidden = logical === "start" ? "left" : "right"
      expect(wrapper.find(`[data-separator-${hidden}]`).exists()).toBe(false)
    })

    it.each(["left", "right"] as const)("dev-warns on deprecated contentPosition=%s", (position) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      mount(Separator, { props: { contentPosition: position as any } })
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toContain("[FishtVue Separator]")
      warn.mockRestore()
    })

    it.each(["start", "end", "center", "full"] as const)("does not warn for logical contentPosition=%s", (position) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      mount(Separator, { props: { contentPosition: position } })
      expect(warn).not.toHaveBeenCalled()
      warn.mockRestore()
    })

    it("mirrors horizontal gradient direction under RTL via rtl: variants", () => {
      const wrapper = mount(Separator, { props: { gradient: true, contentPosition: "center" } })
      const leftLine = wrapper.find("[data-separator-left] div")
      const rightLine = wrapper.find("[data-separator-right] div")
      expect(leftLine.classes()).toContain("rtl:bg-gradient-to-l")
      expect(rightLine.classes()).toContain("rtl:bg-gradient-to-r")
    })

    it("defaults to center when contentPosition is omitted", () => {
      const wrapper = mount(Separator)
      expect((wrapper.vm as any).content).toBe("center")
      expect(wrapper.find("[data-separator-left]").exists()).toBe(true)
      expect(wrapper.find("[data-separator-right]").exists()).toBe(true)
    })
  })

  describe("Unstyled mode", () => {
    // window.FishtVue — глобальный singleton, выставляемый plugin'ом; чистим, чтобы
    // unstyled-конфиг не утёк в последующие тесты/файлы.
    afterEach(() => {
      delete (window as any).FishtVue
    })

    const createUnstyledApp = () => ({
      install(app: any) {
        app.use(FishtVue, { unstyled: true })
      }
    })

    it("respects unstyled: true via Component.setStyle guard", () => {
      const app = createUnstyledApp()
      const wrapper = mount(Separator, {
        global: { plugins: [app] }
      })
      expect(wrapper.find("[data-separator]").classes()).toEqual([])
    })
  })
})

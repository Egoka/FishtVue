import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Separator from "fishtvue/separator/Separator.vue"
import { SeparatorClassKey, SeparatorProps } from "fishtvue/separator/Separator"

describe("Separator Component", () => {
  describe("Without Library Initialization", () => {
    it("renders with default props", () => {
      const wrapper = mount(Separator)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find("[data-separator]").classes()).toContain("relative")
    })

    it.each(["vertical", "horizontal"] as const)("renders orientation: %s", (orientation) => {
      const wrapper = mount(Separator, {
        props: { orientation }
      })
      const separator = wrapper.find("[data-separator]")
      if (orientation === "vertical") {
        expect(separator.classes()).toContain("flex-col")
      } else {
        expect(separator.classes()).not.toContain("flex-col")
      }
    })

    it.each(["start", "end", "center", "full"] as SeparatorProps["contentPosition"][])(
      "renders content position: %s",
      (content) => {
        const wrapper = mount(Separator, {
          props: { contentPosition: content }
        })
        const left = wrapper.find("[data-separator-start]")
        const right = wrapper.find("[data-separator-end]")
        if (content === "start") {
          expect(left.exists()).toBe(false)
          expect(right.exists()).toBe(true)
        } else if (content === "end") {
          expect(right.exists()).toBe(false)
          expect(left.exists()).toBe(true)
        } else if (content === "center" || content === "full") {
          expect(left.exists()).toBe(content === "center")
          expect(right.exists()).toBe(content === "center")
        }
      }
    )

    it('снятые физические "left"/"right" сводятся к дефолтному center, а не к пустой разметке', () => {
      // Алиасы убраны в major 2026-09-06 (решение R7). Untyped JS-потребитель, оставшийся на
      // старом значении, получает дефолт — обе линии на месте, а не разъехавшийся разделитель.
      const wrapper = mount(Separator, { props: { contentPosition: "left" as any } })

      expect(wrapper.find("[data-separator-start]").exists()).toBe(true)
      expect(wrapper.find("[data-separator-end]").exists()).toBe(true)
    })

    it.each([0, 5, 10, 20, 30, 40, 50] as SeparatorProps["gradient"][])("renders with gradient: %s", (gradient) => {
      const wrapper = mount(Separator, {
        props: { gradient }
      })
      const startLine = wrapper.find("[data-separator-start] div")
      const gradientStyle = startLine.attributes("style")
      expect(gradientStyle).toContain(`--fv-gradient-from-position: ${gradient}%`)
    })

    it("renders with gradient array", () => {
      const wrapper = mount(Separator, {
        props: { gradient: [10, 20] }
      })
      const startLine = wrapper.find("[data-separator-start] div")
      const gradientStyle = startLine.attributes("style")
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
      const startLine = wrapper.find("[data-separator-start] div")
      const depthStyle = startLine.attributes("style")
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

    it('sets aria-orientation="vertical" when orientation="vertical"', () => {
      const wrapper = mount(Separator, { props: { orientation: "vertical" } })
      expect(wrapper.find("[data-separator]").attributes("aria-orientation")).toBe("vertical")
    })

    it("keeps decorative line segments aria-hidden", () => {
      const wrapper = mount(Separator)
      expect(wrapper.find("[data-separator-start]").attributes("aria-hidden")).toBe("true")
      expect(wrapper.find("[data-separator-end]").attributes("aria-hidden")).toBe("true")
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
      { position: "start", hidden: "start", visible: "end" },
      { position: "end", hidden: "end", visible: "start" }
    ] as const)("logical $position hides $hidden segment, keeps $visible", ({ position, hidden, visible }) => {
      const wrapper = mount(Separator, { props: { contentPosition: position } })
      expect(wrapper.find(`[data-separator-${hidden}]`).exists()).toBe(false)
      expect(wrapper.find(`[data-separator-${visible}]`).exists()).toBe(true)
      expect((wrapper.vm as any).content).toBe(position)
    })

    // Физические алиасы "left"/"right" сняты в major 2026-09-06 (решение R7) вместе с их
    // dev-warn'ом. Остался один контракт: неизвестное значение сводится к дефолту.
    it.each(["left", "right"] as const)("снятое физическое %s резолвится в center", (position) => {
      const wrapper = mount(Separator, { props: { contentPosition: position as any } })

      expect((wrapper.vm as any).content).toBe("center")
    })

    it.each(["left", "right", "start", "end", "center", "full"] as const)(
      "не предупреждает ни для какого contentPosition=%s",
      (position) => {
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
        mount(Separator, { props: { contentPosition: position as any } })
        expect(warn).not.toHaveBeenCalled()
        warn.mockRestore()
      }
    )

    it("mirrors horizontal gradient direction under RTL via rtl: variants", () => {
      const wrapper = mount(Separator, { props: { gradient: true, contentPosition: "center" } })
      const startLine = wrapper.find("[data-separator-start] div")
      const endLine = wrapper.find("[data-separator-end] div")
      expect(startLine.classes()).toContain("rtl:bg-gradient-to-l")
      expect(endLine.classes()).toContain("rtl:bg-gradient-to-r")
    })

    it("defaults to center when contentPosition is omitted", () => {
      const wrapper = mount(Separator)
      expect((wrapper.vm as any).content).toBe("center")
      expect(wrapper.find("[data-separator-start]").exists()).toBe(true)
      expect(wrapper.find("[data-separator-end]").exists()).toBe(true)
    })
  })

  describe("Semantic color tokens (Issue 4 / B10)", () => {
    it("uses surface-* family (not neutral-*) for line gradient/fallback classes", () => {
      const wrapper = mount(Separator)
      const startLine = wrapper.find("[data-separator-start] div")
      const endLine = wrapper.find("[data-separator-end] div")

      for (const line of [startLine, endLine]) {
        const classes = line.classes()
        expect(classes).toContain("via-surface-200")
        expect(classes).toContain("dark:via-surface-800")
        expect(classes).toContain("to-surface-200")
        expect(classes).toContain("dark:to-surface-800")
        expect(classes).toContain("bg-surface-200")
        expect(classes).toContain("dark:bg-surface-800")
        expect(classes.some((c) => c.includes("neutral-"))).toBe(false)
      }
    })

    it("uses text-surface-* (not text-gray-*) for content text", () => {
      const wrapper = mount(Separator, { slots: { default: "OR" } })
      const content = wrapper.find("[data-separator-content]")
      const classes = content.classes()
      expect(classes).toContain("text-surface-500")
      expect(classes.some((c) => c.includes("text-gray-"))).toBe(false)
    })
  })

  // Контракт props 1.0.0 (dev-patterns §2 A–D): `class` — только корень, `classes` — карта
  // внутренних элементов, порядок склейки base → options.classes[k] → props.classes[k] → class.
  describe("Props contract 1.0.0", () => {
    afterEach(() => {
      delete (window as any).FishtVue
    })

    const createAppWithFishtVue = (options: any = {}) => ({
      install(app: any) {
        app.use(FishtVue, { componentsOptions: { Separator: options } })
      }
    })

    it("объявляет ровно набор props 1.0.0 (vertical снят, есть orientation/class/classes)", () => {
      const wrapper = mount(Separator)

      expect(Object.keys(wrapper.props()).sort()).toEqual(
        ["class", "classes", "contentPosition", "depth", "gradient", "orientation"].sort()
      )
    })

    it("`class` уходит только на корень и не протекает во внутренние элементы", () => {
      const wrapper = mount(Separator, { props: { class: "probe-root" }, slots: { default: "OR" } })
      const root = wrapper.find("[data-separator]")

      expect(root.classes()).toContain("probe-root")
      expect(root.element.querySelectorAll("[class~='probe-root']")).toHaveLength(0)
    })

    it.each([
      ["segment", ["[data-separator-start]", "[data-separator-end]"]],
      ["segmentStart", ["[data-separator-start]"]],
      ["segmentEnd", ["[data-separator-end]"]],
      ["line", ["[data-separator-start] [data-separator-line]", "[data-separator-end] [data-separator-line]"]],
      ["lineStart", ["[data-separator-start] [data-separator-line]"]],
      ["lineEnd", ["[data-separator-end] [data-separator-line]"]],
      ["content", ["[data-separator-content]"]]
    ] as Array<[SeparatorClassKey, string[]]>)("classes.%s доезжает до своего элемента", (key, selectors) => {
      const wrapper = mount(Separator, {
        props: { classes: { [key]: "probe-key" } },
        slots: { default: "OR" }
      })

      for (const selector of selectors) expect(wrapper.find(selector).classes()).toContain("probe-key")
      expect(wrapper.find("[data-separator]").classes()).not.toContain("probe-key")
    })

    it("частный ключ сегмента выигрывает у общего (twMerge: конкретика последней)", () => {
      const wrapper = mount(Separator, {
        props: { classes: { segment: "p-2", segmentStart: "p-8" } }
      })

      expect(wrapper.find("[data-separator-start]").classes()).toContain("p-8")
      expect(wrapper.find("[data-separator-start]").classes()).not.toContain("p-2")
      expect(wrapper.find("[data-separator-end]").classes()).toContain("p-2")
    })

    it("props.classes перебивает options.classes, неконфликтный класс options остаётся", () => {
      const app = createAppWithFishtVue({ classes: { content: "p-2 italic" } })
      const wrapper = mount(Separator, {
        props: { classes: { content: "p-8" } },
        slots: { default: "OR" },
        global: { plugins: [app] }
      })
      const classes = wrapper.find("[data-separator-content]").classes()

      expect(classes).toContain("p-8")
      expect(classes).not.toContain("p-2")
      expect(classes).toContain("italic")
    })

    it("options.class и options.orientation читаются с уровня componentsOptions", () => {
      const app = createAppWithFishtVue({ class: "opt-root", orientation: "vertical" })
      const wrapper = mount(Separator, { global: { plugins: [app] } })
      const root = wrapper.find("[data-separator]")

      expect(root.classes()).toContain("opt-root")
      expect(root.attributes("aria-orientation")).toBe("vertical")
    })

    it("props.class идёт последним сегментом — перебивает options.class", () => {
      const app = createAppWithFishtVue({ class: "p-2" })
      const wrapper = mount(Separator, { props: { class: "p-8" }, global: { plugins: [app] } })

      expect(wrapper.find("[data-separator]").classes()).toContain("p-8")
      expect(wrapper.find("[data-separator]").classes()).not.toContain("p-2")
    })

    it("unstyled сохраняет классы потребителя и режет тему", () => {
      const app = {
        install(a: any) {
          a.use(FishtVue, { unstyled: true })
        }
      }
      const wrapper = mount(Separator, {
        props: { class: "probe-root", classes: { content: "probe-content" } },
        slots: { default: "OR" },
        global: { plugins: [app] }
      })

      expect(wrapper.find("[data-separator]").classes()).toEqual(["fv", "probe-root"])
      expect(wrapper.find("[data-separator-content]").classes()).toEqual(["fv", "probe-content"])
    })

    it("expose отдаёт orientation и итоговые классы сегментов/линий", () => {
      const wrapper = mount(Separator, { props: { orientation: "vertical" }, slots: { default: "OR" } })
      const vm = wrapper.vm as any

      expect(vm.orientation).toBe("vertical")
      for (const key of [
        "classBase",
        "classSegmentStart",
        "classLineStart",
        "classContent",
        "classSegmentEnd",
        "classLineEnd"
      ])
        expect(typeof vm[key]).toBe("string")
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
      expect(wrapper.find("[data-separator]").classes()).toEqual(["fv"])
    })
  })
})

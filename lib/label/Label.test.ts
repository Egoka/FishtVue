import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Label from "fishtvue/label/Label.vue"

describe("Label Component Tests", () => {
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

    it("renders <label> as root element with data-label", () => {
      const wrapper = mount(Label, {
        props: {
          title: "Root tag"
        }
      })

      expect(wrapper.element.tagName).toBe("LABEL")
      expect(wrapper.find("label[data-label]").exists()).toBe(true)
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

      expect(wrapper.find("[data-label]").attributes("style")).toContain("--fv-translate-x: 20px;")
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
        [
          "outlined",
          "fv fishtvue-label absolute top-[48px] bg-inherit dark:bg-inherit flex pointer-events-none select-none h-2.5 motion-safe:transition-all motion-safe:duration-200 px-1 peer-focus:-translate-y-[48px] peer-focus:translate-x-4 -translate-y-7"
        ],
        [
          "underlined",
          "fv fishtvue-label absolute top-[48px] bg-inherit dark:bg-inherit flex pointer-events-none select-none h-2.5 motion-safe:transition-all motion-safe:duration-200 px-1 peer-focus:-translate-y-[48px] peer-focus:translate-x-4 -translate-y-7"
        ],
        [
          "filled",
          "fv fishtvue-label absolute top-[48px] bg-inherit dark:bg-inherit flex pointer-events-none select-none h-2.5 motion-safe:transition-all motion-safe:duration-200 px-1 peer-focus:-translate-y-[48px] peer-focus:translate-x-4 -translate-y-7"
        ]
      ])('applies correct background style for mode "%s"', (mode, expectedBackground) => {
        const wrapper = mount(Label, {
          props: {
            title: "Test Label",
            type: "offsetDynamic",
            // @ts-ignore
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
            // @ts-ignore
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

  // Issue 1 (E29.1, audit 2026-05-10) — `<label for>` association
  describe("Label Component - for-id (a11y)", () => {
    it("applies for attribute when forId is provided", () => {
      const wrapper = mount(Label, {
        props: { forId: "email-input", title: "Email" }
      })

      expect(wrapper.find("label").attributes("for")).toBe("email-input")
    })

    it("omits for attribute when forId is undefined", () => {
      const wrapper = mount(Label, {
        props: { title: "No for-id" }
      })

      expect(wrapper.find("label").attributes("for")).toBeUndefined()
    })

    // Note: click-to-focus is a native browser behavior on `<label for>` and
    // is not reliably implemented in jsdom. Asserting the `for` attribute is
    // sufficient — the browser handles the rest per WHATWG HTML spec.
  })

  // Issue 4 (D25, audit 2026-05-10) — translateX / maxWidth accept number | string
  describe("Label Component - translateX / maxWidth typing", () => {
    it("accepts translateX as string with CSS unit", () => {
      const wrapper = mount(Label, {
        props: { title: "Rem translate", translateX: "1rem" }
      })

      expect(wrapper.find("[data-label]").attributes("style")).toContain("--fv-translate-x: 1rem;")
    })

    it("accepts translateX as percentage string", () => {
      const wrapper = mount(Label, {
        props: { title: "Pct translate", translateX: "50%" }
      })

      expect(wrapper.find("[data-label]").attributes("style")).toContain("--fv-translate-x: 50%;")
    })

    it("accepts maxWidth as string with calc fallback", () => {
      const wrapper = mount(Label, {
        props: { title: "Pct maxWidth", maxWidth: "100%" }
      })

      const span = wrapper.find("span")
      expect(span.attributes("style")).toContain("max-width: calc(100% - 38px)")
    })

    it("accepts maxWidth as rem string", () => {
      const wrapper = mount(Label, {
        props: { title: "Rem maxWidth", maxWidth: "5rem" }
      })

      const span = wrapper.find("span")
      expect(span.attributes("style")).toContain("max-width: calc(5rem - 38px)")
    })
  })

  // Issue 7 (L53, audit 2026-05-10) — `unstyled: true` regression test
  // Cross-cutting fix in Component.setStyle (lib/component/index.ts:138).
  describe("Label Component - unstyled cross-cutting", () => {
    afterEach(() => {
      // Component falls back to `window.FishtVue` when no app instance is
      // present (see lib/component/index.ts ctor). The `app.use` above
      // assigns it; clean up so subsequent tests are not unstyled.
      delete (window as any).FishtVue
    })

    it("respects unstyled: true via Component.setStyle guard", () => {
      const unstyledApp = {
        install(app: any) {
          app.use(FishtVue, { unstyled: true })
        }
      }

      const wrapper = mount(Label, {
        props: { title: "Unstyled Label" },
        global: {
          plugins: [unstyledApp]
        }
      })

      expect(wrapper.find("[data-label]").classes()).toEqual([])
      const span = wrapper.find("span")
      expect(span.classes()).toEqual([])
    })
  })

  // Issue 8 (E29.7, audit 2026-05-10) — prefers-reduced-motion guard
  describe("Label Component - motion-safe", () => {
    it("applies motion-safe guard on transition classes", () => {
      const wrapper = mount(Label, {
        props: { title: "Motion-safe" }
      })

      const classes = wrapper.find("[data-label]").classes()
      expect(classes).toContain("motion-safe:transition-all")
      expect(classes).toContain("motion-safe:duration-200")
      expect(classes).not.toContain("transition-all")
      expect(classes).not.toContain("duration-200")
    })
  })

  // Issue: floating-label «переезжал» из исходной точки в финальную на mount.
  // Transition теперь гейтится prop `animate` (InputLayout передаёт isTick), чтобы
  // на первом кадре лейбл стоял на месте без анимации.
  describe("Label Component - animate prop (position transition gate)", () => {
    it("keeps the motion-safe transition by default (animate defaults to true)", () => {
      const classes = mount(Label, { props: { title: "L" } })
        .find("[data-label]")
        .classes()
      expect(classes).toContain("motion-safe:transition-all")
      expect(classes).toContain("motion-safe:duration-200")
    })

    it("drops the position transition when animate=false (no mount slide)", () => {
      const classes = mount(Label, { props: { title: "L", animate: false } })
        .find("[data-label]")
        .classes()
      expect(classes).not.toContain("motion-safe:transition-all")
      expect(classes).not.toContain("motion-safe:duration-200")
      // позиционные классы остаются — лейбл сразу в нужном месте, просто без анимации перехода
      expect(classes).toContain("-translate-y-7")
    })
  })

  // Issue 10 (G37, audit 2026-05-10) — default slot for custom title content
  describe("Label Component - default slot", () => {
    it("renders title prop as fallback when no default slot is provided", () => {
      const wrapper = mount(Label, {
        props: { title: "Plain title" }
      })

      expect(wrapper.text()).toBe("Plain title")
    })

    it("renders default slot content overriding title prop", () => {
      const wrapper = mount(Label, {
        props: { title: "Plain title" },
        slots: {
          default: "<strong>Slot title</strong>"
        }
      })

      expect(wrapper.find("strong").exists()).toBe(true)
      expect(wrapper.find("strong").text()).toBe("Slot title")
      expect(wrapper.text()).toBe("Slot title")
    })
  })
})

import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Label from "fishtvue/label/Label.vue"
import { tailwind } from "fishtvue/theme"

describe("Label Component Tests", () => {
  describe("Label Component - Without Library Initialization", () => {
    it("renders with default props", () => {
      const wrapper = mount(Label, {
        props: {
          label: "Default Label"
        }
      })

      expect(wrapper.find("[data-label]").exists()).toBe(true)
      expect(wrapper.text()).toBe("Default Label")
      // props 1.0: полный контракт props — переименования снимают старые имена, `classes` появляется
      expect(wrapper.props()).toEqual({
        label: "Default Label",
        required: undefined,
        labelMode: undefined,
        mode: undefined,
        translateX: undefined,
        maxWidth: undefined,
        forId: undefined,
        class: undefined,
        classes: undefined,
        animated: undefined
      })
    })

    it("renders <label> as root element with data-label", () => {
      const wrapper = mount(Label, {
        props: {
          label: "Root tag"
        }
      })

      expect(wrapper.element.tagName).toBe("LABEL")
      expect(wrapper.find("label[data-label]").exists()).toBe(true)
      expect(wrapper.find("[data-label] span[data-label-text]").exists()).toBe(true)
    })

    it("applies correct styles for labelMode 'dynamic'", () => {
      const wrapper = mount(Label, {
        props: {
          label: "Dynamic Label",
          labelMode: "dynamic"
        }
      })

      expect(wrapper.find("[data-label]").classes()).toContain(
        "peer-focus:-translate-y-[var(--fv-label-translate-y,60px)]"
      )
    })

    it("applies required marker when 'required' is true", () => {
      const wrapper = mount(Label, {
        props: {
          label: "Required Label",
          required: true
        }
      })

      expect(wrapper.text()).toContain("Required Label")
      expect(wrapper.find("[data-label]").classes()).toContain("after:content-['*']")
    })

    it("computes dynamic translateX style", () => {
      const wrapper = mount(Label, {
        props: {
          label: "Translate Label",
          translateX: 20
        }
      })

      expect(wrapper.find("[data-label]").attributes("style")).toContain(
        "--fv-translate-x: calc(20px * var(--fv-label-dir, 1));"
      )
    })

    it("computes correct maxWidth style", () => {
      const wrapper = mount(Label, {
        props: {
          label: "MaxWidth Label",
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
          "fv fishtvue-label absolute top-[48px] bg-inherit dark:bg-inherit flex pointer-events-none select-none h-2.5 motion-safe:transition-all motion-safe:duration-200 px-1 rtl:[--fv-label-dir:-1] peer-focus:-translate-y-[var(--fv-label-translate-y-offset,48px)] peer-focus:translate-x-[calc(16px*var(--fv-label-dir,1))] -translate-y-[var(--fv-label-translate-y-rest,28px)]"
        ],
        [
          "underlined",
          "fv fishtvue-label absolute top-[48px] bg-inherit dark:bg-inherit flex pointer-events-none select-none h-2.5 motion-safe:transition-all motion-safe:duration-200 px-1 rtl:[--fv-label-dir:-1] peer-focus:-translate-y-[var(--fv-label-translate-y-offset,48px)] peer-focus:translate-x-[calc(16px*var(--fv-label-dir,1))] -translate-y-[var(--fv-label-translate-y-rest,28px)]"
        ],
        [
          "filled",
          "fv fishtvue-label absolute top-[48px] bg-inherit dark:bg-inherit flex pointer-events-none select-none h-2.5 motion-safe:transition-all motion-safe:duration-200 px-1 rtl:[--fv-label-dir:-1] peer-focus:-translate-y-[var(--fv-label-translate-y-offset,48px)] peer-focus:translate-x-[calc(16px*var(--fv-label-dir,1))] -translate-y-[var(--fv-label-translate-y-rest,28px)]"
        ]
      ])('applies correct background style for mode "%s"', (mode, expectedBackground) => {
        const wrapper = mount(Label, {
          props: {
            label: "Test Label",
            labelMode: "offsetDynamic",
            // @ts-ignore
            mode
          }
        })

        const classList = wrapper.find("[data-label]")
        expect(classList.classes().join(" ")).toContain(expectedBackground)
      })
    })

    describe("Label Component - labelMode Variants", () => {
      it.each([
        [
          "dynamic",
          "peer-focus:-translate-y-[var(--fv-label-translate-y,60px)] peer-focus:translate-x-[calc(16px*var(--fv-label-dir,1))] -translate-y-[var(--fv-label-translate-y-rest,28px)]"
        ],
        [
          "offsetDynamic",
          "peer-focus:-translate-y-[var(--fv-label-translate-y-offset,48px)] peer-focus:translate-x-[calc(16px*var(--fv-label-dir,1))] -translate-y-[var(--fv-label-translate-y-rest,28px)]"
        ],
        [
          "offsetStatic",
          "-translate-y-[var(--fv-label-translate-y-offset,48px)] translate-x-[calc(16px*var(--fv-label-dir,1))]"
        ],
        ["static", "-translate-y-[var(--fv-label-translate-y,60px)] translate-x-[calc(16px*var(--fv-label-dir,1))]"],
        ["vanishing", "-translate-y-[var(--fv-label-translate-y-rest,28px)]"],
        [
          "none",
          "opacity-0 -translate-y-[var(--fv-label-translate-y-rest,28px)] translate-x-[calc(32px*var(--fv-label-dir,1))]"
        ]
      ])('applies correct class for labelMode "%s"', (labelMode, expectedClass) => {
        const wrapper = mount(Label, {
          props: {
            label: "Test Label",
            // @ts-ignore
            labelMode
          }
        })

        const classList = wrapper.find("[data-label]")
        expect(classList.classes().join(" ")).toContain(expectedClass)
      })
    })

    /**
     * Issue 5 (B11): вертикальные смещения параметризованы CSS custom properties.
     * Прежние литералы (`-translate-y-[60px]`) не масштабировались вместе с font-size —
     * при `class: "text-base"` лейбл вылезал за пределы поля, и починить это без правки
     * исходника было нельзя.
     */
    describe("Label Component - translate custom properties (Issue 5)", () => {
      it.each([
        ["dynamic", "--fv-label-translate-y,60px"],
        ["offsetDynamic", "--fv-label-translate-y-offset,48px"],
        ["offsetStatic", "--fv-label-translate-y-offset,48px"],
        ["static", "--fv-label-translate-y,60px"],
        ["vanishing", "--fv-label-translate-y-rest,28px"],
        ["none", "--fv-label-translate-y-rest,28px"]
      ])('labelMode "%s" ссылается на переменную, а не на литерал px', (labelMode, variable) => {
        const wrapper = mount(Label, {
          // @ts-ignore
          props: { label: "Test Label", labelMode }
        })
        const classes = wrapper.find("[data-label]").classes().join(" ")

        expect(classes).toContain(variable)
        // Голых px-смещений по вертикали не остаётся: любое `-translate-y-[…]` идёт через var().
        expect(classes).not.toMatch(/-translate-y-\[\d+px]/)
      })

      it("движок разворачивает переменную в CSS с сохранением fallback и знака", () => {
        const css = tailwind("-translate-y-[var(--fv-label-translate-y,60px)]") ?? ""

        // Отрицание арбитрарного значения делается через calc(… * -1) — литерал 60px остаётся
        // fallback'ом, поэтому переопределение переменной работает без правки JS.
        expect(css).toContain("--fv-translate-y: calc(var(--fv-label-translate-y,60px) * -1)")
      })

      it("fallback сохраняется и под peer-focus", () => {
        const css = tailwind("peer-focus:-translate-y-[var(--fv-label-translate-y,60px)]") ?? ""

        expect(css).toContain(".peer:focus ~")
        expect(css).toContain("var(--fv-label-translate-y,60px)")
      })
    })
  })

  // props 1.0 (dev-patterns §2 A–D): `class` — только корень `<label data-label>`,
  // внутренний текст — `classes.text` (`<span data-label-text>`), ключ `root` ≡ `class`.
  describe("Label Component - class / classes (props 1.0)", () => {
    it("`class` lands only on the root <label>, never on the text span", () => {
      const wrapper = mount(Label, { props: { label: "L", class: "probe-root" } })
      expect(wrapper.find("[data-label]").classes()).toContain("probe-root")
      expect(wrapper.find("[data-label-text]").classes()).not.toContain("probe-root")
    })

    it("`classes.text` lands on the text span, `classes.root` on the root", () => {
      const wrapper = mount(Label, {
        props: { label: "L", classes: { root: "probe-root", text: "probe-text" } }
      })
      expect(wrapper.find("[data-label]").classes()).toContain("probe-root")
      expect(wrapper.find("[data-label]").classes()).not.toContain("probe-text")
      expect(wrapper.find("[data-label-text]").classes()).toContain("probe-text")
      expect(wrapper.find("[data-label-text]").classes()).not.toContain("probe-root")
    })

    it("consumer classes come last and win twMerge conflicts against the base", () => {
      const wrapper = mount(Label, { props: { label: "L", class: "h-4", classes: { text: "text-lg" } } })
      const root = wrapper.find("[data-label]").classes()
      expect(root).toContain("h-4")
      expect(root).not.toContain("h-2.5")
      const text = wrapper.find("[data-label-text]").classes()
      expect(text).toContain("text-lg")
      expect(text).not.toContain("text-sm")
    })

    it("reacts to `classes` replacement", async () => {
      const wrapper = mount(Label, { props: { label: "L", classes: { text: "first" } } })
      expect(wrapper.find("[data-label-text]").classes()).toContain("first")
      await wrapper.setProps({ classes: { text: "second" } })
      expect(wrapper.find("[data-label-text]").classes()).toContain("second")
      expect(wrapper.find("[data-label-text]").classes()).not.toContain("first")
    })

    it("legacy names (title/type/isRequired/animate/classBody) are no longer props — они падают атрибутами на корень и ничего не меняют", () => {
      const wrapper = mount(Label, {
        // снятые в 1.0 имена — намеренно мимо типов
        props: { title: "Old", type: "none", isRequired: true, classBody: "old-body" } as any
      })
      const root = wrapper.find("[data-label]")
      expect(wrapper.text()).toBe("")
      expect(root.classes()).not.toContain("old-body")
      expect(root.classes()).not.toContain("opacity-0")
      expect(root.classes()).not.toContain("after:content-['*']")
      expect(root.attributes("title")).toBe("Old")
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
    it("applies global class / classes from library initialization", () => {
      const app = createAppWithFishtVue({
        class: "global-class-root",
        classes: { text: "global-class-text" }
      })

      const wrapper = mount(Label, {
        props: {
          label: "Global Styled Label"
        },
        global: {
          plugins: [app]
        }
      })

      const labelElement = wrapper.find("[data-label]")
      expect(labelElement.classes()).toContain("global-class-root")

      const contentElement = wrapper.find("[data-label-text]")
      expect(contentElement.classes()).toContain("global-class-text")
      expect(contentElement.classes()).not.toContain("global-class-root")
    })

    it("merges global and local classes per key; local wins twMerge conflicts", () => {
      const app = createAppWithFishtVue({
        class: "global-class-root p-2",
        classes: { text: "global-text p-1" }
      })

      const wrapper = mount(Label, {
        props: {
          label: "Override Styled Label",
          class: "local-class-root p-4",
          classes: { text: "local-text p-3" }
        },
        global: {
          plugins: [app]
        }
      })

      const root = wrapper.find("[data-label]").classes()
      expect(root).toContain("local-class-root")
      expect(root).toContain("global-class-root")
      expect(root).toContain("p-4")
      expect(root).not.toContain("p-2")
      const text = wrapper.find("[data-label-text]").classes()
      expect(text).toContain("local-text")
      expect(text).toContain("global-text")
      expect(text).toContain("p-3")
      expect(text).not.toContain("p-1")
    })

    it("uses global 'labelMode' when not provided locally", () => {
      const app = createAppWithFishtVue({
        labelMode: "offsetDynamic"
      })

      const wrapper = mount(Label, {
        props: {
          label: "Global Type Label"
        },
        global: {
          plugins: [app]
        }
      })

      expect(wrapper.find("[data-label]").classes()).toContain(
        "peer-focus:-translate-y-[var(--fv-label-translate-y-offset,48px)]"
      )
    })

    it("local 'labelMode' overrides global 'labelMode'", () => {
      const app = createAppWithFishtVue({
        labelMode: "offsetDynamic"
      })

      const wrapper = mount(Label, {
        props: {
          label: "Local Type Label",
          labelMode: "vanishing"
        },
        global: {
          plugins: [app]
        }
      })

      expect(wrapper.find("[data-label]").classes()).toContain("-translate-y-[var(--fv-label-translate-y-rest,28px)]")
      expect(wrapper.find("[data-label]").classes()).not.toContain(
        "peer-focus:-translate-y-[var(--fv-label-translate-y-offset,48px)]"
      )
    })
  })

  // Issue 1 (E29.1, audit 2026-05-10) — `<label for>` association
  describe("Label Component - for-id (a11y)", () => {
    it("applies for attribute when forId is provided", () => {
      const wrapper = mount(Label, {
        props: { forId: "email-input", label: "Email" }
      })

      expect(wrapper.find("label").attributes("for")).toBe("email-input")
    })

    it("omits for attribute when forId is undefined", () => {
      const wrapper = mount(Label, {
        props: { label: "No for-id" }
      })

      expect(wrapper.find("label").attributes("for")).toBeUndefined()
    })

    // Note: click-to-focus is a native browser behavior on `<label for>` and
    // is not reliably implemented in jsdom. Asserting the `for` attribute is
    // sufficient — the browser handles the rest per WHATWG HTML spec.

    it("passes through an `id` attribute to the root <label> (used by aria-labelledby)", () => {
      // InputLayout relies on attribute fall-through to stamp the label id that
      // non-native controls reference via aria-labelledby (Wave 4).
      const wrapper = mount(Label, {
        attrs: { id: "email-input-label" },
        props: { forId: "email-input", label: "Email" }
      })
      expect(wrapper.find("label").attributes("id")).toBe("email-input-label")
    })
  })

  // Issue 4 (D25, audit 2026-05-10) — translateX / maxWidth accept number | string
  describe("Label Component - translateX / maxWidth typing", () => {
    it("accepts translateX as string with CSS unit", () => {
      const wrapper = mount(Label, {
        props: { label: "Rem translate", translateX: "1rem" }
      })

      expect(wrapper.find("[data-label]").attributes("style")).toContain(
        "--fv-translate-x: calc(1rem * var(--fv-label-dir, 1));"
      )
    })

    it("accepts translateX as percentage string", () => {
      const wrapper = mount(Label, {
        props: { label: "Pct translate", translateX: "50%" }
      })

      expect(wrapper.find("[data-label]").attributes("style")).toContain(
        "--fv-translate-x: calc(50% * var(--fv-label-dir, 1));"
      )
    })

    it("accepts maxWidth as string with calc fallback", () => {
      const wrapper = mount(Label, {
        props: { label: "Pct maxWidth", maxWidth: "100%" }
      })

      const span = wrapper.find("span")
      expect(span.attributes("style")).toContain("max-width: calc(100% - 38px)")
    })

    it("accepts maxWidth as rem string", () => {
      const wrapper = mount(Label, {
        props: { label: "Rem maxWidth", maxWidth: "5rem" }
      })

      const span = wrapper.find("span")
      expect(span.attributes("style")).toContain("max-width: calc(5rem - 38px)")
    })
  })

  // Issue 7 (L53, audit 2026-05-10) — `unstyled: true` regression test.
  // props 1.0 (dev-patterns §2 E): под unstyled остаются `fv` и классы потребителя, тема — нет.
  describe("Label Component - unstyled cross-cutting", () => {
    afterEach(() => {
      // Component falls back to `window.FishtVue` when no app instance is
      // present (see lib/component/index.ts ctor). The `app.use` above
      // assigns it; clean up so subsequent tests are not unstyled.
      delete (window as any).FishtVue
    })

    const unstyledApp = {
      install(app: any) {
        app.use(FishtVue, { unstyled: true })
      }
    }

    it("respects unstyled: true via Component.setStyle guard", () => {
      const wrapper = mount(Label, {
        props: { label: "Unstyled Label" },
        global: {
          plugins: [unstyledApp]
        }
      })

      expect(wrapper.find("[data-label]").classes()).toEqual(["fv"])
      const span = wrapper.find("span")
      expect(span.classes()).toEqual(["fv"])
    })

    it("keeps consumer class / classes under unstyled", () => {
      const wrapper = mount(Label, {
        props: { label: "Unstyled Label", class: "probe-root", classes: { text: "probe-text" } },
        global: { plugins: [unstyledApp] }
      })

      expect(wrapper.find("[data-label]").classes()).toEqual(["fv", "probe-root"])
      expect(wrapper.find("[data-label-text]").classes()).toEqual(["fv", "probe-text"])
    })
  })

  // Issue 8 (E29.7, audit 2026-05-10) — prefers-reduced-motion guard
  describe("Label Component - motion-safe", () => {
    it("applies motion-safe guard on transition classes", () => {
      const wrapper = mount(Label, {
        props: { label: "Motion-safe" }
      })

      const classes = wrapper.find("[data-label]").classes()
      expect(classes).toContain("motion-safe:transition-all")
      expect(classes).toContain("motion-safe:duration-200")
      expect(classes).not.toContain("transition-all")
      expect(classes).not.toContain("duration-200")
    })
  })

  // Issue: floating-label «переезжал» из исходной точки в финальную на mount.
  // Transition гейтится prop `animated` (InputLayout передаёт isTick), чтобы
  // на первом кадре лейбл стоял на месте без анимации. props 1.0: булев без
  // `withDefaults`-литерала — default `true` живёт в резолвере (dev-patterns §2 F).
  describe("Label Component - animated prop (position transition gate)", () => {
    it("keeps the motion-safe transition by default (animated resolves to true, prop stays undefined)", () => {
      const wrapper = mount(Label, { props: { label: "L" } })
      expect(wrapper.props("animated")).toBeUndefined()
      const classes = wrapper.find("[data-label]").classes()
      expect(classes).toContain("motion-safe:transition-all")
      expect(classes).toContain("motion-safe:duration-200")
    })

    it("drops the position transition when animated=false (no mount slide)", () => {
      const classes = mount(Label, { props: { label: "L", animated: false } })
        .find("[data-label]")
        .classes()
      expect(classes).not.toContain("motion-safe:transition-all")
      expect(classes).not.toContain("motion-safe:duration-200")
      // позиционные классы остаются — лейбл сразу в нужном месте, просто без анимации перехода
      expect(classes).toContain("-translate-y-[var(--fv-label-translate-y-rest,28px)]")
    })
  })

  // Semantic token migration — Issue 11 / B10 (label.md, cross-cutting Wave 9)
  // Default text color hardcoded `gray-*` → renamed to library semantic
  // `surface-*` (lib/theme/primitive.ts: surface — 23rd named color, default =
  // точная копия gray-шкалы). Family rename only, same numeric tone (400/500) —
  // zero visual change, но подключает floating-label текст к theme-token indirection.
  // -----------------------------------------------------------------------
  describe("Label Component - semantic token migration — content color uses surface-* (Issue 11 / B10)", () => {
    it("classContent includes text-surface-400 dark:text-surface-500 (not gray)", () => {
      const wrapper = mount(Label, { props: { label: "Surface tone" } })
      const classContent = (wrapper.vm as any).classContent as string
      expect(classContent).toContain("text-surface-400")
      expect(classContent).toContain("dark:text-surface-500")
      expect(classContent).not.toContain("gray")
    })

    it("rendered span class attribute carries surface-* tone classes", () => {
      const wrapper = mount(Label, { props: { label: "Surface tone" } })
      const spanClass = wrapper.find("span").attributes("class")
      expect(spanClass).toContain("text-surface-400")
      expect(spanClass).toContain("dark:text-surface-500")
    })
  })

  // Issue 10 (G37, audit 2026-05-10) — default slot for custom label content
  describe("Label Component - default slot", () => {
    it("renders label prop as fallback when no default slot is provided", () => {
      const wrapper = mount(Label, {
        props: { label: "Plain label" }
      })

      expect(wrapper.text()).toBe("Plain label")
    })

    it("renders default slot content overriding label prop", () => {
      const wrapper = mount(Label, {
        props: { label: "Plain label" },
        slots: {
          default: "<strong>Slot label</strong>"
        }
      })

      expect(wrapper.find("strong").exists()).toBe(true)
      expect(wrapper.find("strong").text()).toBe("Slot label")
      expect(wrapper.text()).toBe("Slot label")
    })
  })

  describe("Label Component - expose", () => {
    it("exposes mode, labelMode, classBase, classContent", () => {
      const wrapper = mount(Label, { props: { label: "L", labelMode: "static", mode: "filled" } })
      const vm = wrapper.vm as any
      expect(vm.mode).toBe("filled")
      expect(vm.labelMode).toBe("static")
      expect(String(vm.classBase)).toContain("fishtvue-label")
      expect(String(vm.classContent)).toContain("text-sm")
    })
  })
})

import { createApp } from "vue"
import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Badge from "fishtvue/badge/Badge.vue"
import { BadgeClassKey } from "fishtvue/badge/Badge"

describe("Badge Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Badge)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props()).toEqual({
        variant: undefined,
        class: undefined,
        classes: undefined,
        point: undefined,
        closeButton: undefined
      })
    })

    it("handles props correctly", () => {
      const wrapper = mount(Badge, {
        props: {
          variant: "secondary",
          point: true,
          closeButton: true
        }
      })
      expect(wrapper.props()).toMatchObject({
        variant: "secondary",
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
          // @ts-ignore
          variant: "",
          point: true,
          closeButton: false
        }
      })
      expect(wrapper.props()).toMatchObject({
        variant: "",
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

    it("handles props correctly only tag and variant is outline", () => {
      const wrapper = mount(Badge, {
        props: {
          variant: "outline",
          point: false,
          closeButton: false
        }
      })
      expect(wrapper.props()).toMatchObject({
        variant: "outline",
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
      expect(wrapper.emitted("close")).toBeTruthy()
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
          variant: "outline",
          point: true
        }
      })

      const badgeRef = wrapper.vm
      expect(badgeRef.variant).toBe("outline")
      expect(badgeRef.isPoint).toBe(true)
      expect(typeof badgeRef.deleteBadge).toBe("function")
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}, componentsStyle?: "filled" | "outlined" | "underlined") => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsStyle,
        componentsOptions: {
          Badge: options
        }
      })
      return app
    }

    it("applies global options correctly", () => {
      const app = createAppWithFishtVue({
        variant: "neutral",
        closeButton: true
      })

      const wrapper = mount(Badge, {
        global: {
          plugins: [app as any]
        }
      })

      expect(wrapper.vm.variant).toBe("neutral")
      expect(wrapper.vm.isCloseButton).toBe(true)
    })

    it("overrides global options with local props", () => {
      const app = createAppWithFishtVue({
        variant: "neutral",
        point: true
      })

      const wrapper = mount(Badge, {
        global: {
          plugins: [app as any]
        },
        props: {
          variant: "primary",
          point: false
        }
      })

      expect(wrapper.vm.variant).toBe("primary")
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
      expect(wrapper.emitted("close")).toBeTruthy()
    })

    describe("componentsStyle global fallback", () => {
      it("maps global componentsStyle=filled to variant=primary", () => {
        const app = createAppWithFishtVue({}, "filled")
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.variant).toBe("primary")
      })

      it("maps global componentsStyle=outlined to variant=outline", () => {
        const app = createAppWithFishtVue({}, "outlined")
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.variant).toBe("outline")
      })

      it("maps global componentsStyle=underlined to variant=neutral", () => {
        const app = createAppWithFishtVue({}, "underlined")
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.variant).toBe("neutral")
      })

      it("per-component options override global componentsStyle", () => {
        const app = createAppWithFishtVue({ variant: "secondary" }, "filled")
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.variant).toBe("secondary")
      })

      it("props override global componentsStyle and componentsOptions", () => {
        const app = createAppWithFishtVue({ variant: "secondary" }, "filled")
        const wrapper = mount(Badge, {
          global: { plugins: [app as any] },
          props: { variant: "outline" }
        })
        expect(wrapper.vm.variant).toBe("outline")
      })

      it("falls back to default primary when componentsStyle is unset", () => {
        const app = createAppWithFishtVue({})
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.variant).toBe("primary")
      })
    })

    describe("close event deprecation (Issue 5)", () => {
      it("emits both delete and close when close button is clicked", async () => {
        const app = createAppWithFishtVue({ closeButton: true })
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })

        const button = wrapper.find("button")
        await button.trigger("click")

        expect(wrapper.emitted("close")).toBeTruthy()
        expect(wrapper.emitted("close")).toHaveLength(1)
        expect(wrapper.emitted("close")).toBeTruthy()
        expect(wrapper.emitted("close")).toHaveLength(1)
      })

      it("emits close when deleteBadge() is called programmatically", async () => {
        const wrapper = mount(Badge, { props: { closeButton: true } })

        wrapper.vm.deleteBadge()
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted("close")).toBeTruthy()
        expect(wrapper.emitted("close")).toHaveLength(1)
        expect(wrapper.emitted("close")).toBeTruthy()
        expect(wrapper.emitted("close")).toHaveLength(1)
      })
    })

    describe("outline+neutral contrast fix (Issue 4)", () => {
      it("renders ring-surface-300 with dark variant when outline+point and not closeButton", () => {
        const wrapper = mount(Badge, {
          props: { variant: "outline", point: true, closeButton: false }
        })
        const badge = wrapper.find("[data-badge]")
        const classAttr = badge.attributes("class") ?? ""
        expect(classAttr).toContain("ring-surface-300")
        expect(classAttr).toContain("dark:ring-surface-700")
        expect(classAttr).not.toContain("ring-neutral-500/30")
      })

      it("renders ring-surface-300 with dark variant when outline+closeButton", () => {
        const wrapper = mount(Badge, {
          props: { variant: "outline", point: false, closeButton: true }
        })
        const badge = wrapper.find("[data-badge]")
        const classAttr = badge.attributes("class") ?? ""
        expect(classAttr).toContain("ring-surface-300")
        expect(classAttr).toContain("dark:ring-surface-700")
        expect(classAttr).not.toContain("ring-neutral-500/30")
      })
    })

    // ---------------------------------------------------------------------------
    // B10 (Wave 9) — structural neutral-* → surface-* semantic token migration
    // ---------------------------------------------------------------------------
    describe("B10 (Wave 9) — outline-variant structural neutral-* migrated to surface-*", () => {
      it("uses text-surface-*/ring-surface-* (not neutral-*) when outline+point and not closeButton", () => {
        const wrapper = mount(Badge, {
          props: { variant: "outline", point: true, closeButton: false }
        })
        const classAttr = wrapper.find("[data-badge]").attributes("class") ?? ""
        expect(classAttr).toContain("text-surface-600")
        expect(classAttr).toContain("dark:text-surface-200")
        expect(classAttr).toContain("ring-surface-300")
        expect(classAttr).toContain("dark:ring-surface-700")
        expect(classAttr).not.toContain("text-neutral-600")
        expect(classAttr).not.toContain("dark:text-neutral-200")
        expect(classAttr).not.toContain("ring-neutral-300")
        expect(classAttr).not.toContain("dark:ring-neutral-700")
      })

      it("uses text-surface-*/ring-surface-* (not neutral-*) when outline+closeButton", () => {
        const wrapper = mount(Badge, {
          props: { variant: "outline", point: false, closeButton: true }
        })
        const classAttr = wrapper.find("[data-badge]").attributes("class") ?? ""
        expect(classAttr).toContain("text-surface-600")
        expect(classAttr).toContain("dark:text-surface-200")
        expect(classAttr).toContain("ring-surface-300")
        expect(classAttr).toContain("dark:ring-surface-700")
        expect(classAttr).not.toContain("text-neutral-600")
        expect(classAttr).not.toContain("dark:text-neutral-200")
        expect(classAttr).not.toContain("ring-neutral-300")
        expect(classAttr).not.toContain("dark:ring-neutral-700")
      })
    })
  })

  // ---------------------------------------------------------------------------
  // F31 — RTL logical padding (Issue 6): физические pl/pr → логические ps/pe
  // ---------------------------------------------------------------------------
  describe("F31 — RTL logical padding", () => {
    it("uses logical ps-1 (not physical pl-1) when point only", () => {
      const wrapper = mount(Badge, {
        props: { point: true, closeButton: false }
      })
      const cls = wrapper.find("[data-badge]").attributes("class") ?? ""
      expect(cls).toContain("ps-1")
      expect(cls).not.toContain("pl-1")
    })

    it("uses logical pe-1 (not physical pr-1) when close button only", () => {
      const wrapper = mount(Badge, {
        props: { point: false, closeButton: true }
      })
      const cls = wrapper.find("[data-badge]").attributes("class") ?? ""
      expect(cls).toContain("pe-1")
      expect(cls).not.toContain("pr-1")
    })

    it("keeps symmetric px-1 when both point and close button", () => {
      const wrapper = mount(Badge, {
        props: { point: true, closeButton: true }
      })
      const cls = wrapper.find("[data-badge]").attributes("class") ?? ""
      expect(cls).toContain("px-1")
    })
  })

  // ---------------------------------------------------------------------------
  // B10 — forced-colors visibility (Issue 6): badge виден в Windows high-contrast
  // ---------------------------------------------------------------------------
  describe("B10 — forced-colors", () => {
    it("keeps the badge visible in forced-colors (high-contrast) mode", () => {
      const wrapper = mount(Badge, { props: { variant: "primary" } })
      const cls = wrapper.find("[data-badge]").attributes("class") ?? ""
      expect(cls).toContain("forced-colors:outline")
    })

    it("applies forced-colors:outline regardless of variant", () => {
      const wrapper = mount(Badge, { props: { variant: "outline", point: true } })
      const cls = wrapper.find("[data-badge]").attributes("class") ?? ""
      expect(cls).toContain("forced-colors:outline")
    })
  })

  // ---------------------------------------------------------------------------
  // Configuration support — unstyled (L53, cross-cutting Component.setStyle guard)
  // ---------------------------------------------------------------------------
  describe("Configuration support — unstyled", () => {
    const appWithConfig = (config: Record<string, unknown>) => ({
      install(app: any) {
        app.use(FishtVue, config)
      }
    })

    // `window.FishtVue` — глобальный singleton (config inject-first / window-fallback):
    // чистим, чтобы unstyled:true из теста не протёк в соседние тесты/файлы.
    afterEach(() => {
      delete (window as any).FishtVue
    })

    it("strips all classes from the root when global unstyled: true", () => {
      const wrapper = mount(Badge, {
        global: { plugins: [appWithConfig({ unstyled: true })] },
        props: { point: true, closeButton: true }
      })
      // Component.setStyle() возвращает "" при unstyled → ни базовых классов,
      // ни `fv fishtvue-badge`-префикса на корне.
      const cls = (wrapper.find("[data-badge]").attributes("class") ?? "").trim()
      expect(cls).toBe("fv")
    })

    it("keeps base classes when unstyled is false (contrast)", () => {
      const wrapper = mount(Badge, {
        global: { plugins: [appWithConfig({ unstyled: false })] },
        props: { variant: "primary" }
      })
      const cls = wrapper.find("[data-badge]").attributes("class") ?? ""
      expect(cls).toContain("rounded-md")
    })
  })

  // Контракт props 1.0.0 (dev-patterns §2 A–D): `class` — только корень `[data-badge]`,
  // `classes` — карта `content`/`point`/`close` (последний — корень вложенного Button).
  describe("Props contract 1.0.0", () => {
    afterEach(() => {
      delete (window as any).FishtVue
    })

    const withOptions = (options: any = {}) => ({
      install(app: any) {
        app.use(FishtVue, { componentsOptions: { Badge: options } })
      }
    })

    it("отсутствующие булевы приходят `undefined`, а не скастованными в false", () => {
      const wrapper = mount(Badge)

      expect(wrapper.props("point")).toBeUndefined()
      expect(wrapper.props("closeButton")).toBeUndefined()
    })

    it("`class` уходит только на корень и не протекает во внутренние элементы", () => {
      const wrapper = mount(Badge, {
        props: { class: "probe-root", point: true, closeButton: true },
        slots: { default: "x" }
      })
      const root = wrapper.find("[data-badge]")

      expect(root.classes()).toContain("probe-root")
      expect(root.element.querySelectorAll("[class~='probe-root']")).toHaveLength(0)
    })

    it.each([
      ["content", "[data-badge-content]"],
      ["point", "[data-badge-point]"],
      ["close", "[data-badge-close]"]
    ] as Array<[BadgeClassKey, string]>)("classes.%s доезжает до своего элемента", (key, selector) => {
      const wrapper = mount(Badge, {
        props: { classes: { [key]: "probe-key" }, point: true, closeButton: true },
        slots: { default: "x" }
      })

      expect(wrapper.find(selector).classes()).toContain("probe-key")
      expect(wrapper.find("[data-badge]").classes()).not.toContain("probe-key")
    })

    it("classes.close уходит в корень вложенного Button без setStyle-префикса Badge", () => {
      const wrapper = mount(Badge, {
        props: { closeButton: true, classes: { close: "probe-close" } },
        slots: { default: "x" }
      })
      const close = wrapper.find("[data-badge-close]")

      expect(close.classes()).toContain("probe-close")
      expect(close.classes()).toContain("fishtvue-button")
      expect(close.classes()).not.toContain("fishtvue-badge")
    })

    it("props.classes перебивает options.classes, неконфликтный класс options остаётся", () => {
      const wrapper = mount(Badge, {
        props: { classes: { content: "p-8" } },
        slots: { default: "x" },
        global: { plugins: [withOptions({ classes: { content: "p-2 italic" } })] }
      })
      const classes = wrapper.find("[data-badge-content]").classes()

      expect(classes).toContain("p-8")
      expect(classes).not.toContain("p-2")
      expect(classes).toContain("italic")
    })

    it("options.class на корне, props.class перебивает его последним сегментом", () => {
      const wrapper = mount(Badge, {
        props: { class: "p-8" },
        slots: { default: "x" },
        global: { plugins: [withOptions({ class: "p-2 opt-only" })] }
      })
      const classes = wrapper.find("[data-badge]").classes()

      expect(classes).toContain("p-8")
      expect(classes).toContain("opt-only")
      expect(classes).not.toContain("p-2")
    })

    it("unstyled сохраняет классы потребителя и режет тему", () => {
      const wrapper = mount(Badge, {
        props: { class: "probe-root", classes: { content: "probe-content" } },
        slots: { default: "x" },
        global: {
          plugins: [
            {
              install(a: any) {
                a.use(FishtVue, { unstyled: true })
              }
            }
          ]
        }
      })

      expect(wrapper.find("[data-badge]").classes()).toEqual(["fv", "probe-root"])
      expect(wrapper.find("[data-badge-content]").classes()).toEqual(["fv", "probe-content"])
    })

    it("expose отдаёт variant/isCloseButton вместо снятого mode", () => {
      const wrapper = mount(Badge, { props: { variant: "outline", closeButton: true }, slots: { default: "x" } })
      const vm = wrapper.vm as any

      expect(vm.variant).toBe("outline")
      expect(vm.isCloseButton).toBe(true)
      expect(vm.mode).toBeUndefined()
    })

    it("дубль события `delete` снят — остаётся только `close`", async () => {
      const wrapper = mount(Badge, { props: { closeButton: true }, slots: { default: "x" } })

      await wrapper.find("[data-badge-close]").trigger("click")

      expect(wrapper.emitted("close")).toHaveLength(1)
      expect(wrapper.emitted("delete")).toBeUndefined()
    })
  })
})

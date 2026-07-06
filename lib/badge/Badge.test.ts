import { createApp } from "vue"
import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it } from "vitest"
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
          // @ts-ignore
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

    describe("componentsStyle global fallback", () => {
      it("maps global componentsStyle=filled to mode=primary", () => {
        const app = createAppWithFishtVue({}, "filled")
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.mode).toBe("primary")
      })

      it("maps global componentsStyle=outlined to mode=outline", () => {
        const app = createAppWithFishtVue({}, "outlined")
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.mode).toBe("outline")
      })

      it("maps global componentsStyle=underlined to mode=neutral", () => {
        const app = createAppWithFishtVue({}, "underlined")
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.mode).toBe("neutral")
      })

      it("per-component options override global componentsStyle", () => {
        const app = createAppWithFishtVue({ mode: "secondary" }, "filled")
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.mode).toBe("secondary")
      })

      it("props override global componentsStyle and componentsOptions", () => {
        const app = createAppWithFishtVue({ mode: "secondary" }, "filled")
        const wrapper = mount(Badge, {
          global: { plugins: [app as any] },
          props: { mode: "outline" }
        })
        expect(wrapper.vm.mode).toBe("outline")
      })

      it("falls back to default primary when componentsStyle is unset", () => {
        const app = createAppWithFishtVue({})
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })
        expect(wrapper.vm.mode).toBe("primary")
      })
    })

    describe("close event deprecation (Issue 5)", () => {
      it("emits both delete and close when close button is clicked", async () => {
        const app = createAppWithFishtVue({ closeButton: true })
        const wrapper = mount(Badge, { global: { plugins: [app as any] } })

        const button = wrapper.find("button")
        await button.trigger("click")

        expect(wrapper.emitted("delete")).toBeTruthy()
        expect(wrapper.emitted("delete")).toHaveLength(1)
        expect(wrapper.emitted("close")).toBeTruthy()
        expect(wrapper.emitted("close")).toHaveLength(1)
      })

      it("emits both delete and close when deleteBadge() is called programmatically", async () => {
        const wrapper = mount(Badge, { props: { closeButton: true } })

        wrapper.vm.deleteBadge()
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted("delete")).toBeTruthy()
        expect(wrapper.emitted("delete")).toHaveLength(1)
        expect(wrapper.emitted("close")).toBeTruthy()
        expect(wrapper.emitted("close")).toHaveLength(1)
      })
    })

    describe("outline+neutral contrast fix (Issue 4)", () => {
      it("renders ring-surface-300 with dark variant when outline+point and not closeButton", () => {
        const wrapper = mount(Badge, {
          props: { mode: "outline", point: true, closeButton: false }
        })
        const badge = wrapper.find("[data-badge]")
        const classAttr = badge.attributes("class") ?? ""
        expect(classAttr).toContain("ring-surface-300")
        expect(classAttr).toContain("dark:ring-surface-700")
        expect(classAttr).not.toContain("ring-neutral-500/30")
      })

      it("renders ring-surface-300 with dark variant when outline+closeButton", () => {
        const wrapper = mount(Badge, {
          props: { mode: "outline", point: false, closeButton: true }
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
    describe("B10 (Wave 9) — outline-mode structural neutral-* migrated to surface-*", () => {
      it("uses text-surface-*/ring-surface-* (not neutral-*) when outline+point and not closeButton", () => {
        const wrapper = mount(Badge, {
          props: { mode: "outline", point: true, closeButton: false }
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
          props: { mode: "outline", point: false, closeButton: true }
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
      const wrapper = mount(Badge, { props: { mode: "primary" } })
      const cls = wrapper.find("[data-badge]").attributes("class") ?? ""
      expect(cls).toContain("forced-colors:outline")
    })

    it("applies forced-colors:outline regardless of mode", () => {
      const wrapper = mount(Badge, { props: { mode: "outline", point: true } })
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
      expect(cls).toBe("")
    })

    it("keeps base classes when unstyled is false (contrast)", () => {
      const wrapper = mount(Badge, {
        global: { plugins: [appWithConfig({ unstyled: false })] },
        props: { mode: "primary" }
      })
      const cls = wrapper.find("[data-badge]").attributes("class") ?? ""
      expect(cls).toContain("rounded-md")
    })
  })
})

import { mount } from "@vue/test-utils"
import { afterEach, describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Button from "fishtvue/button/Button.vue"
import type { ButtonExpose } from "fishtvue/button/Button"

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

      expect((wrapper.vm as unknown as ButtonExpose).mode).toBe("primary")
      expect((wrapper.vm as unknown as ButtonExpose).size).toBe("xl")
      expect((wrapper.vm as unknown as ButtonExpose).rounded).toBe("full")
      expect((wrapper.vm as unknown as ButtonExpose).color).toBe("theme")
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

      expect((wrapper.vm as unknown as ButtonExpose).mode).toBe("outline")
      expect((wrapper.vm as unknown as ButtonExpose).size).toBe("sm")
      expect((wrapper.vm as unknown as ButtonExpose).rounded).toBe("none")
      expect((wrapper.vm as unknown as ButtonExpose).color).toBe("creative")
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

  describe("A11y, refs, slots, emits (issues 2/4/10/11/12)", () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    // Vue в DEV пишет в console.warn собственные сообщения (например про missing
    // inject(FishtVueSymbol), когда тест монтирует Button без плагина). Чтобы наш
    // assertions считал только specific warning Button'а, фильтруем по prefix.
    const fishtVueButtonWarns = (spy: { mock: { calls: any[][] } }): any[][] =>
      spy.mock.calls.filter((call) => typeof call[0] === "string" && call[0].includes("[FishtVue Button]"))

    // ---Issue 2: aria-label--------------------
    it("sets aria-label when ariaLabel prop is provided", () => {
      const wrapper = mount(Button, {
        props: { type: "icon", icon: "trash", ariaLabel: "Delete user" }
      })
      expect(wrapper.find("[data-button]").attributes("aria-label")).toBe("Delete user")
    })

    it("falls back to icon name when type=icon and ariaLabel is omitted", () => {
      const wrapper = mount(Button, {
        props: { type: "icon", icon: "trash" }
      })
      expect(wrapper.find("[data-button]").attributes("aria-label")).toBe("trash")
    })

    it("does not set aria-label for non-icon button without ariaLabel", () => {
      const wrapper = mount(Button, {
        props: { type: "button", icon: "check" },
        slots: { default: "Save" }
      })
      expect(wrapper.find("[data-button]").attributes("aria-label")).toBeUndefined()
    })

    it("warns in DEV when type=icon without ariaLabel and without default slot", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
      mount(Button, { props: { type: "icon", icon: "trash" } })
      const ourWarns = fishtVueButtonWarns(warnSpy)
      expect(ourWarns).toHaveLength(1)
      expect(ourWarns[0][0]).toContain("aria-label")
    })

    it("does not warn when icon button has a default slot (tooltip)", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
      mount(Button, {
        props: { type: "icon", icon: "trash" },
        slots: { default: "Delete item" }
      })
      expect(fishtVueButtonWarns(warnSpy)).toHaveLength(0)
    })

    it("does not warn when icon button has ariaLabel", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
      mount(Button, {
        props: { type: "icon", icon: "trash", ariaLabel: "Delete" }
      })
      expect(fishtVueButtonWarns(warnSpy)).toHaveLength(0)
    })

    // ---Issue 11: typed click emit-------------
    it("emits click with MouseEvent payload", async () => {
      const wrapper = mount(Button, { slots: { default: "Save" } })
      await wrapper.find("[data-button]").trigger("click")
      const events = wrapper.emitted("click")
      expect(events).toBeTruthy()
      expect(events?.[0]?.[0]).toBeInstanceOf(MouseEvent)
    })

    // ---Issue 4: buttonRef + focus / blur------
    it("exposes buttonRef pointing to the underlying <button> element", () => {
      const wrapper = mount(Button, { slots: { default: "X" } })
      const buttonEl = wrapper.find("[data-button]").element
      expect((wrapper.vm as unknown as ButtonExpose).buttonRef).toBe(buttonEl)
    })

    it("focuses the underlying button via exposed focus()", () => {
      const wrapper = mount(Button, {
        attachTo: document.body,
        slots: { default: "X" }
      })
      ;(wrapper.vm as unknown as ButtonExpose).focus()
      expect(document.activeElement).toBe(wrapper.find("[data-button]").element)
      wrapper.unmount()
    })

    it("blurs the underlying button via exposed blur()", () => {
      const wrapper = mount(Button, {
        attachTo: document.body,
        slots: { default: "X" }
      })
      const expose = wrapper.vm as unknown as ButtonExpose
      expose.focus()
      expect(document.activeElement).toBe(wrapper.find("[data-button]").element)
      expose.blur()
      expect(document.activeElement).not.toBe(wrapper.find("[data-button]").element)
      wrapper.unmount()
    })

    // ---Issue 12: start / end slots------------
    it("renders start slot before default content", () => {
      const wrapper = mount(Button, {
        slots: {
          start: "<span>S</span>",
          default: "D"
        }
      })
      expect(wrapper.find("[data-button]").text()).toBe("SD")
    })

    it("renders end slot after default content", () => {
      const wrapper = mount(Button, {
        slots: {
          default: "D",
          end: "<span>E</span>"
        }
      })
      expect(wrapper.find("[data-button]").text()).toBe("DE")
    })

    it("renders start before default before end (ordering)", () => {
      const wrapper = mount(Button, {
        slots: {
          start: "<span>S</span>",
          default: "D",
          end: "<span>E</span>"
        }
      })
      expect(wrapper.find("[data-button]").text()).toBe("SDE")
    })

    // ---Issue 10: motion-safe-----------------
    it("applies motion-safe transition variants instead of unconditional ones", () => {
      const wrapper = mount(Button)
      const cls = wrapper.find("[data-button]").attributes("class") ?? ""
      expect(cls).toContain("motion-safe:transition-colors")
      expect(cls).toContain("motion-safe:duration-200")
      expect(cls).not.toMatch(/(^|\s)transition-colors(\s|$)/)
      expect(cls).not.toMatch(/(^|\s)duration-200(\s|$)/)
    })

    // ---Issue 3: logical iconPosition (start/end) + RTL-safe----
    // true → label следует за иконкой в DOM (иконка перед контентом)
    const iconBeforeLabel = (wrapper: ReturnType<typeof mount>) => {
      const iconEl = wrapper.findComponent({ name: "Icons" }).element
      const labelEl = wrapper.find(".lbl").element
      return Boolean(iconEl.compareDocumentPosition(labelEl) & Node.DOCUMENT_POSITION_FOLLOWING)
    }
    const mountWithIcon = (iconPosition?: "start" | "end" | "left" | "right") =>
      mount(Button, {
        props: { icon: "check", ...(iconPosition ? { iconPosition } : {}) },
        slots: { default: '<span class="lbl">L</span>' }
      })

    it('renders icon before content when iconPosition="start"', () => {
      expect(iconBeforeLabel(mountWithIcon("start"))).toBe(true)
    })

    it('renders icon after content when iconPosition="end"', () => {
      expect(iconBeforeLabel(mountWithIcon("end"))).toBe(false)
    })

    it("defaults to end position (icon after content) when iconPosition is omitted", () => {
      expect(iconBeforeLabel(mountWithIcon())).toBe(false)
    })

    it('maps deprecated "left" → start (icon before content)', () => {
      expect(iconBeforeLabel(mountWithIcon("left"))).toBe(true)
    })

    it('maps deprecated "right" → end (icon after content)', () => {
      expect(iconBeforeLabel(mountWithIcon("right"))).toBe(false)
    })

    it("warns in dev when deprecated left/right iconPosition is used", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      mountWithIcon("left")
      mountWithIcon("right")
      const messages = fishtVueButtonWarns(warn).map((call) => call[0])
      expect(messages.some((m) => m.includes('iconPosition="left" is deprecated'))).toBe(true)
      expect(messages.some((m) => m.includes('iconPosition="right" is deprecated'))).toBe(true)
      warn.mockRestore()
    })

    it("does not warn for logical start/end iconPosition", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
      mountWithIcon("start")
      mountWithIcon("end")
      const messages = fishtVueButtonWarns(warn).map((call) => call[0])
      expect(messages.some((m) => m.includes("deprecated"))).toBe(false)
      warn.mockRestore()
    })
  })
})

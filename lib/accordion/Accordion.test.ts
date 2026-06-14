import { createApp, h, nextTick, Transition } from "vue"
import { flushPromises, mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Accordion from "fishtvue/accordion/Accordion.vue"
import AccordionItem from "fishtvue/accordion/AccordionItem.vue"

describe("Accordion Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Accordion)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props()).toEqual({
        dataSource: undefined,
        multiple: undefined,
        animationDuration: undefined,
        icon: undefined,
        class: undefined,
        classItem: undefined,
        classTitle: undefined,
        classSubtitle: undefined
      })
    })

    it("handles props: dataSource and multiple", async () => {
      const dataSource = [
        { title: "Item 1", subtitle: "Subtitle 1", open: false },
        { title: "Item 2", subtitle: "Subtitle 2", open: true }
      ]
      const wrapper: any = mount(Accordion, {
        props: { dataSource, multiple: true }
      })
      expect(wrapper.props("dataSource")).toEqual(dataSource)
      expect(wrapper.props("multiple")).toBe(true)

      const items = wrapper.findAll('[role="group"]')
      expect(items).toHaveLength(2)
      const itemsButton = wrapper.findAll('[role="group"] [type="button"]')
      expect(itemsButton[0].attributes("aria-expanded")).toBe("false")
      expect(itemsButton[1].attributes("aria-expanded")).toBe("true")
    })

    it("emits toggle event when an item is clicked", async () => {
      const dataSource = [
        { title: "Item 1", subtitle: "Subtitle 1", open: false },
        { title: "Item 2", subtitle: "Subtitle 2", open: false }
      ]
      const wrapper = mount(Accordion, {
        props: { dataSource }
      })
      let button = wrapper.find('[role="group"] [type="button"]')
      await button.trigger("click")
      expect(wrapper.emitted("toggle")).toBeTruthy()
      expect(wrapper.emitted("toggle")?.[0]).toEqual([
        [
          { title: "Item 1", subtitle: "Subtitle 1", open: true },
          { title: "Item 2", subtitle: "Subtitle 2", open: false }
        ]
      ])
      button = wrapper.find('[role="group"] [type="button"]')
      expect(button.attributes("aria-expanded")).toBe("true")
    })

    it("handles animationDuration prop correctly", () => {
      const wrapper: any = mount(Accordion, {
        props: { animationDuration: 500, dataSource: [{ title: "Item 1", subtitle: "Subtitle 1", open: false }] }
      })
      expect(wrapper.props("animationDuration")).toBe(500)

      const region = wrapper.find('[role="region"]')
      expect(region.attributes("style")).toContain("transition-duration: 500ms;")
    })

    it("handles icon prop correctly", async () => {
      const wrapper: any = mount(Accordion, {
        props: { icon: "ChevronDown", dataSource: [{ title: "Item 1", subtitle: "Subtitle 1", open: false }] }
      })
      let icon = wrapper.find("svg.ChevronDownIcon")
      expect(icon.exists()).toBe(true)

      await wrapper.setProps({ icon: "ArrowDownCircle" })
      icon = wrapper.find("svg.ArrowDownCircleIcon")
      expect(icon.exists()).toBe(true)

      await wrapper.setProps({ icon: "Plus" })
      icon = wrapper.find("svg.PlusIcon")
      expect(icon.exists()).toBe(true)
    })

    it("handles class-related props correctly", () => {
      const wrapper: any = mount(Accordion, {
        props: {
          dataSource: [{ title: "Item 1", subtitle: "Subtitle 1", open: false }],
          class: "custom-body-class",
          classItem: "custom-item-class",
          classTitle: "custom-title-class",
          classSubtitle: "custom-subtitle-class"
        }
      })

      const body = wrapper.find("div")
      expect(body.classes()).toContain("custom-body-class")

      const item = wrapper.find(".custom-item-class")
      expect(item.exists()).toBe(true)

      const title = wrapper.find(".custom-title-class")
      expect(title.exists()).toBe(true)

      const subtitle = wrapper.find(".custom-subtitle-class")
      expect(subtitle.exists()).toBe(true)
    })

    it("renders slots correctly", () => {
      const wrapper = mount(Accordion, {
        props: {
          dataSource: [{ title: "Custom Slot Title", open: false }]
        },
        slots: {
          title: '<span class="slot-title">Slot Title</span>'
        }
      })

      const slot = wrapper.find(".slot-title")
      expect(slot.exists()).toBe(true)
      expect(slot.text()).toBe("Slot Title")
    })

    it("accesses exposed methods and properties via ref", () => {
      const dataSource = [{ title: "Item 1", subtitle: "Subtitle 1", open: false }]
      const wrapper = mount(Accordion, {
        props: { dataSource }
      })

      const accordionRef = wrapper.vm
      expect(accordionRef.dataItems).toEqual(dataSource)
      expect(accordionRef.multiple).toBe(false)
      expect(typeof accordionRef.toggle).toBe("function")
    })

    it("handles invalid prop values gracefully", () => {
      const wrapper: any = mount(Accordion, {
        // @ts-ignore
        props: { animationDuration: "invalid" }
      })
      expect(wrapper.props("animationDuration")).toBe("invalid")
      // Ensure component doesn't break on invalid props
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe("Security — XSS in subtitle", () => {
    it("renders subtitle as text, not HTML, when no slot provided", () => {
      const payload = "<img src=x onerror=alert(1)>"
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "t", subtitle: payload, open: true }] }
      })
      expect(wrapper.html()).not.toContain("<img")
      expect(wrapper.text()).toContain(payload)
    })

    it("allows consumer to opt-in to HTML via #item-subtitle slot", () => {
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "t", subtitle: "raw", open: true }] },
        slots: { "item-subtitle": '<strong class="custom-subtitle-slot">custom</strong>' }
      })
      expect(wrapper.find(".custom-subtitle-slot").exists()).toBe(true)
      expect(wrapper.find(".custom-subtitle-slot").text()).toBe("custom")
    })

    it("does not render fallback <p> when slot is provided", () => {
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "t", subtitle: "default", open: true }] },
        slots: { "item-subtitle": '<span class="only-slot">only</span>' }
      })
      expect(wrapper.find(".only-slot").exists()).toBe(true)
      expect(wrapper.html()).not.toContain("default")
    })
  })

  describe("Accessibility — disclosure pattern", () => {
    it("links header to panel via aria-controls/aria-labelledby with stable ids", () => {
      const wrapper = mount(Accordion, {
        props: {
          dataSource: [
            { title: "A", subtitle: "sa", open: true },
            { title: "B", subtitle: "sb", open: false }
          ]
        }
      })
      const buttons = wrapper.findAll('[type="button"]')
      const panels = wrapper.findAll('[role="region"]')
      expect(buttons).toHaveLength(2)
      expect(panels).toHaveLength(2)
      for (let i = 0; i < buttons.length; i++) {
        const headerId = buttons[i].attributes("id")
        const panelId = panels[i].attributes("id")
        expect(headerId).toBeTruthy()
        expect(panelId).toBeTruthy()
        expect(headerId).not.toBe(panelId)
        expect(buttons[i].attributes("aria-controls")).toBe(panelId)
        expect(panels[i].attributes("aria-labelledby")).toBe(headerId)
      }
    })

    it("ArrowDown moves focus to next header", async () => {
      const wrapper = mount(Accordion, {
        attachTo: document.body,
        props: {
          dataSource: [{ title: "A" }, { title: "B" }, { title: "C" }]
        }
      })
      const buttons = wrapper.findAll('[type="button"]')
      ;(buttons[0].element as HTMLElement).focus()
      await wrapper.find("[data-accordion]").trigger("keydown", { key: "ArrowDown" })
      expect(document.activeElement).toBe(buttons[1].element)
      wrapper.unmount()
    })

    it("ArrowUp moves focus to previous header", async () => {
      const wrapper = mount(Accordion, {
        attachTo: document.body,
        props: {
          dataSource: [{ title: "A" }, { title: "B" }, { title: "C" }]
        }
      })
      const buttons = wrapper.findAll('[type="button"]')
      ;(buttons[2].element as HTMLElement).focus()
      // simulate roving via two ArrowDown to land on idx 2, then ArrowUp
      await wrapper.find("[data-accordion]").trigger("keydown", { key: "End" })
      await wrapper.find("[data-accordion]").trigger("keydown", { key: "ArrowUp" })
      expect(document.activeElement).toBe(buttons[1].element)
      wrapper.unmount()
    })

    it("Home / End move focus to first / last header", async () => {
      const wrapper = mount(Accordion, {
        attachTo: document.body,
        props: {
          dataSource: [{ title: "A" }, { title: "B" }, { title: "C" }, { title: "D" }]
        }
      })
      const buttons = wrapper.findAll('[type="button"]')
      ;(buttons[0].element as HTMLElement).focus()
      await wrapper.find("[data-accordion]").trigger("keydown", { key: "End" })
      expect(document.activeElement).toBe(buttons[3].element)
      await wrapper.find("[data-accordion]").trigger("keydown", { key: "Home" })
      expect(document.activeElement).toBe(buttons[0].element)
      wrapper.unmount()
    })

    it("roving tabindex — only focused header is tabbable", async () => {
      const wrapper = mount(Accordion, {
        attachTo: document.body,
        props: {
          dataSource: [{ title: "A" }, { title: "B" }, { title: "C" }]
        }
      })
      const buttons = wrapper.findAll('[type="button"]')
      expect(buttons[0].attributes("tabindex")).toBe("0")
      expect(buttons[1].attributes("tabindex")).toBe("-1")
      expect(buttons[2].attributes("tabindex")).toBe("-1")
      await wrapper.find("[data-accordion]").trigger("keydown", { key: "ArrowDown" })
      const buttons2 = wrapper.findAll('[type="button"]')
      expect(buttons2[0].attributes("tabindex")).toBe("-1")
      expect(buttons2[1].attributes("tabindex")).toBe("0")
      expect(buttons2[2].attributes("tabindex")).toBe("-1")
      wrapper.unmount()
    })

    it("exposes focus(index) helper", () => {
      const wrapper = mount(Accordion, {
        attachTo: document.body,
        props: {
          dataSource: [{ title: "A" }, { title: "B" }]
        }
      })
      const accordionRef = wrapper.vm as any
      expect(typeof accordionRef.focus).toBe("function")
      accordionRef.focus(1)
      const buttons = wrapper.findAll('[type="button"]')
      expect(document.activeElement).toBe(buttons[1].element)
      wrapper.unmount()
    })

    it("non-handled keys are ignored", async () => {
      const wrapper = mount(Accordion, {
        attachTo: document.body,
        props: { dataSource: [{ title: "A" }, { title: "B" }] }
      })
      const buttons = wrapper.findAll('[type="button"]')
      ;(buttons[0].element as HTMLElement).focus()
      await wrapper.find("[data-accordion]").trigger("keydown", { key: "Tab" })
      expect(document.activeElement).toBe(buttons[0].element)
      wrapper.unmount()
    })
  })

  describe("Animation lifecycle — Transition unmount race", () => {
    it("renders <Transition> wrapper around root for unmount delay", () => {
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "A", subtitle: "s", open: true }], animationDuration: 300 }
      })
      // The rendered subtree's root must be a Transition VNode so Vue can run the leave hook
      // before removing the panel DOM. Compare subTree.type with Vue's built-in Transition.
      const subTree: any = (wrapper.vm.$ as any).subTree
      expect(subTree?.type).toBe(Transition)
      wrapper.unmount()
    })
  })

  describe("Dual-API — compound <Accordion><AccordionItem>", () => {
    it("renders sections declared as <AccordionItem> children", () => {
      const wrapper = mount(Accordion, {
        slots: {
          default: () => [
            h(AccordionItem, { title: "A", open: true }, { default: () => "Content A" }),
            h(AccordionItem, { title: "B" }, { default: () => "Content B" })
          ]
        }
      })
      const groups = wrapper.findAll('[role="group"]')
      expect(groups).toHaveLength(2)
      const buttons = wrapper.findAll('[type="button"]')
      expect(buttons[0].text()).toContain("A")
      expect(buttons[1].text()).toContain("B")
      expect(wrapper.text()).toContain("Content A")
      expect(wrapper.text()).toContain("Content B")
    })

    it("uses AccordionItem `open` prop as initial state", () => {
      const wrapper = mount(Accordion, {
        slots: {
          default: () => [
            h(AccordionItem, { title: "A", open: true }, { default: () => "ca" }),
            h(AccordionItem, { title: "B" }, { default: () => "cb" })
          ]
        }
      })
      const buttons = wrapper.findAll('[type="button"]')
      expect(buttons[0].attributes("aria-expanded")).toBe("true")
      expect(buttons[1].attributes("aria-expanded")).toBe("false")
    })

    it("schema :dataSource wins over compound children (backward compat)", () => {
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "Schema", subtitle: "s", open: false }] },
        slots: {
          default: () => [h(AccordionItem, { title: "Compound" }, { default: () => "cc" })]
        }
      })
      const buttons = wrapper.findAll('[type="button"]')
      expect(buttons).toHaveLength(1)
      expect(buttons[0].text()).toContain("Schema")
      expect(wrapper.text()).not.toContain("Compound")
    })

    it("falls back to subtitle text when AccordionItem has no default slot", () => {
      const wrapper = mount(Accordion, {
        slots: {
          default: () => [h(AccordionItem, { title: "A", subtitle: "Plain sub", open: true })]
        }
      })
      expect(wrapper.text()).toContain("Plain sub")
    })

    it("toggles a compound section and emits toggle", async () => {
      const wrapper = mount(Accordion, {
        slots: {
          default: () => [
            h(AccordionItem, { title: "A" }, { default: () => "ca" }),
            h(AccordionItem, { title: "B" }, { default: () => "cb" })
          ]
        }
      })
      const button = wrapper.find('[type="button"]')
      expect(button.attributes("aria-expanded")).toBe("false")
      await button.trigger("click")
      expect(button.attributes("aria-expanded")).toBe("true")
      expect(wrapper.emitted("toggle")).toBeTruthy()
    })

    it("wires aria-controls/labelledby for compound sections", () => {
      const wrapper = mount(Accordion, {
        slots: {
          default: () => [h(AccordionItem, { title: "A", open: true }, { default: () => "ca" })]
        }
      })
      const button = wrapper.find('[type="button"]')
      const panel = wrapper.find('[role="region"]')
      expect(button.attributes("aria-controls")).toBe(panel.attributes("id"))
      expect(panel.attributes("aria-labelledby")).toBe(button.attributes("id"))
    })

    it("renders nothing when no children and no dataSource", () => {
      const wrapper = mount(Accordion)
      expect(wrapper.find("[data-accordion]").exists()).toBe(false)
    })

    it("preserves open-state across parent re-render", async () => {
      const wrapper = mount(Accordion, {
        slots: {
          default: () => [
            h(AccordionItem, { title: "A" }, { default: () => "ca" }),
            h(AccordionItem, { title: "B" }, { default: () => "cb" })
          ]
        }
      })
      const button = wrapper.find('[type="button"]')
      await button.trigger("click")
      expect(button.attributes("aria-expanded")).toBe("true")
      await wrapper.setProps({ multiple: true })
      expect(wrapper.find('[type="button"]').attributes("aria-expanded")).toBe("true")
    })
  })

  describe("A11y — motion-safe & RTL (E29.7 / F31)", () => {
    it("uses logical text alignment (text-start, not text-left) on header button", () => {
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "A", subtitle: "s", open: true }] }
      })
      const button = wrapper.find("[data-accordion-button]")
      expect(button.classes()).toContain("text-start")
      expect(button.classes()).not.toContain("text-left")
    })

    it("uses logical margin (ms-8, not ml-8) on the icon", () => {
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "A", subtitle: "s", open: true }], icon: "Plus" }
      })
      const icon = wrapper.find("svg.PlusIcon")
      expect(icon.classes()).toContain("ms-8")
      expect(icon.classes()).not.toContain("ml-8")
    })

    it("gates the panel transition behind motion-safe", () => {
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "A", subtitle: "s", open: true }] }
      })
      const panel = wrapper.find('[role="region"]')
      expect(panel.classes()).toContain("motion-safe:transition-all")
      expect(panel.classes()).not.toContain("transition-all")
    })
  })

  describe("Expose — root element ref (G34)", () => {
    it("exposes rootRef pointing at the [data-accordion] root", () => {
      const wrapper = mount(Accordion, {
        props: { dataSource: [{ title: "A", subtitle: "s", open: true }] }
      })
      const root = wrapper.find("[data-accordion]")
      expect((wrapper.vm as any).rootRef).toBe(root.element)
    })
  })

  describe("Accordion Component Tests with FishtVue Initialization and Options", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Accordion: options
        }
      })
      return app
    }

    it("applies global component-specific options to Accordion", () => {
      const localVue = createAppWithFishtVue({
        icon: "Plus",
        animationDuration: 300,
        multiple: true
      })

      const wrapper = mount(Accordion, {
        localVue,
        props: {
          dataSource: [
            { title: "Item 1", subtitle: "Subtitle 1", open: false },
            { title: "Item 2", subtitle: "Subtitle 2", open: true }
          ]
        }
      })

      expect(wrapper.vm.icon).toBe("Plus")
      expect(wrapper.vm.animationDuration).toBe(300)
      expect(wrapper.vm.multiple).toBe(true)
    })

    it("overrides global Accordion options with local props", () => {
      const localVue = createAppWithFishtVue({
        icon: "ArrowDownCircle",
        animationDuration: 200
      })

      const wrapper = mount(Accordion, {
        localVue,
        props: {
          icon: "ChevronDown",
          animationDuration: 1000
        }
      })

      expect(wrapper.vm.icon).toBe("ChevronDown")
      expect(wrapper.vm.animationDuration).toBe(1000)
    })

    it("inherits and applies global styles from options", () => {
      const localVue = createAppWithFishtVue({
        class: "global-body-class",
        classItem: "global-item-class",
        classTitle: "global-title-class",
        classSubtitle: "global-subtitle-class"
      })

      const wrapper = mount(Accordion, {
        localVue,
        props: {
          dataSource: [
            { title: "Item 1", subtitle: "Subtitle 1", open: false },
            { title: "Item 2", subtitle: "Subtitle 2", open: true }
          ]
        }
      })

      const body = wrapper.find(".global-body-class")
      expect(body.exists()).toBe(true)

      const item = wrapper.find(".global-item-class")
      expect(item.exists()).toBe(true)

      const title = wrapper.find(".global-title-class")
      expect(title.exists()).toBe(true)

      const subtitle = wrapper.find(".global-subtitle-class")
      expect(subtitle.exists()).toBe(true)
    })

    it("uses default options when no props or global settings are provided", () => {
      const localVue = createAppWithFishtVue({
        animationDuration: 500
      })

      const wrapper = mount(Accordion, {
        localVue,
        props: {
          dataSource: [
            { title: "Item 1", subtitle: "Subtitle 1", open: false },
            { title: "Item 2", subtitle: "Subtitle 2", open: true }
          ]
        }
      })

      expect(wrapper.vm.animationDuration).toBe(500)
      expect(wrapper.vm.icon).toBe("Plus") // Default value
    })

    it("emits toggle event correctly with options initialized multiple", async () => {
      const localVue = createAppWithFishtVue({
        multiple: true
      })

      const dataSource = [
        { title: "Item 1", subtitle: "Subtitle 1", open: false },
        { title: "Item 2", subtitle: "Subtitle 2", open: true }
      ]

      const wrapper = mount(Accordion, {
        localVue,
        props: { dataSource }
      })

      const button = wrapper.find("button")
      await button.trigger("click")
      expect(wrapper.emitted("toggle")).toBeTruthy()
      expect(wrapper.emitted("toggle")?.[0]).toEqual([
        [
          { title: "Item 1", subtitle: "Subtitle 1", open: true },
          { title: "Item 2", subtitle: "Subtitle 2", open: true }
        ]
      ])
    })
    it("emits toggle event correctly with options initialized not multiple", async () => {
      const localVue = createAppWithFishtVue({
        multiple: false
      })

      const dataSource = [
        { title: "Item 1", subtitle: "Subtitle 1", open: false },
        { title: "Item 2", subtitle: "Subtitle 2", open: true }
      ]

      const wrapper = mount(Accordion, {
        localVue,
        props: { dataSource }
      })

      const button = wrapper.find("button")
      await button.trigger("click")
      expect(wrapper.emitted("toggle")).toBeTruthy()
      expect(wrapper.emitted("toggle")?.[0]).toEqual([
        [
          { title: "Item 1", subtitle: "Subtitle 1", open: true },
          { title: "Item 2", subtitle: "Subtitle 2", open: false }
        ]
      ])
    })
  })
})

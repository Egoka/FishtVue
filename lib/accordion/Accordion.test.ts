import { createApp } from "vue"
import { mount } from "@vue/test-utils"
import { describe, it, expect } from "vitest"
import FishtVue from "fishtvue/config"
import Accordion from "fishtvue/accordion/Accordion.vue"

describe("Accordion Component Tests", () => {
  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Accordion)
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.props()).toEqual({
        dataSource: undefined,
        multiple: undefined,
        animationDuration: undefined,
        typeIcon: undefined,
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

    it("handles typeIcon prop correctly", async () => {
      const wrapper: any = mount(Accordion, {
        props: { typeIcon: "ChevronDown", dataSource: [{ title: "Item 1", subtitle: "Subtitle 1", open: false }] }
      })
      let icon = wrapper.find("svg.ChevronDownIcon")
      expect(icon.exists()).toBe(true)

      await wrapper.setProps({ typeIcon: "ArrowDownCircle" })
      icon = wrapper.find("svg.ArrowDownCircleIcon")
      expect(icon.exists()).toBe(true)

      await wrapper.setProps({ typeIcon: "Plus" })
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
        props: { animationDuration: "invalid" }
      })
      expect(wrapper.props("animationDuration")).toBe("invalid")
      // Ensure component doesn't break on invalid props
      expect(wrapper.exists()).toBe(true)
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
        typeIcon: "Plus",
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

      expect(wrapper.vm.typeIcon).toBe("Plus")
      expect(wrapper.vm.animationDuration).toBe(300)
      expect(wrapper.vm.multiple).toBe(true)
    })

    it("overrides global Accordion options with local props", () => {
      const localVue = createAppWithFishtVue({
        typeIcon: "ArrowDownCircle",
        animationDuration: 200
      })

      const wrapper = mount(Accordion, {
        localVue,
        props: {
          typeIcon: "ChevronDown",
          animationDuration: 1000
        }
      })

      expect(wrapper.vm.typeIcon).toBe("ChevronDown")
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
      expect(wrapper.vm.typeIcon).toBe("Plus") // Default value
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

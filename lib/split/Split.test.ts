import { describe, it, expect } from "vitest"
import { mount } from "@vue/test-utils"
import FishtVue from "fishtvue/config"
import Split from "fishtvue/split/Split.vue"
import { SplitOption } from "fishtvue/split/Split"

describe("Split Component", () => {
  describe("Without Library Initialization", () => {
    it("renders panels based on the `panels` prop", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        }
      })

      const panels = wrapper.findAll("[data-split-item]")
      expect(panels).toHaveLength(2)
      expect(panels[0].attributes("data-name")).toBe("panel1")
      expect(panels[1].attributes("data-name")).toBe("panel2")
    })

    it("emits `updated-size-panel` when a panel is resized", async () => {
      ;(window as any).innerWidth = 1920
      ;(window as any).innerHeight = 1080
      const container = document.createElement("div")
      container.style.width = "100px"
      container.style.height = "100px"
      container.style.padding = "100px"
      document.body.appendChild(container)
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        },
        slots: {
          panel1: '<div class="slot-content">Slot panel1</div>',
          panel2: '<div class="slot-content">Slot panel2</div>'
        },
        attachTo: container
      })

      const separator = wrapper.find("[data-split-separator]")
      await separator.trigger("mousedown")
      expect(wrapper.emitted("start-resize-panel")?.[0][1]).toBe("panel1")
      await separator.trigger("mousemove", { clientX: 100 })
      expect(wrapper.emitted("move-resize-panel")?.[0][1]).toBe("panel1")
      await separator.trigger("mouseout")
      expect(wrapper.emitted("out-resize-panel")?.[0][1]).toBe("panel1")
      await separator.trigger("mouseup")
      expect(wrapper.emitted("stop-resize-panel")?.[0][1]).toBe("panel1")

      expect(wrapper.emitted()).toHaveProperty("updated-size-panel")
      expect(wrapper.emitted("updated-size-panel")?.[0]).toEqual([100, "panel1"])
    })

    it("renders slots for each panel", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        },
        slots: {
          panel1: "<div>Panel 1 Content</div>",
          panel2: "<div>Panel 2 Content</div>"
        }
      })

      expect(wrapper.html()).toContain("Panel 1 Content")
      expect(wrapper.html()).toContain("Panel 2 Content")
    })

    it("updates `sizePanels` when panels prop changes", async () => {
      const wrapper = mount(Split, {
        props: {
          panels: [
            { name: "panel1", size: 50 },
            { name: "panel2", size: 50 }
          ]
        }
      })

      await wrapper.setProps({
        panels: [
          { name: "panel1", size: 75 },
          { name: "panel2", size: 25 }
        ]
      })

      const panel1 = wrapper.find('[data-name="panel1"]')
      expect(panel1.attributes("data-size")).toBe("75")

      const panel2 = wrapper.find('[data-name="panel2"]')
      expect(panel2.attributes("data-size")).toBe("25")
    })

    it("applies `direction` prop correctly", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [{ name: "panel1", size: 50 }],
          direction: "vertical"
        }
      })

      expect(wrapper.attributes("data-direction")).toBe("vertical")
    })

    it("handles `separatorType` prop", () => {
      const wrapper = mount(Split, {
        props: {
          panels: [{ name: "panel1" }, { name: "panel2" }],
          separatorType: "hexagon"
        }
      })

      const separator = wrapper.find("[data-split-separator-icon]")
      expect(separator.exists()).toBe(true)
    })
  })
  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options: SplitOption = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Split: options
          }
        })
      }
    })

    // Test with global options from library
    it("applies default options from library", () => {
      const app = createAppWithFishtVue({
        separatorType: "hexagon",
        separatorNotHoverOpacity: true,
        class: "classSplitOption",
        styles: {
          panel: "stylesPanel"
        }
      })

      const wrapper = mount(Split, {
        global: { plugins: [app] },
        props: {
          panels: [{ name: "panel1" }, { name: "panel2" }]
        }
      })

      const selectedItems = wrapper.findAll("[data-split-item]")
      expect(selectedItems).toHaveLength(2)
      expect(wrapper.vm.separatorType)
      expect(wrapper.vm.separatorNotHoverOpacity)
      expect(wrapper.vm.classBase).toContain("classSplitOption")
      expect(wrapper.vm.styles).toEqual({ panel: "stylesPanel" })
    })
  })
})

import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Icons from "fishtvue/icons/Icons.vue"

describe("Icons Component Tests", () => {
  describe("Icon Component - Without Library Initialization", () => {
    it("renders a HeroIcon when type matches", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "Check"
        }
      })
      expect(wrapper.html())
        .toBe(`<i data-icon=""><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon" class="fv fishtvue-icons h-5 w-5 text-gray-900 dark:text-gray-100 select-none">
    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5"></path>
  </svg></i>`)
    })

    it("does not render any icon if type is invalid", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "test"
        }
      })

      // Проверяем, что ни HeroIcon, ни Iconify не рендерятся
      expect(wrapper.findComponent({ name: "Icon" }).exists()).toBe(false)
      expect(wrapper.findComponent({ name: "CheckIcon" }).exists()).toBe(false)
    })

    it("applies custom class and style", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "Check",
          class: "custom-class",
          style: "color: red;"
        }
      })

      const iconElement = wrapper.find("svg")
      expect(iconElement.attributes("class")).toContain("custom-class")
      expect(iconElement.attributes("style")).toContain("color: red;")
    })

    it("renders an Iconify icon when type matches", async () => {
      const wrapper = mount(Icons, {
        props: {
          type: "icon-park-solid:circles-and-triangles"
        }
      })

      // Эмулируем обновление пропса type
      await wrapper.setProps({ type: "icon-park-solid:circles-and-triangles" })
    })
  })
  describe("Icon Component - With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Icons: options
          }
        })
      }
    })

    it("renders a HeroIcon with global options applied", async () => {
      const app = createAppWithFishtVue({ class: "global-class" })
      const wrapper = mount(Icons, {
        props: {
          type: "Check"
        },
        global: {
          plugins: [app]
        }
      })

      // Проверяем, что иконка рендерится с глобальным классом
      const iconElement = wrapper.find("svg")
      expect(iconElement.attributes("class")).toContain("global-class")
    })
  })
})

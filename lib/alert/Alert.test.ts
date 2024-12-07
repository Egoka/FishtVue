import { mount } from "@vue/test-utils"
import { describe, it, vi, expect, beforeEach } from "vitest"
import FishtVue from "fishtvue/config"
import { createApp } from "vue"
import Alert from "fishtvue/alert/Alert.vue"
import { openAlert } from "fishtvue/alert/openAlert"
import { PositionShort } from "fishtvue/types"

describe("Alert Component", () => {
  describe("Without Library Initialization", () => {
    it("should render with default props", () => {
      const wrapper = mount(Alert)
      expect(wrapper.exists()).toBe(true)
      expect((wrapper.props() as any).type).toBeUndefined()
    })

    it("should render custom title, subtitle, and slot content", () => {
      const wrapper = mount(Alert, {
        props: {
          modelValue: true,
          title: "Custom Title",
          subtitle: "Custom Subtitle"
        },
        slots: {
          default: "<p>Custom Slot Content</p>"
        }
      })

      expect(wrapper.find("[data-alert-content] [data-alert-title]").text()).toBe("Custom Title")
      expect(wrapper.find("[data-alert-content] [data-alert-subtitle]").text()).toBe("Custom Subtitle")
      expect(wrapper.find("[data-alert-content] [data-alert-slot]").html()).toContain("Custom Slot Content")
    })

    it("should expose reactive fields and methods", async () => {
      const wrapper = mount(Alert, {
        props: {
          modelValue: true
        }
      })

      expect(wrapper.vm.isVisible).toBe(true)
      expect(wrapper.vm.type).toBe("success") // default type
      wrapper.vm.close()
      expect(wrapper.vm.isVisible).toBe(false)
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    })
  })

  describe("Integration with FishtVue Library", () => {
    const createAppWithFishtVue = (options = {}) => {
      const app = createApp({})
      app.use(FishtVue, {
        componentsOptions: {
          Alert: options
        }
      })
      return app
    }

    it("should render with global options", () => {
      const app: any = createAppWithFishtVue({
        type: "warning"
      })

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: {
          title: "Global Title",
          subtitle: "Global Subtitle"
        }
      })

      expect(wrapper.vm.type).toBe("warning")
      expect(wrapper.vm.title).toBe("Global Title")
      expect(wrapper.vm.subtitle).toBe("Global Subtitle")
    })

    it("should override global options with props", () => {
      const app: any = createAppWithFishtVue({
        type: "warning"
      })

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: {
          type: "error",
          title: "Prop Title"
        }
      })

      expect(wrapper.vm.type).toBe("error")
      expect(wrapper.vm.title).toBe("Prop Title")
    })

    it("should handle visibility and emit update:modelValue", async () => {
      const app: any = createAppWithFishtVue()

      const wrapper = mount(Alert, {
        global: { plugins: [app] },
        props: {
          modelValue: true
        }
      })

      expect(wrapper.vm.isVisible).toBe(true)
      await wrapper.vm.close()
      expect(wrapper.vm.isVisible).toBe(false)
    })
  })

  describe("Alert Component - Extended Tests", () => {
    describe("Each test for type", () => {
      it.each([
        { type: "success", expectClass: "bg-green-50 dark:bg-green-950" },
        { type: "warning", expectClass: "bg-yellow-50 dark:bg-yellow-950" },
        {
          type: "info",
          expectClass: "bg-blue-50 dark:bg-blue-950"
        },
        { type: "error", expectClass: "bg-red-50 dark:bg-red-950" },
        { type: "neutral", expectClass: "bg-neutral-100 dark:bg-neutral-800" }
      ])("should render alert with type '%s'", ({ type, expectClass }) => {
        const wrapper = mount(Alert, {
          props: { type }
        })
        expect(wrapper.vm.classesStyle.body).toBe(expectClass)
      })
    })

    describe("Each test for position", () => {
      it.each(["top", "bottom", "left", "right", "center"])("should render alert with position '%s'", (position) => {
        const wrapper = mount(Alert, {
          props: { position }
        })

        expect(wrapper.vm.position).toBe(position)
      })
    })

    describe("Each test for size", () => {
      it.each(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl"])(
        "should render alert with size '%s'",
        (size) => {
          const wrapper = mount(Alert, {
            props: { size }
          })

          expect(wrapper.vm.size).toContain(size)
        }
      )
    })

    describe("displayTime functionality", () => {
      it.each([1000, 2000, 3000])("should hide alert after %sms", async (displayTime) => {
        const wrapper = mount(Alert, {
          props: { displayTime, modelValue: true }
        })

        expect(wrapper.vm.isVisible).toBe(true)

        await new Promise((resolve) => setTimeout(resolve, displayTime + 500))

        expect(wrapper.vm.isVisible).toBe(false)
      })
    })

    describe("notAnimate functionality", () => {
      it("should not include transition classes when notAnimate is true", () => {
        const wrapper = mount(Alert, {
          props: { notAnimate: true }
        })

        const transitionClasses = ["translate-x-[200%]", "opacity-0", "translate-y-[200%]"]
        const wrapperHtml = wrapper.html()

        transitionClasses.forEach((cls) => {
          expect(wrapperHtml).not.toContain(cls)
        })
      })
    })

    describe("closeButton functionality", () => {
      it("should render a close button and handle close action", async () => {
        const wrapper = mount(Alert, {
          props: { closeButton: true, modelValue: true }
        })

        expect(wrapper.find("[data-alert-button]").exists()).toBe(true)

        await wrapper.find("button").trigger("click")

        expect(wrapper.vm.isVisible).toBe(false)
      })
    })

    describe("class and style props", () => {
      it("should apply custom class to alert", () => {
        const customClass = "custom-alert-class"
        const wrapper = mount(Alert, {
          props: { class: customClass, modelValue: true }
        })

        expect(wrapper.find("[data-alert] > div").attributes("class")).toContain(customClass)
      })

      it("should apply custom style to alert", () => {
        const customStyle = { color: "red" }
        const wrapper = mount(Alert, {
          props: { style: customStyle, modelValue: true }
        })

        expect(wrapper.find("[data-alert] > div").attributes("style")).toContain("color: red;")
      })
    })
  })

  describe("Alert Component - Icon Rendering", () => {
    const iconMap = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fishtvue-alert h-5 w-5 text-green-400 dark:text-green-600">
  <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"></path>
</svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fishtvue-alert h-5 w-5 text-yellow-400 dark:text-yellow-600">
  <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"></path>
</svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fishtvue-alert h-5 w-5 text-blue-400 dark:text-blue-600">
  <path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd"></path>
</svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fishtvue-alert h-5 w-5 text-red-400 dark:text-red-600">
  <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clip-rule="evenodd"></path>
</svg>`,
      neutral: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" class="fishtvue-alert h-5 w-5 text-neutral-400 dark:text-neutral-600">
  <path fill-rule="evenodd" d="M2 10c0-3.967 3.69-7 8-7 4.31 0 8 3.033 8 7s-3.69 7-8 7a9.165 9.165 0 0 1-1.504-.123 5.976 5.976 0 0 1-3.935 1.107.75.75 0 0 1-.584-1.143 3.478 3.478 0 0 0 .522-1.756C2.979 13.825 2 12.025 2 10Z" clip-rule="evenodd"></path>
</svg>`
    }

    it.each(Object.entries(iconMap))("should render correct icon for type '%s'", (type, expectedIcon) => {
      const wrapper = mount(Alert, {
        props: { type, modelValue: true }
      })

      expect(wrapper.find("[data-alert-icon] svg").html()).toBe(expectedIcon)
    })
  })

  describe("openAlert Function", () => {
    beforeEach(() => {
      document.body.innerHTML = "" // Очистить DOM перед каждым тестом
    })

    it("should create and mount an alert with default options", () => {
      openAlert({})

      const alertElement = document.querySelector(".alert-top")
      expect(alertElement).not.toBeNull()
      expect(alertElement?.querySelector(`[data-alert]`)).not.toBeNull()
    })

    it("should set custom position and create the corresponding container", () => {
      openAlert({ position: "bottom-right" })

      const alertElement = document.querySelector(".alert-bottom-right")
      expect(alertElement).not.toBeNull()
      expect(alertElement?.className).toContain("items-end")
    })

    it("should set default position to 'top' if none is provided", () => {
      openAlert({})
      const alertElement = document.querySelector(".alert-top")
      expect(alertElement).not.toBeNull()
    })

    it("should handle invalid position gracefully", () => {
      openAlert({ position: "invalid-position" as any })

      const alertElement = document.querySelector(".alert-top")
      expect(alertElement).not.toBeNull()
      expect(alertElement?.className).toContain("top-0")
      expect(alertElement?.className).toContain("-translate-x-1/2")
    })

    it("should apply displayTime and unmount alert after the timeout", async () => {
      vi.useFakeTimers()

      openAlert({ displayTime: 1000 })

      let alertElement = document.querySelector(`[data-alert]`)
      expect(alertElement).not.toBeNull()

      vi.advanceTimersByTime(1600)

      alertElement = document.querySelector(`[data-alert]`)
      expect(alertElement).toBeNull()

      vi.useRealTimers()
    })

    it("should allow manual close via close button", async () => {
      vi.useFakeTimers()
      openAlert({ closeButton: true })

      const closeButton = document.querySelector("[data-alert-button] [data-button]")
      expect(closeButton).not.toBeNull()

      closeButton?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true
        })
      )
      vi.advanceTimersByTime(600)

      const alertElement = document.querySelector(`[data-alert]`)
      expect(alertElement).toBeNull()
      vi.useRealTimers()
    })

    it("should mount alert to the specified teleport target", () => {
      const teleportTarget = document.createElement("div")
      teleportTarget.id = "custom-teleport"
      document.body.appendChild(teleportTarget)

      openAlert({ toTeleport: "#custom-teleport" })

      const alertElement = teleportTarget.querySelector(`[data-alert]`)
      expect(alertElement).not.toBeNull()
    })

    it("should log a warning if teleport target is not found", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      openAlert({ toTeleport: "#non-existent" })

      expect(consoleSpy).toHaveBeenCalledWith("The element for mounting the Alert component was not found")

      consoleSpy.mockRestore()
    })

    it("should remove the alert container if all alerts are destroyed", async () => {
      vi.useFakeTimers()
      openAlert({ position: "top" })

      const alertContainer = document.querySelector(".alert-top")
      expect(alertContainer).not.toBeNull()

      const closeButton = document.querySelector("[data-alert-button] [data-button]")
      closeButton?.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true
        })
      )
      vi.advanceTimersByTime(600)

      expect(document.querySelector("[data-alert]")).toBeNull()
      vi.useRealTimers()
    })

    it("should create three alerts in the same container", () => {
      // Вызов функции трижды с разными заголовками
      openAlert({ title: "First Alert", position: "top" })
      openAlert({ title: "Second Alert", position: "top" })
      openAlert({ title: "Third Alert", position: "top" })

      // Проверяем, что контейнер создан
      const alertContainer = document.querySelector(".alert-top")
      expect(alertContainer).not.toBeNull()

      // Проверяем, что внутри контейнера три алерта
      const alerts = alertContainer?.querySelectorAll(`[data-alert]`)
      expect(alerts?.length).toBe(3)

      // Проверяем заголовки для каждого алерта
      const alertTitles = Array.from(alerts || []).map((alert) => alert.querySelector("h3")?.textContent)

      expect(alertTitles).toEqual(["Third Alert", "Second Alert", "First Alert"])
    })
    describe("openAlert Function - Position Tests", () => {
      const positions: PositionShort[] = [
        "top",
        "bottom",
        "left",
        "right",
        "center",
        "bottom-left",
        "top-left",
        "bottom-right",
        "top-right"
      ]

      /**
       * Возвращает ожидаемые классы для заданной позиции
       */
      function getExpectedClassesForPosition(position: string): string[] {
        const positionClasses: Record<string, string[]> = {
          top: ["top-0", "mt-5", "items-center"],
          bottom: ["bottom-0", "mb-5", "items-center", "flex-col-reverse"],
          left: ["left-0", "ml-5", "top-1/2", "-translate-y-1/2"],
          right: ["right-0", "mr-5", "top-1/2", "-translate-y-1/2"],
          center: ["top-1/2", "left-1/2", "-translate-y-1/2", "-translate-x-1/2"],
          "bottom-left": ["bottom-0", "mb-5", "left-0", "ml-5", "flex-col-reverse"],
          "top-left": ["top-0", "mt-5", "left-0", "ml-5"],
          "bottom-right": ["bottom-0", "mb-5", "right-0", "mr-5", "flex-col-reverse"],
          "top-right": ["top-0", "mt-5", "right-0", "mr-5"]
        }

        return positionClasses[position] || []
      }

      it.each(positions)("should create an alert with position '%s'", (position) => {
        openAlert({ position })

        const alertContainer = document.querySelector(`.alert-${position}`)
        expect(alertContainer).not.toBeNull()

        const alertElement = alertContainer?.querySelector(`[data-alert]`)
        expect(alertElement).not.toBeNull()

        // Проверяем наличие классов, соответствующих позиции
        const expectedClasses = getExpectedClassesForPosition(position)
        expectedClasses.forEach((cls) => {
          expect(alertContainer?.className).toContain(cls)
        })
      })
    })
  })
})

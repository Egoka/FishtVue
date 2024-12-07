import { mount } from "@vue/test-utils"
import { describe, it, expect, afterEach, beforeEach } from "vitest"
import FishtVue from "fishtvue/config"
import Dialog from "fishtvue/dialog/Dialog.vue"

describe("Dialog Component Tests", () => {
  beforeEach(() => {
    // Create teleport target
    const el = document.createElement("div")
    el.id = "modal"
    document.body.appendChild(el)
  })

  afterEach(() => {
    // Cleanup teleport target
    const el = document.getElementById("modal")
    if (el) {
      document.body.removeChild(el)
    }
  })

  describe("Without Library Initialization", () => {
    it("renders correctly with default props", () => {
      const wrapper = mount(Dialog, {
        props: {
          modelValue: true,
          toTeleport: "#modal"
        }
      })

      expect(wrapper.exists()).toBe(true)
      const dialog = document.querySelector("#modal [data-dialog]")
      expect(dialog).not.toBeNull()
    })

    it('emits "update:modelValue" event when closeDialog is called', async () => {
      const wrapper = mount(Dialog, {
        props: {
          modelValue: true,
          toTeleport: "#modal"
        }
      })

      await wrapper.vm.closeDialog()
      expect(wrapper.emitted("update:modelValue")).toBeTruthy()
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false])
    })

    it("renders close button when closeButton is true", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          closeButton: true,
          toTeleport: "#modal"
        }
      })

      const closeButton = document.querySelector("#modal button")
      expect(closeButton).not.toBeNull()
    })

    it("renders slots correctly", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          toTeleport: "#modal"
        },
        slots: {
          default: '<div class="slot-content">Default Slot</div>',
          background: '<div class="slot-background">Background Slot</div>'
        }
      })

      const defaultSlot = document.querySelector("#modal .slot-content")
      expect(defaultSlot).not.toBeNull()
      expect(defaultSlot!.textContent).toBe("Default Slot")

      const backgroundSlot = document.querySelector("#modal .slot-background")
      expect(backgroundSlot).not.toBeNull()
      expect(backgroundSlot!.textContent).toBe("Background Slot")
    })

    it("applies size and position styles correctly", () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          size: "lg",
          position: "top-right",
          toTeleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expect(dialogContent!.classList).toContain("sm:max-w-lg")
      expect(dialogContent!.classList).toContain("top-0")
      expect(dialogContent!.classList).toContain("right-0")
    })

    const sizes = [
      { size: "xs", expectedClass: "sm:max-w-xs" },
      { size: "sm", expectedClass: "sm:max-w-sm" },
      { size: "md", expectedClass: "sm:max-w-md" },
      { size: "lg", expectedClass: "sm:max-w-lg" },
      { size: "xl", expectedClass: "sm:max-w-xl" },
      { size: "2xl", expectedClass: "sm:max-w-2xl" },
      { size: "3xl", expectedClass: "sm:max-w-3xl" },
      { size: "4xl", expectedClass: "sm:max-w-4xl" },
      { size: "5xl", expectedClass: "sm:max-w-5xl" },
      { size: "6xl", expectedClass: "sm:max-w-6xl" },
      { size: "7xl", expectedClass: "sm:max-w-7xl" }
    ]

    it.each(sizes)("applies correct size class for size: %s", ({ size, expectedClass }) => {
      mount(Dialog, {
        props: {
          modelValue: true,
          size,
          toTeleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expect(dialogContent!.classList).toContain(expectedClass)
    })

    const positions = [
      { position: "center", expectedClasses: ["top-1/2", "left-1/2", "-translate-y-1/2", "-translate-x-1/2"] },
      { position: "top", expectedClasses: ["top-0", "-translate-x-1/2"] },
      { position: "bottom", expectedClasses: ["bottom-0", "-translate-x-1/2"] },
      { position: "left", expectedClasses: ["top-1/2", "left-0", "-translate-y-1/2"] },
      { position: "right", expectedClasses: ["top-1/2", "right-0", "-translate-y-1/2"] },
      { position: "top-left", expectedClasses: ["top-0", "left-0"] },
      { position: "top-right", expectedClasses: ["top-0", "right-0"] },
      { position: "bottom-left", expectedClasses: ["bottom-0", "left-0"] },
      { position: "bottom-right", expectedClasses: ["bottom-0", "right-0"] }
    ]

    it.each(positions)("applies correct position classes for position: %s", ({ position, expectedClasses }) => {
      mount(Dialog, {
        props: {
          modelValue: true,
          position,
          toTeleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expectedClasses.forEach((expectedClass) => {
        expect(dialogContent!.classList).toContain(expectedClass)
      })
    })

    it('teleports content to body when toTeleport is "body"', () => {
      mount(Dialog, {
        props: {
          modelValue: true,
          toTeleport: "body"
        }
      })

      const dialog = document.querySelector("body [data-dialog]")
      expect(dialog).not.toBeNull()
    })

    it('adds and removes "overflow-hidden" to body on open and close', async () => {
      const wrapper = mount(Dialog, {
        props: {
          modelValue: false,
          toTeleport: "#modal"
        }
      })

      // Проверяем, что класс отсутствует при закрытии
      expect(document.body.classList.contains("overflow-hidden")).toBe(false)
      expect(document.body.style.overflow).not.toContain("hidden")

      // Открываем диалог
      await wrapper.setProps({ modelValue: true })

      // Проверяем, что класс добавлен при открытии
      expect(document.body.classList.contains("overflow-hidden")).toBe(true)
      expect(document.body.style.overflow).toContain("hidden")

      // Закрываем диалог
      await wrapper.setProps({ modelValue: false })

      // Проверяем, что класс удалён при закрытии
      expect(document.body.classList.contains("overflow-hidden")).toBe(false)
      expect(document.body.style.overflow).not.toContain("hidden")
    })
  })

  describe("With Library Initialization", () => {
    const createAppWithFishtVue = (options = {}) => ({
      install(app: any) {
        app.use(FishtVue, {
          componentsOptions: {
            Dialog: options
          }
        })
      }
    })

    it("applies global options correctly", () => {
      const appPlugin = createAppWithFishtVue({
        size: "xl",
        position: "bottom-left",
        closeButton: true
      })

      mount(Dialog, {
        global: {
          plugins: [appPlugin]
        },
        props: {
          modelValue: true,
          toTeleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expect(dialogContent!.classList).toContain("sm:max-w-xl")
      expect(dialogContent!.classList).toContain("bottom-0")
      expect(dialogContent!.classList).toContain("left-0")
    })

    it("overrides global options with local props", () => {
      const appPlugin = createAppWithFishtVue({
        size: "lg",
        position: "center"
      })

      mount(Dialog, {
        global: {
          plugins: [appPlugin]
        },
        props: {
          modelValue: true,
          size: "sm",
          position: "top-right",
          toTeleport: "#modal"
        }
      })

      const dialogContent = document.querySelector("#modal [data-dialog-content]")
      expect(dialogContent!.classList).toContain("sm:max-w-sm")
      expect(dialogContent!.classList).toContain("top-0")
      expect(dialogContent!.classList).toContain("right-0")
    })

    it("renders default background slot when no custom slot is provided", () => {
      const appPlugin = createAppWithFishtVue()

      mount(Dialog, {
        global: {
          plugins: [appPlugin]
        },
        props: {
          modelValue: true,
          toTeleport: "#modal"
        }
      })

      const background = document.querySelector("#modal [data-dialog-background]")
      expect(background).not.toBeNull()
    })
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { createApp } from "vue"
import type { App } from "vue"
import FishtVue, { useFishtVue } from "fishtvue/config"
import type { FishtVue as FishtVueType } from "fishtvue/config"
import type { FishtVueConfiguration } from "fishtvue/config"

describe("Testing config", () => {
  const expectText = "Start use FishtVue"
  const App = {
    template: `<div>${expectText}</div>`
  }
  describe("FishtVue Plugin", () => {
    it("should initialize and set global properties correctly", () => {
      // Создаем приложение Vue
      const app = createApp(App)

      // Настройки, которые будут переданы в плагин
      const options: FishtVueConfiguration = {
        optionsTheme: {
          nameTheme: "Harmony"
        }
      }

      // Используем плагин FishtVue с заданными опциями
      app.use(FishtVue, options)

      // Монтируем приложение
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue, options]]
        }
      })
      expect(wrapper.text()).toBe(expectText)
      // Проверяем наличие объекта FishtVue в глобальных переменных
      expect((window as any).FishtVue).toBeDefined()
      expect(app.config.globalProperties.$fishtVue).toBeDefined()

      // Проверяем, что опции темы установлены правильно
      expect((window as any).FishtVue.config.theme.name).toBe("Harmony")
      expect(app.config.globalProperties.$fishtVue.config.theme.name).toBe("Harmony")
    })

    it("should initialize and set global properties correctly", () => {
      const app = createApp(App)
      const options: FishtVueConfiguration = {
        optionsTheme: {
          nameTheme: "Harmony"
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue, options]]
        }
      })
      expect(wrapper.text()).toBe(expectText)
      expect((window as any).FishtVue).toBeDefined()
      expect(app.config.globalProperties.$fishtVue).toBeDefined()
      expect((window as any).FishtVue.config.theme.name).toBe("Harmony")
      expect(app.config.globalProperties.$fishtVue.config.theme.name).toBe("Harmony")
    })

    it("should access global properties through vm instance", () => {
      const app = createApp(App)
      const options: FishtVueConfiguration = {
        optionsTheme: {
          nameTheme: "Sapphire"
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue, options]]
        }
      })

      // @ts-ignore Проверяем доступность FishtVue через vm
      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue
      expect(fishtVueInstance).toBeDefined()
      expect(fishtVueInstance.config.theme.name).toBe("Sapphire")
    })

    it("should default to Aurora theme when an invalid theme name is provided", () => {
      const app = createApp(App)
      const options: FishtVueConfiguration = {
        optionsTheme: {
          // @ts-ignore
          nameTheme: "InvalidTheme"
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue, options]]
        }
      })
      // @ts-ignore Проверяем, что установлена тема по умолчанию (Aurora)
      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue
      expect(fishtVueInstance).toBeDefined()
      expect(fishtVueInstance.config.theme.name).toBe("Aurora")
    })
  })
  describe("useFishtVue", () => {
    let app: App

    beforeEach(() => {
      // Создаем приложение Vue
      app = createApp(App)
      beforeEach(() => {
        vi.mock("vue", async () => {
          const actualVue = await vi.importActual<typeof import("vue")>("vue")

          return {
            ...actualVue,
            inject: () => undefined
          }
        })
      })
    })
    afterEach(() => {
      // @ts-ignore
      app = null
      // @ts-ignore
      delete window.FishtVue
      // document.getElementById("app")?.remove()
    })

    it("should return FishtVue instance when plugin is installed", () => {
      // Настройки, которые будут переданы в плагин
      const options: FishtVueConfiguration = {
        optionsTheme: {
          nameTheme: "Aurora"
        }
      }

      // Используем плагин FishtVue
      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue, options]]
        }
      })
      expect(wrapper.text()).toBe(expectText)
      const fishtVueInstance = useFishtVue()
      expect(fishtVueInstance).toBeDefined()
      // @ts-ignore
      expect(fishtVueInstance.config.theme.name).toBe("Aurora")
    })

    it("should access useFishtVue function through global properties when plugin is installed", () => {
      const options: FishtVueConfiguration = {
        optionsTheme: {
          nameTheme: "Harmony"
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue, options]]
        }
      })

      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue

      expect(fishtVueInstance).toBeDefined()
      expect(fishtVueInstance.useFishtVue).toBeDefined()

      // Вызов useFishtVue через глобальные свойства
      const fishtVueFromGlobal = fishtVueInstance.useFishtVue()
      expect(fishtVueFromGlobal).toBeDefined()
      expect(fishtVueFromGlobal.config.theme.name).toBe("Harmony")
    })

    it("should warn and return undefined when FishtVue plugin is not installed", () => {
      const warnSpy = vi.spyOn(console, "warn")

      const wrapper = mount(App)
      const fishtVueInstance = wrapper?.vm?.$?.appContext.config.globalProperties.$fishtVue

      if (fishtVueInstance && fishtVueInstance.getOptions) {
        const optionsFromGlobal = fishtVueInstance.useFishtVue()
        expect(optionsFromGlobal).toBeUndefined()
        expect(warnSpy).toHaveBeenCalledWith("FishtVue is not installed!")
      }

      // Восстанавливаем исходное состояние console.warn
      warnSpy.mockRestore()
    })

    it("should warn and return undefined when accessing useFishtVue without plugin", () => {
      // Подменяем console.warn для отслеживания вызова
      const warnSpy = vi.spyOn(console, "warn")

      const wrapper = mount(App)
      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue

      if (fishtVueInstance && fishtVueInstance.useFishtVue) {
        const fishtVueFromGlobal = fishtVueInstance.useFishtVue()
        expect(fishtVueFromGlobal).toBeUndefined()
        expect(warnSpy).toHaveBeenCalledWith("FishtVue is not installed!")
      }

      // Восстанавливаем исходное состояние console.warn
      warnSpy.mockRestore()
    })
  })

  describe("getOptions via global properties", () => {
    let app: App

    beforeEach(() => {
      app = createApp(App)
    })
    afterEach(() => {
      // @ts-ignore
      app = null
      // @ts-ignore
      delete window.FishtVue
    })

    it("should return global options when plugin is installed", () => {
      const options: FishtVueConfiguration = {
        optionsTheme: {
          nameTheme: "Aurora"
        },
        componentsOptions: {
          FixWindow: { closeButton: true }
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue, options]]
        }
      })

      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue

      expect(fishtVueInstance).toBeDefined()
      expect(fishtVueInstance.getOptions).toBeDefined()

      // Вызов getOptions через глобальные свойства
      const optionsFromGlobal = fishtVueInstance.getOptions()
      expect(optionsFromGlobal).toBeDefined()
      expect(optionsFromGlobal.FixWindow).toBeDefined()
      expect(optionsFromGlobal.FixWindow.closeButton).toBe(true)
    })

    it("should return specific component options when component name is provided", () => {
      const options: FishtVueConfiguration = {
        optionsTheme: {
          nameTheme: "Aurora"
        },
        componentsOptions: {
          FixWindow: { closeButton: true }
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue, options]]
        }
      })

      const fishtVueInstance: FishtVueType = wrapper?.vm?.$?.appContext.config.globalProperties.$fishtVue

      // Вызов getOptions с именем компонента
      const fixWindowOptions = fishtVueInstance.getOptions("FixWindow")
      expect(fixWindowOptions).toBeDefined()
      expect(fixWindowOptions?.closeButton).toBe(true)
    })

    it("should warn and return undefined when FishtVue plugin is not installed", () => {
      // Подменяем console.warn для отслеживания вызова
      const warnSpy = vi.spyOn(console, "warn")

      const wrapper = mount(App)
      const fishtVueInstance = wrapper?.vm?.$?.appContext.config.globalProperties.$fishtVue

      if (fishtVueInstance && fishtVueInstance.getOptions) {
        const optionsFromGlobal = fishtVueInstance.getOptions()
        expect(optionsFromGlobal).toBeUndefined()
        expect(warnSpy).toHaveBeenCalledWith("FishtVue is not installed!")
      }

      // Восстанавливаем исходное состояние console.warn
      warnSpy.mockRestore()
    })
  })
})

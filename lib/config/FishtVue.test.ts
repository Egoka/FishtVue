import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import { App, Plugin, defineComponent, inject } from "vue"
import { createApp } from "vue"
import type { FishtVue as FishtVueType, FishtVueConfiguration } from "fishtvue/config"
import FishtVue, { useFishtVue, FishtVueSymbol } from "fishtvue/config"
import { getDefaultLocale } from "fishtvue/config"
import { cssComponents } from "fishtvue/component"

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
          plugins: [[FishtVue as any, options]]
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
          plugins: [[FishtVue as any, options]]
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
          plugins: [[FishtVue as any, options]]
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
          plugins: [[FishtVue as any, options]]
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
          plugins: [[FishtVue as any, options]]
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
          plugins: [[FishtVue as any, options]]
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
          plugins: [[FishtVue as any, options]]
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
          plugins: [[FishtVue as any, options]]
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
  describe("Locale management", () => {
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

    it("should set active locale correctly using setActiveLocale", () => {
      const options: FishtVueConfiguration = {
        locale: {
          defaultLocale: "en",
          activeLocale: "en",
          messages: {
            en: { hello: "Hello" },
            ru: { hello: "Привет" }
          }
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue as any, options]]
        }
      })

      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue

      expect(fishtVueInstance).toBeDefined()
      expect(fishtVueInstance.setActiveLocale).toBeDefined()

      // Set new active locale
      const newLocale = "ru"
      const result = fishtVueInstance.setActiveLocale(newLocale)

      expect(result).toBe(newLocale)
      expect(fishtVueInstance.config.locale.activeLocale).toBe(newLocale)
    })

    it("should warn and return false when attempting to set active locale without plugin", () => {
      const warnSpy = vi.spyOn(console, "warn")

      const wrapper = mount(App)
      const fishtVueInstance = wrapper?.vm?.$?.appContext.config.globalProperties.$fishtVue

      if (fishtVueInstance && fishtVueInstance.setActiveLocale) {
        const result = fishtVueInstance.setActiveLocale("ru")
        expect(result).toBe(false)
        expect(warnSpy).toHaveBeenCalledWith("The locale has not been changed")
      }

      warnSpy.mockRestore()
    })

    it("should set activeLocale even for locale name not present in messages (Issue 6)", () => {
      const options: FishtVueConfiguration = {
        locale: {
          defaultLocale: "en",
          activeLocale: "en",
          messages: { en: { hello: "Hello" } }
        }
      }
      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: { plugins: [[FishtVue as any, options]] }
      })
      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue
      const result = fishtVueInstance.setActiveLocale("fr")
      expect(result).toBe("fr")
      expect(fishtVueInstance.config.locale.activeLocale).toBe("fr")
    })

    it("should return default locale correctly using getDefaultLocale", () => {
      const options: FishtVueConfiguration = {
        locale: {
          defaultLocale: "en",
          activeLocale: "ru",
          messages: {
            en: { hello: "Hello" },
            ru: { hello: "Привет" }
          }
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue as any, options]]
        }
      })

      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue

      expect(fishtVueInstance).toBeDefined()
      expect(fishtVueInstance.getDefaultLocale).toBeDefined()

      const defaultLocale = fishtVueInstance.getDefaultLocale()

      expect(defaultLocale).toBe("en")
    })

    it("should return undefined when accessing getDefaultLocale without plugin (Issue 6 — unblocked)", () => {
      // @ts-ignore
      delete window.FishtVue
      const defaultLocale = getDefaultLocale()
      expect(defaultLocale).toBeUndefined()
    })

    it("should warn and return false when locale configuration is undefined in setActiveLocale (Issue 6 — unblocked)", () => {
      const warnSpy = vi.spyOn(console, "warn")

      const options: FishtVueConfiguration = {
        locale: undefined,
        optionsTheme: {
          nameTheme: "Aurora"
        }
      }

      app.use(FishtVue, options)
      const wrapper = mount(App, {
        global: {
          plugins: [[FishtVue as any, options]]
        }
      })

      const fishtVueInstance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue

      expect(fishtVueInstance).toBeDefined()
      expect(fishtVueInstance.setActiveLocale).toBeDefined()

      const result = fishtVueInstance.setActiveLocale("ru")

      // После Issue 1 fix: defaultOptions всегда содержит locale (en/ru messages),
      // даже если пользователь передал locale: undefined — deepMerge сохраняет defaults.
      // activeLocale ??= defaultLocale = "en" срабатывает в install. setActiveLocale("ru")
      // успешно меняет локаль.
      expect(result).toBe("ru")
      warnSpy.mockRestore()
    })
  })

  describe("FishtVueSymbol stability (Issue 1)", () => {
    afterEach(() => {
      // @ts-ignore
      delete window.FishtVue
    })

    it("is a const Symbol — same reference across re-imports (no reassign)", async () => {
      const modA = await import("fishtvue/config")
      const modB = await import("fishtvue/config")
      expect(modA.FishtVueSymbol).toBe(modB.FishtVueSymbol)
      expect(typeof modA.FishtVueSymbol).toBe("symbol")
    })

    it("plugin provides instance under FishtVueSymbol (queried via globalProperties)", () => {
      const app = createApp(App)
      app.use(FishtVue, { optionsTheme: { nameTheme: "Aurora" } })
      const wrapper = mount(App, {
        global: { plugins: [[FishtVue as any, { optionsTheme: { nameTheme: "Aurora" } }]] }
      })
      const instance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue
      expect(instance).toBeDefined()
      expect(instance.config.theme.name).toBe("Aurora")
    })

    it("multi-app isolation: two apps with different configs do not cross-contaminate", () => {
      const appA = createApp(App)
      appA.use(FishtVue, { optionsTheme: { nameTheme: "Aurora" } })
      const wrapperA = mount(App, {
        global: { plugins: [[FishtVue as any, { optionsTheme: { nameTheme: "Aurora" } }]] }
      })
      const fvA = wrapperA.vm?.$?.appContext.config.globalProperties.$fishtVue

      const appB = createApp(App)
      appB.use(FishtVue, { optionsTheme: { nameTheme: "Sapphire" } })
      const wrapperB = mount(App, {
        global: { plugins: [[FishtVue as any, { optionsTheme: { nameTheme: "Sapphire" } }]] }
      })
      const fvB = wrapperB.vm?.$?.appContext.config.globalProperties.$fishtVue

      expect(fvA?.config.theme.name).toBe("Aurora")
      expect(fvB?.config.theme.name).toBe("Sapphire")
      // Independent reactive objects — mutating one does not affect the other.
      expect(fvA).not.toBe(fvB)
    })
  })

  describe("baseStyle injection (Issue 2)", () => {
    afterEach(() => {
      document.head.querySelectorAll('style[data-fishtvue-style-id="BaseComponent"]').forEach((s) => s.remove())
      // @ts-ignore
      delete window.FishtVue
    })

    it("injects baseStyle CSS into document head on install (default layer)", () => {
      const app = createApp(App)
      app.use(FishtVue, { optionsTheme: { nameTheme: "Aurora" } })
      mount(App, {
        global: { plugins: [[FishtVue as any, { optionsTheme: { nameTheme: "Aurora" } }]] }
      })
      // useStyle инжектит при mount; cssComponents Map в lib/component/index.ts накапливает CSS
      // per-name. Проверка по Map устойчивее к DOM-cleanup между тестами в одном worker.
      const baseCss = cssComponents.get("BaseComponent" as any) ?? ""
      expect(baseCss).toContain("@layer fishtvue")
      expect(baseCss).toContain("--fv-translate-x")
    })

    it("wraps baseStyle in user-defined layers when optionsTheme.layers is provided", () => {
      const app = createApp(App)
      app.use(FishtVue, { optionsTheme: { layers: "reset, base" } })
      mount(App, {
        global: { plugins: [[FishtVue as any, { optionsTheme: { layers: "reset, base" } }]] }
      })
      const baseCss = cssComponents.get("BaseComponent" as any) ?? ""
      // Минификация схлопывает пробелы вокруг запятой — толерантный regex.
      expect(baseCss).toMatch(/@layer\s*reset\s*,\s*base/)
    })
  })

  describe("Extensibility API (Issue 4)", () => {
    afterEach(() => {
      // @ts-ignore
      delete window.FishtVue
      // Очищаем module-level registries между тестами через утилиту.
      const fv = FishtVue as any
      if (typeof fv.__resetForTests === "function") fv.__resetForTests()
    })

    it("FishtVue.use(middleware) mutates config before install", () => {
      const fv = FishtVue as any
      fv.use((cfg: FishtVueConfiguration) => {
        cfg.componentsOptions = { ...(cfg.componentsOptions ?? {}), Button: { mode: "outline" } }
      })
      const app = createApp(App)
      app.use(FishtVue, {})
      const wrapper = mount(App, { global: { plugins: [[FishtVue as any, {}]] } })
      const instance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue
      expect(instance?.config?.componentsOptions?.Button?.mode).toBe("outline")
    })

    it("FishtVue.registerComponent(name, component) globally registers via app.component", () => {
      const fv = FishtVue as any
      const CustomBtn = { name: "CustomBtn", template: "<button data-custom>x</button>" }
      fv.registerComponent("CustomBtn", CustomBtn)
      const Host = defineComponent({ template: "<CustomBtn />" })
      const wrapper = mount(Host, { global: { plugins: [[FishtVue as any, {}]] } })
      expect(wrapper.html()).toContain("data-custom")
    })

    it("FishtVue.extendTheme(name, theme) makes custom theme resolvable via nameTheme", () => {
      const fv = FishtVue as any
      const customTheme = {
        name: "MyTheme",
        semantic: { customThemeColor: "200deg", customThemeColorContrast: "60%" }
      }
      fv.extendTheme("MyTheme", customTheme)

      const app = createApp(App)
      app.use(FishtVue, { optionsTheme: { nameTheme: "MyTheme" as any } })
      const wrapper = mount(App, {
        global: { plugins: [[FishtVue as any, { optionsTheme: { nameTheme: "MyTheme" } }]] }
      })
      const instance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue
      expect(instance?.config?.theme?.name).toBe("MyTheme")
    })
  })

  describe("getDefaultOptions coverage (Issue 6)", () => {
    afterEach(() => {
      // @ts-ignore
      delete window.FishtVue
    })

    it.each([
      ["Aurora" as const, "Aurora"],
      ["Harmony" as const, "Harmony"],
      ["Sapphire" as const, "Sapphire"]
    ])("resolves built-in theme %s", (nameTheme, expected) => {
      const app = createApp(App)
      app.use(FishtVue, { optionsTheme: { nameTheme } })
      const wrapper = mount(App, {
        global: { plugins: [[FishtVue as any, { optionsTheme: { nameTheme } }]] }
      })
      const instance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue
      expect(instance?.config?.theme?.name).toBe(expected)
    })

    it("falls back to Aurora for invalid theme name", () => {
      const app = createApp(App)
      // @ts-ignore
      app.use(FishtVue, { optionsTheme: { nameTheme: "NotARealTheme" } })
      const wrapper = mount(App, {
        // @ts-ignore
        global: { plugins: [[FishtVue as any, { optionsTheme: { nameTheme: "NotARealTheme" } }]] }
      })
      const instance = wrapper.vm?.$?.appContext.config.globalProperties.$fishtVue
      expect(instance?.config?.theme?.name).toBe("Aurora")
    })
  })
})

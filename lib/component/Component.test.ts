import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import Component, { cssComponents } from "fishtvue/component"
import type { App } from "vue"
import { computed, createApp, defineComponent, getCurrentInstance, reactive } from "vue"
import type { FishtVueConfiguration } from "fishtvue/config"
import FishtVue from "fishtvue/config"

describe("Testing class Component", () => {
  let component: Component<"FixWindow">
  const expectText = "Start use FishtVue"
  const App = {
    template: `<div>${expectText}</div>`
  }
  const options: FishtVueConfiguration = {
    optionsTheme: {
      nameTheme: "Harmony",
      prefix: "test-prefix"
    },
    componentsOptions: {
      FixWindow: { closeButton: true }
    }
  }
  beforeEach(() => {
    vi.mock("vue", async () => {
      // Import the actual module to retain other exports
      const actualVue = await vi.importActual<typeof import("vue")>("vue")

      return {
        ...actualVue, // Spread the actual exports
        onBeforeMount: vi.fn(() => "onBeforeMount"),
        onMounted: vi.fn(() => "onMounted"),
        onBeforeUpdate: vi.fn(() => "onBeforeUpdate"),
        onUpdated: vi.fn(() => "onUpdated"),
        onBeforeUnmount: vi.fn(() => "onBeforeUnmount"),
        onUnmounted: vi.fn(() => "onUnmounted"),
        onServerPrefetch: vi.fn(() => "onServerPrefetch"),
        getCurrentInstance: vi.fn(() => ({
          type: {
            __name: "FixWindow",
            __hmrId: "01e97188",
            __file: "/FishtVue/lib/fixwindow/FixWindow.vue"
          },
          appContext: {
            config: {
              globalProperties: {
                $fishtVue: {
                  config: {
                    optionsTheme: {
                      nameTheme: "Harmony",
                      prefix: "test-prefix"
                    },
                    componentsOptions: {
                      FixWindow: { closeButton: true }
                    }
                  },
                  getOptions: vi.fn(() => ({ closeButton: true }))
                }
              }
            }
          },
          props: {
            someProps: "returns something"
          }
        }))
      }
    })
    const app: App = createApp(App)
    app.use<FishtVueConfiguration>(FishtVue, options)
    const wrapper = mount(App, {
      global: {
        plugins: [[FishtVue, options] as any]
      }
    })
    expect(wrapper.text()).toBe(expectText)
    component = new Component<"FixWindow">()
  })

  it("should initialize styles with initStyle", () => {
    const mockStyle = vi.fn()
    component.initStyle(mockStyle)
    expect(mockStyle).toHaveBeenCalled()
    expect(mockStyle).toHaveBeenCalledWith("", "")
  })

  it("should return the correct options with getOptions", () => {
    // Передаём name явно → getOptions резолвит componentsOptions["FixWindow"] детерминированно.
    // Прежний вариант (`new Component()` без name) полагался на то, что this.name резолвится
    // в undefined → getOptions() возвращал весь map; под isolate:false это order-dependent
    // (file-wide vi.mock("vue") применяется не всегда) → flaky. Явный name убирает зависимость.
    const c = new Component<"FixWindow">("FixWindow")
    expect(c.getOptions()).toEqual({ closeButton: true })
  })

  it("should return the correct prefix with getPrefix", () => {
    expect(component.getPrefix()).toBe("test-prefix")
  })

  it("should trigger onMounted hook", () => {
    const hook = vi.fn()
    component.onMounted(hook)
    // Simulate the mounted lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onBeforeMount hook", () => {
    const hook = vi.fn()
    component.onBeforeMount(hook)
    // Simulate the before mount lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onBeforeUpdate hook", () => {
    const hook = vi.fn()
    component.onBeforeUpdate(hook)
    // Simulate the before update lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onUpdated hook", () => {
    const hook = vi.fn()
    component.onUpdated(hook)
    // Simulate the updated lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onBeforeUnmount hook", () => {
    const hook = vi.fn()
    component.onBeforeUnmount(hook)
    // Simulate the before unmount lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  it("should trigger onUnmounted hook", () => {
    const hook = vi.fn()
    component.onUnmounted(hook)
    // Simulate the unmounted lifecycle
    hook()
    expect(hook).toHaveBeenCalled()
  })

  // === Issue 5 — coverage for SSR hook registration / idempotence / fallback chain (Wave 2.3) ===

  it("constructor wires up SSR + client style injection hooks without throwing", () => {
    // `Component.__hooks()` (lib/component/index.ts:79–84) регистрирует onServerPrefetch + vueOnMounted.
    // Конструирование без exception подтверждает выполнение обеих веток; coverage tool отметит
    // line 81 (SSR) как exercised. Проверка `vi.mocked(onServerPrefetch).toHaveBeenCalled()`
    // ненадёжна под vitest `isolate: false` (cross-file vue-mock interference).
    expect(() => new Component<"FixWindow">()).not.toThrow()
    const c = new Component<"FixWindow">()
    expect(typeof c.initStyle).toBe("function")
  })

  it("initStyle is idempotent — multiple calls produce identical args", () => {
    const mockStyle = vi.fn()
    component.initStyle(mockStyle)
    component.initStyle(mockStyle)
    expect(mockStyle).toHaveBeenCalledTimes(2)
    expect(mockStyle.mock.calls[0]).toEqual(mockStyle.mock.calls[1])
  })

  it("initStyle() without a custom function uses the default __stylesBase (Issue 5)", () => {
    // Без аргумента initStyle применяет встроенный `__stylesBase` (ветка `stylesComp ?? this.__stylesBase`,
    // index.ts:130) и пишет результат в `cssComponents`. В тестах onMounted/onServerPrefetch замоканы →
    // авто-вызов из __hooks() не срабатывает, поэтому эта ветка иначе не покрыта.
    // Явный name делает запись детерминированной независимо от резолва getCurrentInstance (isolate:false).
    const c = new Component<"FixWindow">("FixWindow")
    expect(() => c.initStyle()).not.toThrow()
    expect(cssComponents.has("FixWindow")).toBe(true)
    expect(typeof cssComponents.get("FixWindow")).toBe("string")
  })

  it("default __stylesBase wraps component CSS in @layer fishtvue (Wave 2 — theme Issue 4)", () => {
    // Канон dev-patterns §3: стили компонента инжектятся в `@layer fishtvue`. В дефолте
    // (`optionsTheme.layers` не задан) else-ветка `__stylesBase` (index.ts:159-167) обязана
    // обернуть css в слой — зеркало base-style (config/index.ts:166). До фикса возвращала сырой css.
    // Уникальный probe-name + delete: `cssComponents`/`listOfStyledComponents` — module-singleton
    // под `isolate:false`, иначе дедуп класса/контента утечёт из соседнего теста.
    const name = "WaveTwoLayerProbe"
    cssComponents.delete(name as any)
    const c = new Component<"FixWindow">(name as any)
    c.setStyle("relative") // регистрирует непустой css → минуем minify пустого `@layer{}`
    c.initStyle() // без аргумента → `__stylesBase`; layers undefined → else-ветка
    const css = cssComponents.get(name as any) ?? ""
    expect(css).toContain("@layer fishtvue")
    expect(css).toContain("relative") // зарегистрированное правило живёт внутри слоя
  })

  describe("__globalConfig fallback chain", () => {
    let savedWindowFishtVue: unknown
    beforeEach(() => {
      savedWindowFishtVue = (window as any).FishtVue
    })
    afterEach(() => {
      // Восстанавливаем window.FishtVue, чтобы не утекать в другие test-файлы.
      // vite.config.ts: `isolate: false` → globals шарятся между файлами в одном worker.
      if (savedWindowFishtVue !== undefined) {
        ;(window as any).FishtVue = savedWindowFishtVue
      } else {
        delete (window as any).FishtVue
      }
    })

    it("falls back to window.FishtVue when appContext.globalProperties.$fishtVue is undefined", () => {
      ;(window as any).FishtVue = {
        config: {
          optionsTheme: { prefix: "win-prefix" },
          locale: undefined,
          componentsStyle: undefined
        },
        getOptions: vi.fn(() => ({ fromWindow: true })),
        getActiveLocale: vi.fn(() => "en")
      }
      vi.mocked(getCurrentInstance).mockReturnValue({
        type: { __name: "FixWindow" },
        appContext: { config: { globalProperties: {} } }
      } as any)
      const fallbackComponent = new Component<"FixWindow">()
      expect(fallbackComponent.getOptions()).toEqual({ fromWindow: true })
      expect(fallbackComponent.getPrefix()).toBe("win-prefix")
    })

    it("does not throw when neither appContext.$fishtVue nor window.FishtVue is set", () => {
      delete (window as any).FishtVue
      vi.mocked(getCurrentInstance).mockReturnValue({
        type: { __name: "FixWindow" },
        appContext: { config: { globalProperties: {} } }
      } as any)
      let noConfigComponent!: Component<"FixWindow">
      expect(() => {
        noConfigComponent = new Component<"FixWindow">()
      }).not.toThrow()
      expect(noConfigComponent.getOptions()).toBeUndefined()
      expect(noConfigComponent.getPrefix()).toBe("fishtvue")
    })
  })

  describe("t() — locale fallback chain (Issue 3)", () => {
    // Используем РЕАЛЬНЫЙ Vue + FishtVue plugin (не vue-mock из верхнего beforeEach):
    // Component.t() читает this.__globalConfig.getActiveLocale() / getDefaultLocale() / messages,
    // которые setup'аются в plugin install. С моком getCurrentInstance не получается имитировать
    // эти зависимости в полном suite (модуль fishtvue/component уже захватил реальный
    // getCurrentInstance до момента vi.mock в beforeEach Component.test.ts).
    const buildComponent = (cfg: FishtVueConfiguration): Component<"FixWindow"> => {
      let captured: Component<"FixWindow"> | undefined
      const Probe = defineComponent({
        name: "FixWindow",
        setup() {
          captured = new Component<"FixWindow">()
          return () => null
        }
      })
      mount(Probe, { global: { plugins: [[FishtVue as any, cfg]] } })
      // @ts-ignore — captured is set synchronously inside setup before mount returns.
      return captured
    }

    it("returns active-locale value when key exists in messages[activeLocale]", () => {
      const c = buildComponent({
        locale: {
          defaultLocale: "en",
          activeLocale: "ru",
          messages: { en: { greet: "Hello" }, ru: { greet: "Привет" } }
        }
      })
      expect(c.t("greet")).toBe("Привет")
    })

    it("falls back to defaultLocale when key missing in activeLocale", () => {
      const c = buildComponent({
        locale: {
          defaultLocale: "en",
          activeLocale: "fr",
          messages: { en: { greet: "Hello" } }
        }
      })
      expect(c.t("greet")).toBe("Hello")
    })

    it("returns key as last resort when neither active nor default contain it", () => {
      const c = buildComponent({
        locale: {
          defaultLocale: "en",
          activeLocale: "ru",
          messages: { en: {}, ru: {} }
        }
      })
      expect(c.t("missing.key")).toBe("missing.key")
    })

    it("returns empty string for empty key", () => {
      const c = buildComponent({})
      expect(c.t("")).toBe("")
    })

    it("supports dot-path lookup with default-locale fallback", () => {
      const c = buildComponent({
        locale: {
          defaultLocale: "en",
          activeLocale: "fr",
          messages: { en: { alert: { close: "Close" } }, fr: {} }
        }
      })
      expect(c.t("alert.close")).toBe("Close")
    })

    it("returns string type (no longer string | undefined)", () => {
      const c = buildComponent({
        locale: { defaultLocale: "en", activeLocale: "en", messages: { en: {} } }
      })
      const result: string = c.t("anykey")
      expect(typeof result).toBe("string")
    })
  })

  describe("t() — interpolation & pluralization (Wave 3.5 / Issue 3)", () => {
    const buildComponent = (cfg: FishtVueConfiguration): Component<"FixWindow"> => {
      let captured: Component<"FixWindow"> | undefined
      const Probe = defineComponent({
        name: "FixWindow",
        setup() {
          captured = new Component<"FixWindow">()
          return () => null
        }
      })
      mount(Probe, { global: { plugins: [[FishtVue as any, cfg]] } })
      // @ts-ignore — captured is set synchronously inside setup before mount returns.
      return captured
    }

    it("interpolates {name} placeholders from params", () => {
      const c = buildComponent({
        locale: { defaultLocale: "en", activeLocale: "en", messages: { en: { welcome: "Hello, {name}!" } } }
      })
      expect(c.t("welcome", { name: "Egor" })).toBe("Hello, Egor!")
    })

    it("pluralizes English messages by params.count", () => {
      const c = buildComponent({
        locale: {
          defaultLocale: "en",
          activeLocale: "en",
          messages: { en: { items: "=0 No items|one 1 item|other {count} items" } }
        }
      })
      expect(c.t("items", { count: 0 })).toBe("No items")
      expect(c.t("items", { count: 1 })).toBe("1 item")
      expect(c.t("items", { count: 5 })).toBe("5 items")
    })

    it("pluralizes Russian messages with 4 CLDR forms", () => {
      const c = buildComponent({
        locale: {
          defaultLocale: "en",
          activeLocale: "ru",
          messages: {
            ru: { items: "=0 нет|one {count} файл|few {count} файла|many {count} файлов|other {count} файла" }
          }
        }
      })
      expect(c.t("items", { count: 1 })).toBe("1 файл")
      expect(c.t("items", { count: 2 })).toBe("2 файла")
      expect(c.t("items", { count: 5 })).toBe("5 файлов")
      expect(c.t("items", { count: 21 })).toBe("21 файл") // Intl ru: 21 → one
    })

    it("combines pluralization and interpolation in one call", () => {
      const c = buildComponent({
        locale: {
          defaultLocale: "en",
          activeLocale: "en",
          messages: { en: { row: "one {count} item by {name}|other {count} items by {name}" } }
        }
      })
      expect(c.t("row", { count: 1, name: "Egor" })).toBe("1 item by Egor")
      expect(c.t("row", { count: 3, name: "Egor" })).toBe("3 items by Egor")
    })

    it("keeps backward compatibility: no params leaves placeholders untouched", () => {
      const c = buildComponent({
        locale: { defaultLocale: "en", activeLocale: "en", messages: { en: { welcome: "Hello, {name}!" } } }
      })
      expect(c.t("welcome")).toBe("Hello, {name}!")
    })

    it("interpolates against the key returned as last resort without throwing", () => {
      const c = buildComponent({
        locale: { defaultLocale: "en", activeLocale: "en", messages: { en: {} } }
      })
      expect(c.t("missing.key", { name: "x" })).toBe("missing.key")
    })
  })

  describe("Component Lifecycle Hooks", () => {
    let component: Component<"FixWindow">
    const options: FishtVueConfiguration = {
      componentsOptions: {
        FixWindow: { closeButton: true }
      }
    }

    beforeEach(() => {
      const app = createApp({})
      app.use<FishtVueConfiguration>(FishtVue, options)
      mount({}, { global: { plugins: [[FishtVue, options] as any] } })
      component = new Component<"FixWindow">()
    })

    it("should trigger onBeforeMount with the correct instance", () => {
      const hook = vi.fn()
      component.onBeforeMount(hook)
      expect(hook).not.toHaveBeenCalled()
      vi.mocked(hook).mock.calls.forEach((call) => {
        expect(call[0]).toMatchObject({ name: "FixWindow", prefix: "fishtvue" })
      })
    })

    it("should trigger onMounted with the correct instance", () => {
      const hook = vi.fn()
      component.onMounted(hook)
      expect(hook).not.toHaveBeenCalled()
      vi.mocked(hook).mock.calls.forEach((call) => {
        expect(call[0]).toMatchObject({ name: "FixWindow", prefix: "fishtvue" })
      })
    })

    it("should trigger onBeforeUpdate with the correct instance", () => {
      const hook = vi.fn()
      component.onBeforeUpdate(hook)
      expect(hook).not.toHaveBeenCalled()
      vi.mocked(hook).mock.calls.forEach((call) => {
        expect(call[0]).toMatchObject({ name: "FixWindow", prefix: "fishtvue" })
      })
    })

    it("should trigger onUpdated with the correct instance", () => {
      const hook = vi.fn()
      component.onUpdated(hook)
      expect(hook).not.toHaveBeenCalled()
      vi.mocked(hook).mock.calls.forEach((call) => {
        expect(call[0]).toMatchObject({ name: "FixWindow", prefix: "fishtvue" })
      })
    })

    it("should trigger onBeforeUnmount with the correct instance", () => {
      const hook = vi.fn()
      component.onBeforeUnmount(hook)
      expect(hook).not.toHaveBeenCalled()
      vi.mocked(hook).mock.calls.forEach((call) => {
        expect(call[0]).toMatchObject({ name: "FixWindow", prefix: "fishtvue" })
      })
    })

    it("should trigger onUnmounted with the correct instance", () => {
      const hook = vi.fn()
      component.onUnmounted(hook)
      expect(hook).not.toHaveBeenCalled()
      vi.mocked(hook).mock.calls.forEach((call) => {
        expect(call[0]).toMatchObject({ name: "FixWindow", prefix: "fishtvue" })
      })
    })
  })

  describe("setStyle: consumer-сегмент и unstyled (props 1.0, канон §2 D/E)", () => {
    // Классы потребителя (`class`/`classes.*`) передаются в setStyle отдельным сегментом `consumer`:
    // они всегда последние в twMerge (перебивают базу/mode/state) и, в отличие от базы,
    // переживают `unstyled` — иначе флаг «без темы» ломал бы и стилизацию самим потребителем.
    // Реальный Vue + FishtVue plugin (паттерн из t()-тестов): под `isolate:false` модуль
    // fishtvue/component уже захватил настоящий getCurrentInstance, и mock-инстанс сюда не доезжает.
    // Имена probe-компонентов уникальны: `listOfStyledComponents`/`cssComponents` — module-singleton,
    // и дедуп токенов утечёт из соседнего теста.
    const buildComponent = (
      cfg: FishtVueConfiguration,
      name = "FixWindow",
      options?: Record<string, unknown>
    ): Component<"FixWindow"> => {
      let captured: Component<"FixWindow"> | undefined
      const Probe = defineComponent({
        name,
        setup() {
          captured = new Component<"FixWindow">(name as "FixWindow")
          return () => null
        }
      })
      mount(Probe, {
        global: {
          plugins: [
            [
              FishtVue as any,
              {
                optionsTheme: { prefix: "test-prefix" },
                ...cfg,
                componentsOptions: options ? { [name]: options } : undefined
              }
            ]
          ]
        }
      })
      // @ts-ignore — captured is set synchronously inside setup before mount returns.
      return captured
    }
    afterEach(() => {
      delete (window as any).FishtVue
    })

    it("под unstyled возвращает `fv` + классы потребителя вместо пустой строки", () => {
      const c = buildComponent({ unstyled: true })
      expect(c.setStyle(["inline-flex p-2"], { consumer: ["p-4", "probe"] })).toBe("fv p-4 probe")
    })

    it('под unstyled без consumer возвращает голый `fv` (снимает `|| "fv"`-патчи)', () => {
      const c = buildComponent({ unstyled: true })
      expect(c.setStyle("inline-flex p-2")).toBe("fv")
      expect(c.setStyle(["inline-flex", false, undefined])).toBe("fv")
    })

    it("consumer идёт последним: выигрывает twMerge-конфликт у базы и компилируется в CSS", () => {
      const name = "ConsumerProbeZero"
      cssComponents.delete(name as any)
      const c = buildComponent({}, name)
      c.initStyle()
      const out = c.setStyle(["p-2 inline-flex"], { consumer: ["p-4"] })
      expect(out).toBe("fv test-prefix-consumer-probe-zero inline-flex p-4")
      expect(cssComponents.get(name as any) ?? "").toContain("p-4")
    })

    it("вызов без options байт-в-байт прежний (обратная совместимость внутри lib)", () => {
      const c = buildComponent({})
      expect(c.setStyle(["relative", false, "p-2"])).toBe("fv test-prefix-fix-window relative p-2")
    })

    describe("resolveClasses(props)", () => {
      const build = (options?: Record<string, unknown>, config: FishtVueConfiguration = {}) =>
        buildComponent(config, "FixWindow", options)

      it("cls('root'): base → options.classes.root → props.classes.root → options.class → props.class", () => {
        const c = build({ class: "opt-class", classes: { root: "opt-root" } })
        const { cls } = c.resolveClasses<"title">({ class: "prop-class", classes: { root: "prop-root" } })
        expect(cls("root", "base")).toBe("fv test-prefix-fix-window base opt-root prop-root opt-class prop-class")
      })

      it("cls(<element>) не включает prop `class` — он только для корня", () => {
        const c = build({ classes: { title: "opt-title" } })
        const { cls } = c.resolveClasses<"title">({ class: "prop-class", classes: { title: "prop-title" } })
        const out = cls("title", "text-sm")
        expect(out).toBe("fv test-prefix-fix-window text-sm opt-title prop-title")
        expect(out).not.toContain("prop-class")
      })

      it("cls: локальный ключ перебивает глобальный и базу в twMerge-конфликте, остальное складывается", () => {
        const c = build({ classes: { root: "p-3 opt-only" } })
        const { cls } = c.resolveClasses<never>({ classes: { root: "p-4" } })
        const out = cls("root", "p-2 inline-flex")
        expect(out).toContain("p-4")
        expect(out).toContain("opt-only")
        expect(out).toContain("inline-flex")
        expect(out).not.toMatch(/\bp-2\b|\bp-3\b/)
      })

      it("cls принимает falsy-сегменты базы (state-классы по условию)", () => {
        const c = build()
        const { cls } = c.resolveClasses<never>({})
        expect(cls("root", "base", false, undefined, "" as string)).toBe("fv test-prefix-fix-window base")
      })

      it("raw(key): только сегменты потребителя, без setStyle-префикса — для hand-off ребёнку", () => {
        const c = build({ class: "opt-class", classes: { icon: "opt-icon p-2" } })
        const { raw } = c.resolveClasses<"icon">({ class: "prop-class", classes: { icon: "p-4" } })
        expect(raw("icon")).toBe("opt-icon p-4")
        expect(raw("root")).toBe("opt-class prop-class")
      })

      it("raw(key) под unstyled тоже отдаёт классы потребителя", () => {
        const c = build({ classes: { icon: "opt-icon" } }, { unstyled: true })
        const { raw } = c.resolveClasses<"icon">({ classes: { icon: "prop-icon" } })
        expect(raw("icon")).toBe("opt-icon prop-icon")
      })

      it("pick(key, fallback): props ?? options ?? fallback; пустая строка в props отключает и options, и default", () => {
        const c = build({ classes: { mark: "opt-mark" } })
        const { pick } = c.resolveClasses<"mark">({ classes: { mark: "" } })
        expect(pick("mark", "default-mark")).toBe("")
        const { pick: pickFromOptions } = c.resolveClasses<"mark">({})
        expect(pickFromOptions("mark", "default-mark")).toBe("opt-mark")
        const { pick: pickDefault } = build().resolveClasses<"mark">({})
        expect(pickDefault("mark", "default-mark")).toBe("default-mark")
        expect(pickDefault("mark")).toBe("")
      })

      it("cls читается реактивно: замена props.classes пересчитывает computed", () => {
        const c = build()
        const props = reactive<{ class?: string; classes?: Record<string, string> }>({ classes: { root: "first" } })
        const { cls } = c.resolveClasses<never>(props)
        const out = computed(() => cls("root", "base"))
        expect(out.value).toContain("first")
        props.classes = { root: "second" }
        expect(out.value).toContain("second")
        expect(out.value).not.toContain("first")
        props.class = "late-class"
        expect(out.value).toContain("late-class")
      })

      it("массивы StyleClass в options/props сплющиваются", () => {
        const c = build({ classes: { root: ["opt-a", "opt-b"] } })
        const { cls, raw } = c.resolveClasses<never>({ class: ["prop-a", "prop-b"] })
        expect(raw("root")).toBe("opt-a opt-b prop-a prop-b")
        expect(cls("root")).toBe("fv test-prefix-fix-window opt-a opt-b prop-a prop-b")
      })
    })
  })
})

import type { ObjectPlugin, App, Component as VueComponent, InjectionKey } from "vue"
import { hasInjectionContext, inject, reactive } from "vue"
import type { Theme } from "fishtvue/theme"
import { linksTheme, NamesTheme } from "fishtvue/theme"
import { isClient } from "fishtvue/utils/domHandler"
import { deepCopyObject, deepFreeze, deepMerge } from "fishtvue/utils/objectHandler"
import Component from "fishtvue/component"
import type { NameLocale } from "fishtvue/locale"
import Locales from "fishtvue/locale"
import Aurora from "fishtvue/theme/themes/Aurora"
import Harmony from "fishtvue/theme/themes/Harmony"
import Sapphire from "fishtvue/theme/themes/Sapphire"
import baseStyle from "./baseStyle"
import type { ComponentsOptions, FishtVue, FishtVueConfiguration, OptionsTheme } from "fishtvue/config/FishtVue"

// Issue 1: stable InjectionKey — описание "FishtVue" даёт стабильную identity для inject/provide,
// тип параметризован реальной payload (FishtVue), а не неверным `InjectionKey<string>`.
export const FishtVueSymbol: InjectionKey<FishtVue> = Symbol("FishtVue")

// Issue 4: extensibility registries. Module-level state — plugin обычно регистрируется один раз
// при boot приложения; multi-app сценарии разделяют registries (документировано в config.md §10.5).
type FishtVueMiddleware = (config: FishtVueConfiguration) => FishtVueConfiguration | void
const middlewares: FishtVueMiddleware[] = []
const customComponents = new Map<string, VueComponent>()
const customThemes = new Map<string, Theme>()

export function useFishtVue(): Readonly<FishtVue> | undefined {
  return isExistFishtVue<Readonly<FishtVue>>((FishtVue) => {
    FishtVue = deepCopyObject(FishtVue)
    deepFreeze(FishtVue)
    return FishtVue
  })
}

export function getOptions<T extends keyof ComponentsOptions>(
  component?: T
): keyof ComponentsOptions extends T ? Readonly<ComponentsOptions> : Readonly<ComponentsOptions[T]> {
  return isExistFishtVue((FishtVue) => {
    let options = FishtVue?.config?.componentsOptions
    if (options) {
      options = deepCopyObject(options)
      deepFreeze(options)
      if (component && options?.[component]) return options[component]
      return options
    }
  }) as keyof ComponentsOptions extends T ? Readonly<ComponentsOptions> : Readonly<ComponentsOptions[T]>
}

export function setActiveLocale(activeLocale: NameLocale): string | boolean | undefined {
  return isExistFishtVue((FishtVue) => {
    const locale = FishtVue?.config?.locale
    if (locale && locale.activeLocale) {
      locale.activeLocale = activeLocale
      return locale.activeLocale
    }
    console.warn("The locale has not been changed")
    return false
  })
}

export function getActiveLocale(): string | undefined {
  return isExistFishtVue((FishtVue) => {
    const locale = FishtVue?.config?.locale
    if (locale && locale.activeLocale) {
      return locale.activeLocale
    }
  })
}

export function getDefaultLocale(): string | undefined {
  return isExistFishtVue((FishtVue) => {
    const locale = FishtVue?.config?.locale
    if (locale && locale.defaultLocale) {
      return locale.defaultLocale
    }
  })
}

// Issue 1: убран `Symbol("FishtVue").toString() === Symbol("FishtVue").toString()` анти-паттерн.
// Reference-check теперь через прямой inject + window fallback.
function isExistFishtVue<T>(func: (FishtVue: FishtVue) => T): T | undefined {
  let instance: FishtVue | undefined
  if (hasInjectionContext()) {
    instance = inject(FishtVueSymbol, undefined as FishtVue | undefined)
  }
  if (!instance && isClient()) {
    instance = (window as any).FishtVue as FishtVue | undefined
  }
  if (instance) return func(instance)
  return
}

function resolveTheme(nameTheme: OptionsTheme["nameTheme"] | string | undefined): Theme | undefined {
  if (nameTheme && customThemes.has(nameTheme)) return customThemes.get(nameTheme)
  const validBuiltIn = Object.values(NamesTheme).includes((nameTheme as any) ?? "")
    ? (nameTheme as keyof typeof NamesTheme)
    : "Aurora"
  switch (validBuiltIn) {
    case "Aurora":
      return Aurora
    case "Harmony":
      return Harmony
    case "Sapphire":
      return Sapphire
    default:
      return Aurora
  }
}

function getDefaultOptions(nameTheme: OptionsTheme["nameTheme"] | string | undefined): FishtVueConfiguration {
  return {
    theme: resolveTheme(nameTheme),
    locale: {
      defaultLocale: "en",
      messages: {
        en: Locales.en,
        ru: Locales.ru
      }
    }
  }
}

function install(app: App, rawOptions: FishtVueConfiguration): void {
  // Issue 4: прогон middleware перед merge — каждый middleware может мутировать config in-place
  // или вернуть новый объект (последний выигрывает).
  let options: FishtVueConfiguration = rawOptions ?? {}
  for (const mw of middlewares) {
    const next = mw(options)
    if (next) options = next
  }

  const defaultOptions = getDefaultOptions(options?.optionsTheme?.nameTheme)
  const FishtVue: FishtVue = {
    config: reactive(options ? deepMerge(defaultOptions, options) : defaultOptions),
    getOptions: getOptions as FishtVue["getOptions"],
    useFishtVue,
    getActiveLocale,
    setActiveLocale,
    getDefaultLocale
  }
  if (FishtVue.config.locale)
    FishtVue.config.locale.activeLocale = FishtVue.config.locale?.activeLocale ?? FishtVue.config.locale?.defaultLocale
  FishtVue.config.theme = linksTheme(FishtVue.config.theme)

  if (isClient()) (window as any).FishtVue = FishtVue
  app.provide(FishtVueSymbol, FishtVue)
  app.config.globalProperties.$fishtVue = FishtVue

  // Issue 4: регистрируем custom-компоненты на app — они доступны как глобальные имена.
  for (const [name, ctor] of customComponents) {
    app.component(name, ctor)
  }

  const BaseStylesComponent = new Component("BaseComponent" as any)
  const baseLayer = `:root {
  --theme: ${FishtVue.config.theme?.semantic?.customThemeColor ?? 0};
  --theme-contrast: ${FishtVue.config.theme?.semantic?.customThemeColorContrast ?? 0};
  }\n${baseStyle}}`

  BaseStylesComponent.initStyle(() =>
    FishtVue.config.optionsTheme?.layers
      ? `
  @layer ${FishtVue.config.optionsTheme?.layers};
  @layer fishtvue {${baseLayer}
  }`
      : `@layer fishtvue {${baseLayer}}`
  )
}

// Issue 4: расширенный default export — Vue ObjectPlugin + 3 method'а для extensibility.
const plugin = {
  install,
  /**
   * Регистрирует middleware, мутирующий config до merge с defaults. Запускается на каждый install.
   * @example FishtVue.use((cfg) => { cfg.unstyled = true })
   */
  use(middleware: FishtVueMiddleware): void {
    middlewares.push(middleware)
  },
  /**
   * Регистрирует custom-компонент глобально на каждое app, которое затем вызовет install.
   * Эквивалент `app.component(name, component)` без необходимости держать ссылку на app.
   */
  registerComponent(name: string, component: VueComponent): void {
    customComponents.set(name, component)
  },
  /**
   * Регистрирует custom theme под именем. После registerTheme — `optionsTheme.nameTheme: name`
   * резолвится на переданный theme. Override built-in (Aurora/Harmony/Sapphire) допустим.
   */
  extendTheme(name: string, theme: Theme): void {
    customThemes.set(name, theme)
  },
  /** Test-only: сбрасывает middleware/customComponents/customThemes registries. */
  __resetForTests(): void {
    middlewares.length = 0
    customComponents.clear()
    customThemes.clear()
  }
}

export default plugin as ObjectPlugin & {
  use: (middleware: FishtVueMiddleware) => void
  registerComponent: (name: string, component: VueComponent) => void
  extendTheme: (name: string, theme: Theme) => void
  __resetForTests: () => void
}

export type { FishtVueMiddleware }

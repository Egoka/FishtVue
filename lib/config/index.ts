import { hasInjectionContext, inject, reactive } from "vue"
import { NamesTheme, linksTheme } from "fishtvue/theme"
import { deepMerge, deepFreeze, deepCopyObject } from "fishtvue/utils/objectHandler"
import Component from "fishtvue/component"
import Locales from "fishtvue/locale"
import Aurora from "fishtvue/theme/themes/Aurora"
import Harmony from "fishtvue/theme/themes/Harmony"
import Sapphire from "fishtvue/theme/themes/Sapphire"
import baseStyle from "./baseStyle"
import type { ObjectPlugin } from "vue"
import type { Theme } from "fishtvue/theme"
import type { NameLocale } from "fishtvue/locale"
import type { ComponentsOptions, FishtVue, FishtVueConfiguration, OptionsTheme } from "fishtvue/config/FishtVue"

let FishtVueSymbol = Symbol()

export function useFishtVue(): Readonly<FishtVue> | undefined {
  return isExistFishtVue<Readonly<FishtVue>>((FishtVue) => {
    FishtVue = deepCopyObject(FishtVue)
    deepFreeze(FishtVue)
    return FishtVue
  })
}

export function getOptions<T extends keyof ComponentsOptions>(component?: T) {
  return isExistFishtVue((FishtVue) => {
    let options = FishtVue?.config?.componentsOptions
    if (options) {
      options = deepCopyObject(options)
      deepFreeze(options)
      if (component && options?.[component]) return options[component]
      return options
    }
  })
}
export function setActiveLocale(activeLocale: NameLocale) {
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

function isExistFishtVue<T>(func: (FishtVue: FishtVue) => T): T | undefined {
  if (FishtVueSymbol.toString() === Symbol("FishtVue").toString()) {
    // @ts-ignore
    const FishtVue: FishtVue | undefined = hasInjectionContext()
      ? (inject(FishtVueSymbol) ?? (window as any).FishtVue)
      : (window as any).FishtVue
    if (FishtVue) return func(FishtVue)
  }
  console.warn("FishtVue is not installed!")
}

function getDefaultOptions(nameTheme: OptionsTheme["nameTheme"]): FishtVueConfiguration {
  nameTheme = <keyof typeof NamesTheme>(Object.values(NamesTheme).includes(nameTheme ?? "") ? nameTheme : "Aurora")
  let theme: Theme | undefined
  switch (nameTheme) {
    case "Aurora":
      theme = Aurora
      break
    case "Harmony":
      theme = Harmony
      break
    case "Sapphire":
      theme = Sapphire
      break
    default:
      theme = Aurora
  }
  return {
    theme: theme,
    locale: {
      defaultLocale: "en",
      messages: {
        en: Locales.en,
        ru: Locales.ru
      }
    }
  }
}

export default {
  install: (app, options: FishtVueConfiguration) => {
    const defaultOptions = getDefaultOptions(options?.optionsTheme?.nameTheme)
    const FishtVue: FishtVue = {
      config: reactive(options ? deepMerge(defaultOptions, options) : defaultOptions),
      useFishtVue: useFishtVue as FishtVue["useFishtVue"],
      getOptions: getOptions as FishtVue["getOptions"],
      getActiveLocale: getActiveLocale as FishtVue["getActiveLocale"],
      setActiveLocale: setActiveLocale as FishtVue["setActiveLocale"]
    }
    if (FishtVue.config.locale)
      FishtVue.config.locale.activeLocale =
        FishtVue.config.locale?.activeLocale ?? FishtVue.config.locale?.defaultLocale
    FishtVue.config.theme = linksTheme(FishtVue.config.theme)
    FishtVueSymbol = Symbol("FishtVue")
    ;(window as any).FishtVue = FishtVue
    app.provide(FishtVueSymbol, FishtVue)
    app.config.globalProperties.$fishtVue = FishtVue
    const BaseStylesComponent = new Component("BaseComponent" as any)
    BaseStylesComponent.initStyle(
      () => `@layer fishtvue {:root {
  --theme: ${FishtVue.config.theme?.semantic?.customThemeColor ?? 0};
  --theme-contrast: ${FishtVue.config.theme?.semantic?.customThemeColorContrast ?? 0};
}\n${baseStyle}}`
    )
  }
} as ObjectPlugin

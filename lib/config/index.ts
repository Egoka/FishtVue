import type { ObjectPlugin } from "vue"
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

export let FishtVueSymbol = Symbol()

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

function isExistFishtVue<T>(func: (FishtVue: FishtVue) => T): T | undefined {
  if (FishtVueSymbol.toString() === Symbol("FishtVue").toString()) {
    let FishtVue: any = undefined
    if (isClient()) FishtVue = (window as any).FishtVue
    if (hasInjectionContext()) FishtVue = inject(FishtVueSymbol) ?? FishtVue
    if (FishtVue) return func(FishtVue)
  }
  //console.warn("FishtVue is not installed!");
  return
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
      getOptions: getOptions as FishtVue["getOptions"],
      useFishtVue,
      getActiveLocale,
      setActiveLocale,
      getDefaultLocale
    }
    if (FishtVue.config.locale)
      FishtVue.config.locale.activeLocale =
        FishtVue.config.locale?.activeLocale ?? FishtVue.config.locale?.defaultLocale
    FishtVue.config.theme = linksTheme(FishtVue.config.theme)
    FishtVueSymbol = Symbol("FishtVue")
    if (isClient()) (window as any).FishtVue = FishtVue
    app.provide(FishtVueSymbol, FishtVue)
    app.config.globalProperties.$fishtVue = FishtVue
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
} as ObjectPlugin

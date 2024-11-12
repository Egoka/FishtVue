import { hasInjectionContext, inject, reactive } from "vue"
import { NamesTheme, linksTheme } from "fishtvue/theme"
import { deepMerge, deepFreeze, deepCopyObject } from "fishtvue/utils/objectHandler"
import Component from "fishtvue/component"
import Locales from "fishtvue/locale/locale"
import Aurora from "fishtvue/theme/themes/Aurora"
import Harmony from "fishtvue/theme/themes/Harmony"
import Sapphire from "fishtvue/theme/themes/Sapphire"
import type { ObjectPlugin } from "vue"
import type { Theme } from "fishtvue/theme"
import type { ComponentsOptions, FishtVue, FishtVueConfiguration } from "fishtvue/config/FishtVue"
import baseStyle from "./baseStyle"

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

function getDefaultOptions(options: FishtVueConfiguration): FishtVueConfiguration {
  const nameTheme = <keyof typeof NamesTheme>(
    (Object.values(NamesTheme).includes(options?.optionsTheme?.nameTheme ?? "")
      ? options?.optionsTheme?.nameTheme
      : "Aurora")
  )
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
      en: Locales.en
    }
  }
}

export default {
  install: (app, options: FishtVueConfiguration) => {
    const defaultOptions = getDefaultOptions(options)
    const FishtVue: FishtVue = {
      config: reactive(options ? deepMerge(defaultOptions, options) : defaultOptions),
      useFishtVue: useFishtVue as FishtVue["useFishtVue"],
      getOptions: getOptions as FishtVue["getOptions"]
    }
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

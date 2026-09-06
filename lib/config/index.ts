import type { ObjectPlugin, App, Component as VueComponent, InjectionKey } from "vue"
import { hasInjectionContext, inject, reactive } from "vue"
import type { Theme } from "fishtvue/theme"
import { injectTokens, linksTheme, NamesTheme } from "fishtvue/theme"
import { isClient } from "fishtvue/utils/domHandler"
import { deepCopyObject, deepFreeze, deepMerge } from "fishtvue/utils/objectHandler"
import Component from "fishtvue/component"
import type { LocaleMetadata, NameLocale } from "fishtvue/locale"
import Locales, { localeDirection, resolveLocaleMetadata } from "fishtvue/locale"
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

/**
 * Синхронизирует `<html dir>` с направлением письма активной локали
 * ([locale.md Issue 4](../../Documentation/issues/locale.md), решение R23).
 *
 * Атрибут ставится на корневой элемент документа, а не на контейнер приложения: логические
 * CSS-свойства (`ps-`/`pe-`/`start-`/`end-`) и `rtl:`-варианты движка читают направление
 * от ближайшего предка с `dir`, и для портальных узлов (Dialog, FixWindow, Alert) им является
 * именно `<html>` — они рендерятся в `body`, вне дерева приложения.
 *
 * Уже выставленный вручную `dir` **не перетирается**: если потребитель управляет направлением
 * сам (мультиязычная страница, где FishtVue — лишь часть), библиотека не должна с ним спорить.
 *
 * Признак «это выставили мы» хранится в самом DOM — атрибуте `data-fv-dir`, а не в модульной
 * переменной. Модульное состояние здесь врало бы в трёх сценариях сразу: два приложения на одной
 * странице, HMR-перезагрузка модуля и SSR-гидратация, где разметка пришла с сервера, а состояние
 * модуля в браузере пустое. Атрибут переживает всё три и виден в DevTools.
 */
export function applyDocumentDirection(activeLocale: NameLocale | undefined): "ltr" | "rtl" | undefined {
  if (!isClient()) return
  const root = document.documentElement
  if (!root) return
  const direction = localeDirection(activeLocale)
  const current = root.getAttribute("dir")
  if (current && current !== root.getAttribute("data-fv-dir")) return current as "ltr" | "rtl"
  root.setAttribute("dir", direction)
  root.setAttribute("data-fv-dir", direction)
  return direction
}

/** Метаданные локали: направление письма и строки для `Intl` / `date-fns`. */
export function getLocaleMetadata(code?: NameLocale): LocaleMetadata {
  return resolveLocaleMetadata(code ?? getActiveLocale())
}

export function setActiveLocale(activeLocale: NameLocale): string | boolean | undefined {
  return isExistFishtVue((FishtVue) => {
    const locale = FishtVue?.config?.locale
    if (locale && locale.activeLocale) {
      locale.activeLocale = activeLocale
      applyDocumentDirection(activeLocale)
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

/**
 * Имя ФАКТИЧЕСКИ применяемой темы: зарегистрированная кастомная — как есть, известная встроенная —
 * как есть, всё остальное (в том числе опечатка в `nameTheme`) — `"Aurora"`.
 *
 * Отдельная функция нужна, потому что после снятия поля `name` с пресетов (Theme D21) идентичность
 * темы живёт только в `config.optionsTheme.nameTheme`, и это значение должно быть правдой, а не
 * эхом пользовательского ввода.
 */
function resolveThemeName(nameTheme: OptionsTheme["nameTheme"] | string | undefined): string {
  if (nameTheme && customThemes.has(nameTheme)) return nameTheme
  return Object.values(NamesTheme).includes((nameTheme as any) ?? "") ? (nameTheme as string) : "Aurora"
}

function resolveTheme(nameTheme: OptionsTheme["nameTheme"] | string | undefined): Theme | undefined {
  if (nameTheme && customThemes.has(nameTheme)) return customThemes.get(nameTheme)
  switch (resolveThemeName(nameTheme)) {
    case "Harmony":
      return Harmony
    case "Sapphire":
      return Sapphire
    default:
      return Aurora
  }
}

/**
 * Дефолты конфигурации — **всегда свежая копия**.
 *
 * `install()` собирает итоговый конфиг как `deepMerge(defaults, userOptions)`, а `deepMerge` по
 * канону библиотеки мутирует первый аргумент (см. `utilities/objectHandler.md`, Issue 8).
 * Пока здесь возвращались модульные синглтоны по ссылке — сам импортированный пресет темы и сами
 * объекты `Locales.en`/`Locales.ru` — любая пользовательская опция навсегда портила встроенные
 * пресеты и локали для всего процесса. Причём все три темы разделяют один `defaultSemantic`,
 * поэтому правка «только Aurora» протекала в Harmony и Sapphire.
 *
 * Больнее всего это било по SSR: один Node-процесс обслуживает много запросов, и конфиг первого
 * запроса становился дефолтом для всех остальных.
 */
function getDefaultOptions(nameTheme: OptionsTheme["nameTheme"] | string | undefined): FishtVueConfiguration {
  return {
    theme: deepCopyObject(resolveTheme(nameTheme) ?? {}) as FishtVueConfiguration["theme"],
    locale: {
      defaultLocale: "en",
      messages: {
        en: deepCopyObject(Locales.en ?? {}),
        ru: deepCopyObject(Locales.ru ?? {})
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
  if (FishtVue.config.locale) {
    FishtVue.config.locale.activeLocale = FishtVue.config.locale?.activeLocale ?? FishtVue.config.locale?.defaultLocale
    // R23: направление письма выставляется сразу на install, а не только при последующей смене
    // локали — иначе RTL-приложение стартовало бы в LTR и «прыгало» после первого setActiveLocale.
    applyDocumentDirection(FishtVue.config.locale.activeLocale)
  }
  // Theme D21: единственный источник идентичности темы. Значение нормализуется до фактически
  // применённой темы — опечатка в `nameTheme` не должна оставаться в конфиге как «активная тема»,
  // раз пресет по ней всё равно не нашёлся и подставилась Aurora.
  FishtVue.config.optionsTheme = {
    ...FishtVue.config.optionsTheme,
    nameTheme: resolveThemeName(options?.optionsTheme?.nameTheme) as NonNullable<OptionsTheme["nameTheme"]>
  }
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

  // Wave 3.3 (theme.md Issue 1): tokens-тег с палитрой live-темы (--fv-{color}-{tone} и т.д.).
  // Инжектится ПОСЛЕ base-стиля → при равной специфичности :root выигрывает; runtime theme API
  // (usePreset/updatePreset/…) переписывает этот же тег — компоненты перекрашиваются без regen.
  injectTokens(FishtVue)
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

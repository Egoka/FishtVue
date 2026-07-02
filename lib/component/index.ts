import type { ComponentInternalInstance } from "vue"
import {
  getCurrentInstance,
  onBeforeMount as vueOnBeforeMount,
  onBeforeUnmount as vueOnBeforeUnmount,
  onBeforeUpdate as vueOnBeforeUpdate,
  onMounted as vueOnMounted,
  onServerPrefetch,
  onUnmounted as vueOnUnmounted,
  onUpdated as vueOnUpdated
} from "vue"
import { tailwind, useStyle } from "fishtvue/theme"
import { cn } from "fishtvue/utils/tailwindHandler"
import { interpolate, selectPlural, toKebabCase } from "fishtvue/utils/stringHandler"
import { fieldsPick, get } from "fishtvue/utils/objectHandler"
import { isClient, minifyCSS } from "fishtvue/utils/domHandler"
import { DefaultMessages, Locales } from "fishtvue/locale"
import type { ComponentsOptions, FishtVue, OptionsTheme } from "fishtvue/config"
import type { NamesComponents, PublicFields, setStyleOptions, StylesComponent } from "./TypeComponent"
import { UniqueKeySetCollection } from "fishtvue/utils/uniqueCollection"
import { StyleClass, StyleMode } from "fishtvue/types"

const listComponents = new Set<NamesComponents | undefined>()
const listOfStyledComponents = new UniqueKeySetCollection<NamesComponents | undefined, string>()
const listOfCssComponents = new UniqueKeySetCollection<NamesComponents | undefined, string>()
export const cssComponents = new Map<NamesComponents, string>()
/**
 * ## Class: Component
 *
 * The `Component` class is an exported default class that represents a component in the application.
 *
 * ### Properties
 *
 * - `name`: The name of the component.
 * - `prefix`: The prefix for the component.
 *
 * ### Constructor
 *
 * The constructor initializes the `Component` class and sets the necessary properties.
 *
 * ### Methods
 *
 * - `onBeforeMount(hook)`: A method that sets a hook to be executed before the component is mounted.
 * - `onMounted(hook)`: A method that sets a hook to be executed after the component is mounted.
 * - `onBeforeUpdate(hook)`: A method that sets a hook to be executed before the component is updated.
 * - `onUpdated(hook)`: A method that sets a hook to be executed after the component is updated.
 * - `onBeforeUnmount(hook)`: A method that sets a hook to be executed before the component is unmounted.
 * - `onUnmounted(hook)`: A method that sets a hook to be executed after the component is unmounted.
 * - `getOptions()`: A method that returns the options for the component.
 * - `getPrefix()`: A method that returns the prefix for the component.
 * - `initStyle(stylesComp)`: A method that initializes the style for the component.
 */
export default class Component<T extends keyof ComponentsOptions> {
  private readonly __instance: ComponentInternalInstance | null
  private readonly __globalConfig?: FishtVue | undefined
  private readonly __globalLocale?: Locales
  private readonly __globalOptionsTheme?: OptionsTheme
  private readonly __componentsStyle?: StyleMode
  private readonly __options?: ComponentsOptions[T]
  private __stylesComp?: StylesComponent
  private readonly __arrayPublicFields: Array<keyof this> = ["name", "prefix", "getOptions", "getPrefix", "initStyle"]
  public readonly name?: T
  public readonly prefix?: OptionsTheme["prefix"]

  constructor(name?: T) {
    this.__instance = getCurrentInstance()
    this.__globalConfig = this.__instance?.appContext.config.globalProperties.$fishtVue
    if (isClient() && !this.__globalConfig) this.__globalConfig = (window as any)?.FishtVue
    this.__globalLocale = this.__globalConfig?.config?.locale
    this.__globalOptionsTheme = this.__globalConfig?.config?.optionsTheme
    this.__componentsStyle = this.__globalConfig?.config?.componentsStyle
    this.name = (name ?? this.__instance?.type.__name) as T
    this.prefix = this.__globalOptionsTheme?.prefix ?? "fishtvue"
    this.__options = this.__globalConfig?.getOptions(this.name) as ComponentsOptions[T]
    this.__stylesComp = undefined
    this.__hooks()
  }

  private __hooks(): void {
    if (this.__instance) {
      onServerPrefetch(() => this.initStyle())
      vueOnMounted(() => this.initStyle())
    }
  }

  private __getPublicFields = () => fieldsPick(this, this.__arrayPublicFields)
  /**
   * `onBeforeMount(hook)`: A method that sets a hook to be executed before the component is mounted.
   */
  public onBeforeMount = (hook: (instance: Pick<this, PublicFields>) => any): void =>
    vueOnBeforeMount(() => hook(this.__getPublicFields()))
  /**
   * `onMounted(hook)`: A method that sets a hook to be executed after the component is mounted.
   */
  public onMounted = (hook: (instance: Pick<this, PublicFields>) => any): void =>
    vueOnMounted(() => hook(this.__getPublicFields()))
  /**
   * `onBeforeUpdate(hook)`: A method that sets a hook to be executed before the component is updated.
   */
  public onBeforeUpdate = (hook: (instance: Pick<this, PublicFields>) => any): void =>
    vueOnBeforeUpdate(() => hook(this.__getPublicFields()))
  /**
   * `onUpdated(hook)`: A method that sets a hook to be executed after the component is updated.
   */
  public onUpdated = (hook: (instance: Pick<this, PublicFields>) => any): void =>
    vueOnUpdated(() => hook(this.__getPublicFields()))
  /**
   * `onBeforeUnmount(hook)`: A method that sets a hook to be executed before the component is unmounted.
   */
  public onBeforeUnmount = (hook: (instance: Pick<this, PublicFields>) => any): void =>
    vueOnBeforeUnmount(() => hook(this.__getPublicFields()))
  /**
   * `onUnmounted(hook)`: A method that sets a hook to be executed after the component is unmounted.
   */
  public onUnmounted = (hook: (instance: Pick<this, PublicFields>) => any): void =>
    vueOnUnmounted(() => hook(this.__getPublicFields()))
  /**
   * `getOptions()`: A method that returns the options for the component.
   */
  public getOptions = (): ComponentsOptions[T] | undefined => this.__options
  /**
   * `getPrefix()`: A method that returns the prefix for the component.
   */
  public getPrefix = (): OptionsTheme["prefix"] => this.prefix

  /**
   * `initStyle(stylesComp)`: A method that initializes the style for the component.
   */
  public initStyle = (stylesComp?: StylesComponent): void => {
    this.__stylesComp = stylesComp ?? this.__stylesBase
    if (this.__stylesComp) this.__setStyle(this.__stylesComp)
  }

  public setStyle = <T extends StyleClass | boolean | undefined>(
    stylesComp: T | T[],
    options?: setStyleOptions
  ): string => {
    if (this.__globalConfig?.config?.unstyled) return ""
    const specialClass = `${this.prefix}-${toKebabCase(this.name)}`
    const styles = cn(stylesComp)
    const isBaseClasses = options?.isBaseClasses ? "" : " "
    const newClasses = styles
      .split(" ")
      .filter((item) => !listOfStyledComponents.hasValue(this.name, `${isBaseClasses}${item}`))
    if (newClasses?.length) {
      newClasses.forEach((item) => {
        listOfStyledComponents.add(this.name, [`${isBaseClasses}${item}`])
        const css = tailwind(item, {
          selector: options?.selector ? `${options.selector}${isBaseClasses}` : `.${specialClass}`,
          darkSelector: this.__globalOptionsTheme?.darkModeSelector ?? ""
        })
        if (css) listOfCssComponents.add(this.name, [css])
      })
      if (this.__stylesComp) this.__setStyle(this.__stylesComp)
    }
    return `fv ${specialClass} ${styles}`
  }

  private __stylesBase: StylesComponent = (layers, css = "") =>
    layers && layers?.length
      ? `
  @layer ${layers};
  @layer fishtvue {
    ${css}
  }
`
      : // theme Issue 4 (Wave 2): даже без `optionsTheme.layers` component-стиль идёт в `@layer fishtvue`
        // (зеркало base-style в config/index.ts) — канон dev-patterns §3, предсказуемая cascade.
        `@layer fishtvue {${css}}`

  private __setStyle(stylesComp: StylesComponent): void {
    const CSS = [...(listOfCssComponents.get(this.name) ?? [])].sort((a, b) => {
      const isMediaA = a.trim().includes("@media")
      const isMediaB = b.trim().includes("@media")
      if (isMediaA && !isMediaB) return 1
      if (!isMediaA && isMediaB) return -1
      return 0
    })
    let css = stylesComp(this.__globalOptionsTheme?.layers ?? "", CSS.join("\n"))
    if (!this.__globalOptionsTheme?.isNotMinifyCSS) css = minifyCSS(css)
    if (this.name) cssComponents.set(this.name, css)
    if (isClient()) useStyle(css, { name: this.name })
    listComponents.add(this.name)
  }

  // Issue 3 / Wave 3.5: fallback chain `messages[active][key] → messages[default][key] → key`
  // + опциональные interpolation/pluralization через `params`.
  // Возвращаемый тип сужен с `string | undefined` до `string` — key используется как last resort,
  // что делает t() безопасным для template/computed без дополнительного `?? "literal"` fallback.
  // Без `params` поведение байт-в-байт прежнее (backward-compatible для всех single-arg вызовов):
  //   - pluralization: если в строке есть `|`-формы и `params.count` — число, форма выбирается selectPlural по CLDR-правилам активной локали;
  //   - interpolation: `{name}` подставляется из `params` (неизвестный плейсхолдер остаётся литералом — dev-сигнал).
  public t(key: keyof DefaultMessages | string, params?: Record<string, string | number>): string {
    if (!key) return ""
    const active = this.__globalConfig?.getActiveLocale() ?? "en"
    const def = this.__globalConfig?.getDefaultLocale() ?? "en"
    const messages = this.__globalLocale?.messages
    let value: string | undefined
    const fromActive = get<unknown>(messages?.[active], key)
    if (typeof fromActive === "string") value = fromActive
    else if (def && def !== active) {
      const fromDefault = get<unknown>(messages?.[def], key)
      if (typeof fromDefault === "string") value = fromDefault
    }
    if (value === undefined) value = String(key)
    if (params) {
      if (typeof params.count === "number" && value.includes("|")) value = selectPlural(value, params.count, active)
      value = interpolate(value, params)
    }
    return value
  }

  public componentsStyle(): StyleMode | undefined {
    return this.__componentsStyle
  }
}

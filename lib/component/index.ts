import {
  getCurrentInstance,
  onBeforeMount as vueOnBeforeMount,
  onMounted as vueOnMounted,
  onBeforeUpdate as vueOnBeforeUpdate,
  onUpdated as vueOnUpdated,
  onBeforeUnmount as vueOnBeforeUnmount,
  onUnmounted as vueOnUnmounted
} from "vue"
import { useStyle, tailwind } from "fishtvue/theme"
import { cn } from "fishtvue/utils/tailwindHandler"
import { toKebabCase } from "fishtvue/utils/stringHandler"
import { fieldsPick, get } from "fishtvue/utils/objectHandler"
import { minifyCSS } from "fishtvue/utils/domHandler"
import type { ComponentInternalInstance } from "vue"
import type { Theme } from "fishtvue/theme"
import { DefaultMessages, Locales } from "fishtvue/locale"
import type { ComponentsOptions, FishtVue, OptionsTheme } from "fishtvue/config"
import type { PublicFields, StylesComponent } from "./TypeComponent"
import { UniqueKeySetCollection } from "fishtvue/utils/uniqueCollection"
import { StyleClass } from "fishtvue/types"

type namesComponents = keyof ComponentsOptions | "BaseComponent"
type setStyleOptions = Partial<{
  selector: string
  isBaseClasses: boolean
  isNotScopeId: boolean
}>
const listComponents = new Set<namesComponents | undefined>()
const listOfStyledComponents = new UniqueKeySetCollection<namesComponents | undefined, string>()
const listOfCssComponents = new UniqueKeySetCollection<namesComponents | undefined, string>()
/**
 * ## Class: Component
 *
 * The `Component` class is an exported default class that represents a component in the application.
 *
 * ### Properties
 *
 * - `name`: The name of the component.
 * - `scopeId`: The scope ID of the component.
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
  private readonly __globalConfig?: FishtVue
  private readonly __globalTheme?: Theme
  private readonly __globalLocale?: Locales
  private readonly __globalOptionsTheme?: OptionsTheme
  private readonly __options?: ComponentsOptions[T]
  private __stylesComp?: StylesComponent
  private readonly __arrayPublicFields: Array<keyof this> = [
    "name",
    "scopeId",
    "prefix",
    "getOptions",
    "getPrefix",
    "initStyle"
  ]
  public readonly name?: T
  public readonly scopeId?: string
  public readonly prefix?: OptionsTheme["prefix"]

  constructor(name?: T) {
    this.__instance = getCurrentInstance()
    this.__globalConfig = this.__instance?.appContext.config.globalProperties.$fishtVue ?? (window as any).FishtVue
    this.__globalTheme = this.__globalConfig?.config?.theme
    this.__globalLocale = this.__globalConfig?.config?.locale
    this.__globalOptionsTheme = this.__globalConfig?.config?.optionsTheme
    this.name = (name ?? this.__instance?.type.__name) as T
    this.scopeId = `data-fisht-${this.name}`
    this.prefix = this.__globalOptionsTheme?.prefix ? `${this.__globalOptionsTheme?.prefix}-` : ""
    this.__options = this.__globalConfig?.getOptions(this.name) as ComponentsOptions[T]
    this.__stylesComp = this.__stylesBase
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
    if (!listComponents.has(this.name)) this.__setStyle(this.__stylesComp)
  }

  public setStyle = <T extends StyleClass | StyleClass[] | undefined>(
    stylesComp: T | T[],
    options: setStyleOptions = {
      isBaseClasses: false,
      isNotScopeId: false
    }
  ): string => {
    const specialClass = `${toKebabCase(this.name)}-component`
    const isBaseClasses = options.isBaseClasses ? "" : " "
    // const scopeId = options.isNotScopeId ? "" : `[${this.scopeId}]`
    const styles = cn(stylesComp)
    const newClasses = styles
      .split(" ")
      .filter((item) => !listOfStyledComponents.hasValue(this.name, `${isBaseClasses}${item}`))
    if (newClasses?.length) {
      newClasses.forEach((item) => {
        listOfStyledComponents.add(this.name, [`${isBaseClasses}${item}`])
        const css = tailwind(item, {
          // selector: options.selector
          //   ? `${options.selector}${scopeId}${isBaseClasses}`
          //   : `.${this.prefix}${toKebabCase(this.name)}${scopeId}${isBaseClasses}.${specialClass}`,
          selector: options.selector ? `${options.selector}${isBaseClasses}` : `.${specialClass}`,
          darkSelector: this.__globalOptionsTheme?.darkModeSelector ?? ""
        })
        if (css) listOfCssComponents.add(this.name, [css])
      })
      if (this.__stylesComp) this.__setStyle(this.__stylesComp)
    }
    return `${specialClass} ${styles}`
  }
  private __stylesBase: StylesComponent = (layers = "fishtvue", css = "") => `
  @layer ${layers};
  @layer fishtvue {
    ${css}
  }
`

  private __setStyle(stylesComp: StylesComponent): void {
    if (this.scopeId) {
      const CSS = [...(listOfCssComponents.get(this.name) ?? [])].sort((a, b) => {
        const isMediaA = a.trim().includes("@media")
        const isMediaB = b.trim().includes("@media")
        if (isMediaA && !isMediaB) return 1
        if (!isMediaA && isMediaB) return -1
        return 0
      })
      const css = minifyCSS(stylesComp(this.__globalOptionsTheme?.layers ?? "fishtvue", CSS.join("\n")))
      const style = useStyle(css, { name: this.name })
      if (style.isLoaded) listComponents.add(this.name)
    }
  }
  public t(key: keyof DefaultMessages | string): string | undefined {
    if (!key) return
    const nameLocale = this.__globalConfig?.getActiveLocale() ?? "en"
    if (!nameLocale) return
    const localeMessages = this.__globalLocale?.messages?.[nameLocale]
    if (!localeMessages) return
    const value = get<unknown>(localeMessages, key)
    if (!value) return
    return typeof value === "string" ? value : undefined
  }
}

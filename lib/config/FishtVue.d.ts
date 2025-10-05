import { InjectionKey, Plugin } from "vue"
import { StyleMode } from "../types"

import { Locales, type NameLocale } from "fishtvue/locale/TypesLocale"
import { NamesTheme, Theme } from "fishtvue/theme"
import { FixWindowOption } from "fishtvue/fixwindow"
import { BadgeOption } from "fishtvue/badge"
import { ButtonOption } from "fishtvue/button"
import { IconsOption } from "fishtvue/icons"
import { LoadingOption } from "fishtvue/loading"
import { LabelOption } from "fishtvue/label"
import { InputLayoutOption } from "fishtvue/inputlayout"
import { InputOption } from "fishtvue/input"
import { SelectOption } from "fishtvue/select"
import { AriaOption } from "fishtvue/aria"
import { SwitchOption } from "fishtvue/switch"
import { CalendarOption } from "fishtvue/calendar"
import { TextEditorOption } from "fishtvue/texteditor"
import { DialogOption } from "fishtvue/dialog"
import { FormOption } from "fishtvue/form"
import { AccordionOption } from "fishtvue/accordion"
import { AlertOption } from "fishtvue/alert"
import { SeparatorOption } from "fishtvue/separator"
import { MenuOption } from "fishtvue/menu"
import { PaginationOption } from "fishtvue/pagination"
import { SplitOption } from "fishtvue/split"
import { TableOption } from "fishtvue/table"

/**
 * Main FishtVue instance type that provides core functionality and configuration
 * @interface FishtVue
 */
export declare type FishtVue = {
  /** Reactive configuration object containing all FishtVue settings */
  config: FishtVueConfiguration
  /**
   * Returns a readonly copy of the FishtVue instance
   * @returns {Readonly<FishtVue> | undefined} Readonly FishtVue instance or undefined if not installed
   */
  useFishtVue(): Readonly<FishtVue> | undefined
  /**
   * Gets component options either for a specific component or all components
   * @template T - Component key type
   * @param {T} [component] - Optional component key to get specific component options
   * @returns {keyof ComponentsOptions extends T ? Readonly<ComponentsOptions> : Readonly<ComponentsOptions[T]>}
   * Readonly component options
   */
  getOptions<T extends keyof ComponentsOptions>(
    component?: T
  ): keyof ComponentsOptions extends T ? Readonly<ComponentsOptions> : Readonly<ComponentsOptions[T]>
  /**
   * Gets the currently active locale
   * @returns {string | undefined} Active locale code or undefined if not set
   */
  getActiveLocale(): string | undefined
  /**
   * Sets the active locale
   * @param {NameLocale} activeLocale - Locale code to set as active
   * @returns {string | boolean | undefined} New active locale, false if failed, or undefined if not installed
   */
  setActiveLocale(activeLocale: NameLocale): string | boolean | undefined
  /**
   * Gets the default locale
   * @returns {string | undefined} Default locale code or undefined if not set
   */
  getDefaultLocale(): string | undefined
}
/** Injection key symbol used for dependency injection of FishtVue instance in Vue components */
export let FishtVueSymbol: InjectionKey<string>
/**
 * Global function to get a readonly copy of the FishtVue instance
 * @template T - FishtVue type
 * @returns {Readonly<T> | undefined} Readonly FishtVue instance or undefined if not installed
 */
export declare function useFishtVue<T extends FishtVue>(): Readonly<T> | undefined

/**
 * Global function to get component options
 * @template T - Component key type
 * @param {T} [component] - Optional component key to get specific component options
 * @returns {keyof ComponentsOptions extends T ? Readonly<ComponentsOptions> : Readonly<ComponentsOptions[T]>}
 * Readonly component options
 */
export declare function getOptions<T extends keyof ComponentsOptions>(
  component?: T
): keyof ComponentsOptions extends T ? Readonly<ComponentsOptions> : Readonly<ComponentsOptions[T]>

/**
 * Sets the active locale for FishtVue.
 * @param {NameLocale} activeLocale - The locale code to set as active.
 * @returns {string | boolean | undefined} The new active locale code, false if the change failed, or undefined if FishtVue is not installed.
 */
export declare function setActiveLocale(activeLocale: NameLocale): string | boolean | undefined

/**
 * Gets the currently active locale code.
 * @returns {string | undefined} The active locale code, or undefined if not set.
 */
export declare function getActiveLocale(): string | undefined

/**
 * Gets the default locale code.
 * @returns {string | undefined} The default locale code, or undefined if not set.
 */
export declare function getDefaultLocale(): string | undefined

declare const plugin: Plugin
export default plugin

declare module "vue/types/vue" {
  interface Vue {
    $fishtVue: FishtVue
  }
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $fishtVue: FishtVue
  }
}

/**
 * Configuration interface for FishtVue instance
 * @interface FishtVueConfiguration
 */
export declare interface FishtVueConfiguration {
  /** Style mode for components: "filled", "outlined", or "underlined" */
  componentsStyle?: StyleMode
  /** Whether to use unstyled components */
  unstyled?: boolean
  /** Locale configuration for internationalization */
  locale?: Locales
  /** Theme configuration for styling */
  theme?: Theme
  /** Additional theme options */
  optionsTheme?: OptionsTheme
  /** Global configuration object that maps component names to their default options and behavior settings */
  componentsOptions?: ComponentsOptions
}

/**
 * Theme configuration options
 * @interface OptionsTheme
 */
export type OptionsTheme = Partial<{
  /** Name of the theme to use (Aurora, Harmony, or Sapphire) */
  nameTheme: keyof typeof NamesTheme
  /** Prefix for theme-related CSS classes */
  prefix: string
  /** CSS selector for light mode */
  lightModeSelector: string
  /** CSS selector for dark mode */
  darkModeSelector: string
  /** CSS layer configuration */
  layers: string | "fishtvue"
  /** Whether to minify CSS output */
  isNotMinifyCSS: boolean
}>

/**
 * Global configuration object for all FishtVue components
 * Maps component names to their specific configuration options
 * Allows setting default properties and behavior for each component type
 * @interface ComponentsOptions
 */
export type ComponentsOptions = Partial<{
  Form: FormOption
  Input: InputOption
  Aria: AriaOption
  Switch: SwitchOption
  Select: SelectOption
  Calendar: CalendarOption
  TextEditor: TextEditorOption
  Label: LabelOption
  InputLayout: InputLayoutOption
  Button: ButtonOption
  Icons: IconsOption
  Loading: LoadingOption
  FixWindow: FixWindowOption
  Dialog: DialogOption
  Badge: BadgeOption
  Accordion: AccordionOption
  Alert: AlertOption
  Separator: SeparatorOption
  Menu: MenuOption
  Pagination: PaginationOption
  Split: SplitOption
  Table: TableOption
}>

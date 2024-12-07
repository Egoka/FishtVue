import { Plugin } from "vue"
import { StyleMode } from "../types"

import { Locales, type NameLocale } from "fishtvue/locale/TypesLocale"
import { Theme } from "fishtvue/theme"

import { NamesTheme } from "fishtvue/theme"
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

export declare type FishtVue = {
  config: FishtVueConfiguration
  useFishtVue(): Readonly<FishtVue> | undefined
  getOptions<T extends keyof ComponentsOptions>(
    component?: T
  ): keyof ComponentsOptions extends T ? Readonly<ComponentsOptions> : Readonly<ComponentsOptions[T]>
  getActiveLocale(): string | undefined
  setActiveLocale(activeLocale: NameLocale): string | boolean | undefined
  getActiveLocale(): string | undefined
  getDefaultLocale(): string | undefined
}

export declare function useFishtVue<T extends FishtVue>(): Readonly<T> | undefined

export declare function getOptions<T extends keyof ComponentsOptions>(
  component?: T
): keyof ComponentsOptions extends T ? Readonly<ComponentsOptions> : Readonly<ComponentsOptions[T]>

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

export declare interface FishtVueConfiguration {
  componentsStyle?: StyleMode
  locale?: Locales
  theme?: Theme
  optionsTheme?: OptionsTheme
  componentsOptions?: ComponentsOptions
}

export type OptionsTheme = Partial<{
  /**
   * ## Available theme names `NamesTheme`
   *
   * Aurora => (заря)
   *
   * Larimar => (ларимар)
   *
   * Nimbus => (нимбус)
   *
   * Celestia => (селестия)
   *
   * Velvet => (бархат)
   *
   * Harmony => (гармония)
   *
   * Serenity => (безмятежность)
   *
   * Sapphire => (сапфир)
   *
   * Eclipse => (затмение)
   *
   * Iris => (ирис)
   *
   */
  nameTheme: keyof typeof NamesTheme
  /** ## PROPS-EMITS-SLOTS */
  prefix: string
  lightModeSelector: string
  darkModeSelector: string
  layers: string | "fishtvue"
}>

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

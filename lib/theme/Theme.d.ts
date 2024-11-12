import { Ref } from "vue"
import { DeepPartial, Size } from "../types"

export enum NamesTheme {
  Aurora, // (заря)
  // Larimar, // (ларимар)
  // Nimbus, // (нимбус)
  // Celestia, // (селестия)
  // Velvet, // (бархат)
  Harmony, // (гармония)
  // Serenity, // (безмятежность)
  Sapphire // (сапфир)
  // Eclipse, // (затмение)
  // Iris // (ирис)
}

// ----------------------
declare type Theme = DeepPartial<{
  name: keyof typeof NamesTheme
  primitive: ThemePrimitive
  semantic: ThemeSemantic
}>

// ----------------------
export declare function linksTheme<T extends Theme>(theme: Theme | undefined): T | undefined

export declare function useStyle(css: string, options?: StyleOptions): Style

export declare function toVarsCss<T extends Record<string, string | number | T>>(obj: T, prefix?: string): string

export declare function palette(color: HEX): ThemeColor

export declare function tailwind(color: string, options?: Partial<{ selector: string; darkSelector: string }>): string

// ----------------------
export type HEX = string | "#ffffff"
export type RGB = Record<"r" | "g" | "b", number>
// ----------------------
type ThemePrimitive = Margin & Padding & Colors & ColorsConst & Border & Rounded & Shadow & Opacity & Duration
type ThemeSemantic = {
  primary: ThemeColor
  customThemeColor: number | string
  customThemeColorContrast: number | string
}
// ----------------------
type ColorParameters = {
  border: string
  outline: string
  shadow: string
  color: string
  background: string
  opacity: string
}
type OtherParameters = {
  padding: string
  margin: string
  borderWidth: string
  outlineWidth: string
  rounded: string
  duration: string
}
type ColorParametersScheme<T extends string> = { [key in T]: Partial<ColorParameters> }
type OtherParametersScheme<T extends string> = { [key in T]: Partial<OtherParameters> }
declare type ColorScheme<T extends string> = OtherParametersScheme<T> & {
  light: ColorParametersScheme<T>
  dark: ColorParametersScheme<T>
}
// ----------------------
export declare type Margin = Record<"m" | "mx" | "my" | "mt" | "mb" | "ml" | "mr", Record<keysLength, string>>
export declare type Padding = Record<"p" | "px" | "py" | "pt" | "pb" | "pl" | "pr", Record<keysLength, string>>
export declare type Colors = Record<namesColors, ThemeColor>
export declare type ColorsConst = Record<"white" | "black", string>
export declare type Border = Record<"borderWidth", BorderWidth>
export declare type Rounded = Record<"rounded", ThemeRounded>
export declare type Shadow = Record<"shadow", ThemeShadow>
export declare type Opacity = Record<"opacity", ThemeOpacity>
export declare type Duration = Record<"duration", ThemeDuration>

interface ThemeRounded extends Record<Size | "none" | "full", string> {}

interface ThemeShadow extends Record<Size | "inner" | "none", string> {}

interface ThemeOpacity extends Record<keysOpacity, number> {}

interface ThemeDuration extends Record<keysDuration, string> {}

interface BorderWidth extends Record<keysBorder | "none", string> {}

interface Length extends Record<keysLength, string> {
  0: "0px"
  0.25: "1px"
  0.5: "2px"
  1: "4px"
  1.5: "6px"
  2: "8px"
  2.5: "10px"
  3: "12px"
  3.5: "14px"
  4: "16px"
  5: "20px"
  6: "24px"
  7: "28px"
  8: "32px"
  9: "36px"
  10: "40px"
  11: "44px"
  12: "48px"
  14: "56px"
  16: "64px"
  20: "80px"
  24: "96px"
  28: "112px"
  32: "128px"
  36: "144px"
  40: "160px"
}

export type ThemeColor = { [key in keysColor]: string }
export declare type namesColors =
  | "theme"
  | "emerald"
  | "green"
  | "lime"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
type keysColor = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950
type keysOpacity = 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | 90 | 95 | 100
type keysDuration = 0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000
type keysBorder = 1 | 2 | 4 | 6 | 8
// prettier-ignore
type keysLength =
  0
  | 0.25
  | 0.5
  | 1
  | 1.5
  | 2
  | 2.5
  | 3
  | 3.5
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 14
  | 16
  | 20
  | 24
  | 28
  | 32
  | 36
  | 40

export interface StyleOptions {
  document?: HTMLElement
  immediate?: boolean
  manual?: boolean
  name?: string
  id?: string
  media?: string
  nonce?: string
  props?: any
  first?: boolean
  onMounted?: (name: string) => void
  onUpdated?: (name: string) => void
  onLoad?: (event: Event, options: { name: string }) => void
}

export interface Style {
  id: string | undefined
  name: string
  el: Ref<HTMLElement | undefined>
  css: any
  unload: () => void
  load: (css?: string, props?: any) => void
  isLoaded: Readonly<Ref<boolean>>
}

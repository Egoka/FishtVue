/**
 * # `FishtVue` Global Types
 */
import {
  AllowedComponentProps,
  ComponentCustomProps,
  ObjectEmitsOptions,
  type Ref,
  type UnwrapRef,
  VNodeProps
} from "vue"

/**
 * ### Defining dependent types for `ClassComponent`
 */

/**
 * Global component constructor
 * @template T - Component type
 */
export declare type GlobalComponentConstructor<T> = {
  new (): T
}

/**
 * Public props of component, combining VNodeProps, AllowedComponentProps and ComponentCustomProps
 */
declare type PublicProps = VNodeProps & AllowedComponentProps & ComponentCustomProps

/**
 * Converts union type to intersection type
 * @template U - Source union type
 */
declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

/**
 * Function for emitting component events
 * @template Options - Emit options (array of strings or object with functions)
 * @template Event - Event keys from Options
 */
declare type EmitFn<Options = ObjectEmitsOptions, Event extends keyof Options = keyof Options> =
  Options extends Array<infer V>
    ? (event: V, ...args: any[]) => void
    : object extends Options
      ? (event: string, ...args: any[]) => void
      : UnionToIntersection<
          {
            [key in Event]: Options[key] extends (...args: infer Args) => any
              ? (event: key, ...args: Args) => void
              : (event: key, ...args: any[]) => void
          }[Event]
        >

/**
 * Base component class with typed props, slots, emits and exposed properties
 * @template Props - Component props type
 * @template Slots - Component slots type
 * @template Emits - Component emits type
 * @template Expose - Component exposed properties type
 */
export declare class ClassComponent<Props, Slots, Emits, Expose> {
  $props: Props & PublicProps
  $slots: Slots
  $emit: EmitFn<Emits>
  $expose: Expose
}

/**
 * Recursively makes all properties of a type optional
 * @template T - Source type
 */
export declare type DeepPartial<T> = { [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] }

/**
 * Recursively removes specified keys from a type
 * @template T - Source type
 * @template K - Keys to remove
 */
export declare type DeepOmit<T, K> = T extends object
  ? { [Key in keyof T]: Key extends K ? never : T[Key] extends object ? DeepOmit<T[Key], K> : T[Key] }
  : T

/**
 * Recursively picks specified keys from a type (supports nested paths via dot notation)
 * @template T - Source type
 * @template K - Keys to pick (can be nested via dot, e.g. "user.name")
 */
type DeepPick<T, K extends string> = K extends `${infer First}.${infer Rest}`
  ? First extends keyof T
    ? { [P in First]: DeepPick<T[First], Rest> }
    : never
  : K extends keyof T
    ? { [P in K]: T[K] }
    : never

/**
 * Read-only reactive reference
 * @template T - Reference value type
 */
export declare type ReadRef<T = any> = Readonly<Ref<UnwrapRef<T>>>

/**
 * Style class - string or array of strings
 */
export declare type StyleClass = string | Array<string>

/**
 * Type for element width
 */
export declare type TWidth = number | string | "500px" | "50rem" | "50em" | "50vw"

/**
 * Type for element height
 */
export declare type THeight = number | string | "500px" | "50rem" | "50em" | "50vh"

/**
 * Element reference - selector string, HTMLElement or Element
 */
export declare type RefLink = string | HTMLElement | Element

/**
 * Type for key (usually used for identifiers)
 */
export declare type _key = string

/**
 * Type for loading state
 */
export declare type TLoading = boolean

/**
 * Component sizes
 */
export declare type Size = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl"

/**
 * Component styling modes
 */
export declare type StyleMode = "filled" | "outlined" | "underlined"
// ----declare --------------------------------------------------------------------

/**
 * Short position values
 */
export declare type PositionShort =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "center"
  | "bottom-left"
  | "top-left"
  | "bottom-right"
  | "top-right"

/**
 * Full position values including all combinations
 */
export declare type Position =
  | PositionShort
  | "center-top"
  | "center-bottom"
  | "center-right"
  | "center-left"
  | "right-top"
  | "right-bottom"
  | "left-top"
  | "left-bottom"

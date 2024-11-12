import type { ComponentsOptions, OptionsTheme } from "fishtvue/config"

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
declare class Component<T extends keyof ComponentsOptions> {
  readonly name?: T
  readonly scopeId?: ScopeId
  readonly prefix?: OptionsTheme["prefix"]

  /**
   * `onBeforeMount(hook)`: A method that sets a hook to be executed before the component is mounted.
   */
  onBeforeMount(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onMounted(hook)`: A method that sets a hook to be executed after the component is mounted.
   */
  onMounted(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onBeforeUpdate(hook)`: A method that sets a hook to be executed before the component is updated.
   */
  onBeforeUpdate(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onUpdated(hook)`: A method that sets a hook to be executed after the component is updated.
   */
  onUpdated(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onBeforeUnmount(hook)`: A method that sets a hook to be executed before the component is unmounted.
   */
  onBeforeUnmount(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `onUnmounted(hook)`: A method that sets a hook to be executed after the component is unmounted.
   */
  onUnmounted(hook: (instance: Pick<this, PublicFields>) => any): void

  /**
   * `getOptions()`: A method that returns the options for the component.
   */
  getOptions(): ComponentsOptions[T] | undefined

  /**
   * `getPrefix()`: A method that returns the prefix for the component.
   */
  getPrefix(): OptionsTheme["prefix"]

  /**
   * `initStyle(stylesComp)`: A method that initializes the style for the component.
   */
  initStyle(stylesComp: StylesComponent): void
}

type ScopeId = string

export type PublicFields =
  | "name"
  | "scopeId"
  | "prefix"
  | "onBeforeMount"
  | "onMounted"
  | "onBeforeUpdate"
  | "onUpdated"
  | "onBeforeUnmount"
  | "onUnmounted"
  | "getOptions"
  | "getPrefix"
  | "initStyle"

export type StylesComponent = (layers: string, css: string) => string
export default Component

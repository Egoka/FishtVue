import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"

/**
 * ## Aria
 *
 * Aria - a component for managing accessible input fields with extended control options.
 *
 * Provides support for customizable input attributes, validation states, and event handling.
 */
declare class Aria extends ClassComponent<AriaProps, AriaSlots, AriaEmits, AriaExpose> {}

export declare type BaseAriaProps = {
  /**
   * The placeholder text for the input field.
   * @type {string | undefined}
   */
  placeholder?: string

  /**
   * Autocomplete attribute for the input field.
   * @type {"on" | "off" | undefined}
   */
  autocomplete?: "on" | "off"

  /**
   * Text wrapping behavior for the input field.
   * @type {"soft" | "hard" | "off" | undefined}
   */
  wrap?: "soft" | "hard" | "off"

  /**
   * Number of visible rows for text input (applies to textarea elements).
   * @type {number | undefined}
   */
  rows?: number

  /**
   * Maximum allowed length of the input field's value.
   * @type {number | undefined}
   */
  maxLength?: number

  /**
   * Custom CSS class for the input field.
   * @type {StyleClass | undefined}
   */
  classInput?: StyleClass
}

/**
 * Props for the Aria component.
 */
export interface AriaProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseAriaProps> {
  /**
   * The unique identifier for the input element.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The value of the input field.
   * @type {string | number | null | undefined}
   */
  modelValue?: string | number | null | undefined
}

export declare type AriaSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
/**
 * Events emitted by the Aria component.
 */
export declare type AriaEmits = {
  /**
   * Emitted when the `modelValue` prop is updated.
   * @param event
   * @param {string} payload - The updated input value.
   */
  (event: "update:modelValue", payload: string): void

  /**
   * Emitted when the validation state changes.
   * @param event
   * @param {boolean} payload - Indicates whether the input is invalid.
   */
  (event: "update:isInvalid", payload: boolean): void

  /**
   * Emitted when the input value changes.
   * @param event
   * @param {boolean} payload - Indicates the change in the input value.
   */
  (event: "change:modelValue", payload: boolean): void

  /**
   * Emitted when the input field gains focus.
   * @param event
   * @param {FocusEvent} env - The focus event object.
   */
  (event: "focus", env: FocusEvent): void

  /**
   * Emitted when the input field loses focus.
   * @param event
   * @param {FocusEvent} env - The blur event object.
   */
  (event: "blur", env: FocusEvent): void
}
/**
 * Methods and states exposed via `ref` for the Aria component.
 */
export declare type AriaExpose = {
  // ---STATE-------------------------
  /**
   * Layout reference for the input field.
   * @type {InputLayoutExpose | undefined}
   */
  layout: InputLayoutExpose | undefined

  /**
   * Reference to the input HTML element.
   * @type {HTMLElement | undefined}
   */
  inputRef: HTMLElement | undefined

  // ---PROPS-------------------------
  /**
   * Current `id` value of the input field.
   * @type {AriaProps["id"]}
   */
  id: AriaProps["id"]

  /**
   * Current `modelValue` of the input field.
   * @type {AriaProps["modelValue"]}
   */
  modelValue: AriaProps["modelValue"]

  /**
   * Current `placeholder` of the input field.
   * @type {AriaProps["placeholder"]}
   */
  placeholder: AriaProps["placeholder"]

  /**
   * Current autocomplete setting for the input field.
   * @type {AriaProps["autocomplete"]}
   */
  autocomplete: AriaProps["autocomplete"]

  /**
   * Current wrapping behavior for the input field.
   * @type {AriaProps["wrap"]}
   */
  wrap: AriaProps["wrap"]

  /**
   * Current number of rows for the input field.
   * @type {AriaProps["rows"]}
   */
  rows: AriaProps["rows"]

  /**
   * Current maximum length for the input field.
   * @type {AriaProps["maxLength"]}
   */
  maxLength: AriaProps["maxLength"]

  /**
   * Indicates whether the input has a value.
   * @type {InputLayoutProps["isValue"]}
   */
  isValue: InputLayoutProps["isValue"]

  /**
   * Current mode of the input field.
   * @type {AriaProps["mode"]}
   */
  mode: AriaProps["mode"]

  /**
   * Indicates whether the input is disabled.
   * @type {AriaProps["disabled"]}
   */
  isDisabled: AriaProps["disabled"]

  /**
   * Indicates whether the input is in a loading state.
   * @type {AriaProps["loading"]}
   */
  isLoading: AriaProps["loading"]

  /**
   * Indicates whether the input is invalid.
   * @type {AriaProps["isInvalid"]}
   */
  isInvalid: AriaProps["isInvalid"]

  /**
   * The validation error message for the input field.
   * @type {AriaProps["messageInvalid"]}
   */
  messageInvalid: AriaProps["messageInvalid"]

  /**
   * CSS class for the input container.
   * @type {AriaProps["class"]}
   */
  classStyle: AriaProps["class"]

  // ---METHODS-----------------------
  /**
   * Clears the input field value and resets the invalid state.
   *
   * This method sets the input value to an empty string and emits
   * events to update the validation and value states.
   */
  clear(): void

  /**
   * Focuses the input field and sets the active state.
   *
   * @param {FocusEvent} env - The focus event object that triggered the focus action.
   *
   * Emits a `focus` event when the input field gains focus.
   */
  focus(env: FocusEvent): void

  /**
   * Removes focus from the input field and resets the active state.
   *
   * @param {FocusEvent} env - The blur event object that triggered the blur action.
   *
   * Emits a `blur` event when the input field loses focus.
   */
  blur(env: FocusEvent): void
}
export declare type AriaOption = Pick<
  AriaProps,
  "autocomplete" | "wrap" | "rows" | "maxLength" | "classInput" | keyof InputLayoutOption
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Aria: GlobalComponentConstructor<Aria>
  }
}

export default Aria

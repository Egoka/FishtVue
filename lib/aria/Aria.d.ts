import { Ref, type VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
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
   * @type {Ref<InputLayoutExpose | undefined>}
   */
  layout: Ref<InputLayoutExpose | undefined>

  /**
   * Reference to the input HTML element.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  inputRef: ReadRef<HTMLElement | undefined>

  // ---PROPS-------------------------
  /**
   * Current `id` value of the input field.
   * @type {ReadRef<AriaProps["id"]>}
   */
  id: ReadRef<AriaProps["id"]>

  /**
   * Current `modelValue` of the input field.
   * @type {ReadRef<AriaProps["modelValue"]>}
   */
  modelValue: ReadRef<AriaProps["modelValue"]>

  /**
   * Current `placeholder` of the input field.
   * @type {ReadRef<AriaProps["placeholder"]>}
   */
  placeholder: ReadRef<AriaProps["placeholder"]>

  /**
   * Current autocomplete setting for the input field.
   * @type {ReadRef<AriaProps["autocomplete"]>}
   */
  autocomplete: ReadRef<AriaProps["autocomplete"]>

  /**
   * Current wrapping behavior for the input field.
   * @type {ReadRef<AriaProps["wrap"]>}
   */
  wrap: ReadRef<AriaProps["wrap"]>

  /**
   * Current number of rows for the input field.
   * @type {ReadRef<AriaProps["rows"]>}
   */
  rows: ReadRef<AriaProps["rows"]>

  /**
   * Current maximum length for the input field.
   * @type {ReadRef<AriaProps["maxLength"]>}
   */
  maxLength: ReadRef<AriaProps["maxLength"]>

  /**
   * Indicates whether the input has a value.
   * @type {ReadRef<InputLayoutProps["isValue"]>}
   */
  isValue: ReadRef<InputLayoutProps["isValue"]>

  /**
   * Current mode of the input field.
   * @type {ReadRef<AriaProps["mode"]>}
   */
  mode: ReadRef<AriaProps["mode"]>

  /**
   * Indicates whether the input is disabled.
   * @type {ReadRef<AriaProps["disabled"]>}
   */
  isDisabled: ReadRef<AriaProps["disabled"]>

  /**
   * Indicates whether the input is in a loading state.
   * @type {ReadRef<AriaProps["loading"]>}
   */
  isLoading: ReadRef<AriaProps["loading"]>

  /**
   * Indicates whether the input is invalid.
   * @type {ReadRef<AriaProps["isInvalid"]>}
   */
  isInvalid: ReadRef<AriaProps["isInvalid"]>

  /**
   * The validation error message for the input field.
   * @type {ReadRef<AriaProps["messageInvalid"]>}
   */
  messageInvalid: ReadRef<AriaProps["messageInvalid"]>

  /**
   * CSS class for the input container.
   * @type {ReadRef<AriaProps["class"]>}
   */
  classStyle: ReadRef<AriaProps["class"]>

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

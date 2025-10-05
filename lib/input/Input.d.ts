import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"

/**
 * ## Input
 *
 * Input - a component for capturing user input with advanced features and customization options.
 *
 * Supports various input types, masks, validation, and event handling.
 */
declare class Input extends ClassComponent<InputProps, InputSlots, InputEmits, InputExpose> {}

/**
 * Base props for the Input component.
 */
export declare type BaseInputProps = {
  /**
   * The type of input field.
   * @type {"text" | "number" | "email" | "password"}
   */
  type: "text" | "number" | "email" | "password"

  /**
   * Automatically focuses the input field on mount.
   * @type {boolean}
   */
  autoFocus: boolean

  /**
   * Placeholder text for the input field.
   * @type {string}
   */
  placeholder: string

  /**
   * Autocomplete behavior for the input field.
   * @type {"on" | "off"}
   */
  autocomplete: "on" | "off"

  /**
   * Mask type for the input value.
   * @type {"phone" | "number" | "price" | string}
   */
  maskInput: "phone" | "number" | "price" | string

  /**
   * Maximum length for the integer part of the input value.
   * @type {number}
   */
  lengthInteger: number

  /**
   * Maximum length for the decimal part of the input value.
   * @type {number}
   */
  lengthDecimal: number

  /**
   * Custom CSS class for the input element.
   * @type {StyleClass}
   */
  classInput: StyleClass
}

/**
 * Props for the Input component.
 */
export interface InputProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseInputProps> {
  /**
   * Unique identifier for the input element.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The current value of the input field.
   * @type {string | number | null | undefined}
   */
  modelValue?: string | number | null | undefined
}

export declare type InputSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}

/**
 * Events emitted by the Input component.
 */
export declare type InputEmits = {
  /**
   * Emitted when the input is cleared.
   * @param event
   * @param {string} payload - The cleared value.
   */
  (event: "clear", payload: string): void

  /**
   * Emitted when the input gains focus.
   * @param event
   * @param {FocusEvent} eventFocus - The focus event.
   */
  (event: "focus", eventFocus: FocusEvent): void

  /**
   * Emitted when the input loses focus.
   * @param event
   * @param {FocusEvent} eventFocus - The blur event.
   */
  (event: "blur", eventFocus: FocusEvent): void

  /**
   * Emitted when the `modelValue` is updated.
   * @param event
   * @param {string} payload - The updated value.
   */
  (event: "update:modelValue", payload: string): void

  /**
   * Emitted when the `modelValue` changes.
   * @param event
   * @param {string} payload - The changed value.
   */
  (event: "change:modelValue", payload: string): void

  /**
   * Emitted when the invalid state of the input is updated.
   * @param event
   * @param {boolean} payload - Indicates whether the input is invalid.
   */
  (event: "update:isInvalid", payload: boolean): void

  /**
   * Emitted when the input becomes active.
   * @param event
   * @param {boolean} payload - Indicates the active state of the input.
   */
  (event: "isActive", payload: boolean): void
}

/**
 * Methods and states exposed via `ref` for the Input component.
 */
export declare type InputExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the input layout state.
   * @type {InputLayoutExpose | undefined}
   */
  layout: InputLayoutExpose | undefined

  /**
   * Indicates whether the input is active.
   * @type {boolean}
   */
  isActiveInput: boolean

  /**
   * Custom CSS class for the input layout.
   * @type {InputProps["class"]}
   */
  classLayout: InputProps["class"]

  // ---PROPS-------------------------------
  /**
   * Current `id` of the input field.
   * @type {InputProps["id"]}
   */
  id: InputProps["id"]

  /**
   * Current type of the input field.
   * @type {InputProps["type"]}
   */
  type: InputProps["type"]

  /**
   * Current mask type applied to the input field.
   * @type {InputProps["maskInput"]}
   */
  mask: InputProps["maskInput"]

  /**
   * Current value of the input field.
   * @type {InputProps["modelValue"]}
   */
  modelValue: InputProps["modelValue"]

  /**
   * Indicates whether autofocus is enabled.
   * @type {InputProps["autoFocus"]}
   */
  autoFocus: InputProps["autoFocus"]

  /**
   * Current placeholder text of the input field.
   * @type {InputProps["placeholder"]}
   */
  placeholder: InputProps["placeholder"]

  /**
   * Current autocomplete setting of the input field.
   * @type {InputProps["autocomplete"]}
   */
  autocomplete: InputProps["autocomplete"]

  /**
   * Maximum length for the integer part of the input value.
   * @type {InputProps["lengthInteger"]}
   */
  lengthInteger: InputProps["lengthInteger"]

  /**
   * Maximum length for the decimal part of the input value.
   * @type {InputProps["lengthDecimal"]}
   */
  lengthDecimal: InputProps["lengthDecimal"]

  /**
   * Indicates whether the input has a value.
   * @type {InputLayoutProps["isValue"]}
   */
  isValue: InputLayoutProps["isValue"]

  /**
   * Current mode of the input.
   * @type {InputProps["mode"]}
   */
  mode: InputProps["mode"]

  /**
   * Indicates whether the input is disabled.
   * @type {InputProps["disabled"]}
   */
  isDisabled: InputProps["disabled"]

  /**
   * Indicates whether the input is in a loading state.
   * @type {InputProps["loading"]}
   */
  isLoading: InputProps["loading"]

  /**
   * Indicates whether the input is invalid.
   * @type {InputProps["isInvalid"]}
   */
  isInvalid: InputProps["isInvalid"]

  /**
   * Validation error message for the input field.
   * @type {InputProps["messageInvalid"]}
   */
  messageInvalid: InputProps["messageInvalid"]

  /**
   * CSS class for the input base container.
   * @type {InputProps["class"]}
   */
  classBaseInput: InputProps["class"]

  // ---METHODS-----------------------------
  /**
   * Applies a mask to the input value.
   * @param {string | number} baseValue - The value to mask.
   * @returns {string} - The masked value.
   */
  toMask(baseValue: string | number): string

  /**
   * Updates the input's model value.
   * @param {any} valueResult - The value to set.
   */
  inputModelValue(valueResult: any): void

  /**
   * Changes the input's model value and triggers the associated event.
   * @param {any} valueResult - The new value to set.
   */
  changeModelValue(valueResult: any): void

  /**
   * Clears the input's value.
   */
  clear(): void

  /**
   * Focuses the input field.
   * @param {FocusEvent} eventFocus - The focus event.
   */
  focus(eventFocus: FocusEvent): void

  /**
   * Blurs the input field.
   * @param {FocusEvent} eventFocus - The blur event.
   */
  blur(eventFocus: FocusEvent): void
}
export declare type InputOption = Pick<InputProps, "classInput" | keyof InputLayoutOption>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Input: GlobalComponentConstructor<Input>
  }
}

export default Input

import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"

/**
 * ## Textarea
 *
 * Textarea - a component for managing accessible input fields with extended control options.
 *
 * Provides support for customizable input attributes, validation states, and event handling.
 */
declare class Textarea extends ClassComponent<TextareaProps, TextareaSlots, TextareaEmits, TextareaExpose> {}

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
 * Props for the Textarea component.
 */
export interface TextareaProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseAriaProps> {
  /**
   * The unique identifier for the input element.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The value of the input field.
   *
   * Narrowed in 2026-05-11: `number` removed — multi-line text doesn't accept numeric model.
   *
   * @type {string | null | undefined}
   */
  modelValue?: string | null | undefined
}

/**
 * Context provided to the `before` slot.
 */
export declare type TextareaBeforeSlotProps = {
  /** Whether the textarea is currently in an invalid state. */
  isInvalid: boolean
  /** Whether the textarea currently has focus. */
  isFocused: boolean
}

/**
 * Context provided to the `after` slot.
 */
export declare type TextareaAfterSlotProps = {
  /** Whether the textarea is currently in an invalid state. */
  isInvalid: boolean
  /** Whether the textarea currently has focus. */
  isFocused: boolean
  /** Clears the textarea value and resets the invalid state. */
  clear: () => void
}

export declare type TextareaSlots = {
  default(): VNode[]
  before(props: TextareaBeforeSlotProps): VNode[]
  after(props: TextareaAfterSlotProps): VNode[]
}
/**
 * Events emitted by the Textarea component.
 */
export declare type TextareaEmits = {
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
   * Emitted when the input value changes (native `change` event or `clear()`).
   *
   * Fixed in 2026-05-11: payload type was `boolean` by mistake — runtime always emits a string.
   *
   * @param event
   * @param {string} payload - The new textarea value (empty string on clear).
   */
  (event: "change:modelValue", payload: string): void

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
 * Methods and states exposed via `ref` for the Textarea component.
 */
export declare type TextareaExpose = {
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
   * @type {TextareaProps["id"]}
   */
  id: TextareaProps["id"]

  /**
   * Current `modelValue` of the input field.
   * @type {TextareaProps["modelValue"]}
   */
  modelValue: TextareaProps["modelValue"]

  /**
   * Current `placeholder` of the input field.
   * @type {TextareaProps["placeholder"]}
   */
  placeholder: TextareaProps["placeholder"]

  /**
   * Current autocomplete setting for the input field.
   * @type {TextareaProps["autocomplete"]}
   */
  autocomplete: TextareaProps["autocomplete"]

  /**
   * Current wrapping behavior for the input field.
   * @type {TextareaProps["wrap"]}
   */
  wrap: TextareaProps["wrap"]

  /**
   * Current number of rows for the input field.
   * @type {TextareaProps["rows"]}
   */
  rows: TextareaProps["rows"]

  /**
   * Current maximum length for the input field.
   * @type {TextareaProps["maxLength"]}
   */
  maxLength: TextareaProps["maxLength"]

  /**
   * Indicates whether the input has a value.
   * @type {InputLayoutProps["isValue"]}
   */
  isValue: InputLayoutProps["isValue"]

  /**
   * Current mode of the input field.
   * @type {TextareaProps["mode"]}
   */
  mode: TextareaProps["mode"]

  /**
   * Indicates whether the input is disabled.
   * @type {TextareaProps["disabled"]}
   */
  isDisabled: TextareaProps["disabled"]

  /**
   * Indicates whether the input is in a loading state.
   * @type {TextareaProps["loading"]}
   */
  isLoading: TextareaProps["loading"]

  /**
   * Indicates whether the input is invalid.
   * @type {TextareaProps["isInvalid"]}
   */
  isInvalid: TextareaProps["isInvalid"]

  /**
   * The validation error message for the input field.
   * @type {TextareaProps["messageInvalid"]}
   */
  messageInvalid: TextareaProps["messageInvalid"]

  /**
   * CSS class for the input container.
   * @type {TextareaProps["class"]}
   */
  classStyle: TextareaProps["class"]

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
export declare type TextareaOption = Pick<
  TextareaProps,
  "autocomplete" | "wrap" | "rows" | "maxLength" | "classInput" | keyof InputLayoutOption
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Textarea: GlobalComponentConstructor<Textarea>
  }
}

export default Textarea

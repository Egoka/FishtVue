import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass, StyleMode, THeight, TWidth } from "../types"
import { LabelMode } from "fishtvue/label"

/**
 * ## InputLayout
 *
 * InputLayout - a wrapper component for managing input fields with labels, validation, and additional features.
 *
 * Provides support for styling, accessibility, and state management for input elements.
 */
declare class InputLayout extends ClassComponent<
  InputLayoutProps,
  InputLayoutSlots,
  InputLayoutEmits,
  InputLayoutExpose
> {}

/**
 * Props for the InputLayout component.
 */
export declare type InputLayoutProps = {
  /**
   * The value of the input element within the layout.
   * @type {any}
   */
  value: any

  /**
   * Indicates whether the input has a value.
   * @type {boolean | undefined}
   */
  isValue?: boolean

  /**
   * Styling mode for the input layout.
   * @type {StyleMode | undefined}
   */
  mode?: StyleMode

  /**
   * The label text for the input.
   * @type {string | undefined}
   */
  label?: string

  /**
   * The mode for displaying the label.
   * @type {LabelMode | undefined}
   */
  labelMode?: LabelMode

  /**
   * Indicates whether the input is invalid.
   * @type {boolean | undefined}
   */
  isInvalid?: boolean

  /**
   * The validation error message for the input.
   * @type {string | undefined}
   */
  messageInvalid?: string

  /**
   * Marks the input as required.
   * @type {boolean | undefined}
   */
  required?: boolean

  /**
   * Indicates whether the input is in a loading state.
   * @type {boolean | undefined}
   */
  loading?: boolean

  /**
   * Disables the input field.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Additional help text displayed for the input.
   * @type {string | undefined}
   */
  help?: string

  /**
   * Enables a clear button for the input.
   * @type {boolean | undefined}
   */
  clear?: boolean

  /**
   * Width of the input layout.
   * @type {TWidth | undefined}
   */
  width?: TWidth

  /**
   * Height of the input layout.
   * @type {THeight | undefined}
   */
  height?: THeight

  /**
   * Animation type for transitions within the layout.
   * @type {"transition-all duration-500" | "transition-none" | string | undefined}
   */
  animation?: "transition-all duration-500" | "transition-none" | string

  /**
   * Custom CSS class for the body of the layout.
   * @type {StyleClass | "mb-6 rounded-md" | undefined}
   */
  classBody?: StyleClass | "mb-6 rounded-md"

  /**
   * Custom CSS class for the layout container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Vertical offset used by the layout for sticky-header awareness
   * (e.g. `scroll-margin-top` of the invalid input region).
   * Accepts a fixed number of pixels, a CSS string, or a getter function
   * (re-evaluated on mount). Replaces the previous hardcoded
   * `document.querySelector("header")` coupling — see [Issue 5](../../Documentation/issues/inputlayout.md).
   * @type {number | string | (() => number) | undefined}
   */
  offsetTop?: number | string | (() => number)
}

export declare type InputLayoutSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
  body(): VNode[]
  /**
   * Override slot for the help-tooltip content. When provided, replaces the
   * text-only fallback rendered from the `help` prop. The slot exists to allow
   * rich, but caller-sanitized, content without forcing the library to use
   * `v-html` (XSS-safe by default). See [Issue 1](../../Documentation/issues/inputlayout.md).
   */
  help(): VNode[]
  /**
   * Override slot for the validation-error tooltip content. When provided,
   * replaces the text-only fallback rendered from the `messageInvalid` prop.
   * Same XSS-safe contract as the `help` slot.
   */
  messageInvalid(): VNode[]
}

/**
 * Events emitted by the InputLayout component.
 */
export declare type InputLayoutEmits = {
  /**
   * Emitted when the clear button is clicked.
   */
  (event: "clear"): void
}

/**
 * Methods and states exposed via `ref` for the InputLayout component.
 */
export declare type InputLayoutExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the input element within the layout.
   * @type {HTMLElement | undefined}
   */
  input: HTMLElement | undefined

  /**
   * Reference to the input body container.
   * @type {HTMLElement | undefined}
   */
  inputBody: HTMLElement | undefined

  /**
   * Reference to the element before the input.
   * @type {HTMLElement | undefined}*/
  beforeInput: HTMLElement | undefined
  /**
   * Reference to the element after the input.
   * @type {HTMLElement | undefined}
   */
  afterInput: HTMLElement | undefined

  /**
   * The height of the header in the layout.
   * @type {number}
   */
  headerHeight: number

  /**
   * Indicates whether the input value is copied.
   * @type {boolean}
   */
  isCopy: boolean

  /**
   * The width of the element before the input.
   * @type {number | null}
   */
  beforeWidth: number | null

  /**
   * The width of the element after the input.
   * @type {number | null}
   */
  afterWidth: number | null

  // ---PROPS-------------------------
  /**
   * The current value of the input.
   * @type {InputLayoutProps["value"]}
   */
  value: InputLayoutProps["value"]

  /**
   * Indicates whether the input has a value.
   * @type {InputLayoutProps["isValue"]}
   */
  isValue: InputLayoutProps["isValue"]

  /**
   * The current styling mode of the input layout.
   * @type {InputLayoutProps["mode"]}
   */
  mode: InputLayoutProps["mode"]

  /**
   * The current label text for the input.
   * @type {InputLayoutProps["label"]}
   */
  label: InputLayoutProps["label"]

  /**
   * The current label display mode.
   * @type {InputLayoutProps["labelMode"]}
   */
  labelMode: InputLayoutProps["labelMode"]
  /**
   * The type of label display mode currently applied to the input layout.
   * Derived from the `labelMode` prop.
   * @type {InputLayoutProps["labelMode"]}
   */
  labelType: InputLayoutProps["labelMode"]

  /**
   * Indicates whether the input is required.
   * @type {InputLayoutProps["required"]}
   */
  isRequired: InputLayoutProps["required"]

  /**
   * Indicates whether the input is in a loading state.
   * @type {InputLayoutProps["loading"]}
   */
  isLoading: InputLayoutProps["loading"]

  /**
   * Indicates whether the input is disabled.
   * @type {InputLayoutProps["disabled"]}
   */
  isDisabled: InputLayoutProps["disabled"]

  /**
   * Indicates whether the input is invalid.
   * @type {InputLayoutProps["isInvalid"]}
   */
  isInvalid: InputLayoutProps["isInvalid"]

  /**
   * The validation error message for the input.
   * @type {InputLayoutProps["messageInvalid"]}
   */
  messageInvalid: InputLayoutProps["messageInvalid"]

  /**
   * The help text for the input.
   * @type {InputLayoutProps["help"]}
   */
  help: InputLayoutProps["help"]

  /**
   * The width of the input layout.
   * @type {InputLayoutProps["width"]}
   */
  width: InputLayoutProps["width"]

  /**
   * The height of the input layout.
   * @type {InputLayoutProps["height"]}
   */
  height: InputLayoutProps["height"]

  /**
   * The animation applied to the layout.
   * @type {InputLayoutProps["animation"]}
   */
  animation: InputLayoutProps["animation"]

  /**
   * Custom CSS class for the layout container.
   * @type {InputLayoutProps["class"]}
   */
  class: InputLayoutProps["class"]

  /**
   * Custom CSS class for the body of the layout.
   * @type {InputLayoutProps["classBody"]}
   */
  classBody: InputLayoutProps["classBody"]

  // ---METHODS-----------------------
  /**
   * Copies the current value of the input to the clipboard.
   */
  copy(): void
}
export declare type InputLayoutOption = Pick<
  InputLayoutProps,
  "mode" | "labelMode" | "clear" | "width" | "height" | "animation" | "classBody" | "class" | "offsetTop"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    InputLayout: GlobalComponentConstructor<InputLayout>
  }
}

export default InputLayout

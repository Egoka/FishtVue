import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleMode, TWidth, THeight, StyleClass, ReadRef } from "../types"
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
}

export declare type InputLayoutSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
  body(): VNode[]
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
   * @type {ReadRef<HTMLElement | undefined>}
   */
  input: ReadRef<HTMLElement | undefined>

  /**
   * Reference to the input body container.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  inputBody: ReadRef<HTMLElement | undefined>

  /**
   * Reference to the element before the input.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  beforeInput: ReadRef<HTMLElement | undefined>

  /**
   * Reference to the element after the input.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  afterInput: ReadRef<HTMLElement | undefined>

  /**
   * The height of the header in the layout.
   * @type {ReadRef<number>}
   */
  headerHeight: ReadRef<number>

  /**
   * Indicates whether the input value is copied.
   * @type {ReadRef<boolean>}
   */
  isCopy: ReadRef<boolean>

  /**
   * The width of the element before the input.
   * @type {ReadRef<number | null>}
   */
  beforeWidth: ReadRef<number | null>

  /**
   * The width of the element after the input.
   * @type {ReadRef<number | null>}
   */
  afterWidth: ReadRef<number | null>

  // ---PROPS-------------------------
  /**
   * The current value of the input.
   * @type {ReadRef<InputLayoutProps["value"]>}
   */
  value: ReadRef<InputLayoutProps["value"]>

  /**
   * Indicates whether the input has a value.
   * @type {ReadRef<InputLayoutProps["isValue"]>}
   */
  isValue: ReadRef<InputLayoutProps["isValue"]>

  /**
   * The current styling mode of the input layout.
   * @type {ReadRef<InputLayoutProps["mode"]>}
   */
  mode: ReadRef<InputLayoutProps["mode"]>

  /**
   * The current label text for the input.
   * @type {ReadRef<InputLayoutProps["label"]>}
   */
  label: ReadRef<InputLayoutProps["label"]>

  /**
   * The current label display mode.
   * @type {ReadRef<InputLayoutProps["labelMode"]>}
   */
  labelMode: ReadRef<InputLayoutProps["labelMode"]>
  /**
   * The type of label display mode currently applied to the input layout.
   * Derived from the `labelMode` prop.
   * @type {ReadRef<InputLayoutProps["labelMode"]>}
   */
  labelType: ReadRef<InputLayoutProps["labelMode"]>

  /**
   * Indicates whether the input is required.
   * @type {ReadRef<InputLayoutProps["required"]>}
   */
  isRequired: ReadRef<InputLayoutProps["required"]>

  /**
   * Indicates whether the input is in a loading state.
   * @type {ReadRef<InputLayoutProps["loading"]>}
   */
  isLoading: ReadRef<InputLayoutProps["loading"]>

  /**
   * Indicates whether the input is disabled.
   * @type {ReadRef<InputLayoutProps["disabled"]>}
   */
  isDisabled: ReadRef<InputLayoutProps["disabled"]>

  /**
   * Indicates whether the input is invalid.
   * @type {ReadRef<InputLayoutProps["isInvalid"]>}
   */
  isInvalid: ReadRef<InputLayoutProps["isInvalid"]>

  /**
   * The validation error message for the input.
   * @type {ReadRef<InputLayoutProps["messageInvalid"]>}
   */
  messageInvalid: ReadRef<InputLayoutProps["messageInvalid"]>

  /**
   * The help text for the input.
   * @type {ReadRef<InputLayoutProps["help"]>}
   */
  help: ReadRef<InputLayoutProps["help"]>

  /**
   * The width of the input layout.
   * @type {ReadRef<InputLayoutProps["width"]>}
   */
  width: ReadRef<InputLayoutProps["width"]>

  /**
   * The height of the input layout.
   * @type {ReadRef<InputLayoutProps["height"]>}
   */
  height: ReadRef<InputLayoutProps["height"]>

  /**
   * The animation applied to the layout.
   * @type {ReadRef<InputLayoutProps["animation"]>}
   */
  animation: ReadRef<InputLayoutProps["animation"]>

  /**
   * Custom CSS class for the layout container.
   * @type {ReadRef<InputLayoutProps["class"]>}
   */
  class: ReadRef<InputLayoutProps["class"]>

  /**
   * Custom CSS class for the body of the layout.
   * @type {ReadRef<InputLayoutProps["classBody"]>}
   */
  classBody: ReadRef<InputLayoutProps["classBody"]>

  // ---METHODS-----------------------
  /**
   * Copies the current value of the input to the clipboard.
   */
  copy(): void
}
export declare type InputLayoutOption = Pick<
  InputLayoutProps,
  "mode" | "labelMode" | "clear" | "animation" | "classBody" | "class"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    InputLayout: GlobalComponentConstructor<InputLayout>
  }
}

export default InputLayout

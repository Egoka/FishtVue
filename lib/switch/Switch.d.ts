import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass, StyleMode } from "../types"
import { IconsProps } from "fishtvue/icons"

/**
 * ## Switch
 *
 * Switch - a component for toggling between two states (on/off).
 *
 * Supports customization of styles, icons, labels, and switching mechanisms.
 */
declare class Switch extends ClassComponent<SwitchProps, SwitchSlots, SwitchEmits, SwitchExpose> {}

// ---------------------------------------
type SwitchMode = StyleMode | "none" | string
/**
 * Base props for the Switch component.
 */
export declare type BaseSwitchProps = {
  /**
   * The styling mode of the switch.
   * @type {SwitchMode}
   */
  mode: SwitchMode

  /**
   * Rounding of the switch corners.
   * @type {1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number | "full"}
   */
  rounded: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number | "full"

  /**
   * Icon displayed when the switch is active.
   * @type {IconsProps["type"]}
   */
  iconActive: IconsProps["type"]

  /**
   * Icon displayed when the switch is inactive.
   * @type {IconsProps["type"]}
   */
  iconInactive: IconsProps["type"]

  /**
   * The type of switching mechanism (`checkbox` or `switch`).
   * @type {"checkbox" | "switch" | string}
   */
  switchingType: "checkbox" | "switch" | string
}

/**
 * Props for the Switch component.
 */
export interface SwitchProps extends Partial<BaseSwitchProps> {
  /**
   * Unique identifier for the switch component.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The current value of the switch.
   * @type {boolean | null | undefined}
   */
  modelValue?: boolean | null | undefined

  /**
   * The label displayed next to the switch.
   * @type {string | undefined}
   */
  label?: string

  /**
   * Disables the switch if set to `true`.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Help text displayed below the switch.
   * @type {string | undefined}
   */
  help?: string

  /**
   * Indicates whether the switch is required.
   * @type {boolean | undefined}
   */
  required?: boolean

  /**
   * Custom CSS class for the switch container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
}

export declare type SwitchSlots = {
  default(): VNode[]
}

/**
 * Events emitted by the Switch component.
 */
export declare type SwitchEmits = {
  /**
   * Emitted when the `modelValue` is updated.
   @param event
   * @param {boolean} payload - The updated value of the switch.
   */
  (event: "update:modelValue", payload: boolean): void

  /**
   * Alias for `update:modelValue` event.
   @param event
   * @param {boolean} payload - The updated value of the switch.
   */
  (event: "updateModelValue", payload: boolean): void

  /**
   * Emitted when the value of the switch changes.
   @param event
   * @param {boolean} payload - The new value of the switch.
   */
  (event: "change:modelValue", payload: boolean): void
}

/**
 * Methods and states exposed via `ref` for the Switch component.
 */
export declare type SwitchExpose = {
  // ---PROPS-------------------------------
  /**
   * Unique identifier for the switch component.
   * @type {ReadRef<SwitchProps["id"]>}
   */
  id: ReadRef<SwitchProps["id"]>

  /**
   * The current styling mode of the switch.
   * @type {ReadRef<SwitchProps["mode"]>}
   */
  mode: ReadRef<SwitchProps["mode"]>

  /**
   * The label displayed next to the switch.
   * @type {ReadRef<SwitchProps["label"]>}
   */
  label: ReadRef<SwitchProps["label"]>

  /**
   * The rounding of the switch corners.
   * @type {ReadRef<SwitchProps["rounded"]>}
   */
  rounded: ReadRef<SwitchProps["rounded"]>

  /**
   * Indicates whether the switch is disabled.
   * @type {ReadRef<SwitchProps["disabled"]>}
   */
  isDisabled: ReadRef<SwitchProps["disabled"]>

  /**
   * Indicates whether the switch is required.
   * @type {ReadRef<SwitchProps["required"]>}
   */
  isRequired: ReadRef<SwitchProps["required"]>

  /**
   * The icon displayed when the switch is active.
   * @type {ReadRef<SwitchProps["iconActive"]>}
   */
  iconActive: ReadRef<SwitchProps["iconActive"]>

  /**
   * The icon displayed when the switch is inactive.
   * @type {ReadRef<SwitchProps["iconInactive"]>}
   */
  iconInactive: ReadRef<SwitchProps["iconInactive"]>

  /**
   * The type of switching mechanism (`checkbox` or `switch`).
   * @type {ReadRef<SwitchProps["switchingType"]>}
   */
  switchingType: ReadRef<SwitchProps["switchingType"]>

  /**
   * Custom CSS class for the base switch container.
   * @type {ReadRef<StyleClass>}
   */
  classBaseSwitch: ReadRef<StyleClass>

  /**
   * Custom CSS class for the switch element.
   * @type {ReadRef<StyleClass>}
   */
  classSwitch: ReadRef<StyleClass>

  // ---METHODS-----------------------------
  /**
   * Handles input events for toggling the switch.
   * @param {boolean} value - The new value of the switch.
   */
  inputEvent(value: boolean): void
}

export declare type SwitchOption = Pick<
  SwitchProps,
  "mode" | "rounded" | "iconActive" | "iconInactive" | "switchingType" | "class"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Switch: GlobalComponentConstructor<Switch>
  }
}

export default Switch

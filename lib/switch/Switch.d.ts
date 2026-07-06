import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass, StyleMode } from "../types"
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
type SwitchMode = StyleMode | "none"
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
   * @type {"checkbox" | "switch"}
   */
  switchingType: "checkbox" | "switch"
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
  /**
   * Default slot — альтернатива `label` prop'у, произвольный контент рядом со switch.
   */
  default(): VNode[]
  /**
   * Optional slot для кастомизации help-tooltip контента. Имеет приоритет над `help: string`
   * (тот рендерится как fallback). Slot — рекомендуемый способ передачи rich HTML,
   * `help` prop остаётся text-only для XSS safety.
   */
  help?(): VNode[]
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
  // ---STATE-------------------------------
  /**
   * Indicates whether the switch is currently focused/active.
   * @type {boolean}
   */
  isActiveSwitch: boolean

  // ---PROPS-------------------------------
  /**
   * Unique identifier for the switch component.
   * @type {SwitchProps["id"]}
   */
  id: SwitchProps["id"]

  /**
   * The current styling mode of the switch.
   * @type {SwitchProps["mode"]}
   */
  mode: SwitchProps["mode"]

  /**
   * The label displayed next to the switch.
   * @type {SwitchProps["label"]}
   */
  label: SwitchProps["label"]

  /**
   * The rounding of the switch corners.
   * @type {SwitchProps["rounded"]}
   */
  rounded: SwitchProps["rounded"]

  /**
   * Indicates whether the switch is disabled.
   * @type {SwitchProps["disabled"]}
   */
  isDisabled: SwitchProps["disabled"]

  /**
   * Indicates whether the switch is required.
   * @type {SwitchProps["required"]}
   */
  isRequired: SwitchProps["required"]

  /**
   * The icon displayed when the switch is active.
   * @type {SwitchProps["iconActive"]}
   */
  iconActive: SwitchProps["iconActive"]

  /**
   * The icon displayed when the switch is inactive.
   * @type {SwitchProps["iconInactive"]}
   */
  iconInactive: SwitchProps["iconInactive"]

  /**
   * The type of switching mechanism (`checkbox` or `switch`).
   * @type {SwitchProps["switchingType"]}
   */
  switchingType: SwitchProps["switchingType"]

  /**
   * Custom CSS class for the base switch container.
   * @type {StyleClass}
   */
  classBaseSwitch: StyleClass

  /**
   * Custom CSS class for the switch element.
   * @type {StyleClass}
   */
  classSwitch: StyleClass

  // ---REFS--------------------------------
  /**
   * Template ref на native control: `<button role="switch">` в switch-режиме,
   * `<input type="checkbox">` в checkbox-режиме. Используй для programmatic-доступа
   * к DOM (focus, scrollIntoView и т.д.).
   * @type {Ref<HTMLElement | undefined>}
   */
  inputRef: Ref<HTMLElement | undefined>

  // ---METHODS-----------------------------
  /**
   * Handles input events for toggling the switch.
   * @param {boolean} value - The new value of the switch.
   */
  inputEvent(value: boolean): void

  /**
   * Программно фокусирует native control. Принимает опциональный `FocusOptions`
   * (например, `{ preventScroll: true }`).
   * @param {FocusOptions} [options] - Native FocusOptions.
   */
  focus(options?: FocusOptions): void

  /**
   * Программно убирает фокус с native control.
   */
  blur(): void
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

import { CSSProperties, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass, Size, PositionShort, ReadRef } from "../types"

/**
 * ## Alert
 *
 * Alert - a component for displaying messages to the user.
 *
 * Provides support for various alert types, customizable styles, and flexible display configurations.
 */
declare class Alert extends ClassComponent<AlertProps, AlertSlots, AlertEmits, AlertExpose> {}

// ---------------------------------------
export declare type BaseAlert = {
  /**
   * Controls the visibility of the alert.
   * @type {boolean | undefined}
   */
  modelValue?: boolean

  /**
   * Type of the alert message.
   * @type {"success" | "warning" | "info" | "error" | "neutral" | undefined}
   */
  type?: "success" | "warning" | "info" | "error" | "neutral"

  /**
   * Position of the alert on the screen.
   * @type {PositionShort | undefined}
   */
  position?: PositionShort

  /**
   * Size of the alert.
   * @type {Size | undefined}
   */
  size?: Size

  /**
   * The title of the alert.
   * @type {string | undefined}
   */
  title?: string

  /**
   * The subtitle of the alert.
   * @type {string | undefined}
   */
  subtitle?: string

  /**
   * Selector for teleporting the alert to a specific container.
   * @type {string | undefined}
   */
  toTeleport?: string

  /**
   * Custom CSS class for the alert.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom inline styles for the alert.
   * @type {CSSProperties | undefined}
   */
  style?: CSSProperties

  /**
   * Duration for which the alert is displayed (in milliseconds).
   * @type {string | number | 1000 | 2000 | 3000 | 4000 | 5000 | undefined}
   */
  displayTime?: string | number | 1000 | 2000 | 3000 | 4000 | 5000

  /**
   * Disables animations for the alert.
   * @type {boolean | undefined}
   */
  notAnimate?: boolean

  /**
   * Enables the close button for the alert.
   * @type {boolean | undefined}
   */
  closeButton?: boolean
}

/**
 * Props for the Alert component.
 */
export interface AlertProps extends Omit<BaseAlert, "position" | "toTeleport"> {
  /**
   * Position of the alert on the screen.
   * @type {"top" | "bottom" | "left" | "right" | "center" | undefined}
   */
  position?: "top" | "bottom" | "left" | "right" | "center"
}

export declare type AlertSlots = {
  default(): VNode[]
}

/**
 * Events emitted by the Alert component.
 */
export declare type AlertEmits = {
  /**
   * Emitted when the `modelValue` prop is updated.
   * @param event
   * @param {boolean} payload - The new visibility state of the alert.
   */
  (event: "update:modelValue", payload: boolean): void
}
export declare type AlertExpose = {
  // ---STATE-------------------------
  /**
   * Current visibility state of the alert.
   * @type {ReadRef<boolean>}
   */
  isVisible: ReadRef<boolean>

  // ---PROPS-------------------------
  /**
   * Current type of the alert.
   * @type {ReadRef<NonNullable<AlertProps["type"]>>}
   */
  type: ReadRef<NonNullable<AlertProps["type"]>>

  /**
   * Current title of the alert.
   * @type {ReadRef<NonNullable<AlertProps["title"]>>}
   */
  title: ReadRef<NonNullable<AlertProps["title"]>>

  /**
   * Current subtitle of the alert.
   * @type {ReadRef<NonNullable<AlertProps["subtitle"]>>}
   */
  subtitle: ReadRef<NonNullable<AlertProps["subtitle"]>>

  /**
   * Current display duration of the alert (in milliseconds).
   * @type {ReadRef<number>}
   */
  displayTime: ReadRef<number>

  /**
   * Indicates if the close button is enabled.
   * @type {ReadRef<NonNullable<AlertProps["closeButton"]>>}
   */
  isCloseButton: ReadRef<NonNullable<AlertProps["closeButton"]>>

  /**
   * Current position of the alert.
   * @type {ReadRef<NonNullable<AlertProps["position"]>>}
   */
  position: ReadRef<NonNullable<AlertProps["position"]>>

  /**
   * CSS classes for various parts of the alert.
   * @type {ReadRef<Record<"body" | "icon" | "title" | "subtitle" | "button" | "buttonIcon", StyleClass>>}
   */
  classesStyle: ReadRef<Record<"body" | "icon" | "title" | "subtitle" | "button" | "buttonIcon", StyleClass>>

  /**
   * Current size of the alert.
   * @type {ReadRef<StyleClass>}
   */
  size: ReadRef<StyleClass>

  /**
   * Base CSS class for the alert.
   * @type {ReadRef<StyleClass>}
   */
  classBase: ReadRef<StyleClass>

  // ---METHODS-----------------------
  /**
   * Closes the alert.
   */
  close(): void
}
export declare type AlertOption = Pick<
  AlertProps & { toTeleport?: string },
  "type" | "position" | "size" | "class" | "style" | "displayTime" | "notAnimate" | "toTeleport" | "closeButton"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Alert: GlobalComponentConstructor<Alert>
  }
}

export default Alert

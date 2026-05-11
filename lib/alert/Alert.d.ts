import { CSSProperties, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, PositionShort, Size, StyleClass } from "../types"

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
  /**
   * Custom rendering for the alert subtitle. Fallback — `subtitle` prop as plain text.
   *
   * Use this slot when richer markup is required. Native HTML in `subtitle` prop is
   * intentionally rendered as text (XSS guard) — supply your own markup through this slot.
   */
  subtitle(): VNode[]
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
   * @type {boolean}
   */
  isVisible: boolean

  // ---PROPS-------------------------
  /**
   * Current type of the alert.
   * @type {AlertProps["type"]}
   */
  type: AlertProps["type"]

  /**
   * Current title of the alert.
   * @type {AlertProps["title"]}
   */
  title: AlertProps["title"]

  /**
   * Current subtitle of the alert.
   * @type {AlertProps["subtitle"]}
   */
  subtitle: AlertProps["subtitle"]

  /**
   * Current display duration of the alert (in milliseconds).
   * @type {number}
   */
  displayTime: number

  /**
   * Indicates if the close button is enabled.
   * @type {AlertProps["closeButton"]}
   */
  isCloseButton: AlertProps["closeButton"]

  /**
   * Current position of the alert.
   * @type {AlertProps["position"]}
   */
  position: AlertProps["position"]

  /**
   * CSS classes for various parts of the alert.
   * @type {Record<"body" | "icon" | "title" | "subtitle" | "button" | "buttonIcon", StyleClass>}
   */
  classesStyle: Record<"body" | "icon" | "title" | "subtitle" | "button" | "buttonIcon", StyleClass>

  /**
   * Current size of the alert.
   * @type {StyleClass}
   */
  size: StyleClass

  /**
   * Base CSS class for the alert.
   * @type {StyleClass}
   */
  classBase: StyleClass

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

export function openAlert(optionsAlert: BaseAlert): void

export default Alert

import { CSSProperties, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, Size, StyleClass } from "../types"

/**
 * Logical, RTL-safe position values for the alert.
 *
 * `start`/`end` — логические стороны (`start` = слева в LTR, справа в RTL).
 * Физические `left`/`right`/`top-left`/… — deprecated алиасы, мапятся на logical
 * (`left → start`, `right → end`) с dev-warning. Используй logical-значения для RTL-корректности.
 */
export declare type AlertPosition =
  | "top"
  | "bottom"
  | "center"
  | "start"
  | "end"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end"
  /** @deprecated физический алиас — используй logical `start` (RTL-safe) */
  | "left"
  /** @deprecated физический алиас — используй logical `end` (RTL-safe) */
  | "right"
  /** @deprecated физический алиас — используй logical `top-start` (RTL-safe) */
  | "top-left"
  /** @deprecated физический алиас — используй logical `top-end` (RTL-safe) */
  | "top-right"
  /** @deprecated физический алиас — используй logical `bottom-start` (RTL-safe) */
  | "bottom-left"
  /** @deprecated физический алиас — используй logical `bottom-end` (RTL-safe) */
  | "bottom-right"

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
   * Position of the alert on the screen (logical, RTL-safe).
   * @type {AlertPosition | undefined}
   */
  position?: AlertPosition

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
   * Position of the alert on the screen (logical, RTL-safe).
   *
   * Logical `start`/`end` зеркалятся в RTL. Физические `left`/`right` — deprecated алиасы
   * (`left → start`, `right → end`) с dev-warning.
   * @type {"top" | "bottom" | "center" | "start" | "end" | "left" | "right" | undefined}
   */
  position?: "top" | "bottom" | "center" | "start" | "end" | "left" | "right"
}

export declare type AlertSlots = {
  default(): VNode[]
  /**
   * Custom rendering for the alert subtitle. Fallback — `subtitle` prop rendered as
   * **sanitized HTML** (best-effort sanitizer: strips `<script>`/`on*`/`javascript:` etc.).
   *
   * Use this slot for full control over rich markup, or when the content is untrusted and
   * needs a stronger sanitizer (e.g. DOMPurify) than the built-in best-effort one.
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
   * Current position of the alert (raw, как передано в prop/option).
   * @type {AlertProps["position"]}
   */
  position: AlertProps["position"]

  /**
   * Logical (RTL-safe) позиция: физические `left`/`right` нормализованы в `start`/`end`.
   * @type {"top" | "bottom" | "center" | "start" | "end" | "top-start" | "top-end" | "bottom-start" | "bottom-end"}
   */
  positionLogical: string

  /**
   * Off-screen transition-класс (enter-from / leave-to). Для logical `start`/`end`
   * содержит `rtl:`-флип translate-направления.
   * @type {string}
   */
  startEnterAndLeaveClass: string

  /**
   * On-screen transition-класс (enter-to / leave-from).
   * @type {string}
   */
  endEnterAndLeaveClass: string

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

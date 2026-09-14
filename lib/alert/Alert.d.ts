import { CSSProperties, VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor, Size, StyleClass, TeleportTarget } from "../types"

/**
 * Logical, RTL-safe position values for the alert.
 *
 * `start`/`end` — логические стороны (`start` = слева в LTR, справа в RTL).
 * Физические `left`/`right`/`top-left`/… сняты в major 2026-09-06 (решение R7) — они не были
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

/**
 * ## Alert
 *
 * Alert - a component for displaying messages to the user.
 *
 * Provides support for various alert types, customizable styles, and flexible display configurations.
 */
declare class Alert extends ClassComponent<AlertProps, AlertSlots, AlertEmits, AlertExpose> {}

/**
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-alert>` (добавляется `ClassesMap`).
 * - `body` — карточка алерта `[data-alert-body]` (бывший инвертированный `class`).
 * - `icon` — контейнер иконки типа `[data-alert-icon]`.
 * - `content` — колонка текста `[data-alert-content]`.
 * - `title` / `subtitle` — `[data-alert-title]` / `[data-alert-subtitle]`.
 * - `close` — обёртка close-кнопки `[data-alert-button]`.
 */
export declare type AlertClassKey = "body" | "icon" | "content" | "title" | "subtitle" | "close"

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
   * Контейнер, в который `openAlert` монтирует стек алертов. `false` — `document.body`.
   * @type {TeleportTarget | undefined}
   */
  teleport?: TeleportTarget

  /**
   * CSS-классы корня `<div data-alert>` (dev-patterns §2 A). До 1.0.0 адресовал карточку —
   * теперь она доступна через `classes.body`.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов: `body`, `icon`, `content`, `title`, `subtitle`, `close`;
   * `root` ≡ `class`. См. `AlertClassKey`.
   * @type {ClassesMap<AlertClassKey> | undefined}
   */
  classes?: ClassesMap<AlertClassKey>

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
   * Анимировать появление/скрытие. Bare-positive инверсия снятого `notAnimate`
   * (dev-patterns §2 F): default перевёрнут в `true`.
   * @type {boolean | undefined}
   */
  animated?: boolean

  /**
   * Enables the close button for the alert.
   * @type {boolean | undefined}
   */
  closeButton?: boolean
}

/**
 * Props for the Alert component.
 */
export interface AlertProps extends Omit<BaseAlert, "position"> {
  /**
   * Position of the alert on the screen (logical, RTL-safe).
   *
   * Logical `start`/`end` зеркалятся в RTL. Физические `left`/`right` сняты (решение R7)
   * (`left → start`, `right → end`) с dev-warning.
   * @type {"top" | "bottom" | "center" | "start" | "end" | undefined}
   */
  position?: "top" | "bottom" | "center" | "start" | "end"
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
   * Итоговый класс корня `<div data-alert>` (база + `class`/`classes.root`).
   * @type {StyleClass}
   */
  classBase: StyleClass

  /**
   * Итоговый класс карточки `[data-alert-body]` (база + type + size + `classes.body`).
   * @type {StyleClass}
   */
  classBody: StyleClass

  // ---METHODS-----------------------
  /**
   * Closes the alert.
   */
  close(): void
}
export declare type AlertOption = Pick<
  AlertProps,
  "type" | "position" | "size" | "class" | "classes" | "style" | "displayTime" | "animated" | "teleport" | "closeButton"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Alert: GlobalComponentConstructor<Alert>
  }
}

export function openAlert(optionsAlert: BaseAlert): void

export default Alert

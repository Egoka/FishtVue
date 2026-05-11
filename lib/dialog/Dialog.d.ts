import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, PositionShort, Size, StyleClass } from "../types"

/**
 * ## Dialog
 *
 * Dialog - a component for displaying modal dialogs with customizable styles and behavior.
 *
 * Supports flexible positioning, animations, and options for closing the dialog.
 */
declare class Dialog extends ClassComponent<DialogProps, DialogSlots, DialogEmits, DialogExpose> {}

/**
 * Props for the Dialog component.
 */
export declare type DialogProps = {
  /**
   * Controls the visibility of the dialog.
   * @type {boolean}
   */
  modelValue: boolean

  /**
   * The size of the dialog.
   * @type {Size | undefined}
   */
  size?: Size

  /**
   * The position of the dialog on the screen.
   * @type {PositionShort | undefined}
   */
  position?: PositionShort

  /**
   * Disables animations for the dialog.
   * @type {boolean | undefined}
   */
  notAnimate?: boolean

  /**
   * Enables a close button inside the dialog.
   * @type {boolean | undefined}
   */
  closeButton?: boolean

  /**
   * Removes the default margin inside the dialog.
   * @type {boolean | undefined}
   */
  withoutMargin?: boolean

  /**
   * Prevents closing the dialog when clicking the background.
   * @type {boolean | undefined}
   */
  notCloseBackground?: boolean

  /**
   * Specifies the target element to teleport the dialog.
   * @type {string | undefined}
   */
  toTeleport?: string

  /**
   * Custom CSS class for the dialog container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom CSS class for the dialog body.
   * @type {StyleClass | undefined}
   */
  classBody?: StyleClass

  /**
   * Accessible label для корневого элемента dialog. Используется, когда нет
   * заголовка, к которому можно привязать `aria-labelledby`. Не комбинируется
   * с `ariaLabelledby` — `aria-labelledby` имеет приоритет в браузерах.
   * @type {string | undefined}
   */
  ariaLabel?: string

  /**
   * ID элемента-заголовка для связки через `aria-labelledby`. Потребитель
   * должен сам выставить этот id на узел title внутри default slot.
   * @type {string | undefined}
   */
  ariaLabelledby?: string

  /**
   * ID элемента-описания для связки через `aria-describedby`. Потребитель
   * должен сам выставить этот id на узел description внутри default slot.
   * @type {string | undefined}
   */
  ariaDescribedby?: string

  /**
   * CSS-селектор внутри dialog для автофокуса при open. По умолчанию — первый
   * focusable элемент. Полезно для confirmation-dialog'ов, где Cancel
   * должен быть выбран по умолчанию.
   * @type {string | undefined}
   */
  initialFocus?: string

  /**
   * Возвращать ли focus на trigger element (тот, что был активен до open)
   * при close. По умолчанию `true`. Установи `false` для programmatic-flow,
   * где focus управляется снаружи.
   * @type {boolean | undefined}
   */
  returnFocus?: boolean
}

export declare type DialogSlots = {
  default(args: { closeDialog(): void }): VNode[]
  background(): VNode[]
}

/**
 * Events emitted by the Dialog component.
 */
export declare type DialogEmits = {
  /**
   * Emitted when the `modelValue` is updated.
   * @param event
   * @param {boolean} payload - The new visibility state of the dialog.
   */
  (event: "update:modelValue", payload: boolean): void
}

/**
 * Methods and states exposed via `ref` for the Dialog component.
 */
export declare type DialogExpose = {
  // ---PROPS-------------------------
  /**
   * The teleport target for the dialog.
   * @type {DialogProps["toTeleport"]}
   */
  toTeleport: DialogProps["toTeleport"]

  /**
   * Indicates whether the dialog is open.
   * @type {boolean}
   */
  isOpen: boolean

  /**
   * Current size of the dialog.
   * @type {string}
   */
  size: string

  /**
   * Indicates whether the close button is enabled.
   * @type {DialogProps["closeButton"]}
   */
  isCloseButton: DialogProps["closeButton"]

  /**
   * Indicates whether the background click closes the dialog.
   * @type {DialogProps["notCloseBackground"]}
   */
  notCloseBackground: DialogProps["notCloseBackground"]

  /**
   * Indicates whether the dialog has margins removed.
   * @type {DialogProps["withoutMargin"]}
   */
  withoutMargin: DialogProps["withoutMargin"]

  /**
   * Current position of the dialog.
   * @type {NonNullable<DialogProps["position"]>}
   */
  position: NonNullable<DialogProps["position"]>

  /**
   * CSS class for the body of the dialog.
   * @type {DialogProps["class"]}
   */
  classBodyDialog: DialogProps["class"]

  /**
   * CSS class for the dialog's position styling.
   * @type {StyleClass}
   */
  classPosition: StyleClass

  /**
   * Base CSS class for the dialog container.
   * @type {StyleClass}
   */
  classBase: StyleClass

  /**
   * CSS class for the dialog itself.
   * @type {StyleClass}
   */
  classDialog: StyleClass

  /**
   * Trigger element, который был активен до open. Сохраняется автоматически
   * для focus return. `null` пока dialog не открывался.
   * @type {HTMLElement | null}
   */
  triggerEl: HTMLElement | null

  /**
   * Reference на корневой DOM-узел dialog (контейнер с `role="dialog"`).
   * Полезен для programmatic focus, axe-core тестов и интеграций.
   * @type {HTMLElement | null}
   */
  dialogContentRef: HTMLElement | null

  // ---METHODS-----------------------
  /**
   * Closes the dialog.
   */
  closeDialog(): void

  /**
   * Программно ставит focus на initialFocus selector или первый focusable
   * элемент внутри dialog. Используется тестами и при необходимости
   * re-focus после dynamic content updates.
   */
  focusFirst(): void
}
export declare type DialogOption = Pick<
  DialogProps,
  | "class"
  | "classBody"
  | "size"
  | "position"
  | "notAnimate"
  | "closeButton"
  | "withoutMargin"
  | "notCloseBackground"
  | "toTeleport"
  | "ariaLabel"
  | "ariaLabelledby"
  | "ariaDescribedby"
  | "initialFocus"
  | "returnFocus"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Dialog: GlobalComponentConstructor<Dialog>
  }
}

export default Dialog

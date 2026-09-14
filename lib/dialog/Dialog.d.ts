import { VNode } from "vue"
import {
  ClassComponent,
  ClassesMap,
  GlobalComponentConstructor,
  PositionShort,
  Size,
  StyleClass,
  TeleportTarget
} from "../types"

/**
 * ## Dialog
 *
 * Dialog - a component for displaying modal dialogs with customizable styles and behavior.
 *
 * Supports flexible positioning, animations, and options for closing the dialog.
 */
declare class Dialog extends ClassComponent<DialogProps, DialogSlots, DialogEmits, DialogExpose> {}

/**
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-dialog>` (добавляется `ClassesMap`).
 * - `content` — карточка диалога `[data-dialog-content]` (бывший инвертированный `class`).
 * - `backdrop` — подложка `[data-dialog-background]`.
 * - `close` — корень `Button` закрытия `[data-dialog-close]`.
 */
export declare type DialogClassKey = "content" | "backdrop" | "close"

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
   * Анимировать открытие/закрытие. Bare-positive инверсия снятого `notAnimate`
   * (dev-patterns §2 F): default перевёрнут в `true`.
   * @type {boolean | undefined}
   */
  animated?: boolean

  /**
   * Enables a close button inside the dialog.
   * @type {boolean | undefined}
   */
  closeButton?: boolean

  /**
   * Отступ карточки от края экрана в off-center позициях. Bare-positive инверсия снятого
   * `withoutMargin`: default перевёрнут в `true`.
   * @type {boolean | undefined}
   */
  margin?: boolean

  /**
   * Закрывать диалог по клику на подложку. Bare-positive инверсия снятого
   * `notCloseBackground`: default перевёрнут в `true`.
   * @type {boolean | undefined}
   */
  closeOnBackdrop?: boolean

  /**
   * Target для `<Teleport>`. `false` — inline-render без телепорта.
   * @type {TeleportTarget | undefined}
   */
  teleport?: TeleportTarget

  /**
   * CSS-классы корня `<div data-dialog>` (dev-patterns §2 A). Бывший `classBody`.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов: `content`, `backdrop`, `close`; `root` ≡ `class`.
   * См. `DialogClassKey`.
   * @type {ClassesMap<DialogClassKey> | undefined}
   */
  classes?: ClassesMap<DialogClassKey>

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
   * @type {DialogProps["teleport"]}
   */
  teleport: DialogProps["teleport"]

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
   * Закрывается ли диалог по клику на подложку (`closeOnBackdrop`, default `true`).
   * @type {DialogProps["closeOnBackdrop"]}
   */
  isCloseOnBackdrop: DialogProps["closeOnBackdrop"]

  /**
   * Есть ли у карточки отступ от края экрана (`margin`, default `true`).
   * @type {DialogProps["margin"]}
   */
  isMargin: DialogProps["margin"]

  /**
   * Current position of the dialog.
   * @type {NonNullable<DialogProps["position"]>}
   */
  position: NonNullable<DialogProps["position"]>

  /**
   * CSS class for the dialog's position styling.
   * @type {StyleClass}
   */
  classPosition: StyleClass

  /**
   * Итоговый класс корня `<div data-dialog>` (база + `class`/`classes.root`).
   * @type {StyleClass}
   */
  classBase: StyleClass

  /**
   * Итоговый класс карточки `[data-dialog-content]` (база + size + position + `classes.content`).
   * @type {StyleClass}
   */
  classContent: StyleClass

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
  | "classes"
  | "size"
  | "position"
  | "animated"
  | "closeButton"
  | "margin"
  | "closeOnBackdrop"
  | "teleport"
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

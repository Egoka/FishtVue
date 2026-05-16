import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, Position, RefLink, StyleClass, StyleMode } from "../types"

/**
 * ## FixWindow
 *
 * FixWindow - a component for displaying a fixed or floating window with customizable positioning and behavior.
 *
 * Supports various opening and closing events, dynamic positioning, and additional styling options.
 */
declare class FixWindow extends ClassComponent<FixWindowProps, FixWindowSlots, FixWindowEmits, FixWindowExpose> {}

export type FixWindowEvent = "hover" | "click" | "mousedown" | "mouseup" | "dblclick" | "contextmenu" | "none"
/**
 * Semantic ARIA role of the floating window. Если не задано — резолвится
 * автоматически: `eventOpen: "hover"` → `"tooltip"`, иначе `"dialog"`.
 */
export type FixWindowRole = "tooltip" | "dialog" | "menu"

/**
 * Target для `<Teleport>`. `false` (default) сохраняет inline-render для
 * backward-compat; `"body"` или произвольный CSS-селектор / HTMLElement —
 * выносит popover из родительского scroll-parent'а.
 */
export type FixWindowTeleport = string | HTMLElement | false

/**
 * Props for the FixWindow component.
 */
export declare type FixWindowProps = {
  /**
   * Controls the visibility of the fixed window.
   * @type {boolean | undefined}
   */
  modelValue?: boolean

  /**
   * The target element for the fixed window.
   * @type {RefLink | undefined}
   */
  el?: RefLink

  /**
   * The scrollable element affecting the fixed window's position.
   * @type {RefLink | undefined}
   */
  scrollableEl?: RefLink

  /**
   * The CSS positioning style for the fixed window.
   * @type {"absolute" | "fixed" | undefined}
   */
  typePosition?: "absolute" | "fixed"

  /**
   * The position of the fixed window relative to the target element.
   * Mapping на Floating UI Placement производится автоматически —
   * для `dir="rtl"` documents значения `*-left` / `*-right` логически
   * зеркалятся через `start` / `end` placement.
   * @type {Position | undefined}
   */
  position?: Position

  /**
   * Custom CSS class for the fixed window container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom CSS class for the body of the fixed window.
   * @type {StyleClass | undefined}
   */
  classBody?: StyleClass

  /**
   * Styling mode for the fixed window.
   * @type {StyleMode | undefined}
   */
  mode?: StyleMode

  /**
   * Event that triggers the opening of the fixed window.
   * @type {FixWindowEvent | undefined}
   */
  eventOpen?: FixWindowEvent

  /**
   * Event that triggers the closing of the fixed window.
   * @type {FixWindowEvent | undefined}
   */
  eventClose?: FixWindowEvent

  /**
   * Delay before opening the fixed window (in milliseconds).
   * @type {number | 100 | 500 | 1000 | 1500 | 2000 | undefined}
   */
  delay?: number | 100 | 500 | 1000 | 1500 | 2000

  /**
   * Margin between the fixed window and the target element (in pixels).
   * @type {number | 2 | 5 | 10 | undefined}
   */
  marginPx?: number | 2 | 5 | 10

  /**
   * Pixel translation for fine-tuning the fixed window's position.
   * @type {number | 2 | 5 | 10 | undefined}
   */
  translatePx?: number | 2 | 5 | 10

  /**
   * Padding for the fixed window's boundaries (Floating UI shift/flip padding).
   * @type {number | 2 | 5 | 10 | undefined}
   */
  paddingWindow?: number | 2 | 5 | 10

  /**
   * Positions the fixed window based on cursor location.
   * @type {boolean | undefined}
   */
  byCursor?: boolean

  /**
   * Enables a close button for the fixed window.
   * @type {boolean | undefined}
   */
  closeButton?: boolean

  /**
   * Prevents event propagation when opening the fixed window.
   * @type {boolean | undefined}
   */
  stopOpenPropagation?: boolean

  /**
   * Teleport target для popover. `false` (default) — inline-render.
   * `"body"` — рекомендованный target для popover'ов внутри scroll-parent'ов
   * с `overflow: hidden / auto`. Также принимает CSS-селектор или `HTMLElement`.
   * @type {FixWindowTeleport | undefined}
   */
  teleport?: FixWindowTeleport

  /**
   * Включает focus trap внутри popover (Tab/Shift+Tab циклятся между
   * focusable элементами). Нужен для popover-form. Использует ту же native
   * реализацию, что и Dialog (см. `getFocusable` / `onDialogKeydown` pattern).
   * @type {boolean | undefined}
   */
  focusTrap?: boolean

  /**
   * Семантическая ARIA role. Если не задано — резолвится автоматически:
   * `eventOpen: "hover"` → `"tooltip"`, иначе `"dialog"`. Также поддерживается
   * через componentsOptions.
   * @type {FixWindowRole | undefined}
   */
  role?: FixWindowRole

  /**
   * Accessible label для корневого элемента popover. Используется, когда
   * нет внешнего заголовка для `aria-labelledby`. Не комбинируется с
   * `ariaLabelledby` — labelledby имеет приоритет в браузерах.
   * @type {string | undefined}
   */
  ariaLabel?: string

  /**
   * ID элемента-заголовка для связки через `aria-labelledby`.
   * @type {string | undefined}
   */
  ariaLabelledby?: string

  /**
   * ID элемента-описания для связки через `aria-describedby`.
   * @type {string | undefined}
   */
  ariaDescribedby?: string

  /**
   * CSS-селектор внутри popover для автофокуса при open (при `focusTrap: true`).
   * По умолчанию — первый focusable элемент.
   * @type {string | undefined}
   */
  initialFocus?: string

  /**
   * Возвращать ли focus на trigger element при close. По умолчанию `true`
   * когда `focusTrap: true`, иначе focus return не выполняется.
   * @type {boolean | undefined}
   */
  returnFocus?: boolean
}
export declare type FixWindowSlots = {
  default(): VNode[]
}

/**
 * Events emitted by the FixWindow component.
 */
export declare type FixWindowEmits = {
  /**
   * Emitted when the `modelValue` is updated.
   * @param event
   * @param {boolean} isOpen - The updated visibility state of the fixed window.
   */
  (event: "update:modelValue", isOpen: boolean): void

  /**
   * Emitted when the fixed window is opened.
   * @param event
   * @param {MouseEvent} env - The mouse event triggering the action.
   */
  (event: "open", env: MouseEvent | undefined): void

  /**
   * Emitted when the fixed window is closed.
   * @param event
   * @param {MouseEvent} env - The mouse event triggering the action.
   */
  (event: "close", env: MouseEvent | undefined): void
}

/**
 * Methods and states exposed via `ref` for the FixWindow component.
 */
export declare type FixWindowExpose = {
  // ---STATE-------------------------
  /**
   * Current x-coordinate position of the fixed window.
   * @type {string}
   */
  x: string

  /**
   * Current y-coordinate position of the fixed window.
   * @type {string}
   */
  y: string

  /**
   * Indicates whether the fixed window is open.
   * @type {boolean}
   */
  isOpen: boolean

  // ---PROPS-------------------------
  /**
   * Current position of the fixed window.
   * @type {FixWindowProps["position"]}
   */
  position: FixWindowProps["position"]

  /**
   * Current delay before opening the fixed window.
   * @type {FixWindowProps["delay"]}
   */
  delay: FixWindowProps["delay"]

  /**
   * Current margin between the fixed window and the target element.
   * @type {FixWindowProps["marginPx"]}
   */
  marginPx: FixWindowProps["marginPx"]

  /**
   * Indicates whether the close button is enabled.
   * @type {FixWindowProps["closeButton"]}
   */
  isCloseButton: FixWindowProps["closeButton"]

  /**
   * Event type for opening the fixed window.
   * @type {FixWindowEvent}
   */
  eventOpen: FixWindowEvent

  /**
   * Event type for closing the fixed window.
   * @type {FixWindowEvent}
   */
  eventClose: FixWindowEvent

  /**
   * The target HTML element for the fixed window.
   * @type {HTMLElement}
   */
  element: HTMLElement

  /**
   * Trigger element, который был активен до open. Сохраняется автоматически
   * для focus return при `focusTrap: true` и `returnFocus !== false`.
   * `null` пока popover не открывался.
   * @type {HTMLElement | null}
   */
  triggerEl: HTMLElement | null

  // ---METHODS-----------------------
  /**
   * Opens the fixed window. Optional event позволяет передать originating MouseEvent
   * (для byCursor positioning или stopOpenPropagation).
   */
  open(event?: MouseEvent): void

  /**
   * Closes the fixed window. Optional event — для emit chain.
   */
  close(event?: MouseEvent): void

  /**
   * Updates the position of the fixed window dynamically (Floating UI `update`).
   */
  updatePosition(): void

  /**
   * Программно ставит focus на initialFocus selector или первый focusable
   * элемент внутри popover. Используется автоматически при open, если
   * `focusTrap: true`.
   */
  focusFirst(): void
}
export declare type FixWindowOption = Pick<
  FixWindowProps,
  | "typePosition"
  | "position"
  | "class"
  | "classBody"
  | "mode"
  | "eventOpen"
  | "eventClose"
  | "delay"
  | "marginPx"
  | "translatePx"
  | "paddingWindow"
  | "byCursor"
  | "closeButton"
  | "teleport"
  | "focusTrap"
  | "role"
  | "ariaLabel"
  | "ariaLabelledby"
  | "ariaDescribedby"
  | "initialFocus"
  | "returnFocus"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    FixWindow: GlobalComponentConstructor<FixWindow>
  }
}

export default FixWindow

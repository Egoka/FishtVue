import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleMode, Position, ReadRef, RefLink, StyleClass } from "../types"

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
  stylePosition?: "absolute" | "fixed"

  /**
   * The position of the fixed window relative to the target element.
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
   * @type {number | 1 | 5 | 10 | 15 | 20 | undefined}
   */
  delay?: number | 1 | 5 | 10 | 15 | 20

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
   * Padding for the fixed window's boundaries.
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
  (event: "open", env: MouseEvent): void

  /**
   * Emitted when the fixed window is closed.
   * @param event
   * @param {MouseEvent} env - The mouse event triggering the action.
   */
  (event: "close", env: MouseEvent): void
}

/**
 * Methods and states exposed via `ref` for the FixWindow component.
 */
export declare type FixWindowExpose = {
  // ---STATE-------------------------
  /**
   * Current x-coordinate position of the fixed window.
   * @type {ReadRef<string>}
   */
  x: ReadRef<string>

  /**
   * Current y-coordinate position of the fixed window.
   * @type {ReadRef<string>}
   */
  y: ReadRef<string>

  /**
   * Indicates whether the fixed window is open.
   * @type {ReadRef<boolean>}
   */
  isOpen: ReadRef<boolean>

  // ---PROPS-------------------------
  /**
   * Current position of the fixed window.
   * @type {ReadRef<FixWindowProps["position"]>}
   */
  position: ReadRef<FixWindowProps["position"]>

  /**
   * Current delay before opening the fixed window.
   * @type {ReadRef<FixWindowProps["delay"]>}
   */
  delay: ReadRef<FixWindowProps["delay"]>

  /**
   * Current margin between the fixed window and the target element.
   * @type {ReadRef<FixWindowProps["marginPx"]>}
   */
  marginPx: ReadRef<FixWindowProps["marginPx"]>

  /**
   * Indicates whether the close button is enabled.
   * @type {ReadRef<FixWindowProps["closeButton"]>}
   */
  isCloseButton: ReadRef<FixWindowProps["closeButton"]>

  /**
   * Event type for opening the fixed window.
   * @type {ReadRef<FixWindowEvent>}
   */
  eventOpen: ReadRef<FixWindowEvent>

  /**
   * Event type for closing the fixed window.
   * @type {ReadRef<FixWindowEvent>}
   */
  eventClose: ReadRef<FixWindowEvent>

  /**
   * The target HTML element for the fixed window.
   * @type {ReadRef<HTMLElement>}
   */
  element: ReadRef<HTMLElement>

  // ---METHODS-----------------------
  /**
   * Opens the fixed window.
   */
  open(): void

  /**
   * Closes the fixed window.
   */
  close(): void

  /**
   * Updates the position of the fixed window dynamically.
   */
  updatePosition(): void
}
export declare type FixWindowOption = Pick<
  FixWindowProps,
  | "stylePosition"
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
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    FixWindow: GlobalComponentConstructor<FixWindow>
  }
}

export default FixWindow

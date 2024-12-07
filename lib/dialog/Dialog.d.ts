import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, Size, PositionShort, StyleClass } from "../types"

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
}

export declare type DialogSlots = {
  default(): VNode[]
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
   * @type {ReadRef<DialogProps["toTeleport"]>}
   */
  toTeleport: ReadRef<DialogProps["toTeleport"]>

  /**
   * Indicates whether the dialog is open.
   * @type {ReadRef<boolean>}
   */
  isOpen: ReadRef<boolean>

  /**
   * Current size of the dialog.
   * @type {ReadRef<string>}
   */
  size: ReadRef<string>

  /**
   * Indicates whether the close button is enabled.
   * @type {ReadRef<DialogProps["closeButton"]>}
   */
  isCloseButton: ReadRef<DialogProps["closeButton"]>

  /**
   * Indicates whether the background click closes the dialog.
   * @type {ReadRef<DialogProps["notCloseBackground"]>}
   */
  notCloseBackground: ReadRef<DialogProps["notCloseBackground"]>

  /**
   * Indicates whether the dialog has margins removed.
   * @type {ReadRef<DialogProps["withoutMargin"]>}
   */
  withoutMargin: ReadRef<DialogProps["withoutMargin"]>

  /**
   * Current position of the dialog.
   * @type {ReadRef<NonNullable<DialogProps["position"]>>}
   */
  position: ReadRef<NonNullable<DialogProps["position"]>>

  /**
   * CSS class for the body of the dialog.
   * @type {ReadRef<DialogProps["class"]>}
   */
  classBodyDialog: ReadRef<DialogProps["class"]>

  /**
   * CSS class for the dialog's position styling.
   * @type {ReadRef<StyleClass>}
   */
  classPosition: ReadRef<StyleClass>

  /**
   * Base CSS class for the dialog container.
   * @type {ReadRef<StyleClass>}
   */
  classBase: ReadRef<StyleClass>

  /**
   * CSS class for the dialog itself.
   * @type {ReadRef<StyleClass>}
   */
  classDialog: ReadRef<StyleClass>

  // ---METHODS-----------------------
  /**
   * Closes the dialog.
   */
  closeDialog(): void
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
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Dialog: GlobalComponentConstructor<Dialog>
  }
}

export default Dialog

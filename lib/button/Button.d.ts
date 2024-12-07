import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { VNode } from "vue"

/**
 * ## Button
 *
 * Button - a versatile component for triggering actions or events.
 *
 * Supports different styles, sizes, icons, and states such as loading or disabled.
 */
declare class Button extends ClassComponent<ButtonProps, ButtonSlots, ButtonEmits, ButtonExpose> {}

/**
 * Styling options for the Button component.
 */
type ButtonStyle = {
  /**
   * The visual mode of the button.
   * @type {"primary" | "outline" | "ghost" | undefined}
   */
  mode?: "primary" | "outline" | "ghost"

  /**
   * Size of the button.
   * @type {"xs" | "sm" | "md" | "lg" | "xl" | undefined}
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"

  /**
   * The corner rounding style of the button.
   * @type {"none" | "md" | "lg" | "full" | undefined}
   */
  rounded?: "none" | "md" | "lg" | "full"

  /**
   * Color theme for the button.
   * @type {"theme" | "neutral" | "creative" | "destructive" | undefined}
   */
  color?: "theme" | "neutral" | "creative" | "destructive"

  /**
   * Custom CSS class for the button.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom CSS class for the button's icon.
   * @type {StyleClass | undefined}
   */
  classIcon?: StyleClass
}
/**
 * Base props shared between simple and icon buttons.
 */
type BaseButtonProps = ButtonStyle & {
  /**
   * Icon to be displayed in the button.
   * @type {string | undefined}
   */
  icon?: string

  /**
   * Position of the icon in relation to the text.
   * @type {"left" | "right" | undefined}
   */
  iconPosition?: "left" | "right"

  /**
   * Disables the button.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Indicates if the button is in a loading state.
   * @type {boolean | undefined}
   */
  loading?: boolean
}

/**
 * Props for a simple button.
 */
export type SimpleButtonProps = BaseButtonProps & {
  /**
   * Type of the button element.
   * @type {"button" | "reset" | "submit" | undefined}
   */
  type?: "button" | "reset" | "submit"
}
/**
 * Props for an icon-only button.
 */
export type IconButtonProps = BaseButtonProps & {
  /**
   * Indicates the button is icon-only.
   * @type {"icon"}
   */
  type: "icon"
}
/**
 * Props for the Button component.
 */
export type ButtonProps = SimpleButtonProps | IconButtonProps
export declare type ButtonSlots = {
  default(): VNode[]
}
export declare type ButtonEmits = null
/**
 * Methods and states exposed via `ref` for the Button component.
 */
export declare type ButtonExpose = {
  // ---PROPS-------------------------
  /**
   * Current visual mode of the button.
   * @type {ReadRef<ButtonProps["mode"]>}
   */
  mode: ReadRef<ButtonProps["mode"]>

  /**
   * Current size of the button.
   * @type {ReadRef<ButtonProps["size"]>}
   */
  size: ReadRef<ButtonProps["size"]>

  /**
   * Current corner rounding style of the button.
   * @type {ReadRef<ButtonProps["rounded"]>}
   */
  rounded: ReadRef<ButtonProps["rounded"]>

  /**
   * Current color theme of the button.
   * @type {ReadRef<ButtonProps["color"]>}
   */
  color: ReadRef<ButtonProps["color"]>

  /**
   * Current CSS class for the button container.
   * @type {ReadRef<ButtonProps["class"]>}
   */
  classBase: ReadRef<ButtonProps["class"]>

  /**
   * Current CSS class for the button's icon.
   * @type {ReadRef<ButtonProps["classIcon"]>}
   */
  classIcon: ReadRef<ButtonProps["classIcon"]>
}
export declare type ButtonOption = Pick<ButtonProps, "mode" | "size" | "rounded" | "color" | "class" | "classIcon">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Button: GlobalComponentConstructor<Button>
  }
}

export default Button

import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
import { CSSProperties } from "vue"

/**
 * ## Icons
 *
 * Icons - a component for rendering customizable icons.
 *
 * Supports various icon types, styles, and CSS classes for flexible usage.
 */
declare class Icons extends ClassComponent<IconsProps, IconsSlots, IconsEmits, IconsExpose> {}

/**
 * Props for the Icons component.
 */
export declare type IconsProps = {
  /**
   * The type of the icon to render.
   * You can find the icon type names on the following websites:
   * @see https://heroicons.com
   * @see https://icon-sets.iconify.design
   * @type {string}
   */
  type: string

  /**
   * The style of the icon to render.
   * @type {"outline" | "solid"}
   */
  stileIcon?: "outline" | "solid"

  /**
   * Custom CSS class for the icon.
   * @type {"h-5 w-5 text-gray-400 dark:text-gray-600" | StyleClass | undefined}
   */
  class?: "h-5 w-5 text-gray-400 dark:text-gray-600" | StyleClass

  /**
   * Custom inline styles for the icon.
   * @type {CSSProperties | undefined}
   */
  style?: CSSProperties
}
export declare type IconsSlots = null
export declare type IconsEmits = null
/**
 * Methods and states exposed via `ref` for the Icons component.
 */
export declare type IconsExpose = {
  // ---PROPS-------------------------
  /**
   * The current type of the icon.
   * @type {IconsProps["type"]}
   */
  type: IconsProps["type"]

  /**
   * The current CSS class applied to the icon.
   * @type {IconsProps["class"]}
   */
  classIcon: IconsProps["class"]

  /**
   * The current inline styles applied to the icon.
   * @type {IconsProps["style"]}
   */
  style: IconsProps["style"]
}
export declare type IconsOption = Pick<IconsProps, "class">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Icons: GlobalComponentConstructor<Icons>
  }
}

export default Icons

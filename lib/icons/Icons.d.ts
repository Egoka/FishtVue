import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"

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
   * @type {string}
   */
  type: string

  /**
   * Custom CSS class for the icon.
   * @type {"h-5 w-5 text-gray-400 dark:text-gray-600" | StyleClass | undefined}
   */
  class?: "h-5 w-5 text-gray-400 dark:text-gray-600" | StyleClass

  /**
   * Custom inline styles for the icon.
   * @type {string | undefined}
   */
  style?: string
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
   * @type {ReadRef<IconsProps["type"]>}
   */
  type: ReadRef<IconsProps["type"]>

  /**
   * The current CSS class applied to the icon.
   * @type {ReadRef<IconsProps["class"]>}
   */
  classIcon: ReadRef<IconsProps["class"]>

  /**
   * The current inline styles applied to the icon.
   * @type {ReadRef<IconsProps["style"]>}
   */
  style: ReadRef<IconsProps["style"]>
}
export declare type IconsOption = Pick<IconsProps, "class">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Icons: GlobalComponentConstructor<Icons>
  }
}

export default Icons

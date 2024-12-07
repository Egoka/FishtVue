import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass, StyleMode } from "../types"

/**
 * ## Label
 *
 * Label - a component for rendering labels with optional styling and state indicators.
 *
 * Supports required indicators, various modes, and customizable styles for flexible usage.
 */
declare class Label extends ClassComponent<LabelProps, LabelSlots, LabelEmits, LabelExpose> {}

// ---------------------------------------
export type LabelMode = "offsetDynamic" | "offsetStatic" | "dynamic" | "static" | "vanishing" | "none"

/**
 * Props for the Label component.
 */
export declare type LabelProps = {
  /**
   * The text content of the label.
   * @type {string | undefined}
   */
  title?: string

  /**
   * Indicates whether the field associated with the label is required.
   * @type {boolean | undefined}
   */
  isRequired?: boolean

  /**
   * The display mode of the label (e.g., floating, static).
   * @type {LabelMode | undefined}
   */
  type?: LabelMode

  /**
   * The styling mode for the label.
   * @type {StyleMode | undefined}
   */
  mode?: StyleMode

  /**
   * Horizontal translation of the label in pixels.
   * @type {number | undefined}
   */
  translateX?: number | undefined

  /**
   * Maximum width of the label in pixels.
   * @type {number | undefined}
   */
  maxWidth?: number | undefined

  /**
   * Custom CSS class for the label container.
   * @type {StyleClass | undefined}
   */
  classBody?: StyleClass

  /**
   * Custom CSS class for the label content.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
}

export declare type LabelSlots = null

export declare type LabelEmits = null

/**
 * Methods and states exposed via `ref` for the Label component.
 */
export declare type LabelExpose = {
  // ---PROPS-------------------------
  /**
   * Current styling mode of the label.
   * @type {ReadRef<LabelProps["mode"]>}
   */
  mode: ReadRef<LabelProps["mode"]>

  /**
   * Current display mode of the label.
   * @type {ReadRef<LabelProps["type"]>}
   */
  type: ReadRef<LabelProps["type"]>

  /**
   * Custom CSS class for the label container.
   * @type {ReadRef<LabelProps["classBody"]>}
   */
  classBase: ReadRef<LabelProps["classBody"]>

  /**
   * Custom CSS class for the label content.
   * @type {ReadRef<LabelProps["class"]>}
   */
  classContent: ReadRef<LabelProps["class"]>
}
export declare type LabelOption = Pick<LabelProps, "type" | "mode" | "translateX" | "maxWidth" | "class" | "classBody">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Label: GlobalComponentConstructor<Label>
  }
}

export default Label

import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"

/**
 * ## Separator
 *
 * Separator - a component for dividing sections with customizable styles, gradients, and depth.
 *
 * Supports both vertical and horizontal orientations, content alignment, and advanced styling options.
 */
declare class Separator extends ClassComponent<SeparatorProps, SeparatorSlots, SeparatorEmits, SeparatorExpose> {}

// ---------------------------------------
export type Gradient = 0 | 5 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100
export type GradientLength = 0 | 5 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 | 100
export type Depth = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Props for the Separator component.
 */
export declare type SeparatorProps = {
  /**
   * Indicates whether the separator is vertical.
   * @type {boolean | undefined}
   */
  vertical?: boolean

  /**
   * Alignment of the content within the separator.
   * @type {"right" | "left" | "center" | "full" | undefined}
   */
  contentPosition?: "right" | "left" | "center" | "full"

  /**
   * Gradient applied to the separator lines.
   * Can be a single value, a range, or a boolean to toggle gradients.
   * @type {Gradient | [Gradient, GradientLength] | boolean | undefined}
   */
  gradient?: Gradient | [Gradient, GradientLength] | boolean

  /**
   * Depth effect applied to the separator.
   * @type {Depth | undefined}
   */
  depth?: Depth

  /**
   * Custom CSS class for the separator container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom CSS class for the body of the separator line.
   * @type {StyleClass | undefined}
   */
  classBodyLine?: StyleClass

  /**
   * Custom CSS class for the main separator line.
   * @type {StyleClass | undefined}
   */
  classLine?: StyleClass

  /**
   * Custom CSS class for the separator content.
   * @type {StyleClass | undefined}
   */
  classContent?: StyleClass

  /**
   * Custom CSS class for the left body line.
   * @type {StyleClass | undefined}
   */
  classBodyLineLeft?: StyleClass

  /**
   * Custom CSS class for the left separator line.
   * @type {StyleClass | undefined}
   */
  classLineLeft?: StyleClass

  /**
   * Custom CSS class for the right body line.
   * @type {StyleClass | undefined}
   */
  classBodyLineRight?: StyleClass

  /**
   * Custom CSS class for the right separator line.
   * @type {StyleClass | undefined}
   */
  classLineRight?: StyleClass
}

export declare type SeparatorSlots = {
  default(): VNode[]
}
export declare type SeparatorEmits = null

/**
 * Methods and states exposed via `ref` for the Separator component.
 */
export declare type SeparatorExpose = {
  // ---PROPS-------------------------
  /**
   * Indicates whether the separator is vertical.
   * @type {SeparatorProps["vertical"]}
   */
  vertical: SeparatorProps["vertical"]

  /**
   * Alignment of the content within the separator.
   * @type {SeparatorProps["content"]}
   */
  content: SeparatorProps["contentPosition"]

  /**
   * The applied gradient value for the separator.
   * @type {number}
   */
  gradient: number

  /**
   * The length of the gradient applied to the separator.
   * @type {number}
   */
  gradientLength: number

  /**
   * The depth effect applied to the separator.
   * @type {SeparatorProps["depth"]}
   */
  depth: SeparatorProps["depth"]

  /**
   * Custom CSS class for the separator container.
   * @type {SeparatorProps["class"]}
   */
  classBase: SeparatorProps["class"]

  /**
   * Custom CSS class for the left body line.
   * @type {StyleClass}
   */
  classBodyLineLeft: StyleClass

  /**
   * Custom CSS class for the left separator line.
   * @type {StyleClass}
   */
  classLineLeft: StyleClass

  /**
   * Custom CSS class for the separator content.
   * @type {StyleClass}
   */
  classContent: StyleClass

  /**
   * Custom CSS class for the right body line.
   * @type {StyleClass}
   */
  classBodyLineRight: StyleClass

  /**
   * Custom CSS class for the right separator line.
   * @type {StyleClass}
   */
  classLineRight: StyleClass
}
export declare type SeparatorOption = Pick<
  SeparatorProps,
  | "contentPosition"
  | "gradient"
  | "depth"
  | "class"
  | "classBodyLine"
  | "classLine"
  | "classContent"
  | "classBodyLineLeft"
  | "classLineLeft"
  | "classBodyLineRight"
  | "classLineRight"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Separator: GlobalComponentConstructor<Separator>
  }
}

export default Separator

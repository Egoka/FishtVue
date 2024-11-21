import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"

/**
 * ## Separator
 *
 * Separator - a component for dividing sections with customizable styles, gradients, and depth.
 *
 * Supports both vertical and horizontal orientations, content alignment, and advanced styling options.
 */
declare class Separator extends ClassComponent<SeparatorProps, SeparatorSlots, SeparatorEmits, SeparatorExpose> {}

// ---------------------------------------
export type Gradient = 0 | 5 | 10 | 20 | 30 | 40 | 50
export type GradientLength = 0 | 5 | 10 | 20 | 30 | 40 | 50
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
  content?: "right" | "left" | "center" | "full"

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
   * @type {ReadRef<NonNullable<SeparatorProps["vertical"]>>}
   */
  vertical: ReadRef<NonNullable<SeparatorProps["vertical"]>>

  /**
   * Alignment of the content within the separator.
   * @type {ReadRef<NonNullable<SeparatorProps["content"]>>}
   */
  content: ReadRef<NonNullable<SeparatorProps["content"]>>

  /**
   * The applied gradient value for the separator.
   * @type {ReadRef<number>}
   */
  gradient: ReadRef<number>

  /**
   * The length of the gradient applied to the separator.
   * @type {ReadRef<number>}
   */
  gradientLength: ReadRef<number>

  /**
   * The depth effect applied to the separator.
   * @type {ReadRef<NonNullable<SeparatorProps["depth"]>>}
   */
  depth: ReadRef<NonNullable<SeparatorProps["depth"]>>

  /**
   * Custom CSS class for the separator container.
   * @type {ReadRef<SeparatorProps["class"]>}
   */
  classBase: ReadRef<SeparatorProps["class"]>

  /**
   * Custom CSS class for the left body line.
   * @type {ReadRef<StyleClass>}
   */
  classBodyLineLeft: ReadRef<StyleClass>

  /**
   * Custom CSS class for the left separator line.
   * @type {ReadRef<StyleClass>}
   */
  classLineLeft: ReadRef<StyleClass>

  /**
   * Custom CSS class for the separator content.
   * @type {ReadRef<StyleClass>}
   */
  classContent: ReadRef<StyleClass>

  /**
   * Custom CSS class for the right body line.
   * @type {ReadRef<StyleClass>}
   */
  classBodyLineRight: ReadRef<StyleClass>

  /**
   * Custom CSS class for the right separator line.
   * @type {ReadRef<StyleClass>}
   */
  classLineRight: ReadRef<StyleClass>
}
export declare type SeparatorOption = Pick<
  SeparatorProps,
  | "content"
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

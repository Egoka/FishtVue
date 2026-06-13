import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass, StyleMode } from "../types"

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
   * Horizontal translation of the label. Number is treated as `px`;
   * string is passed through as-is (`"1rem"`, `"50%"`, `"var(--x)"`).
   * @type {number | string | undefined}
   */
  translateX?: number | string

  /**
   * Maximum width of the label. Number is treated as `px` and the inner
   * padding (`38px`) is subtracted directly; string is wrapped in
   * `calc(<value> - 38px)` so `"100%"`, `"5rem"`, `var()` work too.
   * @type {number | string | undefined}
   */
  maxWidth?: number | string

  /**
   * ID of the form control this label is associated with.
   * Sets the native `for` attribute, enabling click-to-focus and
   * screen-reader association (WCAG 2.1 SC 1.3.1).
   * @type {string | undefined}
   */
  forId?: string

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

  /**
   * Включает CSS-transition позиционирования лейбла. По умолчанию `true`.
   * `InputLayout` пробрасывает сюда mount-tick (`isTick`): на первом кадре `false`,
   * чтобы floating-label сразу отрисовался в нужной позиции без «переезда» из исходной
   * точки, а после mount — `true`, и переход при focus / изменении value анимируется.
   * @type {boolean | undefined}
   */
  animate?: boolean
}

/**
 * Slots for the Label component.
 */
export declare type LabelSlots = {
  /**
   * Default slot — overrides `title` prop. Useful for inserting
   * `<strong>`, icons, or other inline markup as label content.
   */
  default?(): VNode[]
}

export declare type LabelEmits = null

/**
 * Methods and states exposed via `ref` for the Label component.
 */
export declare type LabelExpose = {
  // ---PROPS-------------------------
  /**
   * Current styling mode of the label.
   * @type {LabelProps["mode"]}
   */
  mode: LabelProps["mode"]

  /**
   * Current display mode of the label.
   * @type {LabelProps["type"]}
   */
  type: LabelProps["type"]

  /**
   * Custom CSS class for the label container.
   * @type {LabelProps["classBody"]}
   */
  classBase: LabelProps["classBody"]

  /**
   * Custom CSS class for the label content.
   * @type {LabelProps["class"]}
   */
  classContent: LabelProps["class"]
}
export declare type LabelOption = Pick<LabelProps, "type" | "mode" | "translateX" | "maxWidth" | "class" | "classBody">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Label: GlobalComponentConstructor<Label>
  }
}

export default Label

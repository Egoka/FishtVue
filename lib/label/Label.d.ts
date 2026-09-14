import { VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor, StyleClass, StyleMode } from "../types"

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
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<label data-label>` (добавляется `ClassesMap`).
 * - `text` — внутренний `<span data-label-text>` с текстом лейбла.
 */
export declare type LabelClassKey = "text"

/**
 * Props for the Label component.
 */
export declare type LabelProps = {
  /**
   * Текст лейбла (fallback default-слота). Единое имя с form-controls (`InputLayout.label`, `Switch.label`).
   * @type {string | undefined}
   */
  label?: string

  /**
   * Обязательное поле — красная звёздочка после текста.
   * @type {boolean | undefined}
   */
  required?: boolean

  /**
   * Режим позиционирования лейбла (floating / static / offset / vanishing / none).
   * Единое имя с `InputLayout.labelMode` и `Form.labelMode`.
   * @type {LabelMode | undefined}
   */
  labelMode?: LabelMode

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
   * CSS-классы корня `<label data-label>` (контейнер с позиционированием).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов: `text` — `<span data-label-text>`, `root` ≡ `class`.
   * @type {ClassesMap<LabelClassKey> | undefined}
   */
  classes?: ClassesMap<LabelClassKey>

  /**
   * Включает CSS-transition позиционирования лейбла. Default `true` (резолвится в компоненте,
   * отсутствующий prop остаётся `undefined` — dev-patterns §2 F).
   * `InputLayout` пробрасывает сюда mount-tick (`isTick`): на первом кадре `false`,
   * чтобы floating-label сразу отрисовался в нужной позиции без «переезда» из исходной
   * точки, а после mount — `true`, и переход при focus / изменении value анимируется.
   * @type {boolean | undefined}
   */
  animated?: boolean
}

/**
 * Slots for the Label component.
 */
export declare type LabelSlots = {
  /**
   * Default slot — overrides `label` prop. Useful for inserting
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
   * @type {NonNullable<LabelProps["mode"]>}
   */
  mode: NonNullable<LabelProps["mode"]>

  /**
   * Current display mode of the label.
   * @type {NonNullable<LabelProps["labelMode"]>}
   */
  labelMode: NonNullable<LabelProps["labelMode"]>

  /**
   * Итоговый класс корня `<label data-label>` (база + `class`/`classes.root`).
   * @type {string}
   */
  classBase: string

  /**
   * Итоговый класс текста `<span data-label-text>` (база + `classes.text`).
   * @type {string}
   */
  classContent: string
}
export declare type LabelOption = Pick<
  LabelProps,
  "labelMode" | "mode" | "translateX" | "maxWidth" | "class" | "classes"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Label: GlobalComponentConstructor<Label>
  }
}

export default Label

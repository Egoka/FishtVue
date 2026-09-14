import { VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor, StyleClass } from "../types"

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
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-separator>` (добавляется `ClassesMap`).
 * Имена логические (`start`/`end`), а не физические: в RTL сегменты зеркалятся flex main-axis'ом.
 * - `segment` — оба сегмента-обёртки (`[data-separator-start]`, `[data-separator-end]`), бывший `classBodyLine`.
 * - `segmentStart` / `segmentEnd` — только начальный / конечный сегмент (бывшие `classBodyLineLeft/Right`).
 * - `line` — линия внутри обоих сегментов (`[data-separator-line]`), бывший `classLine`.
 * - `lineStart` / `lineEnd` — линия конкретного сегмента (бывшие `classLineLeft/Right`).
 * - `content` — `<span data-separator-content>` со слотом.
 */
export declare type SeparatorClassKey =
  | "segment"
  | "segmentStart"
  | "segmentEnd"
  | "line"
  | "lineStart"
  | "lineEnd"
  | "content"

/**
 * Props for the Separator component.
 */
export declare type SeparatorProps = {
  /**
   * Ориентация разделителя (бывший булев `vertical`). Единое имя с [Menu](./menu.md) и [Split](./split.md).
   * @type {"horizontal" | "vertical" | undefined}
   */
  orientation?: "horizontal" | "vertical"

  /**
   * Alignment of the content within the separator (logical, RTL-aware).
   *
   * `"start"` — у логического начала строки (слева в LTR, справа в RTL), `"end"` — у конца,
   * `"center"` — по центру (оба line-сегмента), `"full"` — контент во всю ширину (без сегментов).
   * Порядок сегментов зеркалится автоматически через flex main-axis при `dir="rtl"`.
   *
   * Физические алиасы `"left"`/`"right"` сняты в major 2026-09-06 (решение R7).
   * сохранены для backward compat; в dev-режиме предупреждают в консоль. Используй logical
   * `"start"`/`"end"` для RTL-safe поведения.
   *
   * @type {"start" | "end" | "center" | "full" | undefined}
   */
  contentPosition?: "start" | "end" | "center" | "full"

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
   * CSS-классы корня `<div data-separator>` (dev-patterns §2 A).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов: `segment`, `segmentStart`, `segmentEnd`, `line`, `lineStart`,
   * `lineEnd`, `content`; `root` ≡ `class`. См. `SeparatorClassKey`.
   * @type {ClassesMap<SeparatorClassKey> | undefined}
   */
  classes?: ClassesMap<SeparatorClassKey>
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
   * Resolved ориентация разделителя.
   * @type {NonNullable<SeparatorProps["orientation"]>}
   */
  orientation: NonNullable<SeparatorProps["orientation"]>

  /**
   * Normalized (logical) alignment of the content within the separator.
   * Значение уже нормализовано: неизвестный ввод сведён к `"center"`.
   * @type {"start" | "end" | "center" | "full"}
   */
  content: "start" | "end" | "center" | "full"

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
   * Итоговый класс корня `<div data-separator>` (база + `class`/`classes.root`).
   * @type {StyleClass}
   */
  classBase: StyleClass

  /**
   * Итоговый класс начального сегмента (`[data-separator-start]`).
   * @type {StyleClass}
   */
  classSegmentStart: StyleClass

  /**
   * Итоговый класс линии внутри начального сегмента.
   * @type {StyleClass}
   */
  classLineStart: StyleClass

  /**
   * Итоговый класс `<span data-separator-content>`.
   * @type {StyleClass}
   */
  classContent: StyleClass

  /**
   * Итоговый класс конечного сегмента (`[data-separator-end]`).
   * @type {StyleClass}
   */
  classSegmentEnd: StyleClass

  /**
   * Итоговый класс линии внутри конечного сегмента.
   * @type {StyleClass}
   */
  classLineEnd: StyleClass
}
export declare type SeparatorOption = Pick<
  SeparatorProps,
  "orientation" | "contentPosition" | "gradient" | "depth" | "class" | "classes"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Separator: GlobalComponentConstructor<Separator>
  }
}

export default Separator

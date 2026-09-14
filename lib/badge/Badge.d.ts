import { ClassComponent, ClassesMap, GlobalComponentConstructor, StyleClass } from "../types"
import { VNode } from "vue"

/**
 * ## Badge
 *
 * Badge - a component for displaying small status indicators, labels, or interactive tags.
 *
 * Provides customizable styles, optional close buttons, and a point indicator for added emphasis.
 */
declare class Badge extends ClassComponent<BadgeProps, BadgeSlots, BadgeEmits, BadgeExpose> {}

/**
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-badge>` (добавляется `ClassesMap`).
 * - `content` — `<div data-badge-content>` с содержимым default-слота (бывший `classContent`).
 * - `point` — `<svg data-badge-point>` точка-индикатор при `point: true`.
 * - `close` — корень `Button` (`[data-badge-close]`) при `closeButton: true`.
 */
export declare type BadgeClassKey = "content" | "point" | "close"

/**
 * Props for the Badge component.
 */
export declare type BadgeProps = {
  /**
   * Визуальный вариант badge (бывший `mode`; значения не изменились). Единое имя с [Button](./button.md):
   * `mode` в библиотеке означает `StyleMode` (`filled`/`outlined`/`underlined`), а здесь набор свой.
   * Глобальный `componentsStyle` маппится сюда: `filled → primary`, `outlined → outline`, `underlined → neutral`.
   * @type {"primary" | "secondary" | "outline" | "neutral" | undefined}
   */
  variant?: "primary" | "secondary" | "outline" | "neutral"

  /**
   * CSS-классы корня `<div data-badge>` (dev-patterns §2 A).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов: `content`, `point`, `close`; `root` ≡ `class`.
   * См. `BadgeClassKey`.
   * @type {ClassesMap<BadgeClassKey> | undefined}
   */
  classes?: ClassesMap<BadgeClassKey>

  /**
   * Indicates whether to show a point indicator.
   * @type {boolean | undefined}
   */
  point?: boolean

  /**
   * Indicates whether to display a close button on the badge.
   * @type {boolean | undefined}
   */
  closeButton?: boolean
}
export declare type BadgeSlots = {
  default(): VNode[]
}
/**
 * Events emitted by the Badge component.
 */
export declare type BadgeEmits = {
  /**
   * Emitted when the badge is closed (via close button or action).
   */
  (event: "close"): void
}
/**
 * Methods and states exposed via `ref` for the Badge component.
 */
export declare type BadgeExpose = {
  // ---PROPS-------------------------
  /**
   * Current visual variant of the badge.
   * @type {BadgeProps["variant"]}
   */
  variant: BadgeProps["variant"]

  /**
   * Indicates whether the point indicator is enabled.
   * @type {BadgeProps["point"]}
   */
  isPoint: BadgeProps["point"]

  /**
   * Indicates whether the close button is enabled.
   * @type {BadgeProps["closeButton"]}
   */
  isCloseButton: BadgeProps["closeButton"]

  /**
   * Итоговый класс корня `<div data-badge>` (база + variant + `class`/`classes.root`).
   * @type {StyleClass}
   */
  classBase: StyleClass

  /**
   * Итоговый класс `<div data-badge-content>` (база + `classes.content`).
   * @type {StyleClass}
   */
  classContent: StyleClass

  // ---METHODS-----------------------
  /**
   * Deletes the badge, triggering the associated event.
   */
  deleteBadge(): void
}
export declare type BadgeOption = Pick<BadgeProps, "variant" | "class" | "classes" | "point" | "closeButton">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Badge: GlobalComponentConstructor<Badge>
  }
}

export default Badge

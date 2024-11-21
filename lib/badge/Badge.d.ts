import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
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
 * Props for the Badge component.
 */
export declare type BadgeProps = {
  /**
   * The style mode of the badge.
   * @type {"primary" | "secondary" | "outline" | "neutral" | undefined}
   */
  mode?: "primary" | "secondary" | "outline" | "neutral"

  /**
   * Custom CSS class for the badge container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom CSS class for the badge content.
   * @type {StyleClass | undefined}
   */
  classContent?: StyleClass

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
   * Emitted when the badge is deleted (via close button or action).
   */
  (event: "delete"): void
}
/**
 * Methods and states exposed via `ref` for the Badge component.
 */
export declare type BadgeExpose = {
  // ---PROPS-------------------------
  /**
   * Current style mode of the badge.
   * @type {ReadRef<BadgeProps["mode"]>}
   */
  mode: ReadRef<BadgeProps["mode"]>

  /**
   * Indicates whether the point indicator is enabled.
   * @type {ReadRef<BadgeProps["point"]>}
   */
  isPoint: ReadRef<BadgeProps["point"]>

  /**
   * Indicates whether the close button is enabled.
   * @type {ReadRef<BadgeProps["closeButton"]>}
   */
  isCloseButton: ReadRef<BadgeProps["closeButton"]>

  // ---METHODS-----------------------
  /**
   * Deletes the badge, triggering the associated event.
   */
  deleteBadge(): void
}
export declare type BadgeOption = Pick<BadgeProps, "mode" | "class" | "classContent" | "point" | "closeButton">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Badge: GlobalComponentConstructor<Badge>
  }
}

export default Badge

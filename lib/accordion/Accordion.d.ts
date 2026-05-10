import { MaybeRef, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"

/**
 * ## Accordion
 *
 * Accordion - a component that implements an accordion with support for multiple items,
 * customizable appearance, and flexible animation settings.
 *
 * Designed to display data as collapsible and expandable sections.
 */
declare class Accordion extends ClassComponent<AccordionProps, AccordionSlots, AccordionEmits, AccordionExpose> {}

// ---------------------------------------
/**
 * Represents a single item within the Accordion component.
 */
export type AccordionItem = {
  /**
   * The title of the accordion item.
   * @type {string}
   */
  title: string

  /**
   * The optional subtitle of the accordion item.
   * @type {string | undefined}
   */
  subtitle?: string

  /**
   * Indicates whether the item is initially open.
   * @type {boolean | undefined}
   */
  open?: boolean

  /**
   * The optional custom template for the accordion item's content.
   * @type {string | undefined}
   */
  template?: string

  /**
   * Any additional properties for the accordion item.
   * @type {any}
   */
  [key: string]: any
}
/**
 * Props for the Accordion component.
 */
export declare type AccordionProps = {
  /**
   * The data source for the accordion.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<Array<AccordionItem>> | undefined}
   */
  dataSource?: MaybeRef<Array<AccordionItem>>
  /**
   * Enables multiple sections to be open simultaneously.
   * @type {boolean}
   */
  multiple?: boolean
  /**
   * Duration of the animation for opening/closing sections (in milliseconds).
   * @type {100 | 200 | 300 | 500 | 1000 | 3000 | number}
   */
  animationDuration?: number | 100 | 200 | 300 | 500 | 1000 | 3000
  /**
   * Type of icon displayed in the accordion section.
   * @type {"ChevronDown" | "ArrowDownCircle" | "Plus" | string}
   */
  icon?: "ChevronDown" | "ArrowDownCircle" | "Plus" | string
  /**
   * General CSS class for the root container.
   * @type {StyleClass}
   */
  class?: StyleClass
  /**
   * CSS class for individual accordion items.
   * @type {StyleClass}
   */
  classItem?: StyleClass
  /**
   * CSS class for the title of an accordion item.
   * @type {StyleClass}
   */
  classTitle?: StyleClass
  /**
   * CSS class for the subtitle of an accordion item.
   * @type {StyleClass}
   */
  classSubtitle?: StyleClass
}
interface DynamicSlots {
  [key: string]: (args: Omit<AccordionItem, "template" | "open">) => VNode[]
}
export declare type AccordionSlots = {
  /**
   * Custom rendering for the title area of a section.
   */
  title(args: { title: string }): VNode[]
  /**
   * Custom rendering for the subtitle area of a section.
   * Replaces the default text fallback. The slot scope receives all `AccordionItem`
   * fields except `template` and `open`. Use this slot to opt into rich markup —
   * the consumer is responsible for sanitizing any HTML they pass.
   */
  "item-subtitle"(args: Omit<AccordionItem, "template" | "open">): VNode[]
} & DynamicSlots
/**
 * Events emitted by the Accordion component.
 */
export declare type AccordionEmits = {
  /**
   * Emitted when a section's state is toggled (opened/closed).
   * @param event
   * @param {AccordionProps["dataSource"]} payload - Updated accordion data.
   */
  (event: "toggle", payload: AccordionProps["dataSource"]): void
}
export declare type AccordionExpose = {
  // ---STATE-------------------------

  /**
   * Current state of the accordion items.
   * @type {ReadRef<AccordionProps["dataSource"]>}
   */
  dataItems: ReadRef<AccordionProps["dataSource"]>

  // ---PROPS-------------------------

  /**
   * Current value of the `multiple` prop.
   * @type {ReadRef<AccordionProps["multiple"]>}
   */
  multiple: ReadRef<AccordionProps["multiple"]>

  /**
   * Current animation duration value.
   * @type {ReadRef<AccordionProps["animationDuration"]>}
   */
  animationDuration: ReadRef<AccordionProps["animationDuration"]>

  /**
   * Current type of the icon.
   * @type {ReadRef<AccordionProps["icon"]>}
   */
  icon: ReadRef<AccordionProps["icon"]>

  /**
   * CSS class for the root container.
   * @type {ReadRef<AccordionProps["class"]>}
   */
  classBody: ReadRef<AccordionProps["class"]>

  /**
   * CSS class for individual accordion items.
   * @type {ReadRef<AccordionProps["classItem"]>}
   */
  classItem: ReadRef<AccordionProps["classItem"]>

  /**
   * CSS class for the title of an accordion item.
   * @type {ReadRef<AccordionProps["classTitle"]>}
   */
  classTitle: ReadRef<AccordionProps["classTitle"]>

  /**
   * CSS class for the subtitle of an accordion item.
   * @type {ReadRef<AccordionProps["classSubtitle"]>}
   */
  classSubtitle: ReadRef<AccordionProps["classSubtitle"]>

  // ---METHODS-----------------------

  /**
   * Toggles the state of an accordion section (open/close) by key.
   * @param {string | number} key - The key of the item to toggle.
   */
  toggle(key: string | number): void

  /**
   * Programmatically focuses the header at the given index and updates the
   * roving tabindex so the focused header is keyboard-tabbable.
   * @param {number} index - Zero-based index of the header to focus.
   */
  focus(index: number): void
}
export declare type AccordionOption = Pick<
  AccordionProps,
  "multiple" | "animationDuration" | "icon" | "class" | "classItem" | "classTitle" | "classSubtitle"
>

// ---------------------------------------
declare module "vue" {
  export interface GlobalComponents {
    Accordion: GlobalComponentConstructor<Accordion>
  }
}

export default Accordion

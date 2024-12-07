import { UnwrapNestedRefs, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { IconsProps } from "fishtvue/icons"

/**
 * ## Split
 *
 * Split - a component for creating resizable, adjustable panels.
 *
 * Supports horizontal and vertical layouts, customizable styles, and panel-specific configurations.
 */
declare class Split extends ClassComponent<SplitProps, SplitSlots, SplitEmits, SplitExpose> {}

// ---------------------------------------
export type CursorType = "center" | "left" | "right"
export type Size = number

/**
 * Styles configuration for panels in the Split component.
 */
export type ISplitStyles = {
  /**
   * Custom CSS class for the panel elements.
   * @type {StyleClass}
   */
  panel: StyleClass
}

/**
 * Defines a single panel within the Split component.
 */
export type Panel = {
  /**
   * The name of the panel.
   * @type {string}
   */
  name: string

  /**
   * The initial size of the panel.
   * @type {Size | undefined}
   */
  size?: Size

  /**
   * The maximum size of the panel.
   * @type {Size | undefined}
   */
  maxSize?: Size

  /**
   * The minimum size of the panel.
   * @type {Size | undefined}
   */
  minSize?: Size

  /**
   * Disables resizing for the panel.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Custom CSS class for the panel container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass
}

/**
 * Defines a panel group configuration for the Split component.
 */
export type Group = {
  /**
   * The units for panel sizes (`percentages` or `pixels`).
   * @type {"percentages" | "pixels" | undefined}
   */
  units?: "percentages" | "pixels"

  /**
   * The list of panels in the group.
   * @type {Array<Panel>}
   */
  panels: Array<Panel>

  /**
   * The direction of panel resizing (`vertical` or `horizontal`).
   * @type {"vertical" | "horizontal" | undefined}
   */
  direction?: "vertical" | "horizontal"
}

/**
 * Props for the Split component.
 */
export declare type SplitProps = {
  /**
   * Automatically saves the panel configuration under this name.
   * @type {string | undefined}
   */
  autoSaveName?: string

  /**
   * The type of separator used between panels.
   * @type {"strip" | "hexagon" | IconsProps["type"] | undefined}
   */
  separatorType?: "strip" | "hexagon" | IconsProps["type"]

  /**
   * Controls opacity of the separator when not hovered.
   * @type {boolean | undefined}
   */
  separatorNotHoverOpacity?: boolean

  /**
   * Custom CSS class for the Split component container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Custom styles for the panels in the Split component.
   * @type {ISplitStyles | undefined}
   */
  styles?: ISplitStyles
} & Group

export declare type SplitSlots = { [key: string]: VNode[] }

/**
 * Events emitted by the Split component.
 */
export declare type SplitEmits = {
  /**
   * Emitted when the panel sizes are updated.
   * @param event
   * @param {Record<Panel["name"], number>} panels - The updated sizes of all panels.
   */
  (event: "updated-panels", panels: Record<Panel["name"], number>): void

  /**
   * Emitted when a single panel's size is updated.
   * @param event
   * @param {Size} panel - The updated size of the panel.
   * @param {Panel["name"]} namePanel - The name of the resized panel.
   */
  (event: "updated-size-panel", panel: Size, namePanel: Panel["name"]): void

  /**
   * Emitted when resizing starts for a panel.
   * @param event
   * @param {MouseEvent | undefined} $event - The mouse event triggering the resize.
   * @param {Panel["name"] | undefined} namePanel - The name of the panel being resized.
   */
  (event: "start-resize-panel", $event?: MouseEvent, namePanel?: Panel["name"]): void

  /**
   * Emitted when resizing stops for a panel.
   * @param event
   * @param {MouseEvent | undefined} $event - The mouse event triggering the stop action.
   * @param {Panel["name"] | undefined} namePanel - The name of the panel being resized.
   */
  (event: "stop-resize-panel", $event?: MouseEvent, namePanel?: Panel["name"]): void

  /**
   * Emitted when a panel is actively being resized.
   * @param event
   * @param {MouseEvent} $event - The mouse event during resizing.
   * @param {Panel["name"]} namePanel - The name of the panel being resized.
   */
  (event: "move-resize-panel", $event: MouseEvent, namePanel: Panel["name"]): void

  /**
   * Emitted when the resize action exits a panel boundary.
   * @param event
   * @param {MouseEvent} $event - The mouse event during the action.
   * @param {Panel["name"]} namePanel - The name of the affected panel.
   */
  (event: "out-resize-panel", $event: MouseEvent, namePanel: Panel["name"]): void
}

/**
 * Methods and states exposed via `ref` for the Split component.
 */
export declare type SplitExpose = {
  // ---REF-LINK----------------------------
  /**
   * Reference to the resizable group container element.
   * @type {ReadRef<HTMLElement | undefined>}
   */
  resizableGroup: ReadRef<HTMLElement | undefined>

  /**
   * References to the individual resizable panel elements.
   * @type {ReadRef<Record<string, HTMLElement>>}
   */
  resizablePanels: ReadRef<Record<string, HTMLElement>>

  // ---STATE-------------------------------
  /**
   * The current sizes of the panels.
   * @type {UnwrapNestedRefs<Record<Panel["name"], number>>}
   */
  sizePanels: UnwrapNestedRefs<Record<Panel["name"], number>>

  /**
   * The current cursor type for resizing panels.
   * @type {UnwrapNestedRefs<Record<Panel["name"], CursorType>>}
   */
  cursorPanels: UnwrapNestedRefs<Record<Panel["name"], CursorType>>

  /**
   * The cursor type currently active during resizing.
   * @type {ReadRef<CursorType>}
   */
  activeCursorPanel: ReadRef<CursorType>

  // ---PROPS-------------------------
  /**
   * The units used for panel sizes (`percentages` or `pixels`).
   * @type {ReadRef<SplitProps["units"]>}
   */
  units: ReadRef<SplitProps["units"]>

  /**
   * The configuration for all panels in the Split component.
   * @type {ReadRef<SplitProps["panels"]>}
   */
  panels: ReadRef<SplitProps["panels"]>

  /**
   * The direction of panel resizing (`vertical` or `horizontal`).
   * @type {ReadRef<SplitProps["direction"]>}
   */
  direction: ReadRef<SplitProps["direction"]>

  /**
   * The type of separator used between panels.
   * @type {ReadRef<NonNullable<SplitProps["separatorType"]>>}
   */
  separatorType: ReadRef<NonNullable<SplitProps["separatorType"]>>

  /**
   * Indicates whether the separator has reduced opacity when not hovered.
   * @type {ReadRef<SplitProps["separatorNotHoverOpacity"]>}
   */
  separatorNotHoverOpacity: ReadRef<SplitProps["separatorNotHoverOpacity"]>

  /**
   * The styles applied to the Split component.
   * @type {ReadRef<SplitProps["styles"]>}
   */
  styles: ReadRef<SplitProps["styles"]>

  /**
   * The base CSS class for the Split component.
   * @type {ReadRef<StyleClass>}
   */
  classBase: ReadRef<StyleClass>
}
export declare type SplitOption = Pick<SplitProps, "separatorType" | "separatorNotHoverOpacity" | "class" | "styles">

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Split: GlobalComponentConstructor<Split>
  }
}

export default Split

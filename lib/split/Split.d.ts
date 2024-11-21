import { UnwrapNestedRefs, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { IconsProps } from "fishtvue/icons"
// ---------------------------------------
export type CursorType = "center" | "left" | "right"
export type Size = number
export type ISplitStyles = {
  panel: StyleClass
}
export type Panel = {
  name: string
  size?: Size
  maxSize?: Size
  minSize?: Size
  disabled?: boolean
  class?: StyleClass
}
export type Group = {
  units?: "percentages" | "pixels"
  panels: Array<Panel>
  direction?: "vertical" | "horizontal"
}
export declare type SplitProps = {
  autoSaveName?: string
  separatorType?: "strip" | "hexagon" | IconsProps["type"]
  separatorNotHoverOpacity?: boolean
  class?: StyleClass
  styles?: ISplitStyles
} & Group
export declare type SplitSlots = {
  [key: string]: VNode[]
}
export declare type SplitEmits = {
  (event: "updated-panels", panels: Record<Panel["name"], number>): void
  (event: "updated-size-panel", panel: Size, namePanel: Panel["name"]): void
  (event: "start-resize-panel", $event?: MouseEvent, namePanel?: Panel["name"]): void
  (event: "stop-resize-panel", $event?: MouseEvent, namePanel?: Panel["name"]): void
  (event: "move-resize-panel", $event: MouseEvent, namePanel: Panel["name"]): void
  (event: "out-resize-panel", $event: MouseEvent, namePanel: Panel["name"]): void
}
export declare type SplitExpose = {
  // ---REF-LINK----------------------------
  resizableGroup: ReadRef<HTMLElement | undefined>
  resizablePanels: ReadRef<Record<string, HTMLElement>>
  // ---STATE-------------------------------
  sizePanels: UnwrapNestedRefs<Record<Panel["name"], number>>
  cursorPanels: UnwrapNestedRefs<Record<Panel["name"], CursorType>>
  activeCursorPanel: ReadRef<CursorType>
  // ---PROPS-------------------------
  units: ReadRef<SplitProps["units"]>
  panels: ReadRef<SplitProps["panels"]>
  direction: ReadRef<SplitProps["direction"]>
  separatorType: ReadRef<NonNullable<SplitProps["separatorType"]>>
  separatorNotHoverOpacity: ReadRef<SplitProps["separatorNotHoverOpacity"]>
  styles: ReadRef<SplitProps["styles"]>
  classBase: ReadRef<StyleClass>
}
export declare type SplitOption = Pick<SplitProps, "separatorType" | "separatorNotHoverOpacity" | "class" | "styles">

// ---------------------------------------
declare class Split extends ClassComponent<SplitProps, SplitSlots, SplitEmits, SplitExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Split: GlobalComponentConstructor<Split>
  }
}

export default Split

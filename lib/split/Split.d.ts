import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass } from "../types"
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
  // ---STATE-------------------------
  // ---PROPS-------------------------
  // ---METHODS-----------------------
}
export declare type SplitOption = Pick<
  SplitProps,
  "autoSaveName" | "separatorType" | "separatorNotHoverOpacity" | "class" | "styles"
>

// ---------------------------------------
declare class Split extends ClassComponent<SplitProps, SplitSlots, SplitEmits, SplitExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Split: GlobalComponentConstructor<Split>
  }
}

export default Split

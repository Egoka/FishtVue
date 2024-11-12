import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
// ---------------------------------------
export type Gradient = 0 | 5 | 10 | 20 | 30 | 40 | 50
export type GradientLength = 0 | 5 | 10 | 20 | 30 | 40 | 50
export type Depth = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export declare type SeparatorProps = {
  vertical?: boolean
  content?: "right" | "left" | "center" | "full"
  gradient?: Gradient | [Gradient, GradientLength] | boolean
  depth?: Depth
  class?: StyleClass
  classBodyLine?: StyleClass
  classLine?: StyleClass
  classContent?: StyleClass
  classBodyLineLeft?: StyleClass
  classLineLeft?: StyleClass
  classBodyLineRight?: StyleClass
  classLineRight?: StyleClass
}
export declare type SeparatorSlots = {
  default(): VNode[]
}
export declare type SeparatorEmits = null
export declare type SeparatorExpose = {
  // ---PROPS-------------------------
  vertical: ReadRef<NonNullable<SeparatorProps["vertical"]>>
  content: ReadRef<NonNullable<SeparatorProps["content"]>>
  gradient: ReadRef<number>
  gradientLength: ReadRef<number>
  depth: ReadRef<NonNullable<SeparatorProps["depth"]>>
  classBase: ReadRef<SeparatorProps["class"]>
  classBodyLineLeft: ReadRef<StyleClass>
  classLineLeft: ReadRef<StyleClass>
  classContent: ReadRef<StyleClass>
  classBodyLineRight: ReadRef<StyleClass>
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
declare class Separator extends ClassComponent<SeparatorProps, SeparatorSlots, SeparatorEmits, SeparatorExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Separator: GlobalComponentConstructor<Separator>
  }
}

export default Separator

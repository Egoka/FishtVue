import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass, StyleMode } from "../types"
// ---------------------------------------
export type LabelMode = "offsetDynamic" | "offsetStatic" | "dynamic" | "static" | "vanishing" | "none"
export declare type LabelProps = {
  title?: string
  isRequired?: boolean
  type?: LabelMode
  mode?: StyleMode
  translateX?: number | undefined
  maxWidth?: number | undefined
  classBody?: StyleClass
  class?: StyleClass
}
export declare type LabelSlots = null
export declare type LabelEmits = null
export declare type LabelExpose = {
  // ---PROPS-------------------------
  mode: ReadRef<LabelProps["mode"]>
  type: ReadRef<LabelProps["type"]>
  classBase: ReadRef<LabelProps["classBody"]>
  classBody: ReadRef<LabelProps["class"]>
}
export declare type LabelOption = Pick<LabelProps, "type" | "mode" | "translateX" | "maxWidth" | "class" | "classBody">

// ---------------------------------------
declare class Label extends ClassComponent<LabelProps, LabelSlots, LabelEmits, LabelExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Label: GlobalComponentConstructor<Label>
  }
}

export default Label

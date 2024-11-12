import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, Size, PositionShort, StyleClass } from "../types"
// ---------------------------------------
export declare type DialogProps = {
  modelValue: boolean
  size?: Size
  position?: PositionShort
  notAnimate?: boolean
  closeButton?: boolean
  withoutMargin?: boolean
  notCloseBackground?: boolean
  toTeleport?: string
  class?: StyleClass
  classBody?: StyleClass
}
export declare type DialogSlots = {
  default(): VNode[]
  background(): VNode[]
}
export declare type DialogEmits = {
  (event: "update:modelValue", payload: boolean): void
}
export declare type DialogExpose = {
  // ---PROPS-------------------------
  toTeleport: ReadRef<DialogProps["toTeleport"]>
  isOpen: ReadRef<boolean>
  size: ReadRef<string>
  isCloseButton: ReadRef<DialogProps["closeButton"]>
  notCloseBackground: ReadRef<DialogProps["notCloseBackground"]>
  withoutMargin: ReadRef<DialogProps["withoutMargin"]>
  position: ReadRef<NonNullable<DialogProps["position"]>>
  classBodyDialog: ReadRef<DialogProps["class"]>
  classPosition: ReadRef<StyleClass>
  classBase: ReadRef<StyleClass>
  classDialog: ReadRef<StyleClass>
  // ---METHODS-----------------------
  closeDialog(): void
}
export declare type DialogOption = Pick<
  DialogProps,
  | "class"
  | "classBody"
  | "size"
  | "position"
  | "notAnimate"
  | "closeButton"
  | "withoutMargin"
  | "notCloseBackground"
  | "toTeleport"
>

// ---------------------------------------
declare class Dialog extends ClassComponent<DialogProps, DialogSlots, DialogEmits, DialogExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Dialog: GlobalComponentConstructor<Dialog>
  }
}

export default Dialog

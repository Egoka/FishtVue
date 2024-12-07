import { CSSProperties, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleClass, Size, PositionShort, ReadRef } from "../types"
// ---------------------------------------
export declare type BaseAlert = {
  modelValue?: boolean
  type?: "success" | "warning" | "info" | "error" | "neutral"
  position?: PositionShort
  size?: Size
  title?: string
  subtitle?: string
  toTeleport?: string
  class?: StyleClass
  style?: CSSProperties
  displayTime?: string | number | 1000 | 2000 | 3000 | 4000 | 5000
  notAnimate?: boolean
  closeButton?: boolean
}

export interface AlertProps extends Omit<BaseAlert, "position" | "toTeleport"> {
  position?: "top" | "bottom" | "left" | "right" | "center"
}

export declare type AlertSlots = {
  default(): VNode[]
}
export declare type AlertEmits = {
  (event: "update:modelValue", payload: boolean): void
}
export declare type AlertExpose = {
  // ---STATE-------------------------
  isVisible: ReadRef<boolean>
  // ---PROPS-------------------------
  type: ReadRef<NonNullable<AlertProps["type"]>>
  title: ReadRef<NonNullable<AlertProps["title"]>>
  subtitle: ReadRef<NonNullable<AlertProps["subtitle"]>>
  displayTime: ReadRef<number>
  isCloseButton: ReadRef<NonNullable<AlertProps["closeButton"]>>
  position: ReadRef<NonNullable<AlertProps["position"]>>
  classesStyle: ReadRef<Record<"body" | "icon" | "title" | "subtitle" | "button" | "buttonIcon", StyleClass>>
  size: ReadRef<StyleClass>
  classBase: ReadRef<StyleClass>
  // ---METHODS-----------------------
  close(): void
}
export declare type AlertOption = Pick<
  AlertProps & { toTeleport?: string },
  "type" | "position" | "size" | "class" | "style" | "displayTime" | "notAnimate" | "toTeleport" | "closeButton"
>

// ---------------------------------------
declare class Alert extends ClassComponent<AlertProps, AlertSlots, AlertEmits, AlertExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Alert: GlobalComponentConstructor<Alert>
  }
}

export default Alert

import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { VNode } from "vue"
// ---------------------------------------
type ButtonStyle = {
  mode?: "primary" | "outline" | "ghost"
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  rounded?: "none" | "md" | "lg" | "full"
  color?: "theme" | "neutral" | "creative" | "destructive"
  class?: StyleClass
  classIcon?: StyleClass
}

type BaseButtonProps = {
  icon?: string
  iconPosition?: "left" | "right"
  disabled?: boolean
  loading?: boolean
} & ButtonStyle

export type SimpleButtonProps = BaseButtonProps & {
  type?: "button" | "reset" | "submit"
}

export type IconButtonProps = BaseButtonProps & {
  type: "icon"
}

export type ButtonProps = SimpleButtonProps | IconButtonProps
export declare type ButtonSlots = {
  default(): VNode[]
}
export declare type ButtonEmits = null
export declare type ButtonExpose = {
  // ---PROPS-------------------------
  mode: ReadRef<ButtonProps["mode"]>
  size: ReadRef<ButtonProps["size"]>
  rounded: ReadRef<ButtonProps["rounded"]>
  color: ReadRef<ButtonProps["color"]>
  classBase: ReadRef<ButtonProps["class"]>
  classIcon: ReadRef<ButtonProps["classIcon"]>
  // ---METHODS-----------------------
}
export declare type ButtonOption = Pick<ButtonProps, "mode" | "size" | "rounded" | "color" | "class" | "classIcon">

// ---------------------------------------
declare class Button extends ClassComponent<ButtonProps, ButtonSlots, ButtonEmits, ButtonExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Button: GlobalComponentConstructor<Button>
  }
}

export default Button

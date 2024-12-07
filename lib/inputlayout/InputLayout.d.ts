import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, StyleMode, TWidth, THeight, StyleClass, ReadRef } from "../types"
import { LabelMode } from "fishtvue/label"
// ---------------------------------------
export declare type InputLayoutProps = {
  value: any
  isValue?: boolean
  mode?: StyleMode
  label?: string
  labelMode?: LabelMode
  isInvalid?: boolean
  messageInvalid?: string
  required?: boolean
  loading?: boolean
  disabled?: boolean
  help?: string
  clear?: boolean
  width?: TWidth
  height?: THeight
  animation?: "transition-all duration-500" | "transition-none" | string
  classBody?: StyleClass | "mb-6 rounded-md"
  class?: StyleClass
}
export declare type InputLayoutSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
  body(): VNode[]
}
export declare type InputLayoutEmits = {
  (event: "clear"): void
}
export declare type InputLayoutExpose = {
  // ---STATE-------------------------
  input: ReadRef<HTMLElement | undefined>
  inputBody: ReadRef<HTMLElement | undefined>
  beforeInput: ReadRef<HTMLElement | undefined>
  afterInput: ReadRef<HTMLElement | undefined>
  headerHeight: ReadRef<number>
  isCopy: ReadRef<boolean>
  beforeWidth: ReadRef<number | null>
  afterWidth: ReadRef<number | null>
  // ---PROPS-------------------------
  value: ReadRef<InputLayoutProps["value"]>
  isValue: ReadRef<InputLayoutProps["isValue"]>
  mode: ReadRef<InputLayoutProps["mode"]>
  label: ReadRef<InputLayoutProps["label"]>
  labelMode: ReadRef<InputLayoutProps["labelMode"]>
  labelType: ReadRef<InputLayoutProps["labelMode"]>
  isRequired: ReadRef<InputLayoutProps["required"]>
  isLoading: ReadRef<InputLayoutProps["loading"]>
  isDisabled: ReadRef<InputLayoutProps["disabled"]>
  isInvalid: ReadRef<InputLayoutProps["isInvalid"]>
  messageInvalid: ReadRef<InputLayoutProps["messageInvalid"]>
  help: ReadRef<InputLayoutProps["help"]>
  width: ReadRef<InputLayoutProps["width"]>
  height: ReadRef<InputLayoutProps["height"]>
  animation: ReadRef<InputLayoutProps["animation"]>
  class: ReadRef<InputLayoutProps["class"]>
  classBody: ReadRef<InputLayoutProps["classBody"]>
  // ---METHODS-----------------------
  copy(): void
}
export declare type InputLayoutOption = Pick<
  InputLayoutProps,
  "mode" | "labelMode" | "clear" | "animation" | "classBody" | "class"
>

// ---------------------------------------
declare class InputLayout extends ClassComponent<
  InputLayoutProps,
  InputLayoutSlots,
  InputLayoutEmits,
  InputLayoutExpose
> {}

declare module "vue" {
  export interface GlobalComponents {
    InputLayout: GlobalComponentConstructor<InputLayout>
  }
}

export default InputLayout

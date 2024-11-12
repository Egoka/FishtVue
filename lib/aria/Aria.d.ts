import { Ref, type VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
// ---------------------------------------
export declare type BaseAriaProps = {
  placeholder?: string
  autocomplete?: "on" | "off"
  wrap?: "soft" | "hard" | "off"
  rows?: number
  maxLength?: number
  classBase: StyleClass
  classInput?: StyleClass
}

export interface AriaProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseAriaProps> {
  id?: string
  modelValue?: string | number | null | undefined
}

export declare type AriaSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
export declare type AriaEmits = {
  (event: "update:modelValue", payload: string): void
  (event: "update:isInvalid", payload: boolean): void
  (event: "change:modelValue", payload: boolean): void
  (event: "focus", env: FocusEvent): void
  (event: "blur", env: FocusEvent): void
}
export declare type AriaExpose = {
  // ---STATE-------------------------
  layout: Ref<InputLayoutExpose | undefined>
  inputRef: ReadRef<HTMLElement | undefined>
  // ---PROPS-------------------------
  id: ReadRef<AriaProps["id"]>
  modelValue: ReadRef<AriaProps["modelValue"]>
  placeholder: ReadRef<AriaProps["placeholder"]>
  autocomplete: ReadRef<AriaProps["autocomplete"]>
  wrap: ReadRef<AriaProps["wrap"]>
  rows: ReadRef<AriaProps["rows"]>
  maxLength: ReadRef<AriaProps["maxLength"]>
  isValue: ReadRef<InputLayoutProps["isValue"]>
  mode: ReadRef<AriaProps["mode"]>
  isDisabled: ReadRef<AriaProps["disabled"]>
  isLoading: ReadRef<AriaProps["loading"]>
  isInvalid: ReadRef<AriaProps["isInvalid"]>
  messageInvalid: ReadRef<AriaProps["messageInvalid"]>
  classStyle: ReadRef<AriaProps["class"]>
  // ---METHODS-----------------------
  closeAria(evt: MouseEvent): void
  clear(): void
}
export declare type AriaOption = Pick<AriaProps, "classBase" | "classInput" | keyof InputLayoutOption>

// ---------------------------------------
declare class Aria extends ClassComponent<AriaProps, AriaSlots, AriaEmits, AriaExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Aria: GlobalComponentConstructor<Aria>
  }
}

export default Aria

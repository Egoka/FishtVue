import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass } from "../types"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
// ---------------------------------------
export declare type BaseInputProps = {
  type: "text" | "number" | "email" | "password"
  autoFocus: boolean
  placeholder: string
  autocomplete: "on" | "off"
  maskInput: "phone" | "number" | "price" | string
  lengthInteger: number
  lengthDecimal: number
  classInput: StyleClass
}

export interface InputProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseInputProps> {
  id?: string
  modelValue?: string | number | null | undefined
}

export declare type InputSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
export declare type InputEmits = {
  (event: "clear", payload: string): void
  (event: "focus", env: FocusEvent): void
  (event: "blur", env: FocusEvent): void
  (event: "update:modelValue", payload: string): void
  (event: "change:modelValue", payload: string): void
  (event: "update:isInvalid", payload: boolean): void
  (event: "isActive", payload: boolean): void
}
export declare type InputExpose = {
  //---STATE-------------------------
  layout: Ref<InputLayoutExpose | undefined>
  isActiveInput: ReadRef<boolean>
  classLayout: ReadRef<InputProps["class"]>
  // ---PROPS-------------------------------
  id: ReadRef<InputProps["id"]>
  type: ReadRef<InputProps["type"]>
  mask: ReadRef<InputProps["maskInput"]>
  modelValue: ReadRef<InputProps["modelValue"]>
  autoFocus: ReadRef<InputProps["autoFocus"]>
  placeholder: ReadRef<InputProps["placeholder"]>
  autocomplete: ReadRef<InputProps["autocomplete"]>
  lengthInteger: ReadRef<InputProps["lengthInteger"]>
  lengthDecimal: ReadRef<InputProps["lengthDecimal"]>
  isValue: ReadRef<InputLayoutProps["isValue"]>
  mode: ReadRef<InputProps["mode"]>
  isDisabled: ReadRef<InputProps["disabled"]>
  isLoading: ReadRef<InputProps["loading"]>
  isInvalid: ReadRef<InputProps["isInvalid"]>
  messageInvalid: ReadRef<InputProps["messageInvalid"]>
  classBaseInput: ReadRef<InputProps["class"]>
  // ---METHODS-----------------------------
  toMask(baseValue: string | number): string
  inputModelValue(valueResult: any): void
  changeModelValue(valueResult: any): void
  clear(): void
  focus(env: FocusEvent): void
  blur(env: FocusEvent): void
}
export declare type InputOption = Pick<InputProps, "classInput" | keyof InputLayoutOption>

// ---------------------------------------
declare class Input extends ClassComponent<InputProps, InputSlots, InputEmits, InputExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Input: GlobalComponentConstructor<Input>
  }
}

export default Input

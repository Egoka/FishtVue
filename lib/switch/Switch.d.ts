import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef, StyleClass, StyleMode } from "../types"
import { IconsProps } from "fishtvue/icons"
// ---------------------------------------
type Imode = StyleMode | "none" | string
export declare type BaseSwitchProps = {
  mode: Imode
  rounded: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | number | "full"
  iconActive: IconsProps["type"]
  iconInactive: IconsProps["type"]
  switchingType: "checkbox" | "switch" | string
}

export interface SwitchProps extends Partial<BaseSwitchProps> {
  id?: string
  modelValue?: boolean | null | undefined
  label?: string
  disabled?: boolean
  help?: string
  required?: boolean
  class?: StyleClass
}

export declare type SwitchSlots = {
  default(): VNode[]
}
export declare type SwitchEmits = {
  (event: "update:modelValue", payload: boolean): void
  (event: "updateModelValue", payload: boolean): void
  (event: "change:modelValue", payload: boolean): void
}
export declare type SwitchExpose = {
  //---STATE-------------------------
  // ---PROPS-------------------------------
  id: ReadRef<SwitchProps["id"]>
  mode: ReadRef<SwitchProps["mode"]>
  label: ReadRef<SwitchProps["label"]>
  rounded: ReadRef<SwitchProps["rounded"]>
  isDisabled: ReadRef<SwitchProps["disabled"]>
  isRequired: ReadRef<SwitchProps["required"]>
  iconActive: ReadRef<SwitchProps["iconActive"]>
  iconInactive: ReadRef<SwitchProps["iconInactive"]>
  switchingType: ReadRef<SwitchProps["switchingType"]>
  classBaseSwitch: ReadRef<StyleClass>
  classSwitch: ReadRef<StyleClass>
  // ---METHODS-----------------------------
  inputEvent(value: boolean): void
}
export declare type SwitchOption = Pick<
  SwitchProps,
  "mode" | "rounded" | "iconActive" | "iconInactive" | "switchingType" | "class"
>

// ---------------------------------------
declare class Switch extends ClassComponent<SwitchProps, SwitchSlots, SwitchEmits, SwitchExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Switch: GlobalComponentConstructor<Switch>
  }
}

export default Switch

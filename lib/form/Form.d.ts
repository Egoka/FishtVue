import { VNode } from "vue"
import { Rules } from "fishtvue/utils/rulesHandler"
import { ClassComponent, GlobalComponentConstructor, StyleClass, StyleMode } from "../types"
import { LabelMode } from "fishtvue/label"
import { InputProps } from "fishtvue/input"
import { AriaProps } from "fishtvue/aria"
import { SelectProps } from "fishtvue/select"
import { CalendarProps } from "fishtvue/calendar"
import { TextEditorProps } from "fishtvue/texteditor"
import { SwitchProps } from "fishtvue/switch"
// ---------------------------------------
type classCol = "col-span-full" | "sm:col-span-3" | "sm:col-span-4" | "sm:col-span-5" | "sm:col-span-6" | string
export type FormValues = { [key: string]: unknown }
export type Field = {
  name: string
  classCol?: classCol
  isHidden?: boolean | undefined
  rules?: Rules
}
export type FieldAdditional = {
  insert?: {
    beforeIcon?: string
    beforeText?: string
    afterIcon?: string
    afterText?: string
  }
}
export type FieldInput = Field &
  FieldAdditional &
  InputProps & {
    typeComponent: "Input"
  }
export type FieldAria = Field &
  FieldAdditional &
  AriaProps & {
    typeComponent: "Aria"
  }
export type FieldSelect = Field &
  FieldAdditional &
  SelectProps & {
    typeComponent: "Select"
    rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }
export type FieldCalendar = Field &
  FieldAdditional &
  CalendarProps & {
    typeComponent: "Calendar"
    rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }
export type FieldTextEditor = Field &
  FieldAdditional &
  TextEditorProps & {
    typeComponent: "TextEditor"
    rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }
export type FieldSwitch = Field &
  SwitchProps & {
    typeComponent: "Switch"
  }
export type FieldCustom = Field & {
  typeComponent: "Custom"
  nameTemplate: string
  modelValue?: any
  isValue?: boolean
  [key: string]: unknown
}
export type FieldType =
  | FieldInput
  | FieldAria
  | FieldSelect
  | FieldCalendar
  | FieldTextEditor
  | FieldSwitch
  | FieldCustom
export type FieldUseInputLayout = FieldInput | FieldAria | FieldSelect | FieldCalendar | FieldTextEditor

export interface FormStructure {
  isHidden?: boolean
  class?: "border-b border-gray-900/10 pb-12" | string
  classGrid?: "grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-10" | string
  fields: Array<FieldType>

  [key: string]: unknown
}

export interface FormProps {
  name?: string
  structure: Array<FormStructure>
  formFields?: FormValues
  class?: StyleClass
  modeStyle?: StyleMode
  modeLabel?: LabelMode
  modeValidate?: "onSubmit" | "onChange" | "onInput"
  submitButton?: string | "Save"
  structureClass?: "border-b border-gray-900/10 pb-12" | string
  structureClassGrid?: "grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-10" | string
  disabled?: boolean
  autocomplete?: "on" | "off"
}

export declare type FormSlots = {
  default(): VNode[]
  itemTitle(): VNode[]
  footer(): VNode[]
}
export declare type FormEmits = {
  (event: "update:formFields", payload: FormValues): void
  (event: "submit", payload: FormValues): void
}
export declare type FormExpose = {
  //---STATE-------------------------
  // ---PROPS-------------------------------
  formFields: FormValues
  // ---METHODS-----------------------------
  setFieldValue(fieldName: string, value: any): void
  setFieldParam(fieldName: string, param: keyof FieldType, value: any): void
  getField(fieldName: string): FieldType | null
  setStructureParam(indexStructure: number, param: keyof FormStructure, value: any): void
  validateFields(nameField?: Array<string> | string): boolean
}
export declare type FormOption = Pick<
  FormProps,
  | "class"
  | "modeStyle"
  | "modeLabel"
  | "modeValidate"
  | "submitButton"
  | "structureClass"
  | "structureClassGrid"
  | "autocomplete"
>

// ---------------------------------------
declare class Form extends ClassComponent<FormProps, FormSlots, FormEmits, FormExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    Form: GlobalComponentConstructor<Form>
  }
}

export default Form

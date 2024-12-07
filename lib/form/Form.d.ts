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

/**
 * ## Form
 *
 * Form - a component for creating dynamic forms with flexible structures and validations.
 *
 * Supports multiple field types, advanced customization, and real-time validation.
 */
declare class Form extends ClassComponent<FormProps, FormSlots, FormEmits, FormExpose> {}

// ---------------------------------------
type classCol = "col-span-full" | "sm:col-span-3" | "sm:col-span-4" | "sm:col-span-5" | "sm:col-span-6" | string
export type FormValues = { [key: string]: unknown }
/**
 * Represents a base field configuration within the form structure.
 */
export type Field = {
  /**
   * The name of the field, used as a key in the form values.
   * @type {string}
   */
  name: string

  /**
   * Custom CSS class for the column layout of the field.
   * @type {classCol | undefined}
   */
  classCol?: classCol

  /**
   * Indicates whether the field is hidden.
   * @type {boolean | undefined}
   */
  isHidden?: boolean | undefined

  /**
   * Validation rules applied to the field.
   * @type {Rules | undefined}
   */
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
    // rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }
export type FieldCalendar = Field &
  FieldAdditional &
  CalendarProps & {
    typeComponent: "Calendar"
    // rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }
export type FieldTextEditor = Field &
  FieldAdditional &
  TextEditorProps & {
    typeComponent: "TextEditor"
    // rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }
export type FieldSwitch = Field &
  SwitchProps & {
    typeComponent: "Switch"
  }
/**
 * Represents a custom field type within the form structure.
 */
export type FieldCustom = Field & {
  /**
   * The type of the component, indicating it's a custom field.
   * @type {"Custom"}
   */
  typeComponent: "Custom"

  /**
   * The name of the custom template used for rendering this field.
   * @type {string}
   */
  nameTemplate: string

  /**
   * The value of the custom field.
   * @type {any | undefined}
   */
  modelValue?: any

  /**
   * Indicates whether the field has a value.
   * @type {boolean | undefined}
   */
  isValue?: boolean

  /**
   * Additional custom properties for the field.
   * @type {Record<string, unknown>}
   */
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

/**
 * Structure for defining a section in the form.
 */
export interface FormStructure {
  /**
   * Indicates whether the section is hidden.
   * @type {boolean | undefined}
   */
  isHidden?: boolean

  /**
   * Custom CSS class for the section.
   * @type {string | undefined}
   */
  class?: "border-b border-gray-900/10 pb-12" | string

  /**
   * CSS class for the grid layout of the section.
   * @type {string | undefined}
   */
  classGrid?: "grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-10" | string

  /**
   * Array of fields in the section.
   * @type {Array<FieldType>}
   */
  fields: Array<FieldType>

  /**
   * Additional custom properties for the section.
   * @type {Record<string, unknown>}
   */
  [key: string]: unknown
}

/**
 * Props for the Form component.
 */
export interface FormProps {
  /**
   * The name of the form.
   * @type {string | undefined}
   */
  name?: string

  /**
   * The structure of the form, including fields and layout settings.
   * @type {Array<FormStructure>}
   */
  structure: Array<FormStructure>

  /**
   * The current values of the form fields.
   * @type {FormValues | undefined}
   */
  formFields?: FormValues

  /**
   * Custom CSS class for the form container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * The styling mode for the form.
   * @type {StyleMode | undefined}
   */
  modeStyle?: StyleMode

  /**
   * The label mode for the form.
   * @type {LabelMode | undefined}
   */
  modeLabel?: LabelMode

  /**
   * The validation mode for the form fields.
   * @type {"onSubmit" | "onChange" | "onInput" | undefined}
   */
  modeValidate?: "onSubmit" | "onChange" | "onInput"

  /**
   * The text for the form's submit button.
   * @type {string | "Save" | undefined}
   */
  submitButton?: string | "Save"

  /**
   * CSS class for the form structure section.
   * @type {string | undefined}
   */
  structureClass?: "border-b border-gray-900/10 pb-12" | string

  /**
   * CSS class for the grid layout in the form structure.
   * @type {string | undefined}
   */
  structureClassGrid?: "grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mt-10" | string

  /**
   * Disables the entire form.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Enables or disables form autocomplete.
   * @type {"on" | "off" | undefined}
   */
  autocomplete?: "on" | "off"
}

export declare type FormSlots = {
  default(): VNode[]
  itemTitle(): VNode[]
  footer(): VNode[]
}

/**
 * Events emitted by the Form component.
 */
export declare type FormEmits = {
  /**
   * Emitted when the form field values are updated.
   * @param event
   * @param {FormValues} payload - The updated form values.
   */
  (event: "update:formFields", payload: FormValues): void

  /**
   * Emitted when the form is submitted.
   * @param event
   * @param {FormValues} payload - The form values at the time of submission.
   */
  (event: "submit", payload: FormValues): void
}
/**
 * Methods and states exposed via `ref` for the Form component.
 */
export declare type FormExpose = {
  // ---PROPS-------------------------------
  /**
   * The current values of the form fields.
   * @type {FormValues}
   */
  formFields: FormValues

  // ---METHODS-----------------------------
  /**
   * Sets the value for a specific field in the form.
   *
   * @param {string} fieldName - The name of the field.
   * @param {any} value - The value to set.
   */
  setFieldValue(fieldName: string, value: any): unknown | undefined

  /**
   * Updates a specific parameter for a field.
   *
   * @param {string} fieldName - The name of the field.
   * @param {keyof FieldType} param - The parameter to update.
   * @param {any} value - The value to set.
   */
  setFieldParam(fieldName: string, param: keyof FieldType, value: any): void

  /**
   * Retrieves the configuration for a specific field.
   *
   * @param {string} fieldName - The name of the field.
   * @returns {FieldType | null} - The field configuration or `null` if not found.
   */
  getField(fieldName: string): FieldType | null
  /**
   * Checks if a specific field is in an invalid state.
   *
   * This method validates the field by its name and returns a boolean
   * indicating whether the field has failed validation.
   *
   * @param {string} fieldName - The name of the field to check.
   * @returns {boolean | undefined} - Returns `true` if the field is invalid,
   *                                  `false` if valid, or `undefined` if the field is not found.
   */
  isFieldInvalid(fieldName: string): boolean | undefined

  /**
   * Updates a parameter for a specific structure section.
   *
   * @param {number} indexStructure - The index of the structure section.
   * @param {keyof FormStructure} param - The parameter to update.
   * @param {any} value - The value to set.
   */
  setStructureParam(indexStructure: number, param: keyof FormStructure, value: any): void

  /**
   * Validates the specified fields or the entire form.
   *
   * @param {Array<string> | string | undefined} nameField - The fields to validate, or all if omitted.
   * @returns {boolean} - `true` if all fields are valid, otherwise `false`.
   */
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

declare module "vue" {
  export interface GlobalComponents {
    Form: GlobalComponentConstructor<Form>
  }
}

export default Form

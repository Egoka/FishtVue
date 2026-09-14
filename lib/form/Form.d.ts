import { Component, MaybeRef, VNode } from "vue"
import { Rules } from "fishtvue/utils/rulesHandler"
import { ClassComponent, ClassesMap, GlobalComponentConstructor, StyleClass, StyleMode } from "../types"
import { LabelMode } from "fishtvue/label"
import { InputProps } from "fishtvue/input"
import { TextareaProps } from "fishtvue/textarea"
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
/**
 * Ключи карты `classes` (dev-patterns §2 B). Все — element-вида (аддитивные, twMerge).
 * `root` — `<form data-form>` (добавляется `ClassesMap`).
 * - `section` — секция `[data-form-item]` (бывший `structureClass` / `FormStructure.class`).
 * - `grid` — grid-раскладка полей `[data-form-group]` (бывший `structureClassGrid` / `classGrid`).
 * - `field` — колонка поля `[data-form-field]` (бывший `classCol`).
 * - `footer` — подвал с submit-кнопкой `[data-form-footer]`.
 */
export declare type FormClassKey = "section" | "grid" | "field" | "footer"
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
   * Карта классов поля. Ключ `field` — колонка `[data-form-field]` (бывший `classCol`);
   * остальные ключи уходят в контрол поля как его собственный `classes`.
   * @type {ClassesMap<FormClassKey> | undefined}
   */
  classes?: ClassesMap<FormClassKey> & Record<string, StyleClass>

  /**
   * Скрыть поле. Bare-positive имя снятого `isHidden` (dev-patterns §2 F).
   * @type {boolean | undefined}
   */
  hidden?: boolean

  /**
   * Validation rules applied to the field.
   * @type {Rules | undefined}
   */
  rules?: Rules
}
/**
 * Additional field properties for inserting icons and text before or after the field
 */
export type FieldAdditional = {
  /**
   * Configuration for inserting content before or after the field
   */
  insert?: {
    /**
     * Icon to display before the field
     */
    beforeIcon?: string
    /**
     * Text to display before the field
     */
    beforeText?: string
    /**
     * Icon to display after the field
     */
    afterIcon?: string
    /**
     * Text to display after the field
     */
    afterText?: string
  }
}

/**
 * Field configuration for Input component
 *
 * Inherits from InputLayoutProps (via InputProps) which provides common properties like:
 * label, labelMode, mode, isInvalid, messageInvalid, required, loading, disabled, help, clear, etc.
 *
 * @property {typeComponent} typeComponent - Must be "Input" to identify this field type
 */
export type FieldInput = Field &
  FieldAdditional &
  InputProps & {
    /**
     * The type of component, must be "Input"
     */
    typeComponent: "Input"
  }

/**
 * Field configuration for Textarea component
 *
 * Inherits from InputLayoutProps (via TextareaProps) which provides common properties like:
 * label, labelMode, mode, isInvalid, messageInvalid, required, loading, disabled, help, clear, etc.
 *
 * @property {typeComponent} typeComponent - Must be "Textarea" to identify this field type
 */
export type FieldTextarea = Field &
  FieldAdditional &
  TextareaProps & {
    /**
     * The type of component, must be "Textarea"
     */
    typeComponent: "Textarea"
  }

/**
 * Field configuration for Select component
 *
 * Inherits from InputLayoutProps (via SelectProps) which provides common properties like:
 * label, labelMode, mode, isInvalid, messageInvalid, required, loading, disabled, help, clear, etc.
 *
 * @property {typeComponent} typeComponent - Must be "Select" to identify this field type
 */
export type FieldSelect = Field &
  FieldAdditional &
  SelectProps & {
    /**
     * The type of component, must be "Select"
     */
    typeComponent: "Select"
    // rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }

/**
 * Field configuration for Calendar component
 *
 * Inherits from InputLayoutProps (via CalendarProps) which provides common properties like:
 * label, labelMode, mode, isInvalid, messageInvalid, required, loading, disabled, help, clear, etc.
 *
 * @property {typeComponent} typeComponent - Must be "Calendar" to identify this field type
 */
export type FieldCalendar = Field &
  FieldAdditional &
  CalendarProps & {
    /**
     * The type of component, must be "Calendar"
     */
    typeComponent: "Calendar"
    // rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }

/**
 * Field configuration for TextEditor component
 *
 * Inherits from InputLayoutProps (via TextEditorProps) which provides common properties like:
 * label, labelMode, mode, isInvalid, messageInvalid, required, loading, disabled, help, clear, etc.
 *
 * @property {typeComponent} typeComponent - Must be "TextEditor" to identify this field type
 */
export type FieldTextEditor = Field &
  FieldAdditional &
  TextEditorProps & {
    /**
     * The type of component, must be "TextEditor"
     */
    typeComponent: "TextEditor"
    // rules?: Omit<Rules, "email" | "phone" | "numeric" | "regular">
  }

/**
 * Field configuration for Switch component
 *
 * Note: Switch does NOT inherit from InputLayoutProps, it has its own props structure.
 *
 * @property {typeComponent} typeComponent - Must be "Switch" to identify this field type
 */
export type FieldSwitch = Field &
  SwitchProps & {
    /**
     * The type of component, must be "Switch"
     */
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
   * Есть ли у поля значение. Единое имя с семейством [InputLayout](./inputlayout.md)
   * (там `isValue` → `hasValue` снят в W2).
   * @type {boolean | undefined}
   */
  hasValue?: boolean

  /**
   * Additional custom properties for the field.
   * @type {Record<string, unknown>}
   */
  [key: string]: unknown
}
/**
 * Field configuration for a custom field type registered via `registerFieldType` (Issue 3).
 *
 * `typeComponent` is an open string that does not match the built-in types — Form renders the
 * registered component bound to the field value (`modelValue`) and passthrough props.
 */
export type FieldRegistered = Field &
  FieldAdditional & {
    /**
     * Open `typeComponent` name, registered through `registerFieldType`.
     * @type {string}
     */
    typeComponent: string

    /**
     * The value of the registered field.
     * @type {any | undefined}
     */
    modelValue?: any

    /**
     * Additional passthrough props forwarded to the registered component.
     * @type {Record<string, unknown>}
     */
    [key: string]: unknown
  }

/**
 * Type of component that determines which fields are available in the field object.
 *
 * Open union (Issue 3): besides the built-in types, any `string` is accepted for fields rendered
 * through `registerFieldType`.
 */
export type FieldComponentType =
  | "Input"
  | "Textarea"
  | "Select"
  | "Calendar"
  | "TextEditor"
  | "Switch"
  | "Custom"
  | (string & {})

/**
 * Generic field type that determines available properties based on the component type
 * @template T - The type of component, which determines which fields are available
 */
export type FieldType<T extends FieldComponentType = FieldComponentType> = T extends "Input"
  ? FieldInput
  : T extends "Textarea"
    ? FieldTextarea
    : T extends "Select"
      ? FieldSelect
      : T extends "Calendar"
        ? FieldCalendar
        : T extends "TextEditor"
          ? FieldTextEditor
          : T extends "Switch"
            ? FieldSwitch
            : T extends "Custom"
              ? FieldCustom
              : FieldRegistered
// : FieldInput | FieldTextarea | FieldSelect | FieldCalendar | FieldTextEditor | FieldSwitch | FieldCustom

// ---ISSUE 3 — публичный API реестра пользовательских типов полей (runtime — ./fieldRegistry).
/**
 * Registers a custom field type under a string `typeComponent` name. Built-in types cannot be
 * overridden — they resolve before the registry.
 *
 * @param {string} name - The `typeComponent` name used in the form structure.
 * @param {Component} component - The Vue component Form renders for this type.
 */
export declare function registerFieldType(name: string, component: Component): void
/**
 * Returns the component registered for a field type, or `undefined`.
 *
 * @param {string} name - The field type name.
 * @returns {Component | undefined}
 */
export declare function getFieldType(name: string): Component | undefined
/**
 * Checks whether a field type is registered.
 *
 * @param {string} name - The field type name.
 * @returns {boolean}
 */
export declare function hasFieldType(name: string): boolean

/**
 * Union type for fields that use InputLayout component
 *
 * Includes only field types that inherit from InputLayoutProps:
 * - FieldInput
 * - FieldTextarea
 * - FieldSelect
 * - FieldCalendar
 * - FieldTextEditor
 *
 * Excludes FieldSwitch (does not use InputLayout) and FieldCustom (custom implementation)
 */
export type FieldUseInputLayout = FieldInput | FieldTextarea | FieldSelect | FieldCalendar | FieldTextEditor

/**
 * Structure for defining a section in the form.
 */
export interface FormStructure {
  /**
   * Array of fields in the section.
   * @type {Array<FieldType>}
   */
  fields: Array<FieldType>

  /**
   * Скрыть секцию. Bare-positive имя снятого `isHidden`.
   * @type {boolean | undefined}
   */
  hidden?: boolean

  /**
   * Классы контейнера секции `[data-form-item]` — самый частный сегмент, идёт после
   * `classes.section` самой формы.
   * @type {string | undefined}
   */
  class?: "border-b border-gray-900/10 pb-12" | string

  /**
   * Карта классов секции; ключ `grid` — её grid-раскладка `[data-form-group]`
   * (бывший `classGrid`).
   * @type {ClassesMap<FormClassKey> | undefined}
   */
  classes?: ClassesMap<FormClassKey>

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
   * Can be passed as a constant value or as a ref. Optional (Issue 2): when omitted, Form builds the
   * structure from compound `<FormSection>`/`<FormField>` children. Schema wins when both are present.
   * @type {MaybeRef<Array<FormStructure>> | undefined}
   */
  structure?: MaybeRef<Array<FormStructure>>

  /**
   * The current values of the form fields.
   * Can be passed as a constant value or as a ref.
   * @type {MaybeRef<FormValues> | undefined}
   */
  formFields?: MaybeRef<FormValues>

  /**
   * CSS-классы корня `<form data-form>` (dev-patterns §2 A).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов: `section`, `grid`, `field`, `footer`;
   * `root` ≡ `class`. См. `FormClassKey`.
   * @type {ClassesMap<FormClassKey> | undefined}
   */
  classes?: ClassesMap<FormClassKey>

  /**
   * Визуальный режим, который форма проставляет полям по умолчанию. Бывший `modeStyle`.
   * @type {StyleMode | undefined}
   */
  mode?: StyleMode

  /**
   * Режим лейбла, который форма проставляет полям по умолчанию. Единое имя с семейством
   * [InputLayout](./inputlayout.md). Бывший `modeLabel`.
   * @type {LabelMode | undefined}
   */
  labelMode?: LabelMode

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
   * Disables the entire form.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Enables or disables form autocomplete.
   * @type {"on" | "off" | undefined}
   */
  autocomplete?: "on" | "off"

  /**
   * Native form `action` URL. When set, a valid submit performs a real browser submission
   * (Form does not call `preventDefault`); otherwise the form stays in SPA mode (`submit` event only).
   * @type {string | undefined}
   */
  action?: string

  /**
   * Native form `method`. Forwarded to the root `<form>` element.
   * @type {"get" | "post" | "dialog" | undefined}
   */
  method?: "get" | "post" | "dialog"

  /**
   * Native form `enctype`. Forwarded to the root `<form>` element (e.g. `multipart/form-data`).
   * @type {string | undefined}
   */
  enctype?: string

  /**
   * Opt-in to native browser submission for a valid form even without `action`. When `false`
   * (default), Form prevents the default submit and emits the `submit` event (SPA mode).
   * Invalid forms always block submission regardless of this flag.
   * @type {boolean | undefined}
   */
  nativeSubmit?: boolean
}
interface DynamicSlots {
  [key: string]: (args: {
    data: FieldCustom & FormValues
    updateModelValue(value: any): void
    changeModelValue(value: any): void
  }) => VNode[]
}
export declare type FormSlots = {
  itemTitle(args: { structure: Omit<FormStructure, "class" | "classGrid" | "fields"> }): VNode[]
  footer(): VNode[]
} & DynamicSlots

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
   * Визуальный режим, который форма проставляет полям. Бывший `modeStyle`.
   * @type {FormProps["mode"]}
   */
  mode: FormProps["mode"]

  /**
   * Режим лейбла, который форма проставляет полям. Бывший `modeLabel`.
   * @type {FormProps["labelMode"]}
   */
  labelMode: FormProps["labelMode"]

  /**
   * Ref to the root `<form>` element (G34) — for native `requestSubmit()`, scrolling, focus, etc.
   * @type {HTMLFormElement | undefined}
   */
  formElement: HTMLFormElement | undefined

  /**
   * The current values of the form fields.
   * @type {FormValues}
   */
  formFields: FormValues

  /**
   * Object containing the invalid state for each field.
   * @type {{ [key: string]: boolean }}
   */
  formInvalidFields: { [key: string]: boolean }

  /**
   * The processed form structure with all computed values and defaults applied.
   * @type {Array<FormStructure> | undefined}
   */
  formStructure: Array<FormStructure> | undefined

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
  setFieldParam<T extends FieldComponentType>(fieldName: string, param: keyof FieldType<T>, value: any): void

  /**
   * Retrieves the configuration for a specific field.
   *
   * @param {string} fieldName - The name of the field.
   * @returns {FieldType | null} - The field configuration or `null` if not found.
   */
  getField<T extends FieldComponentType>(fieldName: string): FieldType<T> | null
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
  "class" | "classes" | "mode" | "labelMode" | "modeValidate" | "submitButton" | "autocomplete"
>

// ---------------------------------------
// ---ISSUE 2 — compound API: <Form><FormSection><FormField> (renderless descriptors).
// `<Form>` reads these children via VNode-walk of slots.default() (canon — НЕ provide/inject,
// зеркало Table/Menu) и синтезирует FormStructure[]. Schema `:structure` при наличии выигрывает.

/**
 * Props for the `<FormField>` descriptor (compound API). Declares a single field; `<Form>` reads
 * these via VNode-walk and renders the matching control bound to `formFields[name]`. A default slot
 * turns the field into a custom control with a value-bridge.
 */
export type FormFieldProps = {
  /**
   * Field name — key in form values.
   * @type {string}
   */
  name: string

  /**
   * Тип поля — единственный дискриминатор схемы. Built-in либо зарегистрированный через
   * `registerFieldType`. Снятый алиас `type` конфликтовал с `InputProps.type`.
   * @type {FieldComponentType | undefined}
   */
  typeComponent?: FieldComponentType

  /**
   * Field label.
   * @type {string | undefined}
   */
  label?: string

  /**
   * Validation rules applied to the field.
   * @type {Rules | undefined}
   */
  rules?: Rules

  /**
   * Initial value of the field.
   * @type {any | undefined}
   */
  modelValue?: any

  /**
   * Custom-slot template name (for `Custom`-typed fields without a default slot).
   * @type {string | undefined}
   */
  nameTemplate?: string

  /**
   * Карта классов поля; ключ `field` — его колонка `[data-form-field]` (бывший `classCol`).
   * @type {ClassesMap<FormClassKey> | undefined}
   */
  classes?: ClassesMap<FormClassKey> & Record<string, StyleClass>

  /**
   * Скрыть поле. Bare-positive имя снятого `isHidden`.
   * @type {boolean | undefined}
   */
  hidden?: boolean

  /**
   * Passthrough props forwarded to the resolved field control (e.g. `dataSelect`, `mask`).
   * @type {unknown}
   */
  [key: string]: unknown
}

/**
 * Slots of `<FormField>`. The default slot renders a custom control with a value-bridge
 * (`updateModelValue`/`changeModelValue`) — identical contract to the schema-driven `Custom` field.
 */
export declare type FormFieldSlots = {
  default(props: {
    data: FieldCustom & FormValues
    updateModelValue(value: any): void
    changeModelValue(value: any): void
  }): VNode[]
}

/**
 * `<FormField>` — renderless field descriptor for the compound `<Form>` API.
 *
 * ```vue
 * <Form v-model:form-fields="values">
 *   <FormField name="email" type="Input" label="Email" :rules="{ required: true }" />
 *   <FormField name="rating"><MyRating /></FormField>
 * </Form>
 * ```
 */
declare class FormField extends ClassComponent<FormFieldProps, FormFieldSlots, null, NonNullable<unknown>> {}

/**
 * Props for the `<FormSection>` descriptor (compound API) — groups `<FormField>` children into a
 * form section.
 */
export type FormSectionProps = {
  /**
   * Section title — forwarded to the `itemTitle` slot.
   * @type {string | undefined}
   */
  title?: string

  /**
   * Section description — forwarded to the `itemTitle` slot.
   * @type {string | undefined}
   */
  description?: string

  /**
   * Custom CSS class for the section container.
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов секции; ключ `grid` — её grid-раскладка `[data-form-group]`
   * (бывший `classGrid`).
   * @type {ClassesMap<FormClassKey> | undefined}
   */
  classes?: ClassesMap<FormClassKey>

  /**
   * Скрыть секцию. Bare-positive имя снятого `isHidden`.
   * @type {boolean | undefined}
   */
  hidden?: boolean
}

/**
 * Slots of `<FormSection>` — nested `<FormField>` descriptors.
 */
export declare type FormSectionSlots = {
  default(): VNode[]
}

/**
 * `<FormSection>` — renderless section descriptor for the compound `<Form>` API.
 *
 * ```vue
 * <Form v-model:form-fields="values">
 *   <FormSection title="User">
 *     <FormField name="name" type="Input" />
 *     <FormField name="email" type="Input" />
 *   </FormSection>
 * </Form>
 * ```
 */
declare class FormSection extends ClassComponent<FormSectionProps, FormSectionSlots, null, NonNullable<unknown>> {}

declare module "vue" {
  export interface GlobalComponents {
    Form: GlobalComponentConstructor<Form>
    FormField: GlobalComponentConstructor<FormField>
    FormSection: GlobalComponentConstructor<FormSection>
  }
}

export default Form
export { FormField, FormSection }

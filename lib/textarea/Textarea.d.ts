import { VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor } from "../types"
import { InputLayoutClassKey, InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
import { InputAutocomplete } from "fishtvue/input"

/**
 * ## Textarea
 *
 * Textarea - a component for managing accessible input fields with extended control options.
 *
 * Provides support for customizable input attributes, validation states, and event handling.
 */
declare class Textarea extends ClassComponent<TextareaProps, TextareaSlots, TextareaEmits, TextareaExpose> {}

/**
 * Ключи карты `classes` (dev-patterns §2 B): семейные `InputLayoutClassKey` плюс `control` —
 * `<textarea data-textarea-control>` (бывший `classInput`). `root` — корень `<InputLayout data-textarea>`.
 */
export declare type TextareaClassKey = InputLayoutClassKey | "control"

export declare type BaseTextareaProps = {
  /**
   * The placeholder text for the input field.
   * @type {string | undefined}
   */
  placeholder?: string

  /**
   * Autocomplete attribute for the textarea — те же WHATWG-токены, что и у Input (`InputAutocomplete`).
   * @type {InputAutocomplete | undefined}
   */
  autocomplete?: InputAutocomplete

  /**
   * Text wrapping behavior for the input field.
   * @type {"soft" | "hard" | "off" | undefined}
   */
  wrap?: "soft" | "hard" | "off"

  /**
   * Number of visible rows for text input (applies to textarea elements).
   * @type {number | undefined}
   */
  rows?: number

  /**
   * Maximum allowed length of the input field's value.
   * @type {number | undefined}
   */
  maxLength?: number
}

/**
 * Props for the Textarea component.
 */
export interface TextareaProps
  extends Omit<InputLayoutProps, "value" | "hasValue" | "classes">, Partial<BaseTextareaProps> {
  /**
   * The unique identifier for the input element.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The value of the input field.
   *
   * Narrowed in 2026-05-11: `number` removed — multi-line text doesn't accept numeric model.
   *
   * @type {string | null | undefined}
   */
  modelValue?: string | null | undefined

  /**
   * Карта классов внутренних элементов: семейные ключи уходят в `InputLayout`, `control` — на `<textarea>`;
   * `root` ≡ `class`. См. `TextareaClassKey`.
   * @type {ClassesMap<TextareaClassKey> | undefined}
   */
  classes?: ClassesMap<TextareaClassKey>
}

/**
 * Context provided to the `before` slot (positive-булевы, dev-patterns §2 F).
 */
export declare type TextareaBeforeSlotProps = {
  /** Whether the textarea is currently in an invalid state. */
  invalid: boolean
  /** Whether the textarea currently has focus. */
  focused: boolean
}

/**
 * Context provided to the `after` slot.
 */
export declare type TextareaAfterSlotProps = {
  /** Whether the textarea is currently in an invalid state. */
  invalid: boolean
  /** Whether the textarea currently has focus. */
  focused: boolean
  /** Clears the textarea value and resets the invalid state. */
  clear: () => void
}

export declare type TextareaSlots = {
  default(): VNode[]
  before(props: TextareaBeforeSlotProps): VNode[]
  after(props: TextareaAfterSlotProps): VNode[]
}
/**
 * Events emitted by the Textarea component.
 */
export declare type TextareaEmits = {
  /**
   * Emitted when the `modelValue` prop is updated.
   * @param event
   * @param {string} payload - The updated input value.
   */
  (event: "update:modelValue", payload: string): void

  /**
   * v-model-канал prop'а `invalid`: любой ввод сбрасывает ошибку — payload всегда `false`.
   * @param event
   * @param {boolean} payload - Indicates whether the input is invalid.
   */
  (event: "update:invalid", payload: boolean): void

  /**
   * Emitted when the input value changes (native `change` event or `clear()`).
   *
   * Fixed in 2026-05-11: payload type was `boolean` by mistake — runtime always emits a string.
   *
   * @param event
   * @param {string} payload - The new textarea value (empty string on clear).
   */
  (event: "change:modelValue", payload: string): void

  /**
   * Emitted when the input field gains focus.
   * @param event
   * @param {FocusEvent} env - The focus event object.
   */
  (event: "focus", env: FocusEvent): void

  /**
   * Emitted when the input field loses focus.
   * @param event
   * @param {FocusEvent} env - The blur event object.
   */
  (event: "blur", env: FocusEvent): void
}
/**
 * Methods and states exposed via `ref` for the Textarea component.
 */
export declare type TextareaExpose = {
  // ---STATE-------------------------
  /**
   * Layout reference for the input field.
   * @type {InputLayoutExpose | undefined}
   */
  layout: InputLayoutExpose | undefined

  /**
   * Reference to the input HTML element.
   * @type {HTMLElement | undefined}
   */
  inputRef: HTMLElement | undefined

  // ---PROPS-------------------------
  /**
   * Current `id` value of the input field.
   * @type {TextareaProps["id"]}
   */
  id: TextareaProps["id"]

  /**
   * Current `modelValue` of the input field.
   * @type {TextareaProps["modelValue"]}
   */
  modelValue: TextareaProps["modelValue"]

  /**
   * Current `placeholder` of the input field.
   * @type {TextareaProps["placeholder"]}
   */
  placeholder: TextareaProps["placeholder"]

  /**
   * Current autocomplete setting for the input field.
   * @type {TextareaProps["autocomplete"]}
   */
  autocomplete: TextareaProps["autocomplete"]

  /**
   * Current wrapping behavior for the input field.
   * @type {TextareaProps["wrap"]}
   */
  wrap: TextareaProps["wrap"]

  /**
   * Current number of rows for the input field.
   * @type {TextareaProps["rows"]}
   */
  rows: TextareaProps["rows"]

  /**
   * Current maximum length for the input field.
   * @type {TextareaProps["maxLength"]}
   */
  maxLength: TextareaProps["maxLength"]

  /**
   * Indicates whether the input has a value (передаётся в `InputLayout` как `hasValue`).
   * @type {boolean}
   */
  isValue: boolean

  /**
   * Current mode of the input field.
   * @type {TextareaProps["mode"]}
   */
  mode: TextareaProps["mode"]

  /**
   * Indicates whether the input is disabled.
   * @type {TextareaProps["disabled"]}
   */
  isDisabled: TextareaProps["disabled"]

  /**
   * Indicates whether the input is in a loading state.
   * @type {TextareaProps["loading"]}
   */
  isLoading: TextareaProps["loading"]

  /**
   * Indicates whether the input is invalid (resolved `invalid`, `false` при `disabled`).
   * @type {boolean}
   */
  isInvalid: boolean

  /**
   * Показывается ли кнопка очистки (resolved `clearable`: props → options → `false`).
   * @type {boolean}
   */
  isClearable: boolean

  /**
   * The validation error message for the input field.
   * @type {TextareaProps["messageInvalid"]}
   */
  messageInvalid: TextareaProps["messageInvalid"]

  /**
   * Итоговый класс `<textarea data-textarea-control>` (база + `classes.control`).
   * @type {string}
   */
  classControl: string

  /**
   * Props, переданные во внутренний `InputLayout` (включая `class` корня и семейную карту `classes`
   * с focus-ring и `max-h-max` в `base`). Заменяет прежние `classStyle`/`classLayout`.
   * @type {Omit<InputLayoutProps, "value">}
   */
  inputLayout: Omit<InputLayoutProps, "value">

  // ---METHODS-----------------------
  /**
   * Clears the input field value and resets the invalid state.
   *
   * This method sets the input value to an empty string and emits
   * events to update the validation and value states.
   */
  clear(): void

  /**
   * Focuses the input field and sets the active state.
   *
   * @param {FocusEvent} env - The focus event object that triggered the focus action.
   *
   * Emits a `focus` event when the input field gains focus.
   */
  focus(env: FocusEvent): void

  /**
   * Removes focus from the input field and resets the active state.
   *
   * @param {FocusEvent} env - The blur event object that triggered the blur action.
   *
   * Emits a `blur` event when the input field loses focus.
   */
  blur(env: FocusEvent): void
}
export declare type TextareaOption = Pick<
  TextareaProps,
  "autocomplete" | "wrap" | "rows" | "maxLength" | "class" | "classes" | keyof InputLayoutOption
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Textarea: GlobalComponentConstructor<Textarea>
  }
}

export default Textarea

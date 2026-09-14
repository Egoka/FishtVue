import { VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor } from "../types"
import { InputLayoutClassKey, InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
import type { PhoneFormat } from "fishtvue/utils/numberHandler"

export type { PhoneFormat } from "fishtvue/utils/numberHandler"

/**
 * Supported `<input type>` values for the Input component.
 *
 * Native semantics enable on-screen keyboards (`tel`, `number`, `email`, `url`),
 * password-manager hints (`password`) and platform clear/affordance (`search`).
 */
export declare type InputType = "text" | "number" | "email" | "password" | "tel" | "url" | "search"

/**
 * Autocomplete tokens for the Input component.
 *
 * Accepts canonical [WHATWG autofill tokens](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill)
 * (`"current-password"`, `"new-password"`, `"email"`, `"tel"`, `"one-time-code"`, etc.)
 * plus `"on"`/`"off"` and arbitrary strings (kept open via `string & {}` so editor
 * autocomplete still shows the known values).
 */
export declare type InputAutocomplete =
  | "on"
  | "off"
  | "current-password"
  | "new-password"
  | "username"
  | "email"
  | "tel"
  | "tel-country-code"
  | "tel-national"
  | "url"
  | "one-time-code"
  | "name"
  | "given-name"
  | "family-name"
  | "honorific-prefix"
  | "honorific-suffix"
  | "nickname"
  | "organization"
  | "organization-title"
  | "street-address"
  | "address-line1"
  | "address-line2"
  | "address-line3"
  | "address-level1"
  | "address-level2"
  | "address-level3"
  | "address-level4"
  | "country"
  | "country-name"
  | "postal-code"
  | "cc-name"
  | "cc-given-name"
  | "cc-family-name"
  | "cc-number"
  | "cc-exp"
  | "cc-exp-month"
  | "cc-exp-year"
  | "cc-csc"
  | "cc-type"
  | "language"
  | "bday"
  | "bday-day"
  | "bday-month"
  | "bday-year"
  | "sex"
  | "transaction-currency"
  | "transaction-amount"
  | "photo"
  | (string & {})

/**
 * ## Input
 *
 * Input - a component for capturing user input with advanced features and customization options.
 *
 * Supports various input types, masks, validation, and event handling.
 */
declare class Input extends ClassComponent<InputProps, InputSlots, InputEmits, InputExpose> {}

/**
 * Ключи карты `classes` (dev-patterns §2 B): семейные `InputLayoutClassKey` (`base`, `label`, `help`, `message`,
 * `before`, `after`, aspect-ключ `animation`) плюс собственные. `root` — корень `<InputLayout data-input>`.
 * - `control` — `<input data-input-control>` (бывший `classInput`).
 * - `passwordToggle` — иконки Eye/EyeSlash `[data-input-password-toggle]` при `type="password"`
 *   (бывший `passwordToggleClass`).
 */
export declare type InputClassKey = InputLayoutClassKey | "control" | "passwordToggle"

/**
 * Base props for the Input component.
 */
export declare type BaseInputProps = {
  /**
   * The type of input field.
   *
   * Расширенный union: к базовым text/number/email/password добавлены
   * нативно-семантичные `tel`/`url`/`search` (mobile keyboards, clear-affordance).
   * @type {InputType}
   */
  type: InputType

  /**
   * Automatically focuses the input field on mount.
   * @type {boolean}
   */
  autoFocus: boolean

  /**
   * Placeholder text for the input field.
   * @type {string}
   */
  placeholder: string

  /**
   * Autocomplete behavior for the input field.
   *
   * Поддерживает WHATWG autofill tokens (`"current-password"`, `"new-password"`,
   * `"email"`, `"tel"`, `"one-time-code"`, и др.) + произвольные строки.
   * Если значение не задано, Input авто-подбирает разумный default по `type`
   * (см. `Input.vue`): `password → "current-password"`, `email → "email"`,
   * `tel → "tel"`, `url → "url"`, иначе `"on"`.
   * @type {InputAutocomplete}
   */
  autocomplete: InputAutocomplete

  /**
   * Mask type for the input value.
   * @type {"phone" | "number" | "price" | string}
   */
  maskInput: "phone" | "number" | "price" | string

  /**
   * Maximum length for the integer part of the input value.
   * @type {number}
   */
  lengthInteger: number

  /**
   * Maximum length for the decimal part of the input value.
   * @type {number}
   */
  lengthDecimal: number

  /**
   * Кастомные phone-форматы для `maskInput: "phone"`.
   *
   * Прокидывается в `convertToPhone(value, { phoneFormats })` и `toPhone(e, { phoneFormats })`.
   * Если не задан — используется дефолтный набор (`+1`/`+7`/`+81`/`+82`/`+86`)
   * из `lib/utils/numberHandler.ts`.
   *
   * Также может быть задан глобально через `componentsOptions.Input.phoneFormats`.
   * @type {PhoneFormat[]}
   */
  phoneFormats: PhoneFormat[]
}

/**
 * Props for the Input component.
 */
export interface InputProps extends Omit<InputLayoutProps, "value" | "hasValue" | "classes">, Partial<BaseInputProps> {
  /**
   * Unique identifier for the input element.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The current value of the input field.
   * @type {string | number | null | undefined}
   */
  modelValue?: string | number | null | undefined

  /**
   * Карта классов внутренних элементов: семейные ключи уходят в `InputLayout`, `control` — на `<input>`,
   * `passwordToggle` — на иконки переключения видимости пароля; `root` ≡ `class`. См. `InputClassKey`.
   * @type {ClassesMap<InputClassKey> | undefined}
   */
  classes?: ClassesMap<InputClassKey>
}

export declare type InputSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}

/**
 * Events emitted by the Input component.
 */
export declare type InputEmits = {
  /**
   * Emitted when the input is cleared.
   * @param event
   * @param {string} payload - The cleared value.
   */
  (event: "clear", payload: string): void

  /**
   * Emitted when the input gains focus.
   * @param event
   * @param {FocusEvent} eventFocus - The focus event.
   */
  (event: "focus", eventFocus: FocusEvent): void

  /**
   * Emitted when the input loses focus.
   * @param event
   * @param {FocusEvent} eventFocus - The blur event.
   */
  (event: "blur", eventFocus: FocusEvent): void

  /**
   * Emitted when the `modelValue` is updated.
   * @param event
   * @param {string} payload - The updated value.
   */
  (event: "update:modelValue", payload: string): void

  /**
   * Emitted when the `modelValue` changes.
   * @param event
   * @param {string} payload - The changed value.
   */
  (event: "change:modelValue", payload: string): void

  /**
   * v-model-канал prop'а `invalid`: любой ввод сбрасывает ошибку — payload всегда `false`
   * (`v-model:invalid` в Form). См. Documentation/components/input.md §6.2.
   * @param event
   * @param {boolean} payload - Indicates whether the input is invalid.
   */
  (event: "update:invalid", payload: boolean): void

  /**
   * Смена focus-состояния контрола: `true` на focus, `false` на blur (бывший `isActive`).
   * @param event
   * @param {boolean} payload - Indicates the active state of the input.
   */
  (event: "active", payload: boolean): void
}

/**
 * Methods and states exposed via `ref` for the Input component.
 */
export declare type InputExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the input layout state.
   * @type {InputLayoutExpose | undefined}
   */
  layout: InputLayoutExpose | undefined

  /**
   * Indicates whether the input is active.
   * @type {boolean}
   */
  isActiveInput: boolean

  /**
   * Props, переданные во внутренний `InputLayout` (включая `class` корня и семейную карту `classes`
   * с focus-ring в `base`). Заменяет прежний `classLayout`.
   * @type {Omit<InputLayoutProps, "value">}
   */
  inputLayout: Omit<InputLayoutProps, "value">

  // ---PROPS-------------------------------
  /**
   * Current `id` of the input field.
   * @type {InputProps["id"]}
   */
  id: InputProps["id"]

  /**
   * Current type of the input field.
   * @type {InputProps["type"]}
   */
  type: InputProps["type"]

  /**
   * Current mask type applied to the input field.
   * @type {InputProps["maskInput"]}
   */
  mask: InputProps["maskInput"]

  /**
   * Current value of the input field.
   * @type {InputProps["modelValue"]}
   */
  modelValue: InputProps["modelValue"]

  /**
   * Indicates whether autofocus is enabled.
   * @type {InputProps["autoFocus"]}
   */
  autoFocus: InputProps["autoFocus"]

  /**
   * Current placeholder text of the input field.
   * @type {InputProps["placeholder"]}
   */
  placeholder: InputProps["placeholder"]

  /**
   * Current autocomplete setting of the input field.
   * @type {InputProps["autocomplete"]}
   */
  autocomplete: InputProps["autocomplete"]

  /**
   * Maximum length for the integer part of the input value.
   * @type {InputProps["lengthInteger"]}
   */
  lengthInteger: InputProps["lengthInteger"]

  /**
   * Maximum length for the decimal part of the input value.
   * @type {InputProps["lengthDecimal"]}
   */
  lengthDecimal: InputProps["lengthDecimal"]

  /**
   * Indicates whether the input has a value (передаётся в `InputLayout` как `hasValue`).
   * @type {boolean}
   */
  isValue: boolean

  /**
   * Current mode of the input.
   * @type {InputProps["mode"]}
   */
  mode: InputProps["mode"]

  /**
   * Indicates whether the input is disabled.
   * @type {InputProps["disabled"]}
   */
  isDisabled: InputProps["disabled"]

  /**
   * Indicates whether the input is in a loading state.
   * @type {InputProps["loading"]}
   */
  isLoading: InputProps["loading"]

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
   * Validation error message for the input field.
   * @type {InputProps["messageInvalid"]}
   */
  messageInvalid: InputProps["messageInvalid"]

  /**
   * Итоговый класс `<input data-input-control>` (база + `classes.control`).
   * @type {string}
   */
  classControl: string

  /**
   * Класс иконок Eye/EyeSlash (база + `classes.passwordToggle`), hand-off в корень `Icons`.
   * @type {string}
   */
  classPasswordToggle: string

  // ---METHODS-----------------------------
  /**
   * Applies a mask to the input value.
   * @param {string | number} baseValue - The value to mask.
   * @returns {string} - The masked value.
   */
  toMask(baseValue: string | number): string

  /**
   * Updates the input's model value.
   * @param {any} valueResult - The value to set.
   */
  inputModelValue(valueResult: any): void

  /**
   * Changes the input's model value and triggers the associated event.
   * @param {any} valueResult - The new value to set.
   */
  changeModelValue(valueResult: any): void

  /**
   * Clears the input's value.
   */
  clear(): void

  /**
   * Focuses the input field.
   *
   * Принимает либо native `FocusEvent` (когда вызывается из `@focus` template-handler —
   * сохраняется emit `"focus"` с исходным event), либо `FocusOptions` (programmatic
   * вызов: `inp.value?.focus({ preventScroll: true })`), либо ничего
   * (`inp.value?.focus()` — аналог нативного `HTMLElement.focus()`).
   *
   * Паритет с Button.focus(options?) — см. Documentation/issues/done/button.md Issue 4.
   *
   * @param {FocusEvent | FocusOptions} [eventOrOptions] - The focus event from a template handler,
   *   `FocusOptions` for programmatic focus, or omitted.
   */
  focus(eventOrOptions?: FocusEvent | FocusOptions): void

  /**
   * Blurs the input field.
   *
   * Принимает либо native `FocusEvent` (template handler), либо ничего (programmatic).
   *
   * @param {FocusEvent} [eventFocus] - The blur event from a template handler (optional).
   */
  blur(eventFocus?: FocusEvent): void
}
export declare type InputOption = Pick<
  InputProps,
  "phoneFormats" | "autocomplete" | "class" | "classes" | keyof InputLayoutOption
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    Input: GlobalComponentConstructor<Input>
  }
}

export default Input

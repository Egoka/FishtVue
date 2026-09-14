import { VNode } from "vue"
import {
  ClassComponent,
  ClassesMap,
  GlobalComponentConstructor,
  StyleClass,
  StyleMode,
  THeight,
  TWidth
} from "../types"
import { LabelMode } from "fishtvue/label"

/**
 * ## InputLayout
 *
 * InputLayout - a wrapper component for managing input fields with labels, validation, and additional features.
 *
 * Provides support for styling, accessibility, and state management for input elements.
 */
declare class InputLayout extends ClassComponent<
  InputLayoutProps,
  InputLayoutSlots,
  InputLayoutEmits,
  InputLayoutExpose
> {}

/**
 * Ключи карты `classes` (dev-patterns §2 B). `root` — `<div data-input-layout>` (добавляется `ClassesMap`).
 * Семейство form-controls (Input, Textarea, Select, Calendar, TextEditor) наследует эти ключи и добавляет свои.
 * - `base` — `<div data-input-layout-base>`: рамка поля (border/ring/mode) вокруг контрола из default-слота.
 * - `label` — корень `<Label data-label>` (hand-off через его `class`).
 * - `help` — `<div data-input-layout-help>`: иконка подсказки с tooltip.
 * - `message` — `<p data-input-layout-message-invalid>`: текст ошибки (`aria-live`).
 * - `before` / `after` — контейнеры слотов `before` / `after`.
 * - `animation` — aspect-ключ: transition-классы корня и `base` после mount-тика
 *   (`props ?? options ?? "motion-safe:transition-all motion-safe:duration-550"`, `""` отключает).
 */
export declare type InputLayoutClassKey = "base" | "label" | "help" | "message" | "before" | "after" | "animation"

/**
 * Props for the InputLayout component.
 */
export declare type InputLayoutProps = {
  /**
   * The value of the input element within the layout.
   * @type {any}
   */
  value: any

  /**
   * Есть ли у контрола значение — управляет floating-состоянием лейбла (`labelType`).
   * Form-controls семейства вычисляют его сами и передают сюда.
   * @type {boolean | undefined}
   */
  hasValue?: boolean

  /**
   * Styling mode for the input layout.
   * @type {StyleMode | undefined}
   */
  mode?: StyleMode

  /**
   * Explicit id for the slotted control. When omitted, InputLayout
   * auto-generates a stable id via `useId()` (SSR-safe). The id is exposed
   * through the default slot scope and used to wire `<label for>` /
   * `aria-labelledby` (label↔control association — see
   * [Issue 9](../../Documentation/issues/inputlayout.md)).
   * @type {string | undefined}
   */
  id?: string

  /**
   * The label text for the input.
   * @type {string | undefined}
   */
  label?: string

  /**
   * The mode for displaying the label.
   * @type {LabelMode | undefined}
   */
  labelMode?: LabelMode

  /**
   * Невалидное состояние: красная рамка поля, иконка и текст `messageInvalid`.
   * Игнорируется при `disabled`.
   * @type {boolean | undefined}
   */
  invalid?: boolean

  /**
   * The validation error message for the input.
   * @type {string | undefined}
   */
  messageInvalid?: string

  /**
   * Marks the input as required.
   * @type {boolean | undefined}
   */
  required?: boolean

  /**
   * Indicates whether the input is in a loading state.
   * @type {boolean | undefined}
   */
  loading?: boolean

  /**
   * Disables the input field.
   * @type {boolean | undefined}
   */
  disabled?: boolean

  /**
   * Additional help text displayed for the input.
   * @type {string | undefined}
   */
  help?: string

  /**
   * Показывать кнопку очистки при непустом `value` (emit `clear`).
   * Резолвится `props ?? componentsOptions.InputLayout.clearable ?? false`.
   * @type {boolean | undefined}
   */
  clearable?: boolean

  /**
   * Width of the input layout.
   * @type {TWidth | undefined}
   */
  width?: TWidth

  /**
   * Height of the input layout.
   * @type {THeight | undefined}
   */
  height?: THeight

  /**
   * CSS-классы корня `<div data-input-layout>` (dev-patterns §2 A).
   * @type {StyleClass | undefined}
   */
  class?: StyleClass

  /**
   * Карта классов внутренних элементов (`base`, `label`, `help`, `message`, `before`, `after`) и aspect-ключ
   * `animation`; `root` ≡ `class`. См. `InputLayoutClassKey`.
   * @type {ClassesMap<InputLayoutClassKey> | undefined}
   */
  classes?: ClassesMap<InputLayoutClassKey>

  /**
   * Vertical offset used by the layout for sticky-header awareness
   * (e.g. `scroll-margin-top` of the invalid input region).
   * Accepts a fixed number of pixels, a CSS string, or a getter function
   * (re-evaluated on mount). Replaces the previous hardcoded
   * `document.querySelector("header")` coupling — see [Issue 5](../../Documentation/issues/inputlayout.md).
   * @type {number | string | (() => number) | undefined}
   */
  offsetTop?: number | string | (() => number)
}

export declare type InputLayoutSlots = {
  /**
   * Default slot for the control element. Receives the association scope:
   * - `id` — stable control id (explicit `id` prop or auto-generated `useId()`).
   *   Bind to the control's `id` so `<label for>` resolves.
   * - `labelledby` — id of the rendered `<Label>` (or `undefined` when no
   *   `label`). Non-labelable triggers (Select/Calendar/TextEditor) bind it to
   *   `aria-labelledby` for screen-reader name.
   */
  default(props: { id: string; labelledby?: string }): VNode[]
  before(): VNode[]
  after(): VNode[]
  body(): VNode[]
  /**
   * Override slot for the help-tooltip content. When provided, replaces the
   * text-only fallback rendered from the `help` prop. The slot exists to allow
   * rich, but caller-sanitized, content without forcing the library to use
   * `v-html` (XSS-safe by default). See [Issue 1](../../Documentation/issues/inputlayout.md).
   */
  help(): VNode[]
  /**
   * Override slot for the validation-error tooltip content. When provided,
   * replaces the text-only fallback rendered from the `messageInvalid` prop.
   * Same XSS-safe contract as the `help` slot.
   */
  messageInvalid(): VNode[]
}

/**
 * Events emitted by the InputLayout component.
 */
export declare type InputLayoutEmits = {
  /**
   * Emitted when the clear button is clicked.
   */
  (event: "clear"): void
}

/**
 * Methods and states exposed via `ref` for the InputLayout component.
 */
export declare type InputLayoutExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the input element within the layout.
   * @type {HTMLElement | undefined}
   */
  input: HTMLElement | undefined

  /**
   * Reference to the input body container.
   * @type {HTMLElement | undefined}
   */
  inputBody: HTMLElement | undefined

  /**
   * Reference to the element before the input.
   * @type {HTMLElement | undefined}*/
  beforeInput: HTMLElement | undefined
  /**
   * Reference to the element after the input.
   * @type {HTMLElement | undefined}
   */
  afterInput: HTMLElement | undefined

  /**
   * The height of the header in the layout.
   * @type {number}
   */
  headerHeight: number

  /**
   * Indicates whether the input value is copied.
   * @type {boolean}
   */
  isCopy: boolean

  /**
   * The width of the element before the input.
   * @type {number | null}
   */
  beforeWidth: number | null

  /**
   * The width of the element after the input.
   * @type {number | null}
   */
  afterWidth: number | null

  // ---PROPS-------------------------
  /**
   * The current value of the input.
   * @type {InputLayoutProps["value"]}
   */
  value: InputLayoutProps["value"]

  /**
   * Indicates whether the input has a value (resolved `hasValue`).
   * @type {boolean}
   */
  isValue: boolean

  /**
   * The current styling mode of the input layout.
   * @type {InputLayoutProps["mode"]}
   */
  mode: InputLayoutProps["mode"]

  /**
   * The current label text for the input.
   * @type {InputLayoutProps["label"]}
   */
  label: InputLayoutProps["label"]

  /**
   * The current label display mode.
   * @type {InputLayoutProps["labelMode"]}
   */
  labelMode: InputLayoutProps["labelMode"]
  /**
   * The type of label display mode currently applied to the input layout.
   * Derived from the `labelMode` prop.
   * @type {InputLayoutProps["labelMode"]}
   */
  labelType: InputLayoutProps["labelMode"]

  /**
   * Indicates whether the input is required.
   * @type {InputLayoutProps["required"]}
   */
  isRequired: InputLayoutProps["required"]

  /**
   * Indicates whether the input is in a loading state.
   * @type {InputLayoutProps["loading"]}
   */
  isLoading: InputLayoutProps["loading"]

  /**
   * Indicates whether the input is disabled.
   * @type {InputLayoutProps["disabled"]}
   */
  isDisabled: InputLayoutProps["disabled"]

  /**
   * Indicates whether the input is invalid (resolved `invalid`, always `false` when disabled).
   * @type {boolean}
   */
  isInvalid: boolean

  /**
   * Показывается ли кнопка очистки (resolved `clearable`: props → options → `false`).
   * @type {boolean}
   */
  isClearable: boolean

  /**
   * The validation error message for the input.
   * @type {InputLayoutProps["messageInvalid"]}
   */
  messageInvalid: InputLayoutProps["messageInvalid"]

  /**
   * The help text for the input.
   * @type {InputLayoutProps["help"]}
   */
  help: InputLayoutProps["help"]

  /**
   * The width of the input layout.
   * @type {InputLayoutProps["width"]}
   */
  width: InputLayoutProps["width"]

  /**
   * The height of the input layout.
   * @type {InputLayoutProps["height"]}
   */
  height: InputLayoutProps["height"]

  /**
   * Resolved aspect-ключ `classes.animation` (пустая строка до mount-тика).
   * @type {StyleClass}
   */
  animation: StyleClass

  /**
   * Итоговый класс корня `<div data-input-layout>` (база + `class`/`classes.root`).
   * @type {string}
   */
  classBase: string

  /**
   * Итоговый класс рамки поля `<div data-input-layout-base>` (база + mode + state + `classes.base`).
   * @type {string}
   */
  classLayout: string

  // ---METHODS-----------------------
  /**
   * Copies the current value of the input to the clipboard.
   */
  copy(): void
}
export declare type InputLayoutOption = Pick<
  InputLayoutProps,
  "mode" | "labelMode" | "clearable" | "width" | "height" | "class" | "classes" | "offsetTop"
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    InputLayout: GlobalComponentConstructor<InputLayout>
  }
}

export default InputLayout

import { VNode } from "vue"
import { ClassComponent, ClassesMap, GlobalComponentConstructor } from "../types"
import { Delta } from "@vueup/vue-quill"
import { InputLayoutClassKey, InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
// @ts-ignore
import Quill, { Sources } from "quill"
import { DialogProps } from "fishtvue/dialog"

/**
 * ## TextEditor
 *
 * TextEditor - a component for rich text editing with Quill.js integration.
 *
 * Supports themes, toolbar customization, content management, and validation features.
 */
declare class TextEditor extends ClassComponent<TextEditorProps, TextEditorSlots, TextEditorEmits, TextEditorExpose> {}

// ---------------------------------------
export declare interface TextEditorInstance {
  editor: HTMLElement | undefined
  getEditor: () => Element
  getToolbar: () => Element
  getQuill: () => Quill
  getContents: (index?: number, length?: number) => string | Delta | undefined
  setContents: (content: ContentPropType, source?: Sources) => void
  getHTML: () => string
  setHTML: (html: string) => void
  pasteHTML: (html: string, source?: Sources) => void
  focus: () => void
  getText: (index?: number, length?: number) => string
  setText: (text: string, source?: Sources) => void
  reinit: () => void
}

declare type ContentPropType = string | Delta | undefined | null
declare type Module = {
  name: string
  module: unknown
  options?: object
}

export declare interface TextEditorQuillConfig {
  content: ContentPropType
  contentType: "delta" | "html" | "text"
  enable: boolean
  readOnly: boolean
  toolbar: "essential" | "minimal" | "full" | string | object | Array<any>
  modules: Module | Module[]
  options: any
  globalOptions: any
}

/**
 * Ключи карты `classes` (dev-patterns §2 B): семейные `InputLayoutClassKey` плюс `editor` —
 * inline-контейнер Quill `[data-text-editor-editor]`. `root` — корень `<InputLayout data-text-editor>`.
 * Классы диалога snow-режима задаются через `dialogProps.class` / `dialogProps.classes`.
 */
export declare type TextEditorClassKey = InputLayoutClassKey | "editor"

export declare type BaseTextEditorProps = {
  /**
   * Props, пробрасываемые в `Dialog` snow-режима (бывший `paramsDialog`).
   * @type {Partial<DialogProps> | undefined}
   */
  dialogProps?: Partial<DialogProps>

  /**
   * Props, пробрасываемые в Quill-редактор (бывший `paramsTextEditor`).
   * @type {Partial<TextEditorQuillConfig> | undefined}
   */
  editorProps?: Partial<TextEditorQuillConfig>

  /**
   * The theme for the Quill editor.
   * @type {"snow" | "bubble" | undefined}
   */
  theme?: "snow" | "bubble"
}

/**
 * Props for the TextEditor component.
 */
export interface TextEditorProps
  extends Omit<InputLayoutProps, "value" | "hasValue" | "classes">, Partial<BaseTextEditorProps> {
  /**
   * Unique identifier for the text editor.
   * @type {string | undefined}
   */
  id?: string

  /**
   * The current value of the text editor.
   * @type {string | number | null | undefined}
   */
  modelValue?: string | number | null | undefined

  /**
   * Карта классов внутренних элементов: семейные ключи уходят в `InputLayout`, `editor` — inline-контейнер
   * Quill; `root` ≡ `class`. См. `TextEditorClassKey`.
   * @type {ClassesMap<TextEditorClassKey> | undefined}
   */
  classes?: ClassesMap<TextEditorClassKey>
}

export declare type TextEditorSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
/**
 * Events emitted by the TextEditor component.
 */
export declare type TextEditorEmits = {
  /**
   * Emitted when the `modelValue` is updated.
   * @param event
   * @param {string} payload - The updated value.
   */
  (event: "update:modelValue", payload: string): void

  /**
   * v-model-канал prop'а `invalid`: ввод сбрасывает ошибку — payload всегда `false`.
   * @param event
   * @param {boolean} payload - The new validation state.
   */
  (event: "update:invalid", payload: boolean): void

  /**
   * Emitted when the value changes (after blur / programmatic save).
   *
   * Fixed in 2026-05-11: payload type was `boolean` by mistake — runtime always emits the HTML string content.
   *
   * @param event
   * @param {string} payload - The new HTML content of the editor (empty string on clear).
   */
  (event: "change:modelValue", payload: string): void
}

/**
 * Methods and states exposed via `ref` for the TextEditor component.
 */
export declare type TextEditorExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the layout used by the editor.
   * @type {InputLayoutExpose | undefined}
   */
  layout: InputLayoutExpose | undefined

  /**
   * Reference to the component's ROOT element (G34).
   *
   * The root of TextEditor is `<InputLayout>`, so the element is taken from its own expose
   * (`inputBody`). Mirrors `componentTable` on Table and `buttonRef` on Button.
   * @type {HTMLElement | undefined}
   */
  componentTextEditor: HTMLElement | undefined

  /**
   * The value displayed in the editor layout.
   * @type {TextEditorProps["modelValue"]}
   */
  valueLayout: TextEditorProps["modelValue"]

  /**
   * Итоговый класс inline-контейнера редактора `[data-text-editor-editor]` (база + `classes.editor`).
   * @type {string}
   */
  classEditor: string

  /**
   * Indicates whether the editor dialog is open.
   * @type {boolean}
   */
  open: boolean

  /**
   * Reference to the Quill editor instance.
   * @type {TextEditorInstance | undefined}
   */
  quillEditorLink: TextEditorInstance | undefined

  /**
   * Indicates whether the text editor is active.
   * @type {boolean}
   */
  isActiveTextEditor: boolean

  // ---PROPS-------------------------
  /**
   * The unique identifier for the editor.
   * @type {string | undefined}
   */
  id: string | undefined

  /**
   * The theme of the Quill editor.
   * @type {TextEditorProps["theme"]}
   */
  theme: TextEditorProps["theme"]

  /**
   * Indicates whether the editor has a value.
   * @type {boolean}
   */
  isValue: boolean

  /**
   * The current styling mode of the editor.
   * @type {TextEditorProps["mode"]}
   */
  mode: TextEditorProps["mode"]

  /**
   * Indicates whether the editor is disabled.
   * @type {TextEditorProps["disabled"]}
   */
  isDisabled: TextEditorProps["disabled"]
  /**
   * Indicates whether the editor is loading.
   * @type {NonNullable<TextEditorProps["loading"]>}
   */
  isLoading: NonNullable<TextEditorProps["loading"]>
  /**
   * Indicates whether the editor is invalid (resolved `invalid`, `false` при `disabled`).
   * @type {boolean}
   */
  isInvalid: boolean

  /**
   * Показывается ли кнопка очистки (resolved `clearable`: props → options → `false`).
   * @type {boolean}
   */
  isClearable: boolean

  /**
   * The validation message for the editor.
   * @type {TextEditorProps["messageInvalid"]}
   */
  messageInvalid: TextEditorProps["messageInvalid"]

  /**
   * Resolved props диалога snow-режима.
   * @type {NonNullable<TextEditorProps["dialogProps"]>}
   */
  dialogProps: NonNullable<TextEditorProps["dialogProps"]>

  /**
   * Resolved props Quill-редактора (defaults + options + props).
   * @type {Partial<TextEditorQuillConfig>}
   */
  editorProps: Partial<TextEditorQuillConfig>

  /**
   * The layout configuration for the editor input.
   * @type {Omit<InputLayoutProps, "value">}
   */
  inputLayout: Omit<InputLayoutProps, "value">

  // ---METHODS-----------------------
  /**
   * Clears the content of the editor.
   */
  clear(): void

  /**
   * Prepares the editor for interaction.
   */
  ready(): void

  /**
   * Moves focus into the editor (G34).
   *
   * Delegates to Quill when it is loaded — it knows where inside the contenteditable to put the
   * caret. Falls back to focusing the root element, so the call is not silently useless when the
   * optional `@vueup/vue-quill` peer is absent.
   */
  focus(): void
}
export declare type TextEditorOption = Pick<
  TextEditorProps,
  "dialogProps" | "editorProps" | "theme" | "class" | "classes" | keyof InputLayoutOption
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    TextEditor: GlobalComponentConstructor<TextEditor>
  }
}

export default TextEditor

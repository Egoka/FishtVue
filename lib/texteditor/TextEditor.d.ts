import { VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor } from "../types"
import { Delta } from "@vueup/vue-quill"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
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
export declare interface IQuillEditor {
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

export declare interface IDataTextEditor {
  content: ContentPropType
  contentType: "delta" | "html" | "text"
  enable: boolean
  readOnly: boolean
  toolbar: "essential" | "minimal" | "full" | string | object | Array<any>
  modules: Module | Module[]
  options: any
  globalOptions: any
}

export declare type BaseTextEditorProps = {
  /**
   * Configuration for the dialog that opens the editor.
   * @type {Partial<DialogProps> | undefined}
   */
  paramsDialog?: Partial<DialogProps>

  /**
   * Configuration for the Quill text editor.
   * @type {Partial<IDataTextEditor> | undefined}
   */
  paramsTextEditor?: Partial<IDataTextEditor>

  /**
   * The theme for the Quill editor.
   * @type {"snow" | "bubble" | undefined}
   */
  theme?: "snow" | "bubble"
}

/**
 * Props for the TextEditor component.
 */
export interface TextEditorProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseTextEditorProps> {
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
   * Emitted when the validation state changes.
   * @param event
   * @param {boolean} payload - The new validation state.
   */
  (event: "update:isInvalid", payload: boolean): void

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
   * The value displayed in the editor layout.
   * @type {TextEditorProps["modelValue"]}
   */
  valueLayout: TextEditorProps["modelValue"]

  /**
   * The CSS class applied to the editor layout.
   * @type {TextEditorProps["class"]}
   */
  classLayout: TextEditorProps["class"]

  /**
   * Indicates whether the editor dialog is open.
   * @type {boolean}
   */
  open: boolean

  /**
   * Reference to the Quill editor instance.
   * @type {IQuillEditor | undefined}
   */
  quillEditorLink: IQuillEditor | undefined

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
   * @type {TextEditorProps["isInvalid"]}
   */
  isLoading: TextEditorProps["isInvalid"]
  /**
   * Indicates whether the editor is invalid.
   * @type {TextEditorProps["isInvalid"]}
   */
  isInvalid: TextEditorProps["isInvalid"]

  /**
   * The validation message for the editor.
   * @type {TextEditorProps["messageInvalid"]}
   */
  messageInvalid: TextEditorProps["messageInvalid"]

  /**
   * The CSS class applied to the editor container.
   * @type {TextEditorProps["class"]}
   */
  classStyle: TextEditorProps["class"]

  /**
   * Configuration for the dialog used by the editor.
   * @type {TextEditorProps["paramsDialog"]}
   */
  paramsDialog: TextEditorProps["paramsDialog"]

  /**
   * Configuration for the Quill editor.
   * @type {Partial<TextEditorProps["paramsTextEditor"]>}
   */
  paramsQuillEditor: Partial<TextEditorProps["paramsTextEditor"]>

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
}
export declare type TextEditorOption = Pick<
  TextEditorProps,
  "paramsDialog" | "paramsTextEditor" | "theme" | keyof InputLayoutOption
>

// ---------------------------------------

declare module "vue" {
  export interface GlobalComponents {
    TextEditor: GlobalComponentConstructor<TextEditor>
  }
}

export default TextEditor

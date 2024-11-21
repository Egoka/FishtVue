import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef } from "../types"
import { Delta } from "@vueup/vue-quill"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
import Quill from "quill"
// @ts-ignore
import { Sources } from "quill"
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
   * Emitted when the value changes.
   * @param event
   * @param {boolean} payload - Indicates the change.
   */
  (event: "change:modelValue", payload: boolean): void
}

/**
 * Methods and states exposed via `ref` for the TextEditor component.
 */
export declare type TextEditorExpose = {
  // ---STATE-------------------------
  /**
   * Reference to the layout used by the editor.
   * @type {Ref<InputLayoutExpose | undefined>}
   */
  layout: Ref<InputLayoutExpose | undefined>

  /**
   * The value displayed in the editor layout.
   * @type {ReadRef<TextEditorProps["modelValue"]>}
   */
  valueLayout: ReadRef<TextEditorProps["modelValue"]>

  /**
   * The CSS class applied to the editor layout.
   * @type {ReadRef<TextEditorProps["class"]>}
   */
  classLayout: ReadRef<TextEditorProps["class"]>

  /**
   * Indicates whether the editor dialog is open.
   * @type {ReadRef<boolean>}
   */
  open: ReadRef<boolean>

  /**
   * Reference to the Quill editor instance.
   * @type {ReadRef<IQuillEditor | undefined>}
   */
  quillEditor: ReadRef<IQuillEditor | undefined>

  /**
   * Indicates whether the text editor is active.
   * @type {ReadRef<boolean>}
   */
  isActiveTextEditor: ReadRef<boolean>

  // ---PROPS-------------------------
  /**
   * The unique identifier for the editor.
   * @type {ReadRef<NonNullable<TextEditorProps["id"]>>}
   */
  id: ReadRef<NonNullable<TextEditorProps["id"]>>

  /**
   * The theme of the Quill editor.
   * @type {ReadRef<NonNullable<TextEditorProps["theme"]>>}
   */
  theme: ReadRef<NonNullable<TextEditorProps["theme"]>>

  /**
   * Indicates whether the editor has a value.
   * @type {ReadRef<boolean>}
   */
  isValue: ReadRef<boolean>

  /**
   * The current styling mode of the editor.
   * @type {ReadRef<NonNullable<TextEditorProps["mode"]>>}
   */
  mode: ReadRef<NonNullable<TextEditorProps["mode"]>>

  /**
   * Indicates whether the editor is disabled.
   * @type {ReadRef<NonNullable<TextEditorProps["disabled"]>>}
   */
  isDisabled: ReadRef<NonNullable<TextEditorProps["disabled"]>>
  /**
   * Indicates whether the editor is loading.
   * @type {ReadRef<NonNullable<TextEditorProps["isInvalid"]>>}
   */
  isLoading: ReadRef<NonNullable<TextEditorProps["isInvalid"]>>
  /**
   * Indicates whether the editor is invalid.
   * @type {ReadRef<NonNullable<TextEditorProps["isInvalid"]>>}
   */
  isInvalid: ReadRef<NonNullable<TextEditorProps["isInvalid"]>>

  /**
   * The validation message for the editor.
   * @type {ReadRef<NonNullable<TextEditorProps["messageInvalid"]>>}
   */
  messageInvalid: ReadRef<NonNullable<TextEditorProps["messageInvalid"]>>

  /**
   * The CSS class applied to the editor container.
   * @type {ReadRef<NonNullable<TextEditorProps["class"]>>}
   */
  classStyle: ReadRef<NonNullable<TextEditorProps["class"]>>

  /**
   * Configuration for the dialog used by the editor.
   * @type {ReadRef<TextEditorProps["paramsDialog"]>}
   */
  paramsDialog: ReadRef<TextEditorProps["paramsDialog"]>

  /**
   * Configuration for the Quill editor.
   * @type {ReadRef<NonNullable<Partial<TextEditorProps["paramsTextEditor"]>>>}
   */
  paramsQuillEditor: ReadRef<NonNullable<Partial<TextEditorProps["paramsTextEditor"]>>>

  /**
   * The layout configuration for the editor input.
   * @type {ReadRef<Omit<InputLayoutProps, "value">>}
   */
  inputLayout: ReadRef<Omit<InputLayoutProps, "value">>

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

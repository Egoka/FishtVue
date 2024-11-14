import { Ref, VNode } from "vue"
import { ClassComponent, GlobalComponentConstructor, ReadRef } from "../types"
import { Delta } from "@vueup/vue-quill"
import { InputLayoutExpose, InputLayoutOption, InputLayoutProps } from "fishtvue/inputlayout"
import Quill from "quill"
// @ts-ignore
import { Sources } from "quill"
import { DialogProps } from "fishtvue/dialog"
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
  paramsDialog?: Partial<DialogProps>
  paramsTextEditor?: Partial<IDataTextEditor>
  theme?: "snow" | "bubble"
}

export interface TextEditorProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseTextEditorProps> {
  id?: string
  modelValue?: string | number | null | undefined
}

export declare type TextEditorSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
export declare type TextEditorEmits = {
  (event: "update:modelValue", payload: string): void
  (event: "update:isInvalid", payload: boolean): void
  (event: "change:modelValue", payload: boolean): void
}
export declare type TextEditorExpose = {
  // ---STATE-------------------------
  layout: Ref<InputLayoutExpose | undefined>
  valueLayout: ReadRef<TextEditorProps["modelValue"]>
  classLayout: ReadRef<TextEditorProps["class"]>
  open: ReadRef<boolean>
  quillEditor: ReadRef<IQuillEditor | undefined>
  isActiveTextEditor: ReadRef<boolean>
  // ---PROPS-------------------------
  id: ReadRef<NonNullable<TextEditorProps["id"]>>
  theme: ReadRef<NonNullable<TextEditorProps["theme"]>>
  isValue: ReadRef<boolean>
  mode: ReadRef<NonNullable<TextEditorProps["mode"]>>
  isDisabled: ReadRef<NonNullable<TextEditorProps["disabled"]>>
  isLoading: ReadRef<NonNullable<TextEditorProps["isInvalid"]>>
  isInvalid: ReadRef<NonNullable<TextEditorProps["isInvalid"]>>
  messageInvalid: ReadRef<NonNullable<TextEditorProps["messageInvalid"]>>
  classStyle: ReadRef<NonNullable<TextEditorProps["class"]>>
  paramsDialog: ReadRef<TextEditorProps["paramsDialog"]>
  paramsQuillEditor: ReadRef<NonNullable<Partial<TextEditorProps["paramsTextEditor"]>>>
  inputLayout: ReadRef<Omit<InputLayoutProps, "value">>
  // ---METHODS-----------------------
  clear(): void
  ready(): void
}
export declare type TextEditorOption = Pick<
  TextEditorProps,
  "paramsDialog" | "paramsTextEditor" | "theme" | keyof InputLayoutOption
>

// ---------------------------------------
declare class TextEditor extends ClassComponent<TextEditorProps, TextEditorSlots, TextEditorEmits, TextEditorExpose> {}

declare module "vue" {
  export interface GlobalComponents {
    TextEditor: GlobalComponentConstructor<TextEditor>
  }
}

export default TextEditor

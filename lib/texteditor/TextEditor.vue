<script setup lang="ts">
  import { computed, getCurrentInstance, ref, watch, onMounted, useSlots } from "vue"
  import { TextEditorProps, TextEditorEmits, TextEditorExpose, IQuillEditor } from "./TextEditor"
  import { QuillEditor } from "@vueup/vue-quill"
  import "@vueup/vue-quill/dist/vue-quill.snow.css"
  import "@vueup/vue-quill/dist/vue-quill.bubble.css"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Dialog from "fishtvue/dialog/Dialog.vue"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  import { InputLayoutExpose, InputLayoutProps } from "fishtvue/inputlayout"
  import { StyleClass } from "fishtvue/types"
  import { htmlToText } from "fishtvue/utils/domHandler"
  // ---BASE-COMPONENT----------------------
  const TextEditor = new Component<"TextEditor">()
  const options = TextEditor.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  const props = withDefaults(defineProps<TextEditorProps>(), {
    isValue: undefined,
    isInvalid: undefined,
    required: undefined,
    loading: undefined,
    disabled: undefined,
    clear: undefined
  })
  const emit = defineEmits<TextEditorEmits>()
  const slots = useSlots()
  // ---STATE-------------------------------
  const layout = ref<InputLayoutExpose>()
  const valueLayout = ref<TextEditorProps["modelValue"]>()
  const classLayout = ref<TextEditorProps["class"]>()
  const open = ref<boolean>(false)
  const quillEditor = ref<IQuillEditor>()
  const isActiveTextEditor = ref<boolean>(false)
  const additionalStyles = ref<string>("max-h-max h-max")
  const editorSmall = ref<StyleClass>(TextEditor.setStyle("editor-small max-h-40 caret-theme-500"))
  const modelValue = ref<TextEditorProps["modelValue"]>()
  watch(
    () => props.modelValue,
    (value) => {
      modelValue.value = value
      valueLayout.value = htmlToText(value)
    },
    { immediate: true }
  )
  // ---PROPS-------------------------------
  const id = ref<NonNullable<TextEditorProps["id"]>>(String(props.id ?? getCurrentInstance()?.uid))
  const theme = ref<NonNullable<TextEditorProps["theme"]>>(props?.theme ?? options?.theme ?? "bubble")
  const isValue = computed<boolean>(() =>
    Boolean(modelValue.value ? String(modelValue.value).length : (modelValue.value ?? isActiveTextEditor.value))
  )
  const mode = computed<NonNullable<TextEditorProps["mode"]>>(() => props.mode ?? options?.mode ?? "outlined")
  const isDisabled = computed<NonNullable<TextEditorProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<TextEditorProps["isInvalid"]>>(() => props.loading ?? false)
  const isInvalid = computed<NonNullable<TextEditorProps["isInvalid"]>>(() =>
    !isDisabled.value ? props.isInvalid : false
  )
  const messageInvalid = computed<NonNullable<TextEditorProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  const classStyle = computed<NonNullable<TextEditorProps["class"]>>(
    () => (options?.class ? `${options?.class} ` : "") + (props.class ? `${props.class}` : "") + additionalStyles.value
  )
  const editor = computed<StyleClass>(() =>
    TextEditor.setStyle([
      "border rounded-md border-neutral-200 dark:border-neutral-800 dark:text-gray-400",
      mode.value === "outlined" ? "bg-white dark:bg-black" : "",
      mode.value === "underlined" ? "bg-stone-50 dark:bg-stone-950" : "",
      mode.value === "filled" ? "bg-stone-100 dark:bg-stone-900" : "",
      "st-text-editor caret-theme-500"
    ])
  )
  const resizeButtonToBubble = ref<StyleClass>(TextEditor.setStyle("absolute top-0 right-0", { isNotScopeId: true }))
  const resizeButtonToSnow = ref<StyleClass>(TextEditor.setStyle("relative flex text-left h-[36px]"))
  const paramsDialog = computed<NonNullable<TextEditorProps["paramsDialog"]>>(() => ({
    ...options?.paramsDialog,
    ...props?.paramsDialog
  }))
  const paramsQuillEditor = computed<NonNullable<Partial<TextEditorProps["paramsTextEditor"]>>>(() => ({
    content: modelValue.value,
    readOnly: isDisabled.value,
    contentType: "html",
    toolbar: [
      ["bold", "italic", "underline", "strike"], // toggled buttons
      ["blockquote", "code-block"],

      [{ header: 1 }, { header: 2 }], // custom button values
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }], // superscript/subscript
      [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
      // [{ 'direction': 'rtl' }],                         // text direction
      // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }], // dropdown with defaults from theme
      [{ font: [] }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"] // remove formatting button
    ],
    ...options?.paramsTextEditor,
    ...props?.paramsTextEditor
  }))
  const inputLayout = computed<Omit<InputLayoutProps, "value">>(() => ({
    isValue: isValue.value,
    mode: mode.value,
    label: props.label,
    labelMode: props.labelMode ?? options?.labelMode,
    isInvalid: isInvalid.value,
    messageInvalid: messageInvalid.value,
    required: props.required,
    loading: isLoading.value,
    disabled: isDisabled.value,
    help: props.help,
    clear: props.clear ?? options?.clear,
    classBody: props.classBody ?? options?.classBody,
    class: classStyle.value
  }))
  // ---EXPOSE------------------------------
  defineExpose<TextEditorExpose>({
    // ---STATE-------------------------
    layout,
    valueLayout,
    classLayout,
    open,
    quillEditor,
    isActiveTextEditor,
    // ---PROPS-------------------------------
    id,
    theme,
    isValue,
    mode,
    isDisabled,
    isLoading,
    isInvalid,
    messageInvalid,
    classStyle,
    paramsDialog,
    paramsQuillEditor,
    inputLayout,
    // ---METHODS-----------------------------
    clear,
    ready
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(() => {
    TextEditor.initStyle()
  })
  // ---WATCHERS----------------------------
  watch(theme, (theme) => {
    open.value = theme === "snow" ? true : theme === "bubble" ? false : false
  })
  watch(isActiveTextEditor, (value) => {
    {
      classLayout.value =
        (props.class ?? "") +
        (value
          ? ` border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700 ${additionalStyles.value}`
          : " " + additionalStyles.value)
      if (!value) changeModelValue(modelValue.value)
    }
  })

  // ---METHODS-----------------------------
  function inputModelValue(value: any) {
    modelValue.value = value
    emit("update:isInvalid", false)
    emit("update:modelValue", value)
  }

  function changeModelValue(value: any) {
    emit("change:modelValue", value)
  }

  function clear() {
    modelValue.value = "<p></p>"
    isActiveTextEditor.value = false
    inputModelValue(modelValue.value)
    changeModelValue(modelValue.value)
  }

  function ready() {
    valueLayout.value = htmlToText(modelValue.value)
  }
</script>

<template>
  <InputLayout
    data-text-editor
    ref="layout"
    :value="valueLayout"
    :class="classLayout"
    v-bind="inputLayout"
    @clear="clear">
    <div :class="editorSmall">
      <QuillEditor
        v-if="theme === 'bubble'"
        :id="id"
        ref="quillEditor"
        theme="bubble"
        v-bind="paramsQuillEditor"
        @update:content="inputModelValue"
        @focus="isActiveTextEditor = true"
        @blur="isActiveTextEditor = false"
        @ready="ready" />
    </div>
    <template #body>
      <Dialog
        v-model="open"
        v-bind="paramsDialog"
        @update:modelValue="theme = 'bubble'"
        :class="['p-0 max-w-screen-sm sm:max-w-5xl sm:m-3 sm:w-[90%] max-h-screen']">
        <div :class="['editor', isDisabled ? 'editor-disabled' : '', editor]">
          <QuillEditor
            v-if="theme === 'snow'"
            theme="snow"
            v-bind="paramsQuillEditor"
            @update:content="inputModelValue" />
          <div :class="resizeButtonToBubble" @click="theme = 'bubble'">
            <Button
              type="icon"
              size="xs"
              mode="ghost"
              icon="ArrowsPointingIn"
              class-icon="text-gray-400 dark:text-gray-600 hover:text-gray-600 hover:dark:text-gray-400">
            </Button>
          </div>
        </div>
      </Dialog>
      <slot />
    </template>
    <template #before>
      <slot v-if="slots.before" name="before" />
    </template>
    <template #after>
      <div :class="resizeButtonToSnow" @click="theme = 'snow'">
        <Button
          type="icon"
          size="xs"
          mode="ghost"
          icon="ArrowsPointingOut"
          data-switch-size
          class-icon="text-gray-400 dark:text-gray-600 hover:text-gray-600 hover:dark:text-gray-400">
          {{ TextEditor.t("increase") ?? "Increase" }}
        </Button>
      </div>
      <slot v-if="slots.after" name="after" />
    </template>
  </InputLayout>
</template>
<style>
  .editor {
    --ql-theme-50: hsla(var(--theme) var(--theme-contrast) 95.1%);
    --ql-theme-100: hsla(var(--theme) var(--theme-contrast) 93.1%);
    --ql-theme-200: hsla(var(--theme) var(--theme-contrast) 86%);
    --ql-theme-300: hsla(var(--theme) var(--theme-contrast) 74.4%);
    --ql-theme-400: hsla(var(--theme) var(--theme-contrast) 60.1%);
    --ql-theme-500: hsla(var(--theme) var(--theme-contrast) 46.9%);
    --ql-theme-600: hsla(var(--theme) var(--theme-contrast) 39.5%);
    --ql-theme-700: hsla(var(--theme) var(--theme-contrast) 30.5%);
    --ql-theme-800: hsla(var(--theme) var(--theme-contrast) 20.5%);
    --ql-theme-900: hsla(var(--theme) var(--theme-contrast) 9.2%);
  }

  .editor .ql-snow.ql-toolbar button:hover,
  .ql-snow .ql-toolbar button:hover,
  .ql-snow.ql-toolbar button:focus,
  .ql-snow .ql-toolbar button:focus,
  .ql-snow.ql-toolbar button.ql-active,
  .ql-snow .ql-toolbar button.ql-active,
  .ql-snow.ql-toolbar .ql-picker-label:hover,
  .ql-snow .ql-toolbar .ql-picker-label:hover,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active,
  .ql-snow.ql-toolbar .ql-picker-item:hover,
  .ql-snow .ql-toolbar .ql-picker-item:hover,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
    color: var(--ql-theme-500);
    background-color: var(--ql-theme-100);
  }

  .editor .ql-snow.ql-toolbar button:hover .ql-fill,
  .ql-snow .ql-toolbar button:hover .ql-fill,
  .ql-snow.ql-toolbar button:focus .ql-fill,
  .ql-snow .ql-toolbar button:focus .ql-fill,
  .ql-snow.ql-toolbar button.ql-active .ql-fill,
  .ql-snow .ql-toolbar button.ql-active .ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill,
  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill,
  .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill,
  .ql-snow.ql-toolbar button:hover .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar button:hover .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar button:focus .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar button:focus .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar button.ql-active .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar button.ql-active .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke.ql-fill,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke.ql-fill {
    fill: var(--ql-theme-500);
  }

  .editor .ql-snow.ql-toolbar button:hover .ql-stroke,
  .ql-snow .ql-toolbar button:hover .ql-stroke,
  .ql-snow.ql-toolbar button:focus .ql-stroke,
  .ql-snow .ql-toolbar button:focus .ql-stroke,
  .ql-snow.ql-toolbar button.ql-active .ql-stroke,
  .ql-snow .ql-toolbar button.ql-active .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
  .ql-snow.ql-toolbar button:hover .ql-stroke-miter,
  .ql-snow .ql-toolbar button:hover .ql-stroke-miter,
  .ql-snow.ql-toolbar button:focus .ql-stroke-miter,
  .ql-snow .ql-toolbar button:focus .ql-stroke-miter,
  .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
  .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
    stroke: var(--ql-theme-500);
  }

  .editor .ql-snow.ql-toolbar button.ql-active .ql-stroke,
  .ql-snow .ql-toolbar button.ql-active .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
  .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter,
  .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
    stroke: var(--ql-theme-500);
  }

  @media (prefers-color-scheme: light) {
    .editor {
      --background-quill-toolbar: var(--ql-theme-100);
      --border-quill-editor: var(--ql-theme-200);
      --placeholder-quill-editor: #00000099;
      --background-quill-editor: #f6f3f4;
      --background-picker-options-quill-editor: #f5f5f5;
    }
  }

  @media (prefers-color-scheme: dark) {
    .editor {
      --background-quill-toolbar: var(--ql-theme-900);
      --border-quill-editor: var(--ql-theme-800);
      --placeholder-quill-editor: #ffffff99;
      --background-quill-editor: #212121;
      --background-picker-options-quill-editor: #131313;
    }
  }

  .editor-small .ql-editor {
    padding: 9px 5px;
  }

  .editor .ql-toolbar {
    border: none;
    border-bottom: 1px solid var(--border-quill-editor);
    padding-right: 2rem;
    border-top-left-radius: 0.3rem;
    border-top-right-radius: 0.3rem;
    background: var(--background-quill-toolbar);
  }

  .editor.editor-disabled .ql-toolbar {
    display: none;
  }

  .editor .ql-toolbar .ql-formats {
    margin-right: 10px;
  }

  .editor .ql-container {
    height: calc(100vh - 40vh);
    padding: 0 1rem;
    border: none;
  }

  .editor .ql-editor::-webkit-scrollbar {
    display: none;
  }

  .editor .ql-formats {
    margin: 2px;
    border: 1px solid var(--border-quill-editor);
    border-radius: 5px;
  }

  @media (max-width: 600px) {
    :deep(.editor .ql-container) {
      height: calc(100vh - 170px);
    }
  }

  .editor .ql-toolbar.ql-snow .ql-picker,
  .editor .ql-snow.ql-toolbar button {
    margin: 0;
    border-radius: 3px;
  }

  .editor .ql-toolbar .ql-picker .ql-picker-label {
    border-color: transparent;
    border-radius: 3px;
  }

  .editor .ql-toolbar .ql-picker.ql-expanded .ql-picker-options {
    border-color: transparent;
    border-radius: 5px;
    margin-top: 5px;
    background-color: var(--background-picker-options-quill-editor);
  }

  .editor .ql-snow .ql-picker-options .ql-picker-item {
    border-radius: 3px;
  }

  .editor .ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
    border: 1px solid var(--border-quill-editor);
  }

  .editor .ql-snow.ql-toolbar button:hover,
  .ql-snow .ql-toolbar button:hover,
  .ql-snow.ql-toolbar button:focus,
  .ql-snow .ql-toolbar button:focus,
  .ql-snow.ql-toolbar button.ql-active,
  .ql-snow .ql-toolbar button.ql-active,
  .ql-snow.ql-toolbar .ql-picker-label:hover,
  .ql-snow .ql-toolbar .ql-picker-label:hover,
  .ql-snow.ql-toolbar .ql-picker-label.ql-active,
  .ql-snow .ql-toolbar .ql-picker-label.ql-active,
  .ql-snow.ql-toolbar .ql-picker-item:hover,
  .ql-snow .ql-toolbar .ql-picker-item:hover,
  .ql-snow.ql-toolbar .ql-picker-item.ql-selected,
  .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
    background-color: var(--background-quill-editor);
  }

  .editor .ql-snow .ql-tooltip[data-mode="link"]::before {
    content: "Ваша ссылка";
  }

  .editor .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    content: "Сохранить";
  }

  .editor-small .ql-editor.ql-blank::before,
  .editor .ql-editor.ql-blank::before {
    font-style: normal;
    color: var(--placeholder-quill-editor);
  }

  .editor-small .ql-editor.ql-blank::before {
    left: 6px;
  }

  .editor .ql-editor.ql-blank::before {
    padding: 0 17px;
  }
</style>

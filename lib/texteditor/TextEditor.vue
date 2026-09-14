<script setup lang="ts">
  import { computed, onMounted, ref, shallowRef, useSlots, watch } from "vue"
  import { TextEditorClassKey, TextEditorEmits, TextEditorInstance, TextEditorProps } from "./TextEditor"
  import InputLayout from "fishtvue/inputlayout/InputLayout.vue"
  import Dialog from "fishtvue/dialog/Dialog.vue"
  import Button from "fishtvue/button/Button.vue"
  import Component from "fishtvue/component"
  import { InputLayoutExpose, InputLayoutProps } from "fishtvue/inputlayout"
  import { StyleClass } from "fishtvue/types"
  import { mergeClasses } from "fishtvue/utils/tailwindHandler"
  import { fieldsOmit } from "fishtvue/utils/objectHandler"
  import { htmlToText } from "fishtvue/utils/domHandler"
  import { useDarkMode } from "fishtvue/theme"
  // ---BASE-COMPONENT----------------------
  const TextEditor = new Component<"TextEditor">()
  const options = TextEditor.getOptions()
  // ---PROPS-EMITS-SLOTS-------------------
  // Каждый optional boolean — `undefined` (dev-patterns §2 F): иначе слой componentsOptions недостижим.
  const props = withDefaults(defineProps<TextEditorProps>(), {
    invalid: undefined,
    required: undefined,
    loading: undefined,
    disabled: undefined,
    clearable: undefined
  })
  const emit = defineEmits<TextEditorEmits>()
  const slots = useSlots()
  const { cls, raw } = TextEditor.resolveClasses<TextEditorClassKey>(props)
  // ---STATE-------------------------------
  // shallowRef, а не ref: сюда кладётся определение компонента. Глубокий reactive-прокси на нём
  // не нужен и вызывает Vue-warn «received a Component that was made a reactive object».
  const QuillEditor = shallowRef<any>()
  const layout = ref<InputLayoutExpose>()
  const valueLayout = ref<TextEditorProps["modelValue"]>()
  const open = ref<boolean>(false)
  const quillEditorLink = ref<TextEditorInstance>()
  const isActiveTextEditor = ref<boolean>(false)
  const modelValue = ref<TextEditorProps["modelValue"]>()
  watch(
    () => props.modelValue,
    (value) => {
      modelValue.value = value
      valueLayout.value = htmlToText<TextEditorProps["modelValue"]>(value)
    },
    { immediate: true }
  )
  // ---PROPS-------------------------------
  const id = ref<string | undefined>((props?.id as TextEditorProps["id"]) ?? undefined)
  const theme = ref<NonNullable<TextEditorProps["theme"]>>(
    (props?.theme as TextEditorProps["theme"]) ?? options?.theme ?? "bubble"
  )
  const isValue = computed<boolean>(() =>
    Boolean(modelValue.value ? String(modelValue.value).length : (modelValue.value ?? isActiveTextEditor.value))
  )
  // Wave 3.2 (texteditor.md Issue 7): глобальный componentsStyle в fallback-chain — зеркало Input.vue.
  const mode = computed<NonNullable<TextEditorProps["mode"]>>(
    () => props.mode ?? options?.mode ?? TextEditor.componentsStyle() ?? "outlined"
  )
  const isDisabled = computed<NonNullable<TextEditorProps["disabled"]>>(() => props.disabled ?? false)
  const isLoading = computed<NonNullable<TextEditorProps["loading"]>>(() => props.loading ?? false)
  const isInvalid = computed<boolean>(() => (!isDisabled.value ? (props.invalid ?? false) : false))
  const isClearable = computed<boolean>(() => props?.clearable ?? options?.clearable ?? false)
  const messageInvalid = computed<NonNullable<TextEditorProps["messageInvalid"]>>(() => props.messageInvalid ?? "")
  // Inline-контейнер Quill (bubble-режим) — ключ `editor`.
  const classEditor = computed(() => cls("editor", "editor-small w-38 max-h-40 caret-theme-500"))
  // Контейнер редактора внутри диалога snow-режима: свой ключ не нужен — диалог настраивается
  // через `dialogProps.class` / `dialogProps.classes`.
  const classDialogEditor = computed<StyleClass>(() =>
    TextEditor.setStyle([
      "border rounded-md border-surface-200 dark:border-surface-800 dark:text-surface-400",
      mode.value === "outlined" ? "bg-white dark:bg-black" : "",
      mode.value === "underlined" ? "bg-surface-50 dark:bg-surface-950" : "",
      mode.value === "filled" ? "bg-surface-100 dark:bg-surface-900" : "",
      "st-text-editor caret-theme-500"
    ])
  )
  // Тема Quill-обвязки и подписи его tooltip'ов идут CSS-переменными, а не `@media` / литералами:
  //
  // - dark-режим определяется через `optionsTheme.darkModeSelector` (единый источник истины с
  //   движком стилей), иначе при `<html class="dark">` и светлой системной теме редактор оставался
  //   светлым посреди тёмной страницы — прежняя привязка к системной цветовой схеме этого не умела;
  // - подписи `content:` в псевдоэлементах Quill нельзя проставить из шаблона, поэтому строки
  //   локали заезжают переменными (значение обязано быть в кавычках — это CSS-строка).
  const isDark = useDarkMode()
  const quillVars = computed<Record<string, string>>(() => ({
    "--background-quill-toolbar": isDark.value ? "var(--ql-theme-900)" : "var(--ql-theme-100)",
    "--border-quill-editor": isDark.value ? "var(--ql-theme-800)" : "var(--ql-theme-200)",
    "--placeholder-quill-editor": isDark.value ? "#ffffff99" : "#00000099",
    // surface-100 / surface-900 (Wave 9 — Issue 2 / B10): ближайшие тона к прежним хардкодам.
    "--background-quill-editor": isDark.value
      ? "rgb(var(--fv-surface-900, 17 24 39))"
      : "rgb(var(--fv-surface-100, 243 244 246))",
    "--background-picker-options-quill-editor": isDark.value
      ? "rgb(var(--fv-surface-900, 17 24 39))"
      : "rgb(var(--fv-surface-100, 243 244 246))",
    "--fv-quill-link-label": JSON.stringify(TextEditor.t("textEditor.linkLabel") ?? "Enter link:"),
    "--fv-quill-save-label": JSON.stringify(TextEditor.t("textEditor.saveLabel") ?? TextEditor.t("save") ?? "Save")
  }))
  const resizeButtonToBubble = ref<StyleClass>(TextEditor.setStyle("absolute top-0 right-0"))
  const resizeButtonToSnow = ref<StyleClass>(TextEditor.setStyle("relative flex text-left h-[36px]"))
  const dialogProps = computed<NonNullable<TextEditorProps["dialogProps"]>>(() => ({
    ...options?.dialogProps,
    ...props?.dialogProps
  }))
  const editorProps = computed<NonNullable<Partial<TextEditorProps["editorProps"]>>>(() => ({
    content: typeof modelValue.value === "number" ? String(modelValue.value) : modelValue.value,
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
      ["clean"] // remove the formatting button
    ],
    ...options?.editorProps,
    ...props?.editorProps
  }))
  // Hand-off карты классов в InputLayout (dev-patterns §2 C/D): семейные ключи складываются по ключу,
  // aspect `animation` заменяется, `root` уходит отдельным `class`. `max-h-max h-max` в `base` снимает
  // лимит высоты рамки (редактор растёт по контенту) — раньше эта строка клеилась к `props.class`
  // без пробела (дефект D-TextEditor, закрыт в W2); focus-ring гейтится `!isInvalid`.
  const FOCUS_RING = "border-theme-600 dark:border-theme-700 ring-2 ring-inset ring-theme-600 dark:ring-theme-700"
  const layoutClasses = computed(() => ({
    ...mergeClasses(
      { base: ["max-h-max h-max", isActiveTextEditor.value && !isInvalid.value ? FOCUS_RING : ""] },
      fieldsOmit(options?.classes ?? {}, ["root", "animation"]),
      fieldsOmit(props.classes ?? {}, ["root", "animation"])
    ),
    animation: props.classes?.animation ?? options?.classes?.animation
  }))
  const inputLayout = computed<Omit<InputLayoutProps, "value">>(() => ({
    id: props.id,
    hasValue: isValue.value,
    mode: mode.value,
    label: props.label,
    labelMode: props.labelMode ?? options?.labelMode,
    invalid: isInvalid.value,
    messageInvalid: messageInvalid.value,
    required: props.required,
    loading: isLoading.value,
    disabled: isDisabled.value,
    help: props.help,
    clearable: isClearable.value,
    width: props.width,
    height: props.height,
    class: raw("root"),
    classes: layoutClasses.value
  }))
  // G34: ссылка на КОРНЕВОЙ элемент + `focus()`. Корень TextEditor — `<InputLayout>`, поэтому
  // элемент берётся из его expose (`inputBody`). Зеркало `componentTable`/`buttonRef`.
  const componentTextEditor = computed<HTMLElement | undefined>(() => layout.value?.inputBody)

  /**
   * Ставит фокус в редактор. Делегирует Quill'у, если тот загружен (он сам знает, куда именно
   * внутри contenteditable вернуть каретку); иначе фокусирует корневой элемент, чтобы вызов
   * не был молча бесполезным при отсутствующем optional peer-dep.
   */
  function focus() {
    if (quillEditorLink.value) quillEditorLink.value.focus()
    else componentTextEditor.value?.focus()
  }

  // ---EXPOSE------------------------------
  defineExpose({
    // ---STATE-------------------------
    layout,
    componentTextEditor,
    valueLayout,
    classEditor,
    open,
    quillEditorLink,
    isActiveTextEditor,
    // ---PROPS-------------------------------
    id,
    theme,
    isValue,
    mode,
    isDisabled,
    isLoading,
    isInvalid,
    isClearable,
    messageInvalid,
    dialogProps,
    editorProps,
    inputLayout,
    // ---METHODS-----------------------------
    clear,
    ready,
    focus
  })
  // ---MOUNT-UNMOUNT-----------------------
  onMounted(async () => {
    // ---CANON (Wave 2.3) — без ручного TextEditor.initStyle(): базовый Component.__hooks() уже
    // регистрирует onServerPrefetch + vueOnMounted → initStyle() (см. lib/component/index.ts:79–84).
    // ---Wave 2.1 — Quill (@vueup/vue-quill + quill) = optional peerDependencies: и компонент, и его
    // CSS грузятся lazy на клиенте при mount, не на import-time (bundle без TextEditor их не тянет,
    // SSR-safe). При отсутствии peer редактор просто не рендерится (template v-if="QuillEditor").
    try {
      QuillEditor.value = (await import("@vueup/vue-quill")).QuillEditor
      await Promise.all([
        import("@vueup/vue-quill/dist/vue-quill.snow.css"),
        import("@vueup/vue-quill/dist/vue-quill.bubble.css")
      ])
    } catch {
      /* @vueup/vue-quill не установлен (optional peer) — редактор остаётся нерендеренным */
    }
  })
  // ---WATCHERS----------------------------
  watch(theme, (theme) => {
    open.value = theme === "snow" ? true : theme === "bubble" ? false : false
  })
  watch(isActiveTextEditor, (value) => {
    if (!value) changeModelValue(modelValue.value)
  })

  // ---METHODS-----------------------------
  function inputModelValue(value: any) {
    modelValue.value = value
    emit("update:invalid", false)
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
  <!-- Корень TextEditor — корень InputLayout: `data-text-editor` падает на него fallthrough-атрибутом -->
  <InputLayout data-text-editor ref="layout" :value="valueLayout" v-bind="inputLayout" @clear="clear">
    <template #default="{ id: fieldId, labelledby }">
      <div data-text-editor-editor :id="fieldId" :aria-labelledby="labelledby" :class="classEditor" :style="quillVars">
        <component
          :is="QuillEditor"
          v-if="QuillEditor && theme === 'bubble'"
          ref="quillEditorLink"
          theme="bubble"
          v-bind="editorProps"
          @update:content="inputModelValue"
          @focus="isActiveTextEditor = true"
          @blur="isActiveTextEditor = false"
          @ready="ready" />
      </div>
      <!--
        Issue 10 (M54-55): Quill рендерится в contenteditable-div'ах, поэтому при native submit
        содержимое не попадало в FormData. Скрытый input переносит HTML-строку в форму.
        `:name="id"` — канон формы, зеркало Textarea.vue: id компонента служит и именем поля.
        Значение берётся из локального modelValue (а не props), чтобы правки попадали в FormData
        сразу, не дожидаясь change-эмита на blur.
      -->
      <input v-if="id" type="hidden" data-text-editor-value :name="id" :value="modelValue ?? ''" />
    </template>
    <template #body>
      <Dialog
        v-model="open"
        v-bind="dialogProps"
        @update:modelValue="theme = 'bubble'"
        :classes="{ content: 'p-0 max-w-screen-sm sm:max-w-5xl sm:m-3 sm:w-[90%] max-h-screen' }">
        <div :class="['editor', isDisabled ? 'editor-disabled' : '', classDialogEditor]" :style="quillVars">
          <component
            :is="QuillEditor"
            v-if="QuillEditor && theme === 'snow'"
            theme="snow"
            v-bind="editorProps"
            @update:content="inputModelValue" />
          <div :class="resizeButtonToBubble" @click="theme = 'bubble'">
            <Button
              type="icon"
              size="xs"
              variant="ghost"
              icon="ArrowsPointingIn"
              :classes="{
                icon: 'text-surface-400 dark:text-surface-600 hover:text-surface-600 hover:dark:text-surface-400'
              }">
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
          variant="ghost"
          icon="ArrowsPointingOut"
          data-switch-size
          :classes="{
            icon: 'text-surface-400 dark:text-surface-600 hover:text-surface-600 hover:dark:text-surface-400'
          }">
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

  /*
    Тематические переменные (--background-quill-*, --border-quill-editor, --placeholder-quill-editor)
    инжектятся инлайном из `quillVars` — на .editor и на .editor-small одновременно.
    Раньше здесь стояла пара media-блоков по системной цветовой схеме: они игнорировали
    `optionsTheme.darkModeSelector` и вешали переменные только на .editor, из-за чего
    bubble-редактор (.editor-small, отдельный узел вне .editor) их вовсе не наследовал.
  */

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

  /* Подписи Quill-tooltip'а: `content` в псевдоэлементе не задать из шаблона, поэтому строка
     локали приезжает CSS-переменной из `quillVars` (fallback — английский литерал). */
  .editor .ql-snow .ql-tooltip[data-mode="link"]::before {
    content: var(--fv-quill-link-label, "Enter link:");
  }

  .editor .ql-snow .ql-tooltip.ql-editing a.ql-action::after {
    content: var(--fv-quill-save-label, "Save");
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

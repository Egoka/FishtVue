---
title: TextEditor
summary: Quill-редактор внутри Dialog с темами Snow/Bubble и кастомным toolbar. mode-цепочка учитывает глобальный componentsStyle (Wave 3.2, 2026-07-02). Native form submit через скрытое поле и полное покрытие тестами — 2026-09-05.
updated: 2026-09-14
stability: experimental
since: 0.2.11
---

# TextEditor

## 1. Overview

`TextEditor` — обёртка над [Quill](https://quilljs.com/) (через [@vueup/vue-quill](https://vueup.github.io/vue-quill/)) внутри [Dialog](./dialog.md). Поддерживает темы `snow` (toolbar сверху) и `bubble` (toolbar появляется при выделении), кастомные toolbar-конфиги (`essential`/`minimal`/`full` или custom), reactive v-model.

Stability: `experimental` — 45 кейсов ([TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts), включая блок «props 1.0»); Quill инжектит inline-стили мимо CSS-layer'а. Type-bug `change:modelValue(payload: boolean)` исправлен 2026-05-11 — payload корректно типизирован как `string` (cross-cutting fix с [Textarea](./textarea.md)).

Source: [Source](../../lib/texteditor/TextEditor.vue), [TextEditor.d.ts](../../lib/texteditor/TextEditor.d.ts), [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts).

## 2. How it's organized

```
lib/texteditor/
├── TextEditor.vue
├── TextEditor.d.ts        # 257 строк
├── TextEditor.test.ts     # 17 кейсов, ВСЕ skipped
└── package.json
```

Зависимости:
- [@vueup/vue-quill](../../lib/package.json) `^1.2.0` + [quill](../../lib/package.json) `^2.0.0` — Vue 3 wrapper + core editor. **Wave 2.1: optional `peerDependencies` + lazy.** Больше не runtime-deps (~200kb quill не тянулся ко всем потребителям): ставит приложение (`pnpm add @vueup/vue-quill quill`). `QuillEditor` грузится lazy в `onMounted` (`(await import("@vueup/vue-quill")).QuillEditor`); без peer редактор не рендерится (`template v-if="QuillEditor"`).
- CSS темы Snow/Bubble грузятся lazy в том же `onMounted` (`import("@vueup/vue-quill/dist/vue-quill.snow.css")` + `.bubble.css`), а не top-level side-effect-импортом ([rollup.config.js:59–60](../../lib/rollup.config.js#L59-L60) — external).
- [Dialog](./dialog.md), [InputLayout](./input-layout.md).

Лицензия quill — BSD-3, vue-quill — MIT (не копилефт).

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит `setStyle`. Явный `onMounted` для инициализации Quill.
- **Поток данных:** `modelValue: string` (HTML) → Quill renders → user edits → `update:modelValue` (string).
- **v-model contract:** см. §6.
- **Стили:** через `setStyle` для обёртки + импортированные CSS темы Quill.
- **Конфиг:** `componentsOptions.TextEditor` — `dialogProps`, `editorProps`, `theme`, `class`, `classes`. Toolbar и Quill modules — через `editorProps`.
- **Локализация:** не использует `t()`. Quill UI на английском; локализация — через `editorProps.options` Quill.
- **SSR:** Quill требует `document` — рендерится только на клиенте (через [Dialog](./dialog.md), который show'ится по флагу).
- **Animation:** Dialog open/close transitions; внутри Quill — собственные.

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import TextEditor from "fishtvue/texteditor"

const html = ref("<p>Hello world</p>")
</script>

<template>
  <TextEditor v-model="html" label="Description" theme="snow" />
</template>
```

Note: компонент рендерит trigger-кнопку, которая открывает Dialog с Quill.

## 5. Props

`TextEditorProps extends Omit<InputLayoutProps, "value" | "hasValue" | "classes">, Partial<BaseTextEditorProps>` ([TextEditor.d.ts:83-103](../../lib/texteditor/TextEditor.d.ts#L83-L103)).

`BaseTextEditorProps` ([TextEditor.d.ts:60-78](../../lib/texteditor/TextEditor.d.ts#L60-L78)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `dialogProps` | `Partial<DialogProps>` | — | Props Dialog-обёртки snow-режима (бывший `paramsDialog`). См. [Dialog](./dialog.md). |
| `editorProps` | `Partial<TextEditorQuillConfig>` | (встроенный toolbar) | Props Quill (toolbar, modules, options) — бывший `paramsTextEditor`. |
| `theme` | `"snow" \| "bubble"` | `"bubble"` | Quill тема. |

Свои:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id контейнера редактора; он же `name` скрытого поля для native submit. |
| `modelValue` | `string \| number \| null` | — | HTML-строка содержимого. |
| `class` | `StyleClass` | — | Классы корня (он же корень `InputLayout`, `[data-text-editor]`). |
| `classes` | `ClassesMap<TextEditorClassKey>` | — | Карта классов внутренних элементов — см. §5.1. |

### 5.1 Classes keys

`TextEditorClassKey = InputLayoutClassKey | "editor"` ([TextEditor.d.ts:58](../../lib/texteditor/TextEditor.d.ts#L58)).

| Key | Element (`data-*`) | Kind | Default |
| --- | --- | --- | --- |
| `root` | `[data-text-editor]` (корень layout'а) | element | `relative rounded-md` + фон режима |
| `base` | `[data-input-layout-base]` | element | рамка поля + `max-h-max h-max` + focus-ring |
| `editor` | `[data-text-editor-editor]` | element | `editor-small w-38 max-h-40 caret-theme-500` (inline bubble-редактор) |
| `label` / `help` / `message` / `before` / `after` | см. [InputLayout §5.1](./input-layout.md) | element | — |
| `animation` | корень + `base` | **aspect** | `motion-safe:transition-all motion-safe:duration-550` |

Диалог snow-режима стилизуется не ключом карты, а через `dialogProps.class` / `dialogProps.classes` — это отдельный компонент [Dialog](./dialog.md).

`TextEditorQuillConfig`:

| Field | Type | Description |
|---|---|---|
| `content` | `ContentPropType` | Initial content (HTML/Delta/text). |
| `contentType` | `"delta" \| "html" \| "text"` | Формат content. |
| `enable` | `boolean` | Enable редактирования. |
| `readOnly` | `boolean` | Read-only mode. |
| `toolbar` | `"essential" \| "minimal" \| "full" \| string \| object \| Array<any>` | Конфиг toolbar. |
| `modules` | `Module \| Module[]` | Quill modules (image-resize, formula и т.д.). |
| `options` | `any` | Quill init options. |
| `globalOptions` | `any` | Глобальные options. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `string` (HTML) | На каждый change в Quill. |
| `change:modelValue` | `string` (HTML) | На blur / programmatic save. Fixed 2026-05-11 (раньше тип был ошибочно `boolean`). |
| `update:invalid` | `boolean` (всегда `false`) | Ввод — reset-сигнал (`v-model:invalid`). |

**v-model contract** (form-control): стандартный `v-model` идёт через `update:modelValue`,
парный `change:modelValue` — «значение устоялось». У TextEditor момент устаканивания — blur
редактора либо programmatic save, а не каждое нажатие в Quill. `update:modelValue` подписывай
для непрерывного отслеживания, `change:modelValue` — для тяжёлых операций (автосохранение
черновика, отправка HTML на бекенд). Валидность — отдельный канал `v-model:invalid`.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Альтернативный rendering trigger'а. |
| `before` | — | Контент слева. |
| `after` | — | Контент справа. |

## 8. Exposed methods

`TextEditorExpose`:

| Name | Description |
|---|---|
| `layout`, `componentTextEditor`, `valueLayout`, `classEditor`, `open`, `quillEditorLink: TextEditorInstance`, `isActiveTextEditor` | Reactive state. |
| `id`, `theme`, `isValue`, `mode`, `isDisabled`, `isLoading`, `isInvalid`, `isClearable`, `messageInvalid`, `dialogProps`, `editorProps`, `inputLayout` | Derived. |
| `clear()` | Очистка содержимого. |
| `ready()` | Promise после init Quill (полезно для тестов). |

`TextEditorInstance` (на `quillEditorLink`):

| Name | Description |
|---|---|
| `editor: HTMLElement` | DOM-узел Quill. |
| `getEditor()`, `getToolbar()`, `getQuill(): Quill` | Доступ к Quill API. |
| `getContents(index?, length?)`, `setContents(content, source?)` | Получить/установить delta. |
| `getHTML()`, `setHTML(html)`, `pasteHTML(html, source?)` | HTML I/O. |
| `focus()`, `getText(index?, length?)`, `setText(text, source?)` | Plain text I/O. |
| `reinit()` | Полная переинициализация. |

## 9. Examples

### 9.1 Базовый

```vue
<TextEditor v-model="html" />
```

### 9.2 С глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    TextEditor: {
      theme: "snow",
      editorProps: {
        toolbar: "minimal",
        contentType: "html"
      }
    }
  }
})
```

### 9.3 Custom toolbar

```vue
<TextEditor
  v-model="html"
  :editor-props="{
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ]
  }" />
```

### 9.4 Read-only preview

```vue
<TextEditor
  v-model="html"
  :editor-props="{ readOnly: true, enable: false }"
  theme="bubble" />
```

## 10. Configuration & Customization

### 10.1 Global

`TextEditorOption = Pick<TextEditorProps, "dialogProps" | "editorProps" | "theme" | "class" | "classes" | keyof InputLayoutOption>` ([TextEditor.d.ts:280-283](../../lib/texteditor/TextEditor.d.ts#L280-L283)).

`mode` (стиль InputLayout-обёртки) резолвится по цепочке `props.mode ?? options?.mode ?? TextEditor.componentsStyle() ?? "outlined"` — глобальный `componentsStyle` учитывается (Wave 3.2, зеркало [Input](./input.md)). Quill-тема `theme: "snow" | "bubble"` — независимая ось (тема редактора, не обёртки).

### 10.2 Per-instance

Через props.

### 10.3 Theming

- Quill темы Snow/Bubble — стилизация toolbar и редактора.
- FishtVue-темa влияет на обёртку Dialog/InputLayout, но не на саму контент-область Quill.
- Кастомные стили Quill — через `:deep(.ql-...)` или импорт собственного `quill.css`.

### 10.4 CSS layer override

Quill CSS импортируется вне `@layer fishtvue` — он имеет более высокую специфичность по дефолту. Для override используй обычный CSS поверх.

## 11. Form integration & validation

- Поддержка в [Form](./form.md) через v-model (HTML-строка).
- Валидация — `required` через rules; для типичных правил «минимум N символов» парси HTML на стороне rules: `<TextEditor>` отдаёт HTML, не plain text.
- Reset — `modelValue: ""`.

### Native form submit (M54-55, 2026-09-05)

Quill рендерит контент в contenteditable-`div`'ах, поэтому сам по себе в `FormData` не попадает. Компонент дополнительно выводит скрытое поле:

```html
<input type="hidden" data-text-editor-value :name="id" :value="modelValue ?? ''" />
```

- **Имя поля — это `id`.** Канон общий с [Textarea](./textarea.md): `<TextEditor id="bio">` → `formData.get("bio")`.
- **Без `id` поле не рендерится** — безымянный input в `FormData` всё равно не попал бы.
- Значение обновляется на каждый ввод, а не по `change:modelValue` (тот эмитится на blur) — submit в любой момент отдаёт актуальный HTML.

```ts
const form = document.querySelector("form")!
new FormData(form).get("bio") // "<p>Привет</p>"
```

## 12. Accessibility & Security

### A11y

- **Editor-контейнер** (`<div :id>`) связан с меткой через `:aria-labelledby` → id `<Label>` (Wave 4, 2026-06-19); id раздаётся [InputLayout](./input-layout.md) (`useId()`, либо `id` prop). См. [inputlayout.md Issue 10](../issues/inputlayout.md).
- Quill поддерживает базовую a11y: keyboard-shortcuts (Cmd/Ctrl+B/I/U), ARIA-атрибуты на toolbar.
- Focus management при open/close Dialog — на стороне [Dialog](./dialog.md).
- Screen-reader: Quill использует contenteditable; SR может не идеально читать формат.

### Security

- **`v-html` для контента — risk surface XSS**. `modelValue` — HTML-строка, рендерится напрямую. Если HTML приходит от пользователя или из ненадёжного источника, **обязательно** санитизируй через [sanitize-html](https://www.npmjs.com/package/sanitize-html) или [DOMPurify](https://github.com/cure53/DOMPurify) ДО передачи в `v-model`.
- Quill сам не санитизирует input — paste из буфера может принести любой HTML.
- Inline-стили Quill — нужны `style-src 'unsafe-inline'` или nonce в CSP.

## 13. TypeScript

```ts
import type {
  TextEditorProps, TextEditorEmits, TextEditorExpose,
  TextEditorQuillConfig, TextEditorInstance, TextEditorClassKey, ContentPropType
} from "fishtvue/texteditor"
import TextEditor from "fishtvue/texteditor"
import { useTemplateRef } from "vue"

const ed = useTemplateRef<InstanceType<typeof TextEditor>>("ed")
ed.value?.clear()
const quill = ed.value?.quillEditorLink?.getQuill()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Quill:** `^2.0.2`.
- **vue-quill:** `^1.2.0`.
- **Stability flag:** `experimental` — 45 кейсов, coverage `TextEditor.vue` ≥ 95%; Quill инжектит inline-стили без layer'а. (Type bug в `change:modelValue` emits исправлен 2026-05-11.)
- **Breaking changes (1.0.0, редизайн props):**
  - `paramsDialog` → `dialogProps`, `paramsTextEditor` → `editorProps`.
  - `classBody` → `class` (корень), прежний `class` → `classes.base`; inline-редактор — `classes.editor`.
  - булевы: `isInvalid` → `invalid`, `clear` → `clearable`; emit `update:isInvalid` → `update:invalid` (silent break).
  - типы: `IQuillEditor` → `TextEditorInstance`, `IDataTextEditor` → `TextEditorQuillConfig`.
  - expose: `classStyle`/`classLayout` → `classEditor` + `inputLayout`; `paramsQuillEditor` → `editorProps`.
  - `data-text-editor` на корне; контейнер Quill — `[data-text-editor-editor]`.
  - При апгрейде Quill 3.x — ожидаются дополнительные breaking changes.

## 15. Testing recipes

45 кейсов ([TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts)) гоняются в jsdom через `vi.mock` Quill-обвязки (2026-09-05). Для сквозных проверок реального редактора по-прежнему нужен Playwright или Cypress.

```ts
// Минимальный smoke — но падает из-за Quill требований
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import TextEditor from "fishtvue/texteditor/TextEditor.vue"

describe.skip("TextEditor smoke", () => {
  it("mounts", () => {
    const wrapper = mount(TextEditor, {
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Toolbar не отображается | `theme` не задан или CSS не подгружен. | Установи `theme="snow"` и проверь, что `vue-quill.snow.css` подгружен. |
| HTML «теряет» форматирование при v-model | Quill нормализует HTML — некоторые atypical тэги фильтруются. | Используй `contentType: "delta"` и работай с Delta-объектом. |
| XSS через paste | Нет санитизации. | Добавь `sanitize-html` перед `v-model`. |
| Размер bundle вырос | Quill — ~200KB minified. | Ленивая загрузка через dynamic import + Suspense. |
| `image`-toolbar не работает | По умолчанию upload не реализован. | Регистрируй custom Quill module для image-handler. |

## 17. Related

- [Dialog](./dialog.md), [InputLayout](./input-layout.md).
- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [Switch](./switch.md).
- [Form](./form.md), [utilities/rulesHandler.md](../utilities/rulesHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [TextEditor.vue](../../lib/texteditor/TextEditor.vue) и [TextEditor.d.ts](../../lib/texteditor/TextEditor.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- ~~**Все 17 тестов пропущены.** Coverage `TextEditor.vue` — 0%~~ ✅ resolved 2026-09-05 — см. «Skipped tests» ниже.
- `TextEditorQuillConfig.options` и `globalOptions` объявлены как `any` ([TextEditor.d.ts](../../lib/texteditor/TextEditor.d.ts)).
- ~~Тёмная тема редактора переключается по системной цветовой схеме, а не по `darkModeSelector`~~ ✅ resolved 2026-09-05 — тема идёт через [`useDarkMode()`](../../lib/theme/useDarkMode.ts), переменные биндятся инлайном на оба контейнера редактора.
- ~~Строки Quill-tooltip захардкожены по-русски вне locale-механизма~~ ✅ resolved 2026-09-05 — ключи `textEditor.linkLabel` / `textEditor.saveLabel`.
- **Toolbar самого Quill не локализован** — лейблы `font`/`align` и tooltip'ы кнопок приходят из Quill на английском. Требует i18n-плагина Quill либо DOM-modify; см. [issues/texteditor.md](../issues/texteditor.md) Issues 8, 9.

### Skipped tests

~~17 кейсов — `it.skip`. Причина: jsdom не поддерживает Quill DOM-layout.~~ ✅ resolved 2026-09-05.

Блок был под `describe.todo` (не `it.skip`), и причина оказалась не в DOM-layout: настоящий Quill планирует `requestAnimationFrame`-колбэки, которые срабатывали после teardown jsdom и роняли весь прогон. С момента Wave 2.1 Quill грузится lazy (`await import()` в `onMounted`), поэтому его достаточно подменить через `vi.mock("@vueup/vue-quill")` — настоящий редактор не инстанцируется вовсе.

Сейчас: **27/27 тестов проходят, 0 todo**, coverage `TextEditor.vue` — **95.89% stmts / 85.18% branch**.

### API inconsistencies

- ~~**Type bug:** `change:modelValue(payload: boolean)`~~ ✅ resolved 2026-05-11 — payload теперь корректно типизирован как `string` ([TextEditor.d.ts:136](../../lib/texteditor/TextEditor.d.ts#L136)). Cross-cutting fix вместе с [textarea.md Issue 1](../issues/textarea.md).
- `modelValue?: string | number | null` — `number` не имеет смысла для HTML-content.
- `toolbar: "essential" \| "minimal" \| "full" \| string \| object \| Array<any>` — open union, narrow не работает.
- `TextEditorQuillConfig.options: any`, `globalOptions: any` — потеря типизации.
- Нет событий `focus` / `blur` (и `active` — тоже: у TextEditor его нет, в отличие от [Input](./input.md), [Select](./select.md) и [Calendar](./calendar.md)). Асимметрия осознанная: major 1.0.0 переименовывал события, но новых не добавлял (dev-patterns §7). Фокус-состояние читается из expose `isActiveTextEditor` либо напрямую из Quill через `quillEditorLink`.

### Behavioral caveats

- Quill требует реального DOM; в jsdom-тестах — пропустить.
- `modelValue: null` — initial state, после ввода никогда не становится `null`. Используй `""` как «пусто».
- Quill инжектит inline-стили (`style="..."`) — учитывай в CSP-настройке `'unsafe-inline'`.
- При `theme: "bubble"` toolbar появляется при выделении. Mobile UX может быть проблемным.
- Размер bundle: Quill ~200KB minified. Если используешь TextEditor только в одной странице — ленивая загрузка предпочтительна.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

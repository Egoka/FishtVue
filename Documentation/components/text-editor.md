---
title: TextEditor
summary: Quill-редактор внутри Dialog с темами Snow/Bubble и кастомным toolbar.
updated: 2026-05-11
stability: experimental
since: 0.2.11
---

# TextEditor

## 1. Overview

`TextEditor` — обёртка над [Quill](https://quilljs.com/) (через [@vueup/vue-quill](https://vueup.github.io/vue-quill/)) внутри [Dialog](./dialog.md). Поддерживает темы `snow` (toolbar сверху) и `bubble` (toolbar появляется при выделении), кастомные toolbar-конфиги (`essential`/`minimal`/`full` или custom), reactive v-model.

Stability: `experimental` — все 17 тестов пропущены ([TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts)); coverage `TextEditor.vue` — 0%. Type-bug `change:modelValue(payload: boolean)` исправлен 2026-05-11 — payload теперь корректно типизирован как `string` (cross-cutting fix с [Aria](./aria.md)).

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
- [@vueup/vue-quill](../../lib/package.json) `^1.2.0` — Vue 3 wrapper для Quill.
- [quill](../../lib/package.json) `^2.0.2` — core editor.
- CSS-импорты темы Snow/Bubble: `@vueup/vue-quill/dist/vue-quill.snow.css`, `@vueup/vue-quill/dist/vue-quill.bubble.css` ([rollup.config.js:59–60](../../lib/rollup.config.js#L59-L60)).
- [Dialog](./dialog.md), [InputLayout](./input-layout.md).

Лицензия quill — BSD-3, vue-quill — MIT (не копилефт).

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит `setStyle`. Явный `onMounted` для инициализации Quill.
- **Поток данных:** `modelValue: string` (HTML) → Quill renders → user edits → `update:modelValue` (string).
- **v-model contract:** см. §6.
- **Стили:** через `setStyle` для обёртки + импортированные CSS темы Quill.
- **Конфиг:** `componentsOptions.TextEditor` — `paramsDialog`, `paramsTextEditor`, `theme`. Toolbar и Quill modules — через `paramsTextEditor`.
- **Локализация:** не использует `t()`. Quill UI на английском; локализация — через `paramsTextEditor.options` Quill.
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

`TextEditorProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseTextEditorProps>`.

`BaseTextEditorProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `paramsDialog` | `Partial<DialogProps>` | — | Конфиг Dialog-обёртки. См. [Dialog](./dialog.md). |
| `paramsTextEditor` | `Partial<IDataTextEditor>` | — | Конфиг Quill (toolbar, modules, options). |
| `theme` | `"snow" \| "bubble"` | `"snow"` | Quill тема. |

Свои:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id корня. |
| `modelValue` | `string \| number \| null` | — | HTML-строка содержимого. |

`IDataTextEditor`:

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
| `update:isInvalid` | `boolean` | При смене статуса валидации. |
| `change:modelValue` | `string` (HTML) | На blur / programmatic save. Fixed 2026-05-11 (раньше тип был ошибочно `boolean`). |

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
| `layout`, `valueLayout`, `classLayout`, `open`, `quillEditorLink: IQuillEditor`, `isActiveTextEditor` | Reactive state. |
| `id`, `theme`, `isValue`, `mode`, `isDisabled`, `isLoading`, `isInvalid`, `messageInvalid`, `classStyle`, `paramsDialog`, `paramsQuillEditor`, `inputLayout` | Derived. |
| `clear()` | Очистка содержимого. |
| `ready()` | Promise после init Quill (полезно для тестов). |

`IQuillEditor` (на `quillEditorLink`):

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
      paramsTextEditor: {
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
  :params-text-editor="{
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
  :params-text-editor="{ readOnly: true, enable: false }"
  theme="bubble" />
```

## 10. Configuration & Customization

### 10.1 Global

`TextEditorOption = Pick<TextEditorProps, "paramsDialog" | "paramsTextEditor" | "theme" | keyof InputLayoutOption>`.

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

## 12. Accessibility & Security

### A11y

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
  IDataTextEditor, IQuillEditor, ContentPropType
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
- **Stability flag:** `experimental` — нет покрытия тестами; Quill инжектит inline стили без layer'а. (Type bug в `change:modelValue` emits исправлен 2026-05-11.)
- **Breaking changes:** при апгрейде Quill 3.x — ожидаются.

## 15. Testing recipes

Все 17 тестов — `it.skip` ([TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts)). Причина — тесты не работают в jsdom (Quill требует реального DOM с window/document layout). Для интеграционных тестов используй Playwright или Cypress.

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

- **Все 17 тестов пропущены** ([TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts)). Coverage `TextEditor.vue` — 0%. Реальное поведение проверено только интеграционно (через `sandbox`).
- `IDataTextEditor.options` и `globalOptions` объявлены как `any` ([TextEditor.d.ts](../../lib/texteditor/TextEditor.d.ts)).

### Skipped tests

17 кейсов в [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts) — `it.skip`. Причина: jsdom не поддерживает Quill DOM-layout.

### API inconsistencies

- ~~**Type bug:** `change:modelValue(payload: boolean)`~~ ✅ resolved 2026-05-11 — payload теперь корректно типизирован как `string` ([TextEditor.d.ts:121](../../lib/texteditor/TextEditor.d.ts#L121)). Cross-cutting fix вместе с [aria.md Issue 1](../issues/aria.md).
- `modelValue?: string | number | null` — `number` не имеет смысла для HTML-content.
- `toolbar: "essential" \| "minimal" \| "full" \| string \| object \| Array<any>` — open union, narrow не работает.
- `IDataTextEditor.options: any`, `globalOptions: any` — потеря типизации.

### Behavioral caveats

- Quill требует реального DOM; в jsdom-тестах — пропустить.
- `modelValue: null` — initial state, после ввода никогда не становится `null`. Используй `""` как «пусто».
- Quill инжектит inline-стили (`style="..."`) — учитывай в CSP-настройке `'unsafe-inline'`.
- При `theme: "bubble"` toolbar появляется при выделении. Mobile UX может быть проблемным.
- Размер bundle: Quill ~200KB minified. Если используешь TextEditor только в одной странице — ленивая загрузка предпочтительна.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

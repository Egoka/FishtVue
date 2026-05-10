---
title: Issues — TextEditor
summary: Аудит TextEditor — coverage 0% (skipped tests), хардкод HEX цветов в style, Quill peer-dep потенциал, type bug change:modelValue, image upload не задокументирован.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/texteditor/
related-doc: ../components/text-editor.md
stability: experimental (на момент аудита 17 тестов skipped)
---

# Issues — TextEditor

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 7 | A2, A4-5, B10 (HEX hardcode), C17, I44 (Quill peer), J46 (tests skipped), L53 |
| medium | 5 | D26 (type bug), F30, F32, M55, security (image upload) |
| low | 3 | E29.7, N59, G34 |

## Issue 1: 17 тестов skipped, coverage 0% — компонент не верифицирован

- **Категория:** J46 (Тесты)
- **Severity:** high
- **Где:** [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts) (17 skipped), coverage 0% statements

### Что найдено

```
lib/texteditor/TextEditor.test.ts (17 tests | 17 skipped)
lib/texteditor: 0/0/0/0
```

Все тесты `it.skip(...)`. Компонент рендерится, эмитит, но нет никакой автоматизированной проверки. Помечен в [Documentation/components/text-editor.md](../components/text-editor.md) как `experimental`.

### Почему это проблема

- Любой refactor рискован — нет regression detection.
- Новые баги попадут в production незамеченными.
- Documentation помечает stability `experimental` — значит ОК что нет тестов? Нет — стабилизация зависит от тестов.

### Что нужно сделать

1. Разблокировать тесты: убрать `.skip` в [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts).
2. Если тесты падают потому что Quill требует JSDOM-полной DOM — добавить `vi.mock("@vueup/vue-quill", ...)` с mock-implementation, проверять только FishtVue wrapper-логику (modelValue → emit, dialog open/close, paramsTextEditor merge).
3. Если тесты падают по другой причине (e.g., async load) — задокументировать в комментариях и fix.
4. Целевой coverage `>= 70%` для разблокировки statuса с `experimental` на `beta`.
5. Добавить тест для каждого emit: update:modelValue, change:modelValue, focus, blur, clear.

### Acceptance criteria

- [ ] `lib/texteditor` coverage > 70% statements.
- [ ] 0 skipped tests.
- [ ] Stability flag поднят до `beta`.

## Issue 2: HEX цвета хардкодом в `<style>` блоке

- **Категория:** B10 (hardcode цветов вместо tokens)
- **Severity:** high
- **Где:** [TextEditor.vue:368-383](../../lib/texteditor/TextEditor.vue#L368-L383)

### Что найдено

```css
:root {
  --placeholder-quill-editor: #00000099;
  --background-quill-editor: #f6f3f4;
  --background-picker-options-quill-editor: #f5f5f5;
  ...
}
[data-theme="dark"] {
  --placeholder-quill-editor: #ffffff99;
  --background-quill-editor: #212121;
}
```

HEX-значения хардкодом в `<style>` блоке. Не привязаны к [theme/themes/Aurora.ts](../../lib/theme/themes/Aurora.ts) primitive/semantic tokens.

### Почему это проблема

- При смене темы через `usePreset(MyTheme)` editor останется на `#212121` background — рассогласование.
- Documentation [docs/content/ru/3.Configuration/2.Theming.md](../../docs/content/ru/3.Configuration/2.Theming.md) обещает theme-driven dark mode.

### Что нужно сделать

1. Заменить HEX на CSS-переменные из FishtVue theme:
   ```css
   :root {
     --placeholder-quill-editor: var(--fv-foreground-muted);
     --background-quill-editor: var(--fv-surface);
   }
   ```
2. Удалить дублирующий `[data-theme="dark"]` блок — CSS-переменные `--fv-*` уже учитывают режим.
3. Cross-check имена переменных в [theme/semantic.ts](../../lib/theme/semantic.ts).

### Acceptance criteria

- [ ] `usePreset(SapphireTheme)` — TextEditor background меняется автоматически.

## Issue 3: Quill в `dependencies` — должен быть optional peer

- **Категория:** I44 (peer-зависимости), A3 (дубль)
- **Severity:** high
- **Где:** [lib/package.json:47](../../lib/package.json#L47), [lib/package.json:53](../../lib/package.json#L53)

### Что найдено

```json
"dependencies": {
  "@vueup/vue-quill": "^1.2.0",
  "quill": "^2.0.2",
  ...
}
```

Quill ≈ 200kb minified. Тянется ВСЕМИ потребителями fishtvue, даже если TextEditor не используется. Без `sideEffects: false` (см. [button.md Issue 8](./button.md)) — невозможно tree-shake.

### Что нужно сделать

См. [calendar.md Issue 2](./calendar.md). Перенести в optional peer + lazy import.

```ts
// TextEditor.vue
const QuillEditor = defineAsyncComponent(() =>
  import("@vueup/vue-quill").then((m) => m.QuillEditor)
)
```

CSS imports также lazy:
```ts
onMounted(async () => {
  await import("@vueup/vue-quill/dist/vue-quill.snow.css")
  await import("@vueup/vue-quill/dist/vue-quill.bubble.css")
})
```

### Acceptance criteria

- [ ] Bundle without TextEditor — без quill в chunk.
- [ ] Установка `npm i fishtvue` без явного quill — не падает (optional peer).

## Issue 4: SSR styles + sideEffects/exports map

- **Категория:** C17, A2, A4, A5

См. [button.md Issue 1, 8, 9](./button.md).

## Issue 5: Type bug `change:modelValue(payload: boolean)` должно быть string

- **Категория:** D26
- **Severity:** medium
- **Где:** [TextEditor.d.ts](../../lib/texteditor/TextEditor.d.ts)

### Что найдено

Аналогично [aria.md Issue 1](./aria.md) — `change:modelValue` объявлен с `boolean` payload, runtime передаёт string (HTML content).

### Что нужно сделать

См. [aria.md Issue 1](./aria.md) — идентичный fix-план.

## Issue 6: Image upload не задокументирован — toolbar содержит `image` button

- **Категория:** Security + UX
- **Severity:** medium
- **Где:** [TextEditor.vue:97](../../lib/texteditor/TextEditor.vue#L97)

### Что найдено

```ts
toolbar: [
  ...
  ["link", "image"],  // image button
  ["clean"]
]
```

Quill image-button по умолчанию вставляет base64-encoded image как `<img src="data:image/...">` напрямую в content. Это:
- Раздувает modelValue (multi-megabyte HTML).
- Не загружает на сервер — пользователь думает «сохранится», но в БД попадает огромный data-URL.
- Нет валидации size/type.

### Что нужно сделать

1. **Опция A (быстрый фикс):** убрать `"image"` из default toolbar; при необходимости пользователь явно передаёт через `paramsTextEditor`.
2. **Опция B (правильно):** настроить custom image handler:
   ```ts
   const toolbarOptions = {
     handlers: {
       image: function() {
         // Открыть file-picker, upload через API, вставить URL
         emit("image-upload-request")
       }
     }
   }
   ```
3. Эмит `image-upload-request` → пользователь обрабатывает в parent.
4. Документировать в [Documentation/components/text-editor.md](../components/text-editor.md) §10 «Image upload».
5. Security: при custom-rendering HTML editor-content — обязательно sanitize через DOMPurify (XSS в рендере stored content).

### Acceptance criteria

- [ ] Image button либо убран по умолчанию, либо вызывает custom handler.
- [ ] Documentation описывает upload-flow.

## Issue 7: Нет componentsStyle global fallback / unstyled

- **Категория:** L53
- **Severity:** high

См. [input.md Issue 2](./input.md), [button.md Issue 14](./button.md). Также `theme: "snow" | "bubble"` (Quill theme) не зависит от FishtVue componentsStyle.

## Issue 8: Locale для Quill — не использует FishtVue locale

- **Категория:** F32
- **Severity:** medium

Quill toolbar tooltips («Bold», «Italic», ...) — на английском по умолчанию. FishtVue не пробрасывает translations. См. [calendar.md Issue 8](./calendar.md) — аналогичный fix-план.

## Issue 9: Hardcoded UI text — alignment options

- **Категория:** F30 (хардкод текста)
- **Severity:** medium
- **Где:** [TextEditor.vue:95-96](../../lib/texteditor/TextEditor.vue#L95-L96), Dialog "Save"/"Cancel" buttons

### Что найдено

Toolbar `[{ font: [] }]`, `[{ align: [] }]` — Quill default labels. Также Dialog для editor-resize ([TextEditor.vue:73-74](../../lib/texteditor/TextEditor.vue#L73-L74)) использует Buttons с английским текстом.

### Что нужно сделать

1. Использовать `t("textEditor.save")`, `t("textEditor.cancel")` для Dialog buttons.
2. Передать Quill custom labels через `i18n` Quill plugin (если есть), либо через DOM-modify в onMounted.
3. Добавить ключи в [lib/locale/locales/en.ts](../../lib/locale/locales/en.ts) и [ru.ts](../../lib/locale/locales/ru.ts).

## Issue 10: Native form integration отсутствует

- **Категория:** M54-55
- **Severity:** medium
- **Где:** [TextEditor.vue](../../lib/texteditor/TextEditor.vue)

### Что найдено

Quill editor рендерится через div'ы. Нет hidden `<input>` для native form submit. modelValue (HTML string) не попадает в FormData при native submit.

### Что нужно сделать

1. Добавить hidden `<input type="hidden" :name="id" :value="modelValue">`.
2. Документировать в [components/text-editor.md](../components/text-editor.md) §M.

## Issue 11: print, motion, color cross-cutting

См. [button.md](./button.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.TextEditor` | ✅ | mode, theme, paramsDialog, paramsTextEditor |
| `componentsStyle` global | ❌ | Issue 7 |
| `unstyled: true` | ❌ | Issue 7 |
| Theme tokens vs hardcode | ❌ | Issue 2 — HEX hardcode |
| Runtime theme switch | ❌ | Issue 2 |
| `t()` для текста | ❌ | Issue 8, 9 |
| Runtime locale switch | ❌ | Issue 8 |

## Dual-API gap

Не применимо в очевидной форме — TextEditor — single-instance editor, не collection. Но **toolbar config** — потенциальный кандидат на compound:

```vue
<TextEditor v-model="html">
  <ToolbarGroup>
    <ToolbarButton type="bold" />
    <ToolbarButton type="italic" />
  </ToolbarGroup>
  <ToolbarGroup>
    <ToolbarHeading :levels="[1,2,3]" />
  </ToolbarGroup>
</TextEditor>
```

vs текущий schema-driven `paramsTextEditor.toolbar`. Это redesign — оставить future direction в [components/text-editor.md](../components/text-editor.md).

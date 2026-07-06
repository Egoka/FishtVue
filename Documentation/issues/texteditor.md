---
title: Issues — TextEditor
summary: Аудит TextEditor — coverage 0% (skipped tests), image upload не задокументирован. Issue 2 (B10 — hardcode Tailwind-классов + HEX в style на surface-*) закрыт 2026-07-04 (Wave 9). Issue 7 (componentsStyle fallback + unstyled) закрыт 2026-07-02 (Wave 3.2). Issue 3 (Quill → optional peer + lazy CSS) закрыт 2026-06-19 (Wave 2.1). Issue 5 (type bug change:modelValue → string) закрыт 2026-05-11.
updated: 2026-07-04
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/texteditor/
related-doc: ../components/text-editor.md
stability: experimental (на момент аудита 17 тестов skipped)
---

# Issues — TextEditor

## Сводка

| Severity | Count (open) | Categories                                                                                            |
| -------- | ------------ | ----------------------------------------------------------------------------------------------------- |
| critical | 0            | —                                                                                                     |
| high     | 4            | A2, A4-5, C17, J46 (tests skipped) — L53 (Issue 7) closed 2026-07-02, B10 (Issue 2) closed 2026-07-04 |
| medium   | 4            | F30, F32, M55, security (image upload) — Issue 5 D26 closed 2026-05-11                                |
| low      | 3            | E29.7, N59, G34                                                                                       |

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

## ~~Issue 2: HEX цвета хардкодом в `<style>` блоке~~ ✅ resolved 2026-07-04 (Wave 9)

- **Категория:** B10 (hardcode цветов вместо tokens)
- **Severity:** ~~high~~

> **Status (2026-07-04): ✅ resolved.** Оба под-фикса B10 для TextEditor — Tailwind-классы (`border-neutral-*`/`bg-stone-*`/`text-gray-*`) и raw HEX в `<style>` блоке — закрыты одним патчем как часть первого батча из 11 компонентов, потребляющих `surface` (23-й именованный цвет, [primitive.ts:305-317](../../lib/theme/primitive.ts#L305-L317); дефолт — точная копия `gray`, переопределяется через `updateSurfacePalette()`). Cross-cutting theme-инфраструктура для B10 закрыта отдельно в [theme.md Issue 10](./theme.md) 2026-07-04 — этот Issue закрывает конкретно TextEditor-часть.

### Что было найдено (before)

Tailwind-классы ([TextEditor.vue](../../lib/texteditor/TextEditor.vue), было):

```
border-neutral-200 dark:border-neutral-800 dark:text-gray-400   // рамка редактора + текст рядом
bg-stone-50 dark:bg-stone-950                                    // фон underlined-режима
bg-stone-100 dark:bg-stone-900                                   // фон filled-режима
text-gray-400 dark:text-gray-600 hover:text-gray-600 hover:dark:text-gray-400  // hover иконок (×2 — resize-кнопки bubble/snow)
```

HEX в `<style>` блоке (было):

```css
@media (prefers-color-scheme: light) {
  .editor {
    --placeholder-quill-editor: #00000099;
    --background-quill-editor: #f6f3f4;
    --background-picker-options-quill-editor: #f5f5f5;
  }
}
@media (prefers-color-scheme: dark) {
  .editor {
    --placeholder-quill-editor: #ffffff99;
    --background-quill-editor: #212121;
    --background-picker-options-quill-editor: #131313;
  }
}
```

Ни Tailwind-примитивы (`neutral`/`stone`/`gray`), ни raw HEX не привязаны к theme-токенам — при `usePreset(MyTheme)` редактор оставался на захардкоженных значениях.

### Что сделано (after)

**(a) Tailwind-классы** ([TextEditor.vue:67,69-70,245,263](../../lib/texteditor/TextEditor.vue#L67)) — мигрированы на `surface-*` с сохранением того же numeric tone:

| Было                                                                            | Стало                                                                                       | Где                                                                                                                                                           |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `border-neutral-200 dark:border-neutral-800 dark:text-gray-400`                 | `border-surface-200 dark:border-surface-800 dark:text-surface-400`                          | [TextEditor.vue:67](../../lib/texteditor/TextEditor.vue#L67) — рамка `editor` computed                                                                        |
| `bg-stone-50 dark:bg-stone-950`                                                 | `bg-surface-50 dark:bg-surface-950`                                                         | [TextEditor.vue:69](../../lib/texteditor/TextEditor.vue#L69) — underlined-фон                                                                                 |
| `bg-stone-100 dark:bg-stone-900`                                                | `bg-surface-100 dark:bg-surface-900`                                                        | [TextEditor.vue:70](../../lib/texteditor/TextEditor.vue#L70) — filled-фон                                                                                     |
| `text-gray-400 dark:text-gray-600 hover:text-gray-600 hover:dark:text-gray-400` | `text-surface-400 dark:text-surface-600 hover:text-surface-600 hover:dark:text-surface-400` | [TextEditor.vue:245](../../lib/texteditor/TextEditor.vue#L245), [:263](../../lib/texteditor/TextEditor.vue#L263) — hover иконок resize-кнопок (bubble + snow) |

Engine не требовал правок — `surface` уже зарегистрирован как именованный цвет ([Theme.d.ts:187](../../lib/theme/Theme.d.ts#L187)), regex собирается динамически из `Object.keys(colors)`.

**(b) Raw HEX в `<style>` блоке** ([TextEditor.vue:384-398](../../lib/texteditor/TextEditor.vue#L384-L398)) — два не-alpha хардкод-пары (`--background-quill-editor`, `--background-picker-options-quill-editor`) в обоих media-блоках заменены на `rgb(var(--fv-surface-{tone}, <rgb-триплет>))` — формат зеркалит движок ([unoStyle/helpers.ts `resolveColor`](../../lib/theme/unoStyle/helpers.ts), эмитит `rgb(var(--fv-surface-500, 107 114 128))` для остальных color-правил). Значения `--fv-surface-*` — RGB-триплеты (не hex), пишет их [tokensCss.ts:73](../../lib/theme/helpers/tokensCss.ts#L73); TextEditor — первый компонент, напрямую потребляющий `--fv-surface-*` в собственном `<style>` (не через `setStyle()`), поэтому fallback-триплет обязателен для параллели с остальным движком.

Tone-matching (ближайший тон по Euclidean-дистанции в RGB-пространстве, не exact match — тени/фон декоративные, не brand-critical):

| Свойство                                         | Было (HEX) | Стало                                     | Дистанция до кандидатов                                                                                                                                                  |
| ------------------------------------------------ | ---------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| light `--background-quill-editor`                | `#f6f3f4`  | `rgb(var(--fv-surface-100, 243 244 246))` | surface-100 (3.7) < surface-50 (10.3)                                                                                                                                    |
| light `--background-picker-options-quill-editor` | `#f5f5f5`  | `rgb(var(--fv-surface-100, 243 244 246))` | surface-100 (2.4) < surface-50 (8.8)                                                                                                                                     |
| dark `--background-quill-editor`                 | `#212121`  | `rgb(var(--fv-surface-900, 17 24 39))`    | surface-900 (19.3) < surface-800 (23.5)                                                                                                                                  |
| dark `--background-picker-options-quill-editor`  | `#131313`  | `rgb(var(--fv-surface-900, 17 24 39))`    | surface-900 (20.7) ≈ surface-950 (20.0) — оставлен на 900, чтобы обе dark-переменные (фон + picker-popup) шли одним тоном, а не расходились на шаг шкалы ради разницы <1 |

Alpha-suffixed `--placeholder-quill-editor` (`#00000099`/`#ffffff99`) — **вне scope**: это полупрозрачные black/white overlay, не часть gray/surface семьи, оставлены литералами.

`[data-theme="dark"]`-дублирующий блок из старого acceptance criteria (п.2 плана) в реальности не существовал — фактический дубль в коде был через `@media (prefers-color-scheme: dark)`, не через атрибут-селектор; оставлен как есть (переключение по `prefers-color-scheme`, не по `darkModeSelector` — известное поведение всего компонента, не regression этого фикса).

### Регрессия

Source-scan тесты (mount крашит jsdom через Quill rAF — та же хрупкость, что держит основную суиту в `todo`) в [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts) `describe("TextEditor — surface-* token migration (Wave 9 — texteditor.md Issue 2 / B10)")`: старые классы/hex отсутствуют, новые `surface-*`/`var(--fv-surface-*)` присутствуют, alpha-плейсхолдеры не тронуты.

### Acceptance criteria

- [x] `usePreset(SapphireTheme)` — TextEditor background меняется автоматически (через `rgb(var(--fv-surface-{tone}, fallback))` — `updateSurfacePalette()` переписывает `--fv-surface-*` в tokens-теге, TextEditor подхватывает без собственного re-render).

## ~~Issue 3: Quill в `dependencies` — должен быть optional peer~~ ✅ resolved 2026-06-19 (Wave 2.1)

> **Status:** ✅ resolved 2026-06-19 (Wave 2.1). `@vueup/vue-quill` + `quill` переведены из `dependencies` в **optional `peerDependencies`** (`^1.2.0` / `^2.0.0`); компонент и его CSS грузятся lazy.

**Что сделано (2026-06-19):**

- [lib/package.json](../../lib/package.json) — `@vueup/vue-quill` + `quill` убраны из `dependencies`, добавлены в `peerDependencies` + `peerDependenciesMeta.optional: true`.
- [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — компонент уже грузился lazy (`QuillEditor.value = (await import("@vueup/vue-quill")).QuillEditor`); top-level CSS-импорты (`vue-quill.snow.css` / `.bubble.css`) перенесены в тот же `onMounted` через dynamic `import()` под `try/catch` (при отсутствии peer редактор не рендерится — `template v-if="QuillEditor"`). Заодно снят последний дубль `TextEditor.initStyle()` (Wave 2.3 → 22/22).
- Контракт — [lib/package.test.ts](../../lib/package.test.ts) (Quill — optional peer, не в `dependencies`); lazy CSS — source-scan в [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts).

### Что найдено (was)

```json
"dependencies": { "@vueup/vue-quill": "^1.2.0", "quill": "^2.0.2", ... }
```

Quill ≈ 200kb minified тянулся ВСЕМИ потребителями fishtvue, даже без TextEditor (top-level CSS-импорты исполнялись на import-time).

- **Категория:** ~~I44 (peer-зависимости), A3 (дубль)~~ — закрыто
- **Severity:** ~~high~~
- **Где (was):** [lib/package.json](../../lib/package.json)

### Acceptance criteria

- [x] Bundle без TextEditor — без quill в chunk (точечный импорт `fishtvue/button` не грузит `texteditor.mjs`).
- [x] Установка `npm i fishtvue` без явного quill — не падает (optional peer).

## Issue 4: SSR styles + sideEffects/exports map

- **Категория:** C17, A2, A4, A5

См. [button.md Issue 1, 8, 9](./button.md).

## ~~Issue 5: Type bug `change:modelValue(payload: boolean)` должно быть string~~ ✅ resolved 2026-05-11

- **Категория:** D26
- **Severity:** ~~medium~~
- **Где:** [TextEditor.d.ts:121](../../lib/texteditor/TextEditor.d.ts#L121)
- **Resolution:** Cross-cutting fix вместе с [aria.md Issue 1](./aria.md). `TextEditorEmits["change:modelValue"]` payload изменён `boolean` → `string`. Runtime поведение не меняется (всегда эмитилась HTML-строка) — это type-only fix, исправляющий Volar-hint для подписчиков `@change:modelValue`. Существующие 17 skipped тестов в [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts) (см. Issue 1) при разблокировке смогут assert'ить корректный type. Documentation [components/text-editor.md](../components/text-editor.md) §6 обновлена.

## Issue 6: Image upload не задокументирован — toolbar содержит `image` button

- **Категория:** Security + UX
- **Severity:** medium
- **Где:** [TextEditor.vue:98](../../lib/texteditor/TextEditor.vue#L98)

### Что найдено

```ts
toolbar: [
  ...["link", "image"], // image button
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
       image: function () {
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

## ~~Issue 7: Нет componentsStyle global fallback / unstyled~~ ✅ resolved 2026-07-02 (Wave 3.2)

- **Категория:** L53
- **Severity:** ~~high~~

> **Status (2026-07-02): ✅ resolved — close Wave 3.2.**
>
> - **componentsStyle fallback** — [TextEditor.vue](../../lib/texteditor/TextEditor.vue) `mode`-computed получил `?? TextEditor.componentsStyle()` между `options?.mode` и литеральным `"outlined"` (зеркало [Input.vue:62-64](../../lib/input/Input.vue#L62-L64)). Тест — source-scan в [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts) `componentsStyle global fallback (Wave 3.2)` (mount Quill крашит jsdom rAF — суита выше `todo`, дисциплина существующих source-scan блоков).
> - **unstyled** — doc-sync: cross-cutting guard `Component.setStyle()` (`config.unstyled → ""`, [component/index.ts:138](../../lib/component/index.ts#L138), ✅ 2026-05-11) покрывает TextEditor вместе со всеми 22 компонентами; per-component правок не требуется.
> - Каveat остаётся справочно: `theme: "snow" | "bubble"` (Quill-тема) — независимая ось от FishtVue `componentsStyle` (осознанно: это тема редактора, не form-control-обёртки).

## Issue 8: Locale для Quill — не использует FishtVue locale

- **Категория:** F32
- **Severity:** medium

Quill toolbar tooltips («Bold», «Italic», ...) — на английском по умолчанию. FishtVue не пробрасывает translations. См. [calendar.md Issue 8](./calendar.md) — аналогичный fix-план.

## Issue 9: Hardcoded UI text — alignment options

- **Категория:** F30 (хардкод текста)
- **Severity:** medium
- **Где:** [TextEditor.vue:96-97](../../lib/texteditor/TextEditor.vue#L96-L97), Dialog "Save"/"Cancel" buttons

### Что найдено

Toolbar `[{ font: [] }]`, `[{ align: [] }]` — Quill default labels. Также Dialog для editor-resize ([TextEditor.vue:74-75](../../lib/texteditor/TextEditor.vue#L74-L75)) использует Buttons с английским текстом.

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

| Настройка                      | Поддержано? | Комментарий                                                                                                                                   |
| ------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `componentsOptions.TextEditor` | ✅          | mode, theme, paramsDialog, paramsTextEditor                                                                                                   |
| `componentsStyle` global       | ✅          | Issue 7 ✅ 2026-07-02 — `?? TextEditor.componentsStyle()` в mode-цепочке                                                                      |
| `unstyled: true`               | ✅          | Issue 7 ✅ 2026-07-02 — cross-cutting guard `Component.setStyle()` (doc-sync)                                                                 |
| Theme tokens vs hardcode       | ✅          | Issue 2 ✅ 2026-07-04 — Tailwind-классы + HEX в `<style>` мигрированы на `surface-*`/`var(--fv-surface-*)`                                    |
| Runtime theme switch           | ✅          | Issue 2 ✅ 2026-07-04 — `rgb(var(--fv-surface-{tone}, fallback))` подхватывает `usePreset`/`updateSurfacePalette()` без ре-рендера компонента |
| `t()` для текста               | ❌          | Issue 8, 9                                                                                                                                    |
| Runtime locale switch          | ❌          | Issue 8                                                                                                                                       |

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

---
title: Issues — TextEditor
summary: Аудит TextEditor. Issue 1 (0% coverage / todo-тесты) и Issue 10 (native form submit) закрыты 2026-09-05 — vi.mock Quill, 27/27 тестов, покрытие 0% → 95.89%. Issue 2 (B10 — hardcode на surface-*) закрыт 2026-07-04 (Wave 9). Issue 7 (componentsStyle fallback + unstyled) закрыт 2026-07-02 (Wave 3.2). Issue 3 (Quill → optional peer + lazy CSS) закрыт 2026-06-19 (Wave 2.1). Issue 5 (type bug change:modelValue → string) закрыт 2026-05-11. Открыты: image upload, i18n Quill, cross-cutting print/motion/RTL.
updated: 2026-09-05
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
| high     | 0            | ~~A2, A4-5, C17~~ ✅ (cross-cutting packaging закрыт Wave 2, см. [button.md](./button.md) Issues 1, 8, 9), ~~J46 (tests todo)~~ ✅ 2026-09-05, ~~L53~~ ✅ 2026-07-02, ~~B10~~ ✅ 2026-07-04 |
| medium   | 3            | F30, F32, security (image upload); ~~M55 (native form submit)~~ ✅ 2026-09-05, ~~D26~~ ✅ 2026-05-11   |
| low      | 1            | N59 (print); ~~G34 (ref/focus expose)~~ ✅ 2026-09-05, ~~E29.7~~ N/A 2026-09-05 — ноль `transition` |

## ~~Issue 1: 17 тестов skipped, coverage 0% — компонент не верифицирован~~ ✅ resolved 2026-09-05

> **Закрыто 2026-09-05 ровно по п. 2 плана ниже** — `vi.mock("@vueup/vue-quill")` со стабом редактора. Диагноз оказался верным, но выполнимым он стал только после Wave 2.1: пока Quill импортировался статически, подмена модуля не спасала — теперь он грузится через `await import()` в `onMounted`, и стаб перехватывает загрузку до того, как настоящий Quill создаст свои `requestAnimationFrame`-колбэки (именно они стреляли после teardown jsdom и роняли прогон).
>
> **Результат:** `describe.todo` снят, **27/27 тестов проходят, 0 todo**; `TextEditor.vue` **0% → 95.89% stmts / 85.18% branch / 92.85% funcs** — цель ≥70% из п. 4 перекрыта с запасом. Агрегат по проекту 90.11 → **91.04 / 80.34 / 93.76 / 95.10** (branch впервые перешагнул 80%).
>
> **Что потребовалось, кроме мока:** четыре legacy-теста вызывали `mount()` синхронно и не находили редактор — вынесен хелпер `mountEditor()` с двумя `flushPromises()` (в `onMounted` последовательно резолвятся `await import(...)` и `Promise.all([...css])` — это две разные микротаск-очереди). Фабрику `vi.mock` пришлось сделать асинхронной и брать `defineComponent`/`h` через `await import("vue")`: вызов хойстится выше импортов файла.
>
> **Уточнение формулировки:** тесты были не `it.skip`, а `describe.todo` на всём блоке — поэтому в отчётах они шли как «todo», а не «skipped». Счёт 17 при этом был верный.

- **Категория:** J46 (Тесты)
- **Severity:** ~~high~~
- **Где:** [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts)

### Что найдено (was)

```
lib/texteditor/TextEditor.test.ts (17 tests | 17 todo)
lib/texteditor: 0/0/0/0
```

Весь блок под `describe.todo(...)`. Компонент рендерится, эмитит, но нет никакой автоматизированной проверки. Помечен в [Documentation/components/text-editor.md](../components/text-editor.md) как `experimental`.

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

- [x] `lib/texteditor` coverage > 70% statements — **95.89%** ✅ 2026-09-05.
- [x] 0 skipped tests — 27/27 проходят, `describe.todo` снят ✅ 2026-09-05.
- [ ] Stability flag поднят до `beta` — **открыто**: покрытие больше не блокер, но остаются Issues 6 (image upload), 8/9 (i18n Quill) и `darkModeSelector`. Решение о промоушене — отдельное, зеркалит Loading Issue 7.

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

Engine не требовал правок — `surface` уже зарегистрирован как именованный цвет ([Theme.d.ts:178](../../lib/theme/Theme.d.ts#L178)), regex собирается динамически из `Object.keys(colors)`.

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

## ~~Issue 4: SSR styles + sideEffects/exports map~~ ✅ resolved (наследуется от волны 2)

- **Категория:** C17, A2, A4, A5
- **Severity:** ~~high~~

Закрыт корневыми фиксами: [button.md Issue 1](./button.md) (SSR-инжекция) ✅ 2026-06-07, [Issue 8](./button.md) (`sideEffects`) ✅ 2026-06-07, [Issue 9](./button.md) (exports map) ✅ 2026-06-11.

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

## Issue 9: Hardcoded UI text — alignment options — ⚠️ partial (2026-09-05)

- **Категория:** F30 (хардкод текста)
- **Severity:** medium
- **Где:** toolbar-конфиг [TextEditor.vue](../../lib/texteditor/TextEditor.vue) (`{ font: [] }`, `{ align: [] }`)

### Что найдено

Toolbar `[{ font: [] }]`, `[{ align: [] }]` — Quill default labels.

> **Уточнение 2026-09-05.** Утверждение про «Dialog Save/Cancel buttons с английским текстом» **неверно**: в Dialog'е editor-resize стоит единственная icon-кнопка без текста, а кнопка увеличения уже локализована через `TextEditor.t("increase")`. Зато нашлось то, чего в issue не было — **две захардкоженные русские строки прямо в CSS**: `content: "Ваша ссылка"` и `content: "Сохранить"` для Quill-tooltip'а. Они не зависели от локали вообще и показывали русский текст англоязычным пользователям.

### Что сделано (2026-09-05)

- Обе CSS-строки переведены на локаль: `content: var(--fv-quill-link-label, "Enter link:")` / `var(--fv-quill-save-label, "Save")`. Значения приходят инлайновыми CSS-переменными из computed `quillVars` — `content` в псевдоэлементе иначе из шаблона не задать. Значение оборачивается в `JSON.stringify`, потому что CSS ждёт строку в кавычках.
- Заведены ключи `textEditor.linkLabel` / `textEditor.saveLabel` в [en.ts](../../lib/locale/locales/en.ts), [ru.ts](../../lib/locale/locales/ru.ts) и `DefaultMessages` ([TypesLocale.d.ts](../../lib/locale/TypesLocale.d.ts)). `saveLabel` падает обратно на общий ключ `save`.
- Тест «переводит подписи вместе с активной локалью» проверяет переключение на `ru`.

### Что осталось

1. Toolbar-лейблы самого Quill (`font`, `align`, tooltip'ы кнопок) — требуют либо i18n-плагина Quill, либо DOM-modify в `onMounted`. **Открыто**, общая часть с Issue 8.

## ~~Issue 10: Native form integration отсутствует~~ ✅ resolved 2026-09-05

> **Закрыто.** В `#default`-слот добавлен `<input type="hidden" data-text-editor-value :name="id" :value="modelValue ?? ''">` — канон зеркалит [Textarea.vue:172](../../lib/textarea/Textarea.vue#L172), где `id` компонента служит и именем поля формы.
>
> Два уточнения против исходного плана:
>
> - значение берётся из **локального** `modelValue`-ref, а не из props — правки попадают в `FormData` сразу, не дожидаясь `change:modelValue` (тот эмитится только на blur);
> - поле рендерится **только при заданном `id`** (`v-if="id"`) — безымянный input в `FormData` не попадает, но и мусорить пустым узлом незачем.
>
> Покрыто четырьмя тестами (describe «native form submit»), включая реальный `new FormData(form)`.

- **Категория:** M54-55
- **Severity:** ~~medium~~
- **Где:** [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — `#default`-слот

### Что найдено (was)

Quill editor рендерится через div'ы. Нет hidden `<input>` для native form submit. modelValue (HTML string) не попадает в FormData при native submit.

### Что нужно сделать

1. ~~Добавить hidden `<input type="hidden" :name="id" :value="modelValue">`~~ ✅ 2026-09-05.
2. ~~Документировать в [components/text-editor.md](../components/text-editor.md)~~ ✅ 2026-09-05.

## ~~Issue 12: dark-тема игнорирует `darkModeSelector`~~ ✅ resolved 2026-09-05

- **Категория:** L53 / B10
- **Severity:** ~~low~~
- **Где:** [TextEditor.vue](../../lib/texteditor/TextEditor.vue) — computed `quillVars`

> Заведён и закрыт в одном заходе (находка аудита 2026-09-05, N5).
>
> **Что было.** Тематические переменные Quill-обвязки жили в двух media-блоках по системной цветовой схеме. Они не знали про `optionsTheme.darkModeSelector`, поэтому при `<html class="dark">` и светлой системной теме редактор оставался светлым посреди тёмной страницы — расхождение с остальной библиотекой (Table получил `darkModeSelector`-aware `isDark` ещё 2026-08-02). Вдобавок переменные вешались только на `.editor`, а bubble-редактор рендерится в `.editor-small` — отдельном узле вне `.editor`, который их не наследовал вовсе.
>
> **Что стало.** Переменные вычисляются в computed `quillVars` и биндятся инлайном на **оба** контейнера. Источник истины о теме — новый composable [`useDarkMode()`](../../lib/theme/useDarkMode.ts), вынесенный из копий в Table и Calendar.

## Issue 11: print, motion, color cross-cutting — ⚠️ partial

- **motion (E29.7):** ✅ **N/A, зафиксировано 2026-09-05.** В [TextEditor.vue](../../lib/texteditor/TextEditor.vue) **ноль** вхождений `transition` — ни Tailwind-класса, ни `<transition>`, ни CSS-свойства ни в шаблоне, ни в `<style>`-блоке. Гейтить нечего; собственные анимации Quill — его поверхность. Cross-cutting guard — [lib/motionSafe.test.ts](../../lib/motionSafe.test.ts).
- **color (B10):** ✅ resolved 2026-07-04 (Issue 2) + 2026-09-05 (тематические переменные ушли в inline, Issue 12).
- **print (N59):** ❌ открыто — в файле нет ни одного `print:`-класса. Входит в общий print-заход, см. [button.md](./button.md).


## ~~G34: ref на корневой элемент~~ ✅ resolved 2026-09-05

- **Категория:** G34
- **Severity:** ~~low~~

> Корень компонента — `<InputLayout>`, поэтому корневой DOM-узел берётся из **его** expose
> (`inputBody`), а не дублируется вторым `ref` на тот же элемент. Наружу выведен как
> ``componentTextEditor``. Канон зеркалит `componentTable` у [Table](./table.md) и `buttonRef` у
> [Button](./button.md).
> 
> Вместе с ним добавлен `focus()`, которого у TextEditor не было вовсе. Он делегирует Quill'у,
> когда тот загружен — редактор сам знает, куда внутри contenteditable вернуть каретку, — и падает
> обратно на фокус корневого элемента, если optional peer `@vueup/vue-quill` не установлен.
> Так вызов не оказывается молча бесполезным.
>
> Покрыто тремя кейсами в [TextEditor.test.ts](../../lib/texteditor/TextEditor.test.ts).

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

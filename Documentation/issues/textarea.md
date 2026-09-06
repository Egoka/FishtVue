---
title: Issues — Textarea
summary: Аудит Textarea. 8/11 issues закрыто 2026-05-11 (type bug change:modelValue → string + cross-cutting TextEditor, dup initStyle removal, componentsStyle fallback, unstyled regression test, modelValue type narrow, typed before/after slot props, motion-safe placeholder, print styles). Issue 11 B10-часть (hardcode gray-* → surface-*) закрыта 2026-07-04. Issue 6 (rename Aria → Textarea) закрыт 2026-09-06. Открытых позиций нет.
updated: 2026-09-06
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/textarea/
related-doc: ../components/textarea.md
---

# Issues — Textarea

## Сводка

| Severity | Count (open) | Categories         |
| -------- | ------------ | ------------------ |
| critical | 0            | —                  |
| high     | 0            | ~~A2, A4-5 (Issue 3)~~ ✅ — cross-cutting packaging закрыт волной 2 (см. [button.md](./button.md) Issues 8, 9) |
| medium   | 0            | ~~D25 (Issue 6 — rename)~~ ✅ resolved 2026-09-06 |
| low      | 0            | ~~M55 (Issue 10 — docs-only)~~ ✅ 2026-09-05 |

> ✅ **Открытых позиций нет** (2026-09-06). Последним закрылся Issue 6 — переименование `Aria` → `Textarea`.

**Закрыто 2026-05-11:** Issues 1 (type bug change:modelValue → string + cross-cutting fix в TextEditor.d.ts), 2 (drop duplicate initStyle, Wave 2.3), 4 (componentsStyle fallback chain), 5 (unstyled regression test — cross-cutting Wave 3.1), 7 (modelValue type narrow), 8 (typed slot props before/after), 9 (motion-safe placeholder), 11 print part (print:* классы в classInput) — зачёркнуты ниже с `✅ resolved`-маркерами. Нумерация исходная — cross-references сохраняются.

**Закрыто 2026-07-04:** Issue 11 B10-часть (hardcode `text-gray-900 dark:text-gray-100` / `focus:placeholder:text-gray-400 focus:placeholder:dark:text-gray-500` → `surface-*` family rename, same tone). RTL-часть и N59 (print/motion, уже resolved 2026-05-11) того же Issue 11 не пересматривались.

## ~~Issue 1: Type bug — `change:modelValue(payload: boolean)` должно быть `string`~~ ✅ resolved 2026-05-11

- **Категория:** D26 (несоответствие типа payload)
- **Severity:** ~~medium~~
- **Где:** [Textarea.d.ts:125](../../lib/textarea/Textarea.d.ts#L125), [Textarea.vue:149](../../lib/textarea/Textarea.vue#L149)
- **Resolution:** payload type изменён `boolean` → `string` в `TextareaEmits["change:modelValue"]`; `changeModelValue` функция типизирована `(value: string)`. Cross-cutting — идентичный fix применён к `TextEditorEmits["change:modelValue"]` ([TextEditor.d.ts:121](../../lib/texteditor/TextEditor.d.ts#L121)) — закрывает [texteditor.md Issue 5](./texteditor.md). Тесты в [Textarea.test.ts](../../lib/textarea/Textarea.test.ts) блок «Audit close-out fixes» (2 кейса: native `change` event payload + `clear()` empty-string payload).

### Что найдено

```ts
// Textarea.d.ts
(event: "change:modelValue", payload: boolean): void
```

```ts
// Textarea.vue:145-147
function changeModelValue(value: any) {
  emit("change:modelValue", value)
}
```

Runtime передаёт `string` (содержимое textarea), но тип объявлен `boolean`. TypeScript не катит ошибку только потому, что внутри функция принимает `any`.

### Почему это проблема

- Подписчик `@change:modelValue="(val: boolean) => ..."` получит string и упадёт.
- Volar даёт неправильный hint.
- Аналогичный bug в TextEditor (`change:modelValue` тоже boolean).

### Что нужно сделать

1. В [Textarea.d.ts:97](../../lib/textarea/Textarea.d.ts#L97):
   ```ts
   (event: "change:modelValue", payload: string | number | null | undefined): void
   ```
2. В [Textarea.vue:145](../../lib/textarea/Textarea.vue#L145) типизировать аргумент: `function changeModelValue(value: string)`.
3. Cross-cutting: проверить TextEditor.d.ts — аналогичный bug.
4. Документировать в [Documentation/components/textarea.md](../components/textarea.md) §6 (уже отмечено в Known issues, но осталось без фикса).

### Acceptance criteria

- [ ] vue-tsc показывает корректный тип для `@change:modelValue` slot/handler.
- [ ] Тест: `wrapper.emitted('change:modelValue')[0]` это array of [string].

## ~~Issue 2: Стили SSR не инжектятся (дубль `onMounted(initStyle)`)~~ ✅ resolved 2026-05-11

- **Категория:** C17 (Wave 2.3 — SSR style injection)
- **Severity:** ~~high~~
- **Resolution:** Удалён дублирующий блок `onMounted(() => Textarea.initStyle())` из `Textarea.vue` — базовый `Component.__hooks()` ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) уже регистрирует `onServerPrefetch + vueOnMounted → initStyle()` в конструкторе. Wave 2.3 progress: 5/22 SFC migrated (Input + Switch + Select + Calendar + **Textarea**). Regression-тест в [Textarea.test.ts](../../lib/textarea/Textarea.test.ts) блок «Initialization (no-dup initStyle)» — static-source check, что SFC не содержит `Textarea.initStyle()` вне base-class hook.

Полный cross-cutting SSR-style fix (layer wrapping, HMR teardown, top-level SSR collector) остаётся в [button.md Issue 1](./button.md) и [component-class.md Issue 3](./component-class.md) — общий вопрос, не aria-specific.

## ~~Issue 3: Нет sideEffects/exports map~~ ✅ resolved (наследуется от волны 2)

- **Категория:** A2, A4, A5
- **Severity:** ~~high~~

Закрыт корневым фиксом в [lib/package.json](../../lib/package.json): [button.md Issue 8](./button.md) (`sideEffects`) ✅ 2026-06-07 и [Issue 9](./button.md) (exports map, ESM/CJS) ✅ 2026-06-11. Оба — one-time правки на уровне пакета, покрывающие все компоненты сразу; контракт зафиксирован в [lib/package.test.ts](../../lib/package.test.ts).

## ~~Issue 4: Нет componentsStyle global fallback~~ ✅ resolved 2026-05-11

- **Категория:** L53 (Wave 3.2)
- **Severity:** ~~high~~
- **Где:** [Textarea.vue:49–51](../../lib/textarea/Textarea.vue#L49-L51)
- **Resolution:** `mode` computed теперь содержит `?? Textarea.componentsStyle()` в fallback chain — `props.mode ?? options?.mode ?? Textarea.componentsStyle() ?? "outlined"`. Покрыто 2 тестами в [Textarea.test.ts](../../lib/textarea/Textarea.test.ts) блок «Issue 4 — componentsStyle global fallback» (single-fallback + priority chain `props > options > componentsStyle > default`). Зеркалит [input.md Issue 2](./input.md) ✅ pattern.

## ~~Issue 5: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-05-11 (cross-cutting Wave 3.1)

- **Категория:** L53 (Wave 3.1)
- **Severity:** ~~high~~
- **Resolution:** Cross-cutting fix уже выполнен в [component/index.ts:138](../../lib/component/index.ts#L138) — `Component.setStyle()` возвращает `""` при `config.unstyled === true`, что отключает рендер Tailwind-классов во всех 22 компонентах, использующих базовый класс. Regression-тест в [Textarea.test.ts](../../lib/textarea/Textarea.test.ts) блок «respects unstyled: true via Component.setStyle guard (Issue 5)» подтверждает работу guard'а на Textarea.

См. [component-class.md Issue 6](./component-class.md) ✅ и [button.md Issue 14](./button.md) для остальных частей (SSR/sideEffects).

## Issue 6: Имя компонента «Textarea» вводит в заблуждение — **open (deferred to breaking-change PR)**

- **Категория:** D25 (консистентность naming)
- **Severity:** medium
- **Где:** [Textarea.vue:9](../../lib/textarea/Textarea.vue#L9), [Textarea.d.ts:11](../../lib/textarea/Textarea.d.ts#L11)
- **Status:** ✅ resolved 2026-09-06. Ранее: tracked for a separate breaking-change PR (major version bump). Rename требует создания `lib/textarea/{Textarea.vue,...}`, deprecated re-export из `lib/textarea/`, обновления `lib/index.ts`, `lib/rollup.config.js`, `lib/config/FishtVue.d.ts` (Textarea key в ComponentsOptions), `lib/module/nuxt.ts`. Из-за blast radius вынесено в отдельный PR.

### Что найдено

`Textarea` — отсылка к WAI-ARIA, но на самом деле компонент — обёртка над `<textarea>` (multiline input). Имя путает: разработчик ищет «общий a11y abstraction», а получает textarea.

### Почему это проблема

- DX: импорт `import Textarea from "fishtvue/textarea"` для multiline-input выглядит как hack.
- Поиск по имени не находит — пользователь ищет «textarea» в [Documentation/](../) — нет.
- Нарушает principle of least astonishment.

### Что нужно сделать

1. Переименовать в `Textarea` (или `MultilineInput`):
   - Создать новый файл `lib/textarea/Textarea.{vue,d.ts,test.ts,package.json}`.
   - Сохранить старый `lib/textarea/*` как deprecated re-export:
     ```ts
     // lib/textarea/Textarea.d.ts
     export { default } from "fishtvue/textarea"
     export * from "fishtvue/textarea"
     ```
   - Console.warn при импорте `fishtvue/textarea`: `[FishtVue] "Textarea" is deprecated, use "Textarea" — will be removed in 0.4.0`.
2. Обновить [Documentation/components/textarea.md](../components/textarea.md) → переименовать в `textarea.md`.
3. Codemod (см. Issue 28): автозамена `import Textarea from "fishtvue/textarea"` → `import Textarea from "fishtvue/textarea"`.
4. Major version bump (0.3 → 1.0 или 0.4) с changelog entry.

### Что сделано (2026-09-06, решение R6)

Переименование **чистое, без deprecated-алиаса** — пункт 1 плана выполнен наполовину намеренно.

Каталог `lib/aria/` переехал в `lib/textarea/`, файлы — в `Textarea.{vue,d.ts,test.ts}`, идентификаторы (`AriaProps` → `TextareaProps` и родня) переименованы, ключ `ComponentsOptions.Aria` стал `Textarea`, обновлены `lib/index.ts`, `lib/module/nuxt.ts` (auto-import) и три места в `lib/rollup.config.js` (entry, `RENAME_DEPENDENCIES`, IIFE-карта). Сборка проверена: `dist/package.json` отдаёт `./textarea`, `./textarea/textarea` и `./textarea/textarea.mjs`, записей `aria` не осталось.

**Почему без deprecated re-export'а.** Он предлагался пунктом 1, но по решению R6 снят: алиас — это второй публичный путь к тому же компоненту, который надо поддерживать, тестировать и однажды удалять вторым breaking change'ем. Библиотека выпускает **один** глобальный major (решение R5), и разумнее сломать один раз, дав миграции инструмент, чем растягивать на два релиза.

**Что не тронуто:**

- `docs/` (публичный сайт fisht.org) — по решению R32 ведётся отдельно, и переименование там пойдёт своим заходом. Это осознанное расхождение на время: канон в `lib/` уже переименован, сайт догоняет.
- `describe("C. Aria attributes")` в `Dialog.test.ts` — это про WAI-ARIA, а не про компонент. Проверено вручную: единственное место, где слово `Aria` в `lib/` означает не бывший компонент.

### Acceptance criteria

- [ ] `import Textarea from "fishtvue/textarea"` работает.
- [ ] Старый импорт работает + dev-warning.
- [ ] Documentation обновлена.

## ~~Issue 7: `modelValue` принимает `number` для текста — странно~~ ✅ resolved 2026-05-11

- **Категория:** D25
- **Severity:** ~~low~~
- **Где:** [Textarea.d.ts:69](../../lib/textarea/Textarea.d.ts#L69)
- **Resolution:** `TextareaProps.modelValue` сужен `string | number | null | undefined` → `string | null | undefined`. `String(value ?? "")` coercion в watcher ([Textarea.vue:32](../../lib/textarea/Textarea.vue#L32)) сохранён как defensive — теперь работает только с string/null/undefined. Покрыто `it.each([null, undefined, ""])` regression-тестом, который проверяет, что textarea рендерится с `value=""` для всех граничных значений. **Breaking:** TypeScript потребители, передающие number, получат compile error — это намеренно (см. Documentation/issues/textarea.md frontmatter).

## ~~Issue 8: Slots `before`/`after` не имеют типизированных props~~ ✅ resolved 2026-05-11

- **Категория:** D22 (Slot props)
- **Severity:** ~~medium~~
- **Где:** [Textarea.d.ts:75–100](../../lib/textarea/Textarea.d.ts#L75-L100), [Textarea.vue:187–192](../../lib/textarea/Textarea.vue#L187-L192)
- **Resolution:**
  1. Введены типы `TextareaBeforeSlotProps` (`{ isInvalid, isFocused }`) и `TextareaAfterSlotProps` (`{ isInvalid, isFocused, clear }`); `TextareaSlots.before/after` теперь принимают эти props.
  2. В шаблоне `<slot name="before"` / `<slot name="after"` забинжен `:is-invalid="isInvalid"`, `:is-focused="isActiveAria"`, для `#after` ещё `:clear="clear"`.
  3. Покрыто 2 тестами (typed slot props for `#after` + `#before`), которые подтверждают, что родительский шаблон получает `boolean` / `function` значения и реактивно обновляется при смене `isInvalid` prop.

## ~~Issue 9: prefers-reduced-motion не учитывается~~ ✅ resolved 2026-05-11

- **Категория:** E29.7
- **Severity:** ~~low~~
- **Где:** [Textarea.vue:65](../../lib/textarea/Textarea.vue#L65)
- **Resolution:** `placeholder:transition-all` → `motion-safe:placeholder:transition-all` в `classInput` (zero-impact для пользователей без `prefers-reduced-motion: reduce`, отключает анимацию placeholder'а для тех, кто его выставил). Tailwind транспилирует `motion-safe:` в `@media (prefers-reduced-motion: no-preference)`. Покрыто regression-тестом (`classInput` содержит `motion-safe:placeholder:transition-all`, не содержит unconditional `placeholder:transition-all`). Зеркалит [button.md Issue 10](./button.md) ✅ pattern.

## ~~Issue 10: maxLength enforce только client-side~~ ✅ resolved 2026-09-05 (doc-only)

- **Категория:** M55 (FormData / submit)
- **Severity:** ~~low~~ (Documentation flag)
- **Где:** [Textarea.vue](../../lib/textarea/Textarea.vue) — поведение корректное, вопрос был в документации

### Что найдено

`<textarea :maxlength="maxLength">` — native HTML maxlength, enforce только в браузере. На server при native form submit пользователь может обойти через DevTools.

### Что сделано

Раздел §12 Security в [components/textarea.md](../components/textarea.md) расширен с одной строки до явного объяснения: `maxLength` — **UX-ограничение, а не проверка**, атрибут снимается через DevTools, и полагаться на него нельзя. Показан рабочий паттерн из двух уровней — правило `length` из [rulesHandler](../utilities/rulesHandler.md) на клиенте (оно, в отличие от нативного `maxlength`, срабатывает и при вставке из буфера, и при программной установке `modelValue`) плюс серверная валидация как единственная гарантия.

Код не трогали: нативный `maxlength` сам по себе корректен, менять его семантику нечего.

## Issue 11: print styles, RTL, hardcode цветов — кросс-cutting

- **Категория:** N59, F31, B10
- **Severity:** low

### Print styles ✅ resolved 2026-05-11

- **Где:** [Textarea.vue:68](../../lib/textarea/Textarea.vue#L68)
- **Resolution:** Добавлены `print:border print:border-black print:bg-white print:text-black print:shadow-none` в `classInput`. Покрыто regression-тестом (`classInput` соответствует `/print:/`). Зеркалит [input.md Issue 11](./input.md) ✅ pattern.

### RTL — open (cross-cutting)

Не aria-specific: классы в `classInput` (`text-gray-900`, `caret-theme-500`) уже design-token и RTL-safe. Layout управляется через [InputLayout](./inputlayout.md). Полноценный RTL audit на уровне 22 компонентов трекается в [switch.md Issue 8](./switch.md) (logical CSS properties) и [input.md Issue 12](./input.md) ✅.

### ~~Hardcode цветов~~ ✅ resolved 2026-07-04 (B10)

- **Где:** [Textarea.vue:63-64](../../lib/textarea/Textarea.vue#L63-L64).
- **Resolution:** `text-gray-900 dark:text-gray-100` (основной текст textarea) и `focus:placeholder:text-gray-400 focus:placeholder:dark:text-gray-500` (focus-placeholder) заменены на `text-surface-900 dark:text-surface-100` / `focus:placeholder:text-surface-400 focus:placeholder:dark:text-surface-500` — family rename без изменения числового тона. Инфраструктура готова заранее: `surface` — 23-й именованный цвет в [primitive.ts:305-317](../../lib/theme/primitive.ts#L305-L317) (default = точная копия `gray`), `namesColors` union в [Theme.d.ts:187](../../lib/theme/Theme.d.ts#L187) уже включает `"surface"` — `text-surface-{tone}` работает как любой другой named color без engine-изменений. `placeholder:select-none` — не hardcode цвета, не тронут. Зеркалит [input.md Issue 15](./input.md) ✅ pattern (идентичная family rename в `Input.vue`). Покрыто 2 regression-тестами в [Textarea.test.ts](../../lib/textarea/Textarea.test.ts) блок «Issue 11 — B10 hardcode: gray-* → surface-* (design-token migration)» (текст textarea + focus-placeholder, оба с negative-assertion на отсутствие `gray-*`).
- **Out of scope (не в этом фиксе):** `caret-theme-500` в той же строке `classInput` — уже theme-токен, не hardcode, не тронут. RTL-часть этого issue (см. выше) и N59-часть (print/motion) остаются в прежнем статусе — не пересматривались в рамках B10.

## Cross-cutting: Configuration support

| Настройка                | Поддержано? | Комментарий                                                                                  |
| ------------------------ | ----------- | -------------------------------------------------------------------------------------------- |
| `componentsOptions.Textarea` | ✅          | mode/autocomplete/wrap/rows/maxLength/classInput + InputLayoutOption                         |
| `componentsStyle` global | ✅          | Issue 4 closed 2026-05-11 — fallback chain `props ?? options ?? Textarea.componentsStyle() ?? "outlined"` |
| `unstyled: true`         | ✅          | Issue 5 closed 2026-05-11 — cross-cutting через `Component.setStyle()` (Wave 3.1)            |
| Theme tokens vs hardcode | ⚠️          | через InputLayout (наследует те же проблемы); aria-specific hardcode tracked в Issue 11      |
| Runtime theme switch     | ⚠️          | через InputLayout                                                                            |
| `t()` для текста         | N/A         | label/placeholder — пользовательские                                                         |
| Runtime locale switch    | N/A         | —                                                                                            |

## Dual-API gap

Не применимо.

---
title: Issues — Aria
summary: Аудит Aria. 8/11 issues закрыто 2026-05-11 (type bug change:modelValue → string + cross-cutting TextEditor, dup initStyle removal, componentsStyle fallback, unstyled regression test, modelValue type narrow, typed before/after slot props, motion-safe placeholder, print styles). Остались Issue 3 (cross-cutting Wave 2.1 packaging), Issue 6 (rename → Textarea, breaking — deferred), Issue 10 (docs-only, уже задокументирован).
updated: 2026-05-11
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/aria/
related-doc: ../components/aria.md
---

# Issues — Aria

## Сводка

| Severity | Count (open) | Categories         |
| -------- | ------------ | ------------------ |
| critical | 0            | —                  |
| high     | 1            | A2, A4-5 (Issue 3) |
| medium   | 1            | D25 (Issue 6 — rename, deferred) |
| low      | 1            | M55 (Issue 10 — docs-only) |

**Закрыто 2026-05-11:** Issues 1 (type bug change:modelValue → string + cross-cutting fix в TextEditor.d.ts), 2 (drop duplicate initStyle, Wave 2.3), 4 (componentsStyle fallback chain), 5 (unstyled regression test — cross-cutting Wave 3.1), 7 (modelValue type narrow), 8 (typed slot props before/after), 9 (motion-safe placeholder), 11 print part (print:* классы в classInput) — зачёркнуты ниже с `✅ resolved`-маркерами. Нумерация исходная — cross-references сохраняются.

## ~~Issue 1: Type bug — `change:modelValue(payload: boolean)` должно быть `string`~~ ✅ resolved 2026-05-11

- **Категория:** D26 (несоответствие типа payload)
- **Severity:** ~~medium~~
- **Где:** [Aria.d.ts:125](../../lib/aria/Aria.d.ts#L125), [Aria.vue:149](../../lib/aria/Aria.vue#L149)
- **Resolution:** payload type изменён `boolean` → `string` в `AriaEmits["change:modelValue"]`; `changeModelValue` функция типизирована `(value: string)`. Cross-cutting — идентичный fix применён к `TextEditorEmits["change:modelValue"]` ([TextEditor.d.ts:121](../../lib/texteditor/TextEditor.d.ts#L121)) — закрывает [texteditor.md Issue 5](./texteditor.md). Тесты в [Aria.test.ts](../../lib/aria/Aria.test.ts) блок «Audit close-out fixes» (2 кейса: native `change` event payload + `clear()` empty-string payload).

### Что найдено

```ts
// Aria.d.ts
(event: "change:modelValue", payload: boolean): void
```

```ts
// Aria.vue:145-147
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

1. В [Aria.d.ts:97](../../lib/aria/Aria.d.ts#L97):
   ```ts
   (event: "change:modelValue", payload: string | number | null | undefined): void
   ```
2. В [Aria.vue:145](../../lib/aria/Aria.vue#L145) типизировать аргумент: `function changeModelValue(value: string)`.
3. Cross-cutting: проверить TextEditor.d.ts — аналогичный bug.
4. Документировать в [Documentation/components/aria.md](../components/aria.md) §6 (уже отмечено в Known issues, но осталось без фикса).

### Acceptance criteria

- [ ] vue-tsc показывает корректный тип для `@change:modelValue` slot/handler.
- [ ] Тест: `wrapper.emitted('change:modelValue')[0]` это array of [string].

## ~~Issue 2: Стили SSR не инжектятся (дубль `onMounted(initStyle)`)~~ ✅ resolved 2026-05-11

- **Категория:** C17 (Wave 2.3 — SSR style injection)
- **Severity:** ~~high~~
- **Resolution:** Удалён дублирующий блок `onMounted(() => Aria.initStyle())` из `Aria.vue` — базовый `Component.__hooks()` ([component/index.ts:79–84](../../lib/component/index.ts#L79-L84)) уже регистрирует `onServerPrefetch + vueOnMounted → initStyle()` в конструкторе. Wave 2.3 progress: 5/22 SFC migrated (Input + Switch + Select + Calendar + **Aria**). Regression-тест в [Aria.test.ts](../../lib/aria/Aria.test.ts) блок «Initialization (no-dup initStyle)» — static-source check, что SFC не содержит `Aria.initStyle()` вне base-class hook.

Полный cross-cutting SSR-style fix (layer wrapping, HMR teardown, top-level SSR collector) остаётся в [button.md Issue 1](./button.md) и [component-class.md Issue 3](./component-class.md) — общий вопрос, не aria-specific.

## Issue 3: Нет sideEffects/exports map

- **Категория:** A2, A4, A5
- **Severity:** high

См. [button.md Issue 8 и Issue 9](./button.md).

## ~~Issue 4: Нет componentsStyle global fallback~~ ✅ resolved 2026-05-11

- **Категория:** L53 (Wave 3.2)
- **Severity:** ~~high~~
- **Где:** [Aria.vue:49–51](../../lib/aria/Aria.vue#L49-L51)
- **Resolution:** `mode` computed теперь содержит `?? Aria.componentsStyle()` в fallback chain — `props.mode ?? options?.mode ?? Aria.componentsStyle() ?? "outlined"`. Покрыто 2 тестами в [Aria.test.ts](../../lib/aria/Aria.test.ts) блок «Issue 4 — componentsStyle global fallback» (single-fallback + priority chain `props > options > componentsStyle > default`). Зеркалит [input.md Issue 2](./input.md) ✅ pattern.

## ~~Issue 5: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-05-11 (cross-cutting Wave 3.1)

- **Категория:** L53 (Wave 3.1)
- **Severity:** ~~high~~
- **Resolution:** Cross-cutting fix уже выполнен в [component/index.ts:138](../../lib/component/index.ts#L138) — `Component.setStyle()` возвращает `""` при `config.unstyled === true`, что отключает рендер Tailwind-классов во всех 22 компонентах, использующих базовый класс. Regression-тест в [Aria.test.ts](../../lib/aria/Aria.test.ts) блок «respects unstyled: true via Component.setStyle guard (Issue 5)» подтверждает работу guard'а на Aria.

См. [component-class.md Issue 6](./component-class.md) ✅ и [button.md Issue 14](./button.md) для остальных частей (SSR/sideEffects).

## Issue 6: Имя компонента «Aria» вводит в заблуждение — **open (deferred to breaking-change PR)**

- **Категория:** D25 (консистентность naming)
- **Severity:** medium
- **Где:** [Aria.vue:9](../../lib/aria/Aria.vue#L9), [Aria.d.ts:11](../../lib/aria/Aria.d.ts#L11)
- **Status:** Tracked for a separate breaking-change PR (major version bump). Rename требует создания `lib/textarea/{Textarea.vue,...}`, deprecated re-export из `lib/aria/`, обновления `lib/index.ts`, `lib/rollup.config.js`, `lib/config/FishtVue.d.ts` (Textarea key в ComponentsOptions), `lib/module/nuxt.ts`. Из-за blast radius вынесено в отдельный PR.

### Что найдено

`Aria` — отсылка к WAI-ARIA, но на самом деле компонент — обёртка над `<textarea>` (multiline input). Имя путает: разработчик ищет «общий a11y abstraction», а получает textarea.

### Почему это проблема

- DX: импорт `import Aria from "fishtvue/aria"` для multiline-input выглядит как hack.
- Поиск по имени не находит — пользователь ищет «textarea» в [Documentation/](../) — нет.
- Нарушает principle of least astonishment.

### Что нужно сделать

1. Переименовать в `Textarea` (или `MultilineInput`):
   - Создать новый файл `lib/textarea/Textarea.{vue,d.ts,test.ts,package.json}`.
   - Сохранить старый `lib/aria/*` как deprecated re-export:
     ```ts
     // lib/aria/Aria.d.ts
     export { default } from "fishtvue/textarea"
     export * from "fishtvue/textarea"
     ```
   - Console.warn при импорте `fishtvue/aria`: `[FishtVue] "Aria" is deprecated, use "Textarea" — will be removed in 0.4.0`.
2. Обновить [Documentation/components/aria.md](../components/aria.md) → переименовать в `textarea.md`.
3. Codemod (см. Issue 28): автозамена `import Aria from "fishtvue/aria"` → `import Textarea from "fishtvue/textarea"`.
4. Major version bump (0.3 → 1.0 или 0.4) с changelog entry.

### Acceptance criteria

- [ ] `import Textarea from "fishtvue/textarea"` работает.
- [ ] Старый импорт работает + dev-warning.
- [ ] Documentation обновлена.

## ~~Issue 7: `modelValue` принимает `number` для текста — странно~~ ✅ resolved 2026-05-11

- **Категория:** D25
- **Severity:** ~~low~~
- **Где:** [Aria.d.ts:69](../../lib/aria/Aria.d.ts#L69)
- **Resolution:** `AriaProps.modelValue` сужен `string | number | null | undefined` → `string | null | undefined`. `String(value ?? "")` coercion в watcher ([Aria.vue:32](../../lib/aria/Aria.vue#L32)) сохранён как defensive — теперь работает только с string/null/undefined. Покрыто `it.each([null, undefined, ""])` regression-тестом, который проверяет, что textarea рендерится с `value=""` для всех граничных значений. **Breaking:** TypeScript потребители, передающие number, получат compile error — это намеренно (см. Documentation/issues/aria.md frontmatter).

## ~~Issue 8: Slots `before`/`after` не имеют типизированных props~~ ✅ resolved 2026-05-11

- **Категория:** D22 (Slot props)
- **Severity:** ~~medium~~
- **Где:** [Aria.d.ts:75–100](../../lib/aria/Aria.d.ts#L75-L100), [Aria.vue:187–192](../../lib/aria/Aria.vue#L187-L192)
- **Resolution:**
  1. Введены типы `AriaBeforeSlotProps` (`{ isInvalid, isFocused }`) и `AriaAfterSlotProps` (`{ isInvalid, isFocused, clear }`); `AriaSlots.before/after` теперь принимают эти props.
  2. В шаблоне `<slot name="before"` / `<slot name="after"` забинжен `:is-invalid="isInvalid"`, `:is-focused="isActiveAria"`, для `#after` ещё `:clear="clear"`.
  3. Покрыто 2 тестами (typed slot props for `#after` + `#before`), которые подтверждают, что родительский шаблон получает `boolean` / `function` значения и реактивно обновляется при смене `isInvalid` prop.

## ~~Issue 9: prefers-reduced-motion не учитывается~~ ✅ resolved 2026-05-11

- **Категория:** E29.7
- **Severity:** ~~low~~
- **Где:** [Aria.vue:65](../../lib/aria/Aria.vue#L65)
- **Resolution:** `placeholder:transition-all` → `motion-safe:placeholder:transition-all` в `classInput` (zero-impact для пользователей без `prefers-reduced-motion: reduce`, отключает анимацию placeholder'а для тех, кто его выставил). Tailwind транспилирует `motion-safe:` в `@media (prefers-reduced-motion: no-preference)`. Покрыто regression-тестом (`classInput` содержит `motion-safe:placeholder:transition-all`, не содержит unconditional `placeholder:transition-all`). Зеркалит [button.md Issue 10](./button.md) ✅ pattern.

## Issue 10: maxLength enforce только client-side

- **Категория:** M55 (FormData / submit)
- **Severity:** low (Documentation flag)
- **Где:** [Aria.vue:171](../../lib/aria/Aria.vue#L171)

### Что найдено

`<textarea :maxlength="maxLength">` — native HTML maxlength, enforce только в браузере. На server при native form submit пользователь может обойти через DevTools.

### Что нужно сделать

Документировать в [Documentation/components/aria.md](../components/aria.md) §12 Security: «дублируй на server». Уже частично есть, оставить.

## Issue 11: print styles, RTL, hardcode цветов — кросс-cutting

- **Категория:** N59, F31, B10
- **Severity:** low

### Print styles ✅ resolved 2026-05-11

- **Где:** [Aria.vue:68](../../lib/aria/Aria.vue#L68)
- **Resolution:** Добавлены `print:border print:border-black print:bg-white print:text-black print:shadow-none` в `classInput`. Покрыто regression-тестом (`classInput` соответствует `/print:/`). Зеркалит [input.md Issue 11](./input.md) ✅ pattern.

### RTL — open (cross-cutting)

Не aria-specific: классы в `classInput` (`text-gray-900`, `caret-theme-500`) уже design-token и RTL-safe. Layout управляется через [InputLayout](./inputlayout.md). Полноценный RTL audit на уровне 22 компонентов трекается в [switch.md Issue 8](./switch.md) (logical CSS properties) и [input.md Issue 12](./input.md) ✅.

### Hardcode цветов — open (cross-cutting)

Замена `text-gray-900 dark:text-gray-100` / `placeholder:text-gray-400` на semantic tokens — wave-level refactor (см. [switch.md Issue 12](./switch.md)). Отложено в отдельный PR — требует обновления `lib/theme/uno.ts` для всех 22 компонентов одновременно.

## Cross-cutting: Configuration support

| Настройка                | Поддержано? | Комментарий                                                                                  |
| ------------------------ | ----------- | -------------------------------------------------------------------------------------------- |
| `componentsOptions.Aria` | ✅          | mode/autocomplete/wrap/rows/maxLength/classInput + InputLayoutOption                         |
| `componentsStyle` global | ✅          | Issue 4 closed 2026-05-11 — fallback chain `props ?? options ?? Aria.componentsStyle() ?? "outlined"` |
| `unstyled: true`         | ✅          | Issue 5 closed 2026-05-11 — cross-cutting через `Component.setStyle()` (Wave 3.1)            |
| Theme tokens vs hardcode | ⚠️          | через InputLayout (наследует те же проблемы); aria-specific hardcode tracked в Issue 11      |
| Runtime theme switch     | ⚠️          | через InputLayout                                                                            |
| `t()` для текста         | N/A         | label/placeholder — пользовательские                                                         |
| Runtime locale switch    | N/A         | —                                                                                            |

## Dual-API gap

Не применимо.

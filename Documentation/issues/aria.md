---
title: Issues — Aria
summary: Аудит Aria — type-bug change:modelValue(boolean) вместо string, no componentsStyle global fallback, misleading имя компонента, SSR-стили.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/aria/
related-doc: ../components/aria.md
---

# Issues — Aria

## Сводка

| Severity | Count | Categories                |
| -------- | ----- | ------------------------- |
| critical | 0     | —                         |
| high     | 4     | A2, A4-5, C17, L53        |
| medium   | 4     | D22, D26, D25/naming, B10 |
| low      | 3     | E29.7, F31, N59           |

## Issue 1: Type bug — `change:modelValue(payload: boolean)` должно быть `string`

- **Категория:** D26 (несоответствие типа payload)
- **Severity:** medium
- **Где:** [Aria.d.ts:97](../../lib/aria/Aria.d.ts#L97), [Aria.vue:146](../../lib/aria/Aria.vue#L146)

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

## Issue 2: Стили SSR не инжектятся

- **Категория:** C17
- **Severity:** high

См. [button.md Issue 1](./button.md).

## Issue 3: Нет sideEffects/exports map

- **Категория:** A2, A4, A5
- **Severity:** high

См. [button.md Issue 8 и Issue 9](./button.md).

## Issue 4: Нет componentsStyle global fallback

- **Категория:** L53
- **Severity:** high
- **Где:** [Aria.vue:49](../../lib/aria/Aria.vue#L49)

```ts
const mode = computed(() => props.mode ?? options?.mode ?? "outlined")
```

См. [input.md Issue 2](./input.md) — идентичный fix-план: добавить `Aria.componentsStyle()` в fallback chain.

## Issue 5: `unstyled: true` не обрабатывается

- **Категория:** L53
- **Severity:** high

См. [button.md Issue 14](./button.md).

## Issue 6: Имя компонента «Aria» вводит в заблуждение

- **Категория:** D25 (консистентность naming)
- **Severity:** medium
- **Где:** [Aria.vue:9](../../lib/aria/Aria.vue#L9), [Aria.d.ts:11](../../lib/aria/Aria.d.ts#L11)

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

## Issue 7: `modelValue` принимает `number` для текста — странно

- **Категория:** D25
- **Severity:** low
- **Где:** [Aria.d.ts](../../lib/aria/Aria.d.ts), AriaProps `modelValue?: string | number | null | undefined`

### Что найдено

`modelValue?: string | number` — `number` для multi-line text не имеет смысла. В runtime auto-coerce в `String(value)` ([Aria.vue:32](../../lib/aria/Aria.vue#L32)).

### Что нужно сделать

1. Сузить до `modelValue?: string | null`.
2. Если number нужен — задокументировать сценарий и оставить, но добавить runtime-warning.

## Issue 8: Slots `before`/`after` не имеют типизированных props

- **Категория:** D22 (Slot props)
- **Severity:** medium
- **Где:** [Aria.d.ts](../../lib/aria/Aria.d.ts), AriaSlots type

### Что найдено

```ts
export declare type AriaSlots = {
  default(): VNode[]
  before(): VNode[]
  after(): VNode[]
}
```

Слоты не получают context (`isInvalid`, `modelValue`, `isFocused`). Пользователь не может условно стилизовать `<template #after="{ isInvalid }">`.

### Что нужно сделать

1. Type signature:
   ```ts
   export declare type AriaSlots = {
     default(): VNode[]
     before?(props: { isInvalid: boolean; isFocused: boolean }): VNode[]
     after?(props: { isInvalid: boolean; isFocused: boolean; clear: () => void }): VNode[]
   }
   ```
2. В [Aria.vue:184-189](../../lib/aria/Aria.vue#L184-L189):
   ```vue
   <template #before>
     <slot v-if="slots.before" name="before" :is-invalid="isInvalid" :is-focused="isActiveAria" />
   </template>
   ```

### Acceptance criteria

- [ ] `<Aria><template #after="{ isInvalid, clear }">...</template></Aria>` — Volar предлагает props.

## Issue 9: prefers-reduced-motion не учитывается

- **Категория:** E29.7
- **Severity:** low

См. [done/button.md Issue 10](./done/button.md) — там готовый motion-safe pattern.

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

См. [button.md Issue 15](./button.md), [switch.md Issue 8 и Issue 12](./switch.md).

## Cross-cutting: Configuration support

| Настройка                | Поддержано? | Комментарий                                                          |
| ------------------------ | ----------- | -------------------------------------------------------------------- |
| `componentsOptions.Aria` | ✅          | mode/autocomplete/wrap/rows/maxLength/classInput + InputLayoutOption |
| `componentsStyle` global | ❌          | Issue 4                                                              |
| `unstyled: true`         | ❌          | Issue 5                                                              |
| Theme tokens vs hardcode | ⚠️          | через InputLayout (наследует те же проблемы)                         |
| Runtime theme switch     | ⚠️          | через InputLayout                                                    |
| `t()` для текста         | N/A         | label/placeholder — пользовательские                                 |
| Runtime locale switch    | N/A         | —                                                                    |

## Dual-API gap

Не применимо.

---
title: Issues — Separator
summary: Аудит Separator — преимущественно cross-cutting, отсутствие role="separator" ARIA, RTL.
updated: 2026-06-06
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/separator/
related-doc: ../components/separator.md
---

# Issues — Separator

## Сводка

| Severity | Count | Categories |
| -------- | ----- | ---------- |
| critical | 0     | —          |
| high     | 2     | A4-5, C17  |
| medium   | 1     | F31        |
| low      | 1     | B10        |

**Закрыто 2026-06-06:** A2 (per-component `sideEffects`), E29.1 (`role="separator"` + `aria-orientation`), L53 (`unstyled` — regression-тест к cross-cutting guard). E29.7 (motion) — N/A (нет анимаций). Зачёркнуто ниже с `✅ resolved`-маркерами.

## Issue 1: SSR styles + sideEffects/exports map / unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

**Статус (2026-06-06):**

- **sideEffects (A2):** ✅ resolved — [lib/separator/package.json](../../lib/separator/package.json) помечен `"sideEffects": false` (нет SFC `<style>`, стили инжектятся в runtime через `setStyle`; precedent — Dialog/FixWindow).
- **unstyled (L53):** ✅ resolved — наследуется из cross-cutting guard `Component.setStyle()` ([component/index.ts:138](../../lib/component/index.ts#L138), ✅ 2026-05-11); regression-тест добавлен в [Separator.test.ts](../../lib/separator/Separator.test.ts) (describe "Unstyled mode").
- **SSR styles (C17):** дубль `Separator.initStyle()` уже снят в Wave 2.3 (comment-marker канона в [Separator.vue](../../lib/separator/Separator.vue)); SSR-инжекция наследуется из `Component.__hooks()`. Остаётся базовый `renderToString`-критерий на уровне `Component` — общий для всех компонентов.
- **exports map (A4-5):** ⏳ deferred → root [lib/package.json](../../lib/package.json) (Wave 2.1, one-time для всех 22 компонентов).

## ~~Issue 2: Нет ARIA role="separator"~~ ✅ resolved 2026-06-06

- **Категория:** E29.1
- **Severity:** ~~medium~~
- **Где:** [Separator.vue](../../lib/separator/Separator.vue)
- **Resolution:** корень `<div data-separator>` рендерит `role="separator"` + `:aria-orientation="vertical ? 'vertical' : 'horizontal'"`. Slot-контент = accessible name; декоративные line-сегменты сохраняют `aria-hidden="true"`. Без нового prop (unconditional, как Radix/shadcn default). Тесты — [Separator.test.ts](../../lib/separator/Separator.test.ts) describe "Accessibility".

### Что найдено

Корневой элемент Separator (или `<hr>` если используется) — без явного `role="separator"`. Если корень — `<div>`, screen reader не идентифицирует.

### Что нужно сделать

1. ~~Корень Separator → `<hr>` (имеет нативный `role="separator"`) или `<div role="separator">`.~~ → выбран `<div role="separator">` (поддерживает slot-контент, в отличие от `<hr>`).
2. ~~Если есть content (текст, иконка) → `role="separator" aria-orientation="horizontal|vertical"`.~~ → `aria-orientation` выставляется всегда.
3. Decorative-режим (`aria-hidden`) не реализован — разделитель всегда семантический (нет `decorative` prop).

## Issue 3: RTL — `contentPosition: "left" | "right"` буквальное

- **Категория:** F31
- **Severity:** medium
- **Статус:** ⏳ deferred → Wave 8.1. Зависит от `useDirectionality()` composable (ещё не существует); зеркалит [button.md Issue 3](./button.md) (тоже открыт). Преждевременная point-fix миграция создала бы частичный RTL-паттерн.

### Что нужно сделать

Заменить `"left"|"right"` на `"start"|"end"` (deprecation soft) или auto-mirror через `dir="rtl"` selector.

## Issue 4: prefers-reduced-motion / colors

- **prefers-reduced-motion (E29.7):** N/A — Separator не использует `transition-*` / анимаций ([Separator.vue](../../lib/separator/Separator.vue)), guard'ить нечего.
- **colors (B10):** ⏳ deferred → Wave 9 — `via-neutral-200 dark:via-neutral-800` / `bg-neutral-200 dark:bg-neutral-800` заменяются на semantic tokens cross-cutting.

Cross-cutting motion-safe pattern (если анимации появятся) — [done/button.md Issue 10](./done/button.md).

## Cross-cutting: Configuration support

| Настройка                     | Поддержано? | Комментарий                                   |
| ----------------------------- | ----------- | --------------------------------------------- |
| `componentsOptions.Separator` | ✅          | gradient, depth, contentPosition              |
| `componentsStyle` global      | ❌          | Separator не имеет mode-enum, не пересекается |
| `unstyled: true`              | ✅          | через `Component.setStyle()` guard (Issue 1)  |
| Theme tokens vs hardcode      | ⚠️          | gradient/border colors частично хардкоден     |
| `t()` для текста              | N/A         | content через slot                            |

## Dual-API gap

Не применимо.

---
title: Issues — Separator
summary: Аудит Separator — преимущественно cross-cutting, отсутствие role="separator" ARIA, RTL.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/separator/
related-doc: ../components/separator.md
---

# Issues — Separator

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | — |
| high | 3 | A2, A4-5, C17 |
| medium | 2 | E29.1, F31 |
| low | 2 | E29.7, B10 |

## Issue 1: SSR styles + sideEffects/exports map / unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 2: Нет ARIA role="separator"

- **Категория:** E29.1
- **Severity:** medium
- **Где:** [Separator.vue](../../lib/separator/Separator.vue)

### Что найдено

Корневой элемент Separator (или `<hr>` если используется) — без явного `role="separator"`. Если корень — `<div>`, screen reader не идентифицирует.

### Что нужно сделать

1. Корень Separator → `<hr>` (имеет нативный `role="separator"`) или `<div role="separator">`.
2. Если есть content (текст, иконка) → `role="separator" aria-orientation="horizontal|vertical"`.
3. Если decorative — `aria-hidden="true"`.

## Issue 3: RTL — `contentPosition: "left" | "right"` буквальное

- **Категория:** F31
- **Severity:** medium

### Что нужно сделать

Заменить `"left"|"right"` на `"start"|"end"` (deprecation soft) или auto-mirror через `dir="rtl"` selector.

## Issue 4: prefers-reduced-motion / colors

Cross-cutting. См. [button.md Issue 10](./button.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Separator` | ✅ | gradient, depth, contentPosition |
| `componentsStyle` global | ❌ | Separator не имеет mode-enum, не пересекается |
| `unstyled: true` | ❌ | Issue 1 |
| Theme tokens vs hardcode | ⚠️ | gradient/border colors частично хардкоден |
| `t()` для текста | N/A | content через slot |

## Dual-API gap

Не применимо.

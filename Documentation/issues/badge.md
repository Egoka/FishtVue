---
title: Issues — Badge
summary: Аудит Badge — преимущественно cross-cutting проблемы (SSR-стили, sideEffects, unstyled). Свои — нет componentsStyle global fallback, нет dark-mode для outline-mode contrast.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/badge/
related-doc: ../components/badge.md
---

# Issues — Badge

## Сводка

| Severity | Count | Categories                                             |
| -------- | ----- | ------------------------------------------------------ |
| critical | 0     | —                                                      |
| high     | 4     | A2, A4-5, C17, L53                                     |
| medium   | 2     | E29.6 (contrast outline mode), D26 (close emit naming) |
| low      | 3     | E29.7, B10, F31                                        |

## Issue 1: SSR styles + sideEffects/exports map

- **Категория:** C17, A2, A4, A5
- **Severity:** high

См. [button.md Issue 1, 8, 9](./button.md). Идентичный fix для всех 22 компонентов.

## Issue 2: Нет componentsStyle global fallback

- **Категория:** L53
- **Severity:** high
- **Где:** [Badge.vue:17](../../lib/badge/Badge.vue#L17)

```ts
const mode = computed(() => props.mode ?? options?.mode ?? "primary")
```

Свой enum `mode: "primary" | "secondary" | "neutral" | "outline"` — не пересекается с global `componentsStyle: "filled" | "outlined" | "underlined"`.

См. [button.md Issue 13](./button.md) — аналогичный fix-план через mapping.

## Issue 3: `unstyled: true` не обрабатывается

- **Категория:** L53
- **Severity:** high

См. [button.md Issue 14](./button.md).

## Issue 4: Outline-mode + neutral — низкий contrast в light mode

- **Категория:** E29.6 (WCAG contrast)
- **Severity:** medium
- **Где:** [Badge.vue:32](../../lib/badge/Badge.vue#L32)

### Что найдено

```ts
mode.value === "outline" ?
  ... : "ring-1 ring-inset text-neutral-600 dark:text-neutral-200 ring-neutral-500/30"
```

`text-neutral-600` (#525252) на белом фоне = contrast ~7:1 (OK), но `ring-neutral-500/30` (30% opacity) — едва видна граница. Пользователи с low-vision не увидят, что это badge.

### Что нужно сделать

1. `ring-neutral-500/30` → `ring-neutral-300` (full opacity).
2. axe-core test для всех mode комбинаций.

## Issue 5: Emit `delete` — лучше `close` или `update:show`

- **Категория:** D26
- **Severity:** medium
- **Где:** [Badge.vue:78](../../lib/badge/Badge.vue#L78)

### Что найдено

```ts
function deleteBadge() {
  emit("delete")
}
```

«Delete» подразумевает destructive backend-операцию. Семантически точнее — «close» (UI-action закрыть бейдж) или `update:show` (Vue convention для controlled visibility).

### Что нужно сделать

1. Добавить новый event `close` или `update:show` рядом с `delete` (deprecation soft).
2. Console.warn при использовании `delete` в minor.
3. В major (1.0) — убрать `delete`.

## Issue 6: prefers-reduced-motion / RTL / colors hardcode

- **Категория:** E29.7, F31, B10
- **Severity:** low

Cross-cutting. См. [done/button.md Issue 10](./done/button.md) — там готовый motion-safe pattern, плюс [switch.md Issue 8, 12](./switch.md). Badge имеет `transition` через children Button.

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                             |
| ------------------------- | ----------- | ----------------------------------------------------------------------- |
| `componentsOptions.Badge` | ✅          | mode, point, closeButton, class, classContent                           |
| `componentsStyle` global  | ❌          | Issue 2                                                                 |
| `unstyled: true`          | ❌          | Issue 3                                                                 |
| Theme tokens vs hardcode  | ⚠️          | theme-_/neutral-_ через Tailwind; контрол через design tokens частичный |
| Runtime theme switch      | ✅          | через CSS-переменные theme-\*                                           |
| `t()` для текста          | N/A         | контент через slot                                                      |
| Runtime locale switch     | N/A         | —                                                                       |

## Dual-API gap

Не применимо — Badge не collection.

---
title: Issues — Badge
summary: Аудит Badge — остаются cross-cutting (sideEffects/exports, unstyled, reduced-motion/RTL/colors). Badge-specific issues (componentsStyle, contrast, close-event) закрыты 2026-05-10.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/badge/
related-doc: ../../components/badge.md
---

# Issues — Badge

## Сводка

| Severity | Count | Categories                                                       |
| -------- | ----- | ---------------------------------------------------------------- |
| critical | 0     | —                                                                |
| high     | 3     | A2, A4-5 (packaging cross-cutting), L53 (unstyled cross-cutting) |
| medium   | 0     | —                                                                |
| low      | 3     | E29.7, B10, F31                                                  |

> 2026-05-10: **all Badge-SFC-specific work done.** Issues 2, 4, 5 resolved полностью; Issue 1 — C17 (per-SFC `onMounted` dup) удалён, packaging A2/A4-5 = cross-cutting в [lib/package.json](../../../lib/package.json) под [Wave 2.1](../README.md#21-packaging-one-time-fix-в-libpackagejson); Issues 3 (unstyled) и 6 (reduced-motion/RTL/colors) — cross-cutting, отслеживаются под [component-class.md Issue 6](../component-class.md) (Wave 3.1) и Waves 8.1/9/10.1 соответственно. Файл перемещён в `./done/`.

## ~~Issue 1: SSR styles + sideEffects/exports map~~ ✅ resolved 2026-05-10 (Badge-part) / cross-cutting

- **Категория:** C17, A2, A4, A5
- **Severity:** high
- **Status:** Badge-specific часть закрыта 2026-05-10; packaging — cross-cutting.

См. [button.md Issue 1, 8, 9](../button.md). Идентичный fix для всех 22 компонентов.

- ~~C17 — `onMounted(() => Badge.initStyle())` дублирующий init в Badge.vue~~ ✅ resolved 2026-05-10: удалён, авто-init идёт через [Component.\_\_hooks()](../../../lib/component/index.ts#L79-L84).
- A2 (`sideEffects` map), A4-A5 (ESM/CJS dual + `exports` map) — остаются cross-cutting в [lib/package.json](../../../lib/package.json), закрываются [Wave 2.1](../README.md#21-packaging-one-time-fix-в-libpackagejson).

## ~~Issue 2: Нет componentsStyle global fallback~~ ✅ resolved 2026-05-10

- **Категория:** L53
- **Severity:** high
- **Где:** [Badge.vue:17–23](../../../lib/badge/Badge.vue#L17-L23)
- **Status:** resolved 2026-05-10

~~`mode` не учитывал global `componentsStyle`.~~ Добавлен `componentsStyleMode` helper и расширен fallback chain:

```ts
const componentsStyleMode = computed<NonNullable<BadgeProps["mode"]> | undefined>(() => {
  const cs = Badge.componentsStyle()
  return cs === "filled" ? "primary" : cs === "outlined" ? "outline" : cs === "underlined" ? "neutral" : undefined
})
const mode = computed<NonNullable<BadgeProps["mode"]>>(
  () => props.mode ?? options?.mode ?? componentsStyleMode.value ?? "primary"
)
```

Маппинг по аналогии с Button (Wave 3.2: `underlined→ghost`): для Badge `underlined→neutral` — ближайший минимально-визуальный mode.

См. [button.md Issue 13](../button.md) — параллельный fix.

## ~~Issue 3: `unstyled: true` не обрабатывается~~ cross-cutting — tracked elsewhere

- **Категория:** L53
- **Severity:** high
- **Status:** канонический fix в `Component.setStyle()` (один PR на все 22 компонента). Отслеживается под [component-class.md Issue 6](../component-class.md) / [Wave 3.1](../README.md#31-unstyled-true-enforcement-один-фикс--22-компонента). Badge-SFC ничего не меняет.

См. [button.md Issue 14](../button.md).

## ~~Issue 4: Outline-mode + neutral — низкий contrast в light mode~~ ✅ resolved 2026-05-10

- **Категория:** E29.6 (WCAG contrast)
- **Severity:** medium
- **Где:** [Badge.vue:38](../../../lib/badge/Badge.vue#L38)
- **Status:** resolved 2026-05-10

### Что найдено

~~`ring-neutral-500/30` (30% opacity) — едва видна граница.~~ Заменено на полную непрозрачность с парным dark-mode вариантом:

```ts
mode.value === "outline" ?
  ... : "ring-1 ring-inset text-neutral-600 dark:text-neutral-200 ring-neutral-300 dark:ring-neutral-700"
```

Light: `ring-neutral-300` (#d4d4d4) на белом — 3:1 non-text contrast WCAG AA. Dark: `ring-neutral-700` (#404040) — 3:1.

### Что нужно сделать

1. ~~`ring-neutral-500/30` → `ring-neutral-300` (full opacity).~~ ✅
2. axe-core test для всех mode комбинаций — отложено в Wave 4 (cross-cutting a11y).

## ~~Issue 5: Emit `delete` — лучше `close` или `update:show`~~ ✅ resolved 2026-05-10 (soft deprecation)

- **Категория:** D26
- **Severity:** medium
- **Где:** [Badge.vue:78–81](../../../lib/badge/Badge.vue#L78-L81), [Badge.d.ts:53–64](../../../lib/badge/Badge.d.ts#L53-L64)
- **Status:** soft deprecation — резолв 2026-05-10. Жёсткое удаление — Wave 12 codemod при major bump.

### Что найдено

~~«Delete» подразумевает destructive backend-операцию.~~ Добавлен event `close` (Vue UI-action convention), эмитится одновременно с `delete` для обратной совместимости:

```ts
function deleteBadge() {
  emit("delete")
  emit("close")
}
```

`delete` помечен `@deprecated` в [Badge.d.ts:57](../../../lib/badge/Badge.d.ts#L57) — IDE/Volar показывают предупреждение.

### Что нужно сделать

1. ~~Добавить новый event `close` или `update:show` рядом с `delete` (deprecation soft).~~ ✅ `close` добавлен.
2. ~~Console.warn при использовании `delete` в minor.~~ Отложено: без чистого способа детектировать конкретный listener это пустой шум. JSDoc `@deprecated` даёт IDE-warning; codemod в Wave 12 — путь миграции.
3. ~~В major (1.0) — убрать `delete`.~~ Запланировано: [Wave 12](../README.md#-wave-12--migration--dx) codemod.

## ~~Issue 6: prefers-reduced-motion / RTL / colors hardcode~~ cross-cutting — tracked elsewhere

- **Категория:** E29.7, F31, B10
- **Severity:** low
- **Status:** Badge сам по себе transitions/left-right-классов не имеет — fix идёт через cross-cutting Waves 8.1 (RTL), 9 (semantic tokens), 10.1 (reduced-motion). Badge-SFC ничего не меняет.

Cross-cutting. См. [button.md Issue 10](../button.md), [switch.md Issue 8, 12](../switch.md). Badge имеет `transition` через children Button.

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                                                                                                                                              |
| ------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `componentsOptions.Badge` | ✅          | mode, point, closeButton, class, classContent                                                                                                            |
| `componentsStyle` global  | ✅          | через mapping `filled→primary`, `outlined→outline`, `underlined→neutral` ([Badge.vue:17–23](../../../lib/badge/Badge.vue#L17-L23)) — resolved 2026-05-10 |
| `unstyled: true`          | ❌          | Issue 3 (cross-cutting, Wave 3.1)                                                                                                                        |
| Theme tokens vs hardcode  | ⚠️          | theme-_/neutral-_ через Tailwind; контрол через design tokens частичный                                                                                  |
| Runtime theme switch      | ✅          | через CSS-переменные theme-\*                                                                                                                            |
| `t()` для текста          | N/A         | контент через slot                                                                                                                                       |
| Runtime locale switch     | N/A         | —                                                                                                                                                        |

## Dual-API gap

Не применимо — Badge не collection.

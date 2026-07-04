---
title: Issues — Separator
summary: Аудит Separator — все пункты закрыты, включая B10 (semantic tokens). A4-5/C17/E29.1/F31/L53/A2/B10 закрыты.
updated: 2026-07-04
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/separator/
related-doc: ../components/separator.md
---

# Issues — Separator

## Сводка

| Severity | Count | Categories |
| -------- | ----- | ---------- |
| critical | 0     | —          |
| high     | 0     | —          |
| medium   | 0     | —          |
| low      | 0     | —          |

**Закрыто 2026-07-04:** B10 (semantic tokens) — `via-neutral-*`/`to-neutral-*`/`bg-neutral-*` (line gradient/fallback) и `text-gray-500` (content) мигрированы на `surface-*` family (тот же numeric tone, family rename без изменения значения) через новый semantic-слот `surface` в [lib/theme/primitive.ts:305-317](../../lib/theme/primitive.ts#L305-L317). Файл остаётся как исторический трекер (без открытых пунктов).
**Закрыто 2026-06-14:** A4-5 (exports map — наследуется от root `buildRootExports()`, ✅ 2026-06-11), C17 (SSR styles — `Component.__hooks()` → `onServerPrefetch`, regression-probe именно на Separator в [ssrStyles.test.ts](../../lib/component/ssrStyles.test.ts)), F31 (logical `contentPosition` start/end + deprecated left/right + dev-warn + RTL gradient — зеркало [button.md Issue 3](./button.md)).
**Закрыто 2026-06-06:** A2 (per-component `sideEffects`), E29.1 (`role="separator"` + `aria-orientation`), L53 (`unstyled` — regression-тест к cross-cutting guard). E29.7 (motion) — N/A (нет анимаций). Зачёркнуто ниже с `✅ resolved`-маркерами.

## Issue 1: SSR styles + sideEffects/exports map / unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

**Статус (2026-06-14):**

- **sideEffects (A2):** ✅ resolved — [lib/separator/package.json](../../lib/separator/package.json) помечен `"sideEffects": false` (нет SFC `<style>`, стили инжектятся в runtime через `setStyle`; precedent — Dialog/FixWindow).
- **unstyled (L53):** ✅ resolved — наследуется из cross-cutting guard `Component.setStyle()` ([component/index.ts:138](../../lib/component/index.ts#L138), ✅ 2026-05-11); regression-тест добавлен в [Separator.test.ts](../../lib/separator/Separator.test.ts) (describe "Unstyled mode").
- **SSR styles (C17):** ✅ resolved 2026-06-14 — дубль `Separator.initStyle()` снят в Wave 2.3 (comment-marker канона в [Separator.vue:134](../../lib/separator/Separator.vue#L134)); SSR-инжекция наследуется из `Component.__hooks()` → `onServerPrefetch` ([button.md Issue 1](./button.md)). Базовый `renderToString`-критерий на уровне `Component` **выполнен** и проверяется regression-probe'ом именно на Separator: [lib/component/ssrStyles.test.ts](../../lib/component/ssrStyles.test.ts) (`renderToString(createSSRApp(Separator))` → `cssComponents.has("Separator")` без client mount → доказывает `onServerPrefetch`-путь).
- **exports map (A4-5):** ✅ resolved 2026-06-14 — корневая `exports`-карта генерируется build-step'ом [`buildRootExports()`](../../lib/rollup.config.js) strict-superset'ом (✅ 2026-06-11, [button.md Issue 9](./button.md), [table.md Issue 5](./table.md)); субпуть `fishtvue/separator` собирается из вложенного [lib/separator/package.json](../../lib/separator/package.json) (lowercase `import` `separator.mjs` + PascalCase `types` `Separator.d.ts`). Per-component правок не требуется; контракт — [lib/package.test.ts](../../lib/package.test.ts).

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

## ~~Issue 3: RTL — `contentPosition: "left" | "right"` буквальное~~ ✅ resolved 2026-06-14

- **Категория:** F31
- **Severity:** ~~medium~~
- **Где:** [Separator.d.ts:28-41](../../lib/separator/Separator.d.ts#L28-L41), [Separator.vue:20-25](../../lib/separator/Separator.vue#L20-L25), [Separator.vue:152-161](../../lib/separator/Separator.vue#L152-L161)
- **Resolution:** `contentPosition` принимает logical `"start" | "end"` (+ `"center" | "full"`); `"left" | "right"` сохранены как deprecated алиасы (`left → start`, `right → end`) через type-union + computed-нормализацию ([Separator.vue:20](../../lib/separator/Separator.vue#L20)). Порядок line-сегментов зеркалится **бесплатно** через flex main-axis корня (`relative flex`) — под `dir="rtl"` сегмент `data-separator-left` визуально уходит вправо, поэтому `start`-контент остаётся у логического начала; отдельный CSS/`useDirectionality()` не нужен (зеркало [button.md Issue 3](./button.md)). Градиентная заливка горизонтальных сегментов зеркалится `rtl:`-вариантом (`bg-gradient-to-r rtl:bg-gradient-to-l` / `bg-gradient-to-l rtl:bg-gradient-to-r`, движок знает `specialStates rtl/ltr`). `onMounted` dev-warn при использовании deprecated значений ([Separator.vue:136-147](../../lib/separator/Separator.vue#L136-L147)). Тесты — [Separator.test.ts](../../lib/separator/Separator.test.ts) describe "RTL & logical contentPosition (Issue 3 / F31)".

> **Примечание о старом deferral.** Прежний статус «⏳ deferred → зависит от `useDirectionality()`» был ошибочным: [button.md Issue 3](./button.md) (закрыт 2026-06-07) доказал, что composable не нужен — RTL-порядок делегируется flex-направлению. Roadmap-пункт `useDirectionality()` ([README.md 8.1](./README.md)) остаётся отдельной задачей auto-detect `<html dir>`, но не блокирует logical-миграцию `contentPosition`.

### Что было сделано

1. ✅ API изменён на `contentPosition?: "start" | "end" | "center" | "full" | "left" | "right"` в [Separator.d.ts](../../lib/separator/Separator.d.ts); `"left" | "right"` — deprecated алиасы (JSDoc-нота).
2. ✅ computed `content` нормализует `left → start`, `right → end`, default `center`; exposed-тип сужен до logical-union.
3. ✅ Template-условия сегментов: `!['start','full']` (левый) / `!['end','full']` (правый); RTL-флип — через flex, без `dir`-атрибута (`direction` дефолтит ltr).
4. ✅ `rtl:bg-gradient-to-*` зеркало направления градиента (горизонтальная ветка).
5. ✅ `onMounted` dev-warn (`[FishtVue Separator] contentPosition="…" is deprecated; use "…"`).

### Acceptance criteria

- [x] `contentPosition: "start"` скрывает левый сегмент (логическое начало), `"end"` — правый; exposed `content` нормализован.
- [x] Существующие `"left"/"right"` продолжают работать (deprecation soft) и рендерят идентично logical-эквиваленту.
- [x] Console-warn при deprecated значении; нет warn для logical.
- [x] Горизонтальный градиент несёт `rtl:`-вариант направления.

## Issue 4: prefers-reduced-motion / colors

- **prefers-reduced-motion (E29.7):** N/A — Separator не использует `transition-*` / анимаций ([Separator.vue](../../lib/separator/Separator.vue)), guard'ить нечего.
- **colors (B10):** ~~⏳ deferred → Wave 9~~ ✅ resolved 2026-07-04

### ~~Что было~~

`via-neutral-200 dark:via-neutral-800 to-neutral-200 dark:to-neutral-800` + `bg-neutral-200 dark:bg-neutral-800` (line gradient/fallback, [Separator.vue:77-78,109-110](../../lib/separator/Separator.vue#L77-L78)) и `text-gray-500` (content text, [Separator.vue:88](../../lib/separator/Separator.vue#L88)) — хардкоженные Tailwind color-primitive классы вместо semantic design-token.

### Что было сделано

Family rename (тот же numeric tone, значение не менялось) на новый `surface` semantic-слот ([lib/theme/primitive.ts:305-317](../../lib/theme/primitive.ts#L305-L317), дефолт — точная копия `gray`-шкалы; `namesColors` union в [Theme.d.ts:187](../../lib/theme/Theme.d.ts#L187)):

- `via-neutral-200 dark:via-neutral-800 to-neutral-200 dark:to-neutral-800` → `via-surface-200 dark:via-surface-800 to-surface-200 dark:to-surface-800` ([Separator.vue:77,109](../../lib/separator/Separator.vue#L77))
- `bg-neutral-200 dark:bg-neutral-800` → `bg-surface-200 dark:bg-surface-800` ([Separator.vue:78,110](../../lib/separator/Separator.vue#L78))
- `text-gray-500` → `text-surface-500` ([Separator.vue:88](../../lib/separator/Separator.vue#L88))

Regression-тесты — [Separator.test.ts](../../lib/separator/Separator.test.ts) describe "Semantic color tokens (Issue 4 / B10)": проверяют наличие `surface-*` классов на line-сегментах и content, и отсутствие `neutral-*`/`text-gray-*` в рендере.

Cross-cutting motion-safe pattern (если анимации появятся) — [done/button.md Issue 10](./done/button.md).

## Cross-cutting: Configuration support

| Настройка                     | Поддержано? | Комментарий                                      |
| ----------------------------- | ----------- | ------------------------------------------------- |
| `componentsOptions.Separator` | ✅          | gradient, depth, contentPosition                 |
| `componentsStyle` global      | ❌          | Separator не имеет mode-enum, не пересекается    |
| `unstyled: true`              | ✅          | через `Component.setStyle()` guard (Issue 1)     |
| Theme tokens vs hardcode      | ✅          | `surface-*` semantic tokens (B10, ✅ 2026-07-04)  |
| `t()` для текста              | N/A         | content через slot                               |

## Dual-API gap

Не применимо.

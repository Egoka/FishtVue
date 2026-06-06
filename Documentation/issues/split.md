---
title: Issues — Split
summary: Аудит Split. Закрыто 2026-06-06 — Issue 1 (body.classList → drag overlay), 2 (coverage 60→85% / 39→70% branch, 7→31 тестов), 3 (dup initStyle снят Wave 2.3 + per-component sideEffects + unstyled regression), 4 (aria-orientation + aria-controls; role/valuenow уже были), 5 (keyboard resize), 6 (localStorage persistence реализована, isClient-guarded), 8 (touch уже через Pointer Events + motion-safe). Остаются cross-cutting: A4-5 exports map (root, Wave 2.1), F31 RTL (Wave 8), G34, B10 colors (Wave 9).
updated: 2026-06-06
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/split/
related-doc: ../components/split.md
stability: stable
---

# Issues — Split

## Сводка

| Severity | Count | Categories              |
| -------- | ----- | ----------------------- |
| critical | 0     | —                       |
| high     | 1     | A4-5 (root exports map) |
| medium   | 2     | F31 (RTL), G34          |
| low      | 1     | B10 (colors)            |

## ~~Issue 1: Мутация `document.body.classList` — global side-effect~~ ✅ resolved 2026-06-06

- **Категория:** C13 (утечка структуры)
- **Severity:** ~~high~~
- **Где (было):** Split.vue `startResizePanel` / `stopResizePanel` / `watch(activeCursorPanel)`
- **Resolution:** курсор во время drag задаётся overlay-элементом `<div data-split-drag-overlay :class="classDragOverlay">` ([Split.vue:103-105](../../lib/split/Split.vue#L103-L105), [Split.vue:717](../../lib/split/Split.vue#L717)). Все три мутации `document.body.classList` и `watch(activeCursorPanel)` удалены. `classDragOverlay` (`fixed inset-0 z-[9999]` + `getStyleCursor(activeCursorPanel)`) реактивен и рендерится только при `isStartResize` → несколько Split на странице не конфликтуют, нет global state. Покрыто тестами «Issue 1 — drag overlay» (overlay появляется/исчезает + `document.body.classList` без `cursor-*`).

### Что найдено

```ts
document.body.classList.add(getStyleCursor(activeCursorPanel.value))
...
document.body.classList.remove(getStyleCursor(activeCursorPanel.value))
```

При drag-resize Split добавляет cursor-class к `document.body`. Это глобальное состояние:

- Конфликт с пользовательскими classes на body.
- При unmount во время active drag — class остаётся (resolved через onUnmounted? Нужно проверить ниже).
- Конфликт с другими Split-компонентами на странице (двух split-панелей одновременно — race condition).

### Что нужно сделать

1. Применять cursor-style к локальному overlay div (`<div class="split-drag-overlay" :class="cursor">`), не к body.
2. Overlay покрывает всю страницу via `position: fixed; inset: 0; z-index: 9999;` только во время drag.
3. Преимущества:
   - Нет global state мутации.
   - Множественные Split не конфликтуют.
   - Auto-cleanup при v-if/Teleport unmount.

### Acceptance criteria

- [x] `document.body.classList` не модифицируется Split. ✅
- [x] Two simultaneous Split с разной orientation работают без race (overlay локален для каждого instance). ✅

## ~~Issue 2: Coverage 60% statements / 39% branch — beta-stability~~ ✅ resolved 2026-06-06

- **Категория:** J46, K46
- **Severity:** ~~high~~
- **Где:** [Split.test.ts](../../lib/split/Split.test.ts) (7 → 31 tests)
- **Resolution:** `Split.vue` coverage **60.48 → 85.43%** statements / **39.15 → 70.35%** branch. Добавлены тесты на: pointer-drag flow, min/max constraints, pixel vs percent units, horizontal/vertical, hidden/disabled панели, persistence save/restore, keyboard resize, ARIA, overlay, unstyled, motion-safe. Геометро-зависимые ветви (`resizePanel` math, `updatePanels` pixel-recalc) покрыты через mock `getBoundingClientRect`/`offsetWidth` и mock `ResizeObserver`. Branch ≥ 70% → переход beta → stable.

### Что найдено (исторически)

```
lib/split: 60.48 / 39.15 / 72.41 / 64.25
```

Очень низкий branch coverage (39%). Основные ветви resize-логики, persistence, panels-API не покрыты.

## Issue 3: SSR styles + sideEffects/exports map / unstyled — **partial**

См. [button.md Issue 1, 8, 9, 14](./button.md).

- ~~**C17 dup initStyle**~~ ✅ resolved 2026-06-06 — удалён ручной `Split.initStyle()` из `onMounted`; стиль инжектится только через `Component.__hooks()` (Wave 2.3, прогресс 13/22). Comment-marker канона — [Split.vue:154](../../lib/split/Split.vue#L154).
- ~~**A2 sideEffects**~~ ✅ resolved 2026-06-06 — `"sideEffects": false` в [lib/split/package.json](../../lib/split/package.json) (в SFC нет `<style>`; precedent — Separator). Wave 2.1 per-component.
- ~~**L53 unstyled**~~ ✅ resolved (cross-cutting Wave 3.1, [component/index.ts:138](../../lib/component/index.ts#L138)) — regression-тест «respects unstyled: true via Component.setStyle guard» в [Split.test.ts](../../lib/split/Split.test.ts).
- **A4-5 exports map** — open (root-level, Wave 2.1), см. [button.md Issue 9](./button.md).

## ~~Issue 4: ARIA role="separator" + aria-controls для resize handle~~ ✅ resolved 2026-06-06

- **Категория:** E29.1
- **Severity:** ~~medium~~
- **Где:** [Split.vue:674-685](../../lib/split/Split.vue#L674-L685)
- **Resolution:** `role="separator"`, `tabindex="0"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax` уже присутствовали; добавлены `:aria-orientation="direction"` и `:aria-controls="panelDomId(panel.name)"` (`panelDomId` через SSR-safe `useId()`, тот же `id` на `data-split-item` — [Split.vue:655](../../lib/split/Split.vue#L655)). `aria-valuenow` округляется (`Math.round`). Disabled-разделитель помечен `aria-disabled="true"` + `:aria-orientation` ([Split.vue:711-715](../../lib/split/Split.vue#L711-L715)). Покрыто блоком тестов «Issue 4 — ARIA on resize handle».

### Что найдено (исторически)

Resize handle уже имел `role="separator"`, `tabindex`, `aria-valuenow/min/max`, но без `aria-orientation` и `aria-controls`.

### Что нужно сделать

1. На resize handle:
   ```vue
   <div
     role="separator"
     :aria-orientation="direction"
     :aria-valuenow="panelSize"
     :aria-valuemin="minSize"
     :aria-valuemax="maxSize"
     :aria-controls="panelId"
     tabindex="0"
     @keydown.left="..."
     @keydown.right="..." />
   ```

## ~~Issue 5: Keyboard navigation (стрелки для resize) отсутствует~~ ✅ resolved 2026-06-06

- **Категория:** E29.2
- **Severity:** ~~medium~~
- **Где:** [onSeparatorKeydown — Split.vue:453](../../lib/split/Split.vue#L453), [keyboardResize — Split.vue:428](../../lib/split/Split.vue#L428), handle `@keydown` — [Split.vue:685](../../lib/split/Split.vue#L685)
- **Resolution:** на focused separator (`tabindex="0"`) добавлен `@keydown`. Direction-aware (как в Menu): horizontal — `ArrowRight`/`ArrowLeft`, vertical — `ArrowDown`/`ArrowUp`; шаг 10, с `Shift` — 50; `Home`/`End` — к минимуму/максимуму. `keyboardResize` переносит размер между смежными панелями с клампами min/max/0, эмитит `updated-panels` + `updated-size-panel` и вызывает `persistSizes()`. `preventDefault` на обрабатываемых клавишах. Покрыто блоком «Issue 5 — keyboard resize» (6 кейсов). Задокументировано в [components/split.md §12](../components/split.md).

### Что найдено (исторически)

Resize только через pointer drag. Keyboard-users не могли изменить размер панели.

### Что нужно сделать

1. На resize handle добавить tabindex и keydown handlers:
   ```ts
   function onKeydown(event: KeyboardEvent) {
     const step = event.shiftKey ? 50 : 10
     if (event.key === "ArrowRight") movePanel(step)
     if (event.key === "ArrowLeft") movePanel(-step)
   }
   ```
2. Документировать в [components/split.md](../components/split.md) §12 A11y.

## ~~Issue 6: Persistence — `localStorage` без SSR guard~~ ✅ resolved 2026-06-06

- **Категория:** C14 + persistence
- **Severity:** ~~medium~~
- **Где:** [storageKey/persistSizes/restoreSizes — Split.vue:396-426](../../lib/split/Split.vue#L396-L426)
- **Resolution:** аудит показал, что persistence вообще **не была реализована** — `autoSaveName` рендерился лишь как `:data-name`, а docs/JSDoc обещали `localStorage["fv-split-{key}"]` (documentation lie). Persistence реализована полностью и сразу SSR-safe: `persistSizes()` (запись `JSON.stringify(sizePanels)` на конец resize — pointer и keyboard) и `restoreSizes()` (чтение + парс + валидация `typeof v === "number" && v >= 0` + кламп по min/max, вызов в `onMounted` **до** `updatePanels`) обёрнуты в `isClient() && props.autoSaveName` + `try/catch`. На SSR — no-op. Повреждённые данные игнорируются. JSDoc `autoSaveName` обновлён ([Split.d.ts:116-122](../../lib/split/Split.d.ts#L116-L122)). Покрыто блоком «Issue 6 — localStorage persistence» (save / restore / clamp / no-autoSaveName / malformed).

### Что найдено (исторически)

`autoSaveName` присутствовал в `SplitProps`, но никакого `localStorage` в `lib/split` не было — feature отсутствовала, при этом документация её обещала.

## Issue 7: RTL для horizontal direction — **deferred (Wave 8)**

- **Категория:** F31
- **Severity:** medium

В RTL «left panel» становится «right panel». `cursor: ew-resize` симметричен, OK. Но порядок панелей может ожидаться зеркальным. Cross-cutting RTL-audit (logical CSS properties) трекается на уровне всех компонентов — отложено в Wave 8, как у Menu/Label/Aria.

## Issue 8: prefers-reduced-motion / mobile touch

- **Категория:** E29.7, N57

- ~~**N57 touch**~~ ✅ resolved 2026-06-06 (уже было) — resize реализован через **Pointer Events** (`pointerdown/move/up/cancel/out` + `setPointerCapture`, [Split.vue:607-641](../../lib/split/Split.vue#L607-L641)), что покрывает mouse + touch + pen; `touch-none` на разделителе ([Split.vue:80](../../lib/split/Split.vue#L80)) предотвращает scroll-конфликт. Исходное утверждение «только mouse» было неверным. Покрыто существующим pointer-drag тестом.
- ~~**E29.7 reduced-motion**~~ ✅ resolved 2026-06-06 — `transition-all` корня → `motion-safe:transition-all` ([Split.vue:95](../../lib/split/Split.vue#L95)); `transition-opacity duration-500` иконки разделителя → `motion-safe:` ([Split.vue:89](../../lib/split/Split.vue#L89)). Regression-тест «wraps root transition in motion-safe:». Зеркалит [done/button.md Issue 10](./done/button.md).

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                        |
| ------------------------- | ----------- | ---------------------------------- |
| `componentsOptions.Split` | ✅          | direction, panels, persistence     |
| `componentsStyle` global  | ❌          | Split не имеет mode-enum           |
| `unstyled: true`          | ✅          | Issue 3 — cross-cutting `Component.setStyle()` guard (Wave 3.1) |
| Theme tokens vs hardcode  | ⚠️          | B10 — resize-handle цвета hardcode, → Wave 9 |
| `t()` для текста          | N/A         | контент через slot                 |

## Dual-API gap

Не применимо в strong форме. Slabo — `<Split><SplitPanel size="30">A</SplitPanel><SplitPanel>B</SplitPanel></Split>` имел бы смысл, но не critical (текущий schema-driven через `:panels` массив достаточно гибок).

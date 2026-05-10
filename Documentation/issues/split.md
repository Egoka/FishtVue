---
title: Issues — Split
summary: Аудит Split — beta stability (coverage 60%), document.body.classList мутация, отсутствие ARIA роли, persistence не SSR-safe.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/split/
related-doc: ../components/split.md
stability: beta
---

# Issues — Split

## Сводка

| Severity | Count | Categories                                              |
| -------- | ----- | ------------------------------------------------------- |
| critical | 0     | —                                                       |
| high     | 5     | A2, A4-5, C13 (body.classList), C17, J46 (low coverage) |
| medium   | 5     | E29.1, E29.2 (keyboard), F31, G34, K46 (branch 39%)     |
| low      | 3     | E29.7, B10, N57                                         |

## Issue 1: Мутация `document.body.classList` — global side-effect

- **Категория:** C13 (утечка структуры)
- **Severity:** high
- **Где:** [Split.vue:525](../../lib/split/Split.vue#L525), [Split.vue:534](../../lib/split/Split.vue#L534), [Split.vue:558-559](../../lib/split/Split.vue#L558-L559)

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

- [ ] `document.body.classList` не модифицируется Split.
- [ ] Two simultaneous Split с разной orientation работают без race.

## Issue 2: Coverage 60% statements / 39% branch — beta-stability

- **Категория:** J46, K46
- **Severity:** high
- **Где:** [Split.test.ts](../../lib/split/Split.test.ts) (7 tests)

### Что найдено

```
lib/split: 60.48 / 39.15 / 72.41 / 64.25
```

Очень низкий branch coverage (39%). Основные ветви resize-логики, persistence, panels-API не покрыты.

### Что нужно сделать

1. Добавить тесты для:
   - Resize handle drag (mousedown → mousemove → mouseup flow).
   - Min/max size constraints.
   - Persist save/restore.
   - Hidden panels.
   - Pixel vs percent units.
   - Direction `horizontal` vs `vertical`.
2. Целевой branch coverage > 70% для перехода beta → stable.

## Issue 3: SSR styles + sideEffects/exports map / unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 4: ARIA role="separator" + aria-controls для resize handle

- **Категория:** E29.1
- **Severity:** medium
- **Где:** [Split.vue](../../lib/split/Split.vue) (resize handle render)

### Что найдено

Resize handle (drag-bar between panels) — без `role="separator" aria-orientation="horizontal|vertical"`. Без `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

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

## Issue 5: Keyboard navigation (стрелки для resize) отсутствует

- **Категория:** E29.2
- **Severity:** medium
- **Где:** [Split.vue](../../lib/split/Split.vue)

### Что найдено

Resize только через mouse drag. Keyboard-users не могут изменить размер панели.

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

## Issue 6: Persistence — `localStorage` без SSR guard

- **Категория:** C14 + persistence
- **Severity:** medium
- **Где:** [Split.vue](../../lib/split/Split.vue) (persist logic)

### Что найдено

Если Split persist'ится через localStorage — на SSR `localStorage` undefined → крэш. Нужно проверить наличие `if (isClient())` guards.

### Что нужно сделать

Audit persist save/restore через `isClient()` или `typeof localStorage !== "undefined"`.

## Issue 7: RTL для horizontal direction

- **Категория:** F31

В RTL «left panel» становится «right panel». `cursor: ew-resize` симметричен, OK. Но порядок панелей может ожидаться зеркальным.

## Issue 8: prefers-reduced-motion / mobile touch

- **Категория:** E29.7, N57

Drag-resize на mobile: нужны touch-event handlers (touchstart, touchmove, touchend). Сейчас только mouse. Mobile users не могут resize.

См. [done/button.md Issue 10](./done/button.md) для motion-safe pattern.

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                        |
| ------------------------- | ----------- | ---------------------------------- |
| `componentsOptions.Split` | ✅          | direction, panels, persistence     |
| `componentsStyle` global  | ❌          | Split не имеет mode-enum           |
| `unstyled: true`          | ❌          | Issue 3                            |
| Theme tokens vs hardcode  | ⚠️          | resize-handle цвета через theme-\* |
| `t()` для текста          | N/A         | контент через slot                 |

## Dual-API gap

Не применимо в strong форме. Slabo — `<Split><SplitPanel size="30">A</SplitPanel><SplitPanel>B</SplitPanel></Split>` имел бы смысл, но не critical (текущий schema-driven через `:panels` массив достаточно гибок).

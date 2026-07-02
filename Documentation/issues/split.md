---
title: Issues — Split
summary: Аудит Split. Закрыто 2026-06-06 — Issue 1 (body.classList → drag overlay), 2 (coverage 60→85% / 39→72% branch, 7→32 теста), 3 (dup initStyle снят Wave 2.3 + per-component sideEffects + unstyled regression), 4 (aria-orientation + aria-controls; role/valuenow уже были), 5 (keyboard resize), 6 (localStorage persistence реализована, isClient-guarded), 8 (touch уже через Pointer Events + motion-safe). Закрыто 2026-06-13 — A4-5 (inherited root exports map, Wave 2.1), F31 (RTL: dir-aware resize-математика + keyboard, без логических классов — Split не имеет физических left/right offset'ов), G34 (root-ref expose `resizableGroup` + `focus()`), B10 (resize-handle: forced-colors:outline + grip через preset-aware theme-* токен). Закрыто 2026-06-14 — follow-up к Issue 1: overlay (cursor-*-resize) залипал при release указателя вне компонента → drag завершается window-safety-net (`pointerup`/`pointercancel`) + идемпотентный `stopResizePanel`. Закрыто 2026-07-02 — Issue 11 (focus-ring разделителя: несуществующий shadcn-токен `ring-ring` → `ring-theme-600/700`). Матрица 0/0/0/0. Файл остаётся active как трекер cross-cutting shadcn-semantic-token миграции (theme.md Issue 1 / Wave 9), как pagination/form/table.
updated: 2026-07-02
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/split/
related-doc: ../components/split.md
stability: stable
---

# Issues — Split

## Сводка

| Severity | Count | Categories |
| -------- | ----- | ---------- |
| critical | 0     | —          |
| high     | 0     | —          |
| medium   | 0     | —          |
| low      | 0     | —          |

> Все numbered + matrix-категории закрыты (matrix `0/0/0/0`). Файл остаётся в `active/` как трекер cross-cutting shadcn-semantic-token миграции (extension theme-движка — [theme.md Issue 1](./theme.md) / Wave 9), которая ещё не выполнена ни для одного компонента. Зеркало [pagination.md](./pagination.md)/[form.md](./form.md)/[table.md](./table.md).

## ~~Issue 1: Мутация `document.body.classList` — global side-effect~~ ✅ resolved 2026-06-06

- **Категория:** C13 (утечка структуры)
- **Severity:** ~~high~~
- **Где (было):** Split.vue `startResizePanel` / `stopResizePanel` / `watch(activeCursorPanel)`
- **Resolution:** курсор во время drag задаётся overlay-элементом `<div data-split-drag-overlay :class="classDragOverlay">` ([Split.vue:106-108](../../lib/split/Split.vue#L106-L108), [Split.vue:762](../../lib/split/Split.vue#L762)). Все три мутации `document.body.classList` и `watch(activeCursorPanel)` удалены. `classDragOverlay` (`fixed inset-0 z-[9999]` + `getStyleCursor(activeCursorPanel)`) реактивен и рендерится только при `isStartResize` → несколько Split на странице не конфликтуют, нет global state. Покрыто тестами «Issue 1 — drag overlay» (overlay появляется/исчезает + `document.body.classList` без `cursor-*`).

### ~~Follow-up: overlay залипал при release вне компонента~~ ✅ resolved 2026-06-14

- **Severity:** ~~high~~ (regression от overlay-подхода выше)
- **Где (было):** Split.vue `stopResizePanel` висел исключительно на separator `@pointerup`/`@pointercancel`.
- **Что найдено:** overlay гасится только когда `isStartResize → false` (это делает `stopResizePanel`). Если указатель уводили **за пределы компонента** и отпускали там, событие на separator не приходило (pointer capture не всегда доставляет `pointerup` обратно на handle — например при overlay поверх или non-HTMLElement target), `stopResizePanel` не вызывался → overlay `fixed inset-0` с `cursor-*-resize` залипал и блокировал весь сайт.
- **Resolution:** на `startResizePanel` ставятся window-листенеры `pointerup`/`pointercancel` (safety-net), которые завершают drag независимо от места release; снимаются на stop и на `onUnmounted` ([startResizePanel/stopResizePanel — Split.vue:636-685](../../lib/split/Split.vue#L636-L685), teardown в `onUnmounted` — [Split.vue:182-189](../../lib/split/Split.vue#L182-L189)). `stopResizePanel` сделан идемпотентным (`if (!isStartResize.value) return`) — двойной вызов (separator + window при release внутри) не дублирует `emit`/`persistSizes`. Заодно `$event?.pointerId` → `$event.pointerId != null` (`pointerId === 0` — валидный id touch/pen). Покрыто блоком тестов «drag teardown on pointerup outside the component» (window `pointerup`/`pointercancel` гасит overlay; нет повторного `stop-resize-panel` на посторонний window `pointerup`).

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
- **Где:** [Split.test.ts](../../lib/split/Split.test.ts) (7 → 32 tests)
- **Resolution:** `Split.vue` coverage **60.48 → 85.19%** statements / **39.15 → 71.77%** branch. Добавлены тесты на: pointer-drag flow, min/max constraints, pixel vs percent units (включая default-size без явного `size`), horizontal/vertical, hidden/disabled панели, persistence save/restore, keyboard resize, ARIA, overlay, unstyled, motion-safe. Геометро-зависимые ветви (`resizePanel` math, `updatePanels` pixel-recalc) покрыты через mock `getBoundingClientRect`/`offsetWidth` и mock `ResizeObserver`. Branch ≥ 70% → переход beta → stable.

### Что найдено (исторически)

```
lib/split: 60.48 / 39.15 / 72.41 / 64.25
```

Очень низкий branch coverage (39%). Основные ветви resize-логики, persistence, panels-API не покрыты.

## ~~Issue 3: SSR styles + sideEffects/exports map / unstyled~~ ✅ resolved 2026-06-13

См. [button.md Issue 1, 8, 9, 14](./button.md).

- ~~**C17 dup initStyle**~~ ✅ resolved 2026-06-06 — удалён ручной `Split.initStyle()` из `onMounted`; стиль инжектится только через `Component.__hooks()` (Wave 2.3, прогресс 13/22). Comment-marker канона — [Split.vue:167](../../lib/split/Split.vue#L167).
- ~~**A2 sideEffects**~~ ✅ resolved 2026-06-06 — `"sideEffects": false` в [lib/split/package.json](../../lib/split/package.json) (в SFC нет `<style>`; precedent — Separator). Wave 2.1 per-component.
- ~~**L53 unstyled**~~ ✅ resolved (cross-cutting Wave 3.1, [component/index.ts:138](../../lib/component/index.ts#L138)) — regression-тест «respects unstyled: true via Component.setStyle guard» в [Split.test.ts](../../lib/split/Split.test.ts).
- ~~**A4-5 exports map**~~ ✅ resolved 2026-06-11 (inherited, Wave 2.1) — корневая `exports`-карта генерируется build-step'ом [`buildRootExports()`](../../lib/rollup.config.js); субпуть `fishtvue/split` (`./split` → `split.mjs` + `Split.d.ts`) входит в strict-superset карты (per-component задачи нет). Контракт — [lib/package.test.ts](../../lib/package.test.ts). См. [button.md Issue 9](./button.md), [table.md Issue 5](./table.md).

## ~~Issue 4: ARIA role="separator" + aria-controls для resize handle~~ ✅ resolved 2026-06-06

- **Категория:** E29.1
- **Severity:** ~~medium~~
- **Где:** [Split.vue:708-730](../../lib/split/Split.vue#L708-L730)
- **Resolution:** `role="separator"`, `tabindex="0"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax` уже присутствовали; добавлены `:aria-orientation="direction"` и `:aria-controls="panelDomId(panel.name)"` (`panelDomId` через SSR-safe `useId()`, тот же `id` на `data-split-item` — [Split.vue:699](../../lib/split/Split.vue#L699)). `aria-valuenow` округляется (`Math.round`). Disabled-разделитель помечен `aria-disabled="true"` + `:aria-orientation` ([Split.vue:754-760](../../lib/split/Split.vue#L754-L760)). Покрыто блоком тестов «Issue 4 — ARIA on resize handle».

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
- **Где:** [onSeparatorKeydown — Split.vue:479](../../lib/split/Split.vue#L479), [keyboardResize — Split.vue:454](../../lib/split/Split.vue#L454), handle `@keydown` — [Split.vue:730](../../lib/split/Split.vue#L730)
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
- **Где:** [storageKey/persistSizes/restoreSizes — Split.vue:422-451](../../lib/split/Split.vue#L422-L451)
- **Resolution:** аудит показал, что persistence вообще **не была реализована** — `autoSaveName` рендерился лишь как `:data-name`, а docs/JSDoc обещали `localStorage["fv-split-{key}"]` (documentation lie). Persistence реализована полностью и сразу SSR-safe: `persistSizes()` (запись `JSON.stringify(sizePanels)` на конец resize — pointer и keyboard) и `restoreSizes()` (чтение + парс + валидация `typeof v === "number" && v >= 0` + кламп по min/max, вызов в `onMounted` **до** `updatePanels`) обёрнуты в `isClient() && props.autoSaveName` + `try/catch`. На SSR — no-op. Повреждённые данные игнорируются. JSDoc `autoSaveName` обновлён ([Split.d.ts:116-122](../../lib/split/Split.d.ts#L116-L122)). Покрыто блоком «Issue 6 — localStorage persistence» (save / restore / clamp / no-autoSaveName / malformed).

### Что найдено (исторически)

`autoSaveName` присутствовал в `SplitProps`, но никакого `localStorage` в `lib/split` не было — feature отсутствовала, при этом документация её обещала.

## ~~Issue 7: RTL для horizontal direction~~ ✅ resolved 2026-06-13

- **Категория:** F31
- **Severity:** ~~medium~~
- **Где:** [isRtlHorizontal — Split.vue:412](../../lib/split/Split.vue#L412), [resizePanel — Split.vue:564-569](../../lib/split/Split.vue#L564-L569), [onSeparatorKeydown — Split.vue:479-488](../../lib/split/Split.vue#L479-L488)
- **Resolution:** у Split нет физических `left/right` / `pl/pr` / `ml/mr` offset'ов (после-псевдоэлемент центрируется `left-1/2 -translate-x-1/2` — симметрично; вертикальный вариант `inset-y-0` / full-width — тоже симметричны), поэтому логические-классы менять не пришлось — баг был только в **пиксельной resize-математике**. Введён `isRtlHorizontal()` ([Split.vue:412](../../lib/split/Split.vue#L412), `getComputedStyle(resizableGroup).direction === "rtl"`, client-only; зеркало [table.md Issue 11](./table.md)). В RTL: pointer-`addedDistance` считается от **левого** края панели (`panel.x - clientX` вместо `clientX - panel.x - width`), а стрелки инвертируются (`ArrowLeft` растит ведущую панель, `ArrowRight` ужимает); vertical не зависит от dir. Покрыто блоком тестов «F31 — RTL» (keyboard-инверсия + pointer-математика через mock `getComputedStyle`).

## Issue 8: prefers-reduced-motion / mobile touch

- **Категория:** E29.7, N57

- ~~**N57 touch**~~ ✅ resolved 2026-06-06 (уже было) — resize реализован через **Pointer Events** (`pointerdown/move/up/cancel/out` + `setPointerCapture` + window-safety-net на release вне компонента, [Split.vue:636-685](../../lib/split/Split.vue#L636-L685)), что покрывает mouse + touch + pen; `touch-none` на разделителе ([Split.vue:83](../../lib/split/Split.vue#L83)) предотвращает scroll-конфликт. Исходное утверждение «только mouse» было неверным. Покрыто существующим pointer-drag тестом.
- ~~**E29.7 reduced-motion**~~ ✅ resolved 2026-06-06 — `transition-all` корня → `motion-safe:transition-all` ([Split.vue:98](../../lib/split/Split.vue#L98)); `transition-opacity duration-500` иконки разделителя → `motion-safe:` ([Split.vue:92](../../lib/split/Split.vue#L92)). Regression-тест «wraps root transition in motion-safe:». Зеркалит [done/button.md Issue 10](./done/button.md).

## ~~Issue 9: G34 — root-ref expose~~ ✅ resolved 2026-06-13

- **Категория:** G34
- **Severity:** ~~medium~~
- **Где:** [focus — Split.vue:141-144](../../lib/split/Split.vue#L141-L144), [defineExpose — Split.vue:164](../../lib/split/Split.vue#L164), [SplitExpose.focus — Split.d.ts:290](../../lib/split/Split.d.ts#L290)
- **Resolution:** корневой DOM-узел уже экспонировался как `resizableGroup` (root `<div data-split>`); добавлен метод `focus()` — переводит фокус на первый resize handle (`[data-split-separator]`, `tabindex=0`), no-op на SSR / до mount. Зеркало Button `buttonRef`+`focus()` / Pagination `paginationRef`+`focus()` / Form `formElement`. Типизирован в `SplitExpose`. Покрыто тестом «G34 — exposes the root element and a focus() method».

## ~~Issue 10: B10 — resize-handle цвета (hardcode → tokens)~~ ✅ resolved 2026-06-13

- **Категория:** B10
- **Severity:** ~~low~~
- **Где:** [separatorClass — Split.vue:80](../../lib/split/Split.vue#L80), [grip-стили — Split.vue:128-136](../../lib/split/Split.vue#L128-L136), [icon — Split.vue:751](../../lib/split/Split.vue#L751)
- **Resolution (canon-safe, без правок theme-движка):** (1) **forced-colors** — `forced-colors:outline` на базовом классе разделителя ([Split.vue:80](../../lib/split/Split.vue#L80)) сохраняет его видимым в Windows high-contrast (где `bg-*` сбрасывается); зеркало [table.md Issue 12](./table.md) / [pagination.md Issue 8](./pagination.md). (2) **preset-aware токен** — грип-акцент (`classSeparatorStripStyle` / `classSeparatorIcon` / `classSeparatorHexagonStyle` + custom-icon) переведён с hardcode `bg-neutral-300 dark:bg-neutral-600` / `text-gray-500` на динамический `bg-theme-300 dark:bg-theme-700` / `text-theme-500` (`theme` — единственный preset-управляемый цвет через `var(--theme)`, см. [architecture/theme.md §10.3](../architecture/theme.md)). Структурная 1px-линия разделителя остаётся нейтральной (`bg-gray-200`) — это divider, не акцент. Покрыто блоком тестов «B10 — resize-handle colors».
- **Примечание:** полная shadcn-style semantic-token миграция (`bg-surface` / `border-border` — требует extension theme-движка + runtime `usePreset`; канон «не патчим движок») остаётся cross-cutting [theme.md Issue 1](./theme.md) / Wave 9, отдельно от Split.

## ~~Issue 11: `focus-visible:ring-ring` — несуществующий токен в focus-стиле разделителя~~ ✅ resolved 2026-07-02

- **Категория:** correctness (styling) / a11y
- **Severity:** ~~medium~~ → resolved
- **Где (was):** [separatorClass — Split.vue:85](../../lib/split/Split.vue#L85)

### Что найдено

`focus-visible:ring-ring` — copy-paste из shadcn-пресета (semantic-токен `ring`, которого в палитре FishtVue нет). Движок не генерировал для него валидного цвета: до fail-closed — мусорное правило `{ undefined }` в Split-теге, после (uno-engine.md Issue 1) — drop с dev-warn. Итог: keyboard-focus разделителя показывал ring **без цвета** (fallback `--fv-ring-color`), а не осмысленный акцент. Вскрыто sandbox-корпусным диффом волны 1 uno-движка.

### Что сделано

Замена на focus-идиому проекта ([Input.vue:171](../../lib/input/Input.vue#L171), [TextEditor.vue:175](../../lib/texteditor/TextEditor.vue#L175)): `focus-visible:ring-theme-600 dark:focus-visible:ring-theme-700` ([Split.vue:86](../../lib/split/Split.vue#L86)) — preset-aware `theme`-токен, согласован с B10-резолюцией (Issue 10). Regression-тест — [Split.test.ts](../../lib/split/Split.test.ts) («не использует несуществующий ring-ring»).

## Cross-cutting: Configuration support

| Настройка                 | Поддержано? | Комментарий                        |
| ------------------------- | ----------- | ---------------------------------- |
| `componentsOptions.Split` | ✅          | direction, panels, persistence     |
| `componentsStyle` global  | ❌          | Split не имеет mode-enum           |
| `unstyled: true`          | ✅          | Issue 3 — cross-cutting `Component.setStyle()` guard (Wave 3.1) |
| Theme tokens vs hardcode  | ✅          | B10 — грип через preset-aware `theme-*` + `forced-colors:outline`; shadcn-semantic-token extension → Wave 9 ([theme.md Issue 1](./theme.md)) |
| `t()` для текста          | N/A         | контент через slot                 |

## Dual-API gap

Не применимо в strong форме. Slabo — `<Split><SplitPanel size="30">A</SplitPanel><SplitPanel>B</SplitPanel></Split>` имел бы смысл, но не critical (текущий schema-driven через `:panels` массив достаточно гибок).

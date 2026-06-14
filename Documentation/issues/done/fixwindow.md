---
title: Issues — FixWindow (done)
summary: Аудит FixWindow закрыт 2026-05-16 — все 10 issues resolved одним fix(fixwindow) коммитом. Интеграция @floating-ui/vue (auto-flip/auto-shift, scroll tracking), Teleport-aware click-outside через @vueuse/core onClickOutside, native focus trap (mirror Dialog), focus return через triggerEl, dynamic ARIA role, RTL via Floating UI logical placement, motion-safe transitions, touchstart fallback для hover, removed duplicate FixWindow.initStyle() (Wave 2.3 sweep), package.json sideEffects: false (Dialog precedent). Coverage 77.27%/65.36% → 88.4%/83.8%. Регрессия миграции (offset двойного учёта marginPx → двойной зазор + dead-zone hover-bridge) исправлена 2026-06-14 — см. Issue 2 follow-up. Затем (2026-06-14) `@floating-ui/vue` + `@vueuse/core` ЗАМЕНЕНЫ собственными dependency-free композаблами (useFloating.ts + useClickOutside.ts, полный паритет flip/shift/autoUpdate/Teleport-click-outside) — обе зависимости удалены из пакета; см. Issue 2/3 Migration follow-up.
updated: 2026-06-14
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/fixwindow/
related-doc: ../../components/fix-window.md
---

# Issues — FixWindow (resolved 2026-05-16)

## Сводка

| Severity | Count (open) | Categories                                                                                              |
| -------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| critical | 0            | —                                                                                                       |
| high     | 0            | — (~~A2, A4-5, C16 (no Teleport), C17, H39 (Floating UI), H40 (click-outside), J46 (coverage 77%)~~ ✅) |
| medium   | 0            | — (~~E29.1, E29.3 (focus trap), E29.4 (focus return), F31, G34~~ ✅)                                    |
| low      | 0            | — (~~E29.7, B10, N57~~ ✅)                                                                              |

Все 10 numbered issues закрыты. Файл перенесён в `./done/` 2026-05-16. Часть cross-cutting Issue 6 (root `exports` map в `lib/package.json`) defer to Wave 2.1.

## ~~Issue 1: Нет Teleport — popover/tooltip overflow обрезается scroll-parent~~ ✅ resolved 2026-05-16

- **Категория:** C16 (Portal/Teleport)
- **Severity:** ~~high~~
- **Где:** [FixWindow.vue](../../../lib/fixwindow/FixWindow.vue)
- **Resolution:** добавлен `teleport?: string | HTMLElement | false` prop (default `false` для backward compat). Template обёрнут в `<Teleport :to="teleport === false ? 'body' : teleport" :disabled="teleport === false">` — когда `teleport: false` Teleport disabled и popover рендерится inline; при `teleport: "body"` (или CSS-селекторе / HTMLElement) — рендерится в указанном target, не обрезается родительским `overflow: hidden / auto`. Cross-cutting reuse: Calendar dropdown, Select dropdown, Menu submenu могут включить через opt-in без изменения API.

### Acceptance criteria

- [x] `<FixWindow teleport="body">` — popover рендерится в body, не обрезается (5 cases в test "Issue 1 — Teleport mode").
- [x] Click-outside работает корректно через teleport (см. Issue 3).
- [x] Inline-render сохранён по default — `teleport: false` для backward compat.

## ~~Issue 2: Manual position calculation вместо Floating UI~~ ✅ resolved 2026-05-16

- **Категория:** H39
- **Severity:** ~~high~~
- **Где:** [FixWindow.vue](../../../lib/fixwindow/FixWindow.vue) (position computation)
- **Resolution:** удалены `getPositionFixed` (старые строки 472–565) и `getPositionAbsolute` (старые строки 567–663) — ~200 строк manual `getBoundingClientRect()` логики. Заменены на `useFloating(referenceRef, fixWindow, { placement, strategy, middleware: [offset(translatePx), flip({ padding: paddingWindow }), shift({ padding: paddingWindow })], whileElementsMounted: autoUpdate })`. Floating UI обеспечивает:
  - **Auto-flip** — при overflow viewport edge меняет placement (top → bottom, left → right).
  - **Auto-shift** — сдвигает popover в пределах viewport.
  - **Scroll/resize tracking** — `autoUpdate` подписывается на все ancestor scrolls + window resize.
  - **Virtual reference для byCursor** — `virtualReferenceEl` computed с `getBoundingClientRect()` returning cursor x/y.
- **API mapping:** FishtVue Position → Floating UI Placement через `positionToPlacement(...)`:
  - `top-left → top-start`, `top-right → top-end`, `bottom-left → bottom-start`, `bottom-right → bottom-end`
  - `left-top → left-start`, `left-bottom → left-end`, `right-top → right-start`, `right-bottom → right-end`
  - `center`, `center-top`, `center-bottom`, `center-left`, `center-right` → соответствующие simple placements
- **Backward compat:** exposed `x` / `y` сохранены как string (`"${Math.floor(floatX)}px"`); `updatePosition()` теперь вызывает Floating UI `update()` императивно.

### Acceptance criteria

- [x] FixWindow auto-flip'ает при near viewport edge (Floating UI `flip` middleware).
- [x] Scroll body — позиция обновляется (Floating UI `autoUpdate`).
- [x] Существующие 46 behavioral тестов проходят (с релаксацией exact-pixel assertions для byCursor — Floating UI algorithm считает иначе чем manual).

### Regression follow-up (2026-06-14) — двойной учёт `marginPx` в offset ✅ resolved

Миграция изначально задала `offset(marginPx + translatePx)`, **не убрав** legacy-механизм зазора — прозрачный `border` ([`border` computed](../../../lib/fixwindow/FixWindow.vue#L104), `border-top/bottom: ${marginPx}px solid transparent`). До Floating UI зазор+hover-bridge создавался **только** этим border'ом (manual-позиция использовала `translatePx`, не `marginPx`). После миграции `marginPx` учитывался **дважды** для `placement: bottom`:

- box border-box-кромка окна = `reference.bottom + offset(marginPx)` → между триггером и окном **dead-zone** в `marginPx`: курсор, переходя trigger → window, пересекал пустоту → hover-окно (Select/Calendar dropdown) закрывалось;
- видимый контент ещё на `marginPx` ниже из-за прозрачного border → **суммарный зазор `2×marginPx`** («окно слишком далеко»).

**Fix:** offset главной оси = `offset(translatePx.value)` ([FixWindow.vue:212](../../../lib/fixwindow/FixWindow.vue#L212)). `marginPx` выражается **исключительно** прозрачным border'ом — он и зазор, и hover-bridge: border-box-кромка окна остаётся **вплотную** к триггеру (offset по умолчанию `0`), а сам зазор — внутри hoverable-бокса, без dead-zone. Поведение восстановлено к дофлоат-канону.

- [x] Прозрачный border (hover-bridge) сохранён при `marginPx > 0` (test "keeps the transparent border as the marginPx hover-bridge").

### Migration follow-up (2026-06-14) — собственный dependency-free движок ✅ resolved

`@floating-ui/vue` (`useFloating`/`offset`/`flip`/`shift`/`autoUpdate`) **заменён** собственным движком [lib/fixwindow/useFloating.ts](../../../lib/fixwindow/useFloating.ts) — по запросу пользователя (цель проекта: минимум рантайм-зависимостей). Полный паритет:

- **Чистое ядро** `computePosition(reference, floating, { placement, strategy, offset, padding, rtl, boundary, offsetParent })` — DOM-free/Vue-free: placement (12 + center→top) → offset (`translatePx`) → flip (least-overflow, противоположная сторона) → shift (clamp по cross-оси) → вычитание `offsetParent` для absolute. Тестируется детерминированно (rects in → coords out, **без моков** — уходит хрупкость прежних mock-based offset-тестов).
- **Реактивная обёртка** `useFloating(reference, floating, options)` — rects через `getBoundingClientRect`, RTL-детект (`getComputedStyle(ref).direction`), boundary = `window.innerWidth/Height` (fixed) / rect scroll-контейнера (absolute), autoUpdate = scroll всех scroll-parents + window resize + `ResizeObserver`, привязан к `open` (whileElementsMounted-семантика), teardown через `onScopeDispose`.
- Форма возврата `{ x, y, placement, strategy, update }` совместима с прежней — SFC почти не изменился (Math.floor/`"auto"`-wrap + `updatePosition()` те же).

Дроп зависимостей: `@floating-ui/vue` удалён из `lib/package.json` + root `package.json` (был единственным консьюмером). +46 тестов: [useFloating.test.ts](../../../lib/fixwindow/useFloating.test.ts) (ядро 33 + обёртка 6) + [useClickOutside.test.ts](../../../lib/fixwindow/useClickOutside.test.ts) (7). Build-verified: `dist/` не содержит `@floating-ui`. Browser-verified в sandbox: окно вплотную к триггеру + auto-flip вверх у нижнего края viewport. Conventional commit: `refactor(fixwindow): replace @floating-ui/vue + @vueuse/core with dependency-free engine`.

- [x] `offset` использует только `translatePx`, `marginPx` не попадает в main-axis offset (test "offset uses translatePx only — marginPx is NOT added to the main-axis offset").
- [x] `offset` учитывает `translatePx`, но НЕ `marginPx + translatePx` (test "offset honors translatePx but still excludes marginPx" — оба в `useFloating.test.ts`, ядро `computePosition`).
- [x] flip/shift/RTL/byCursor/absolute-strategy покрыты unit-тестами ядра; autoUpdate attach/detach + SSR-no-op — тестами обёртки.

## ~~Issue 3: Click-outside не работает при Teleport / iframe / Shadow DOM~~ ✅ resolved 2026-05-16

- **Категория:** H40
- **Severity:** ~~high~~
- **Где:** [FixWindow.vue](../../../lib/fixwindow/FixWindow.vue) (старый `closeOnClick` с `composedPath().includes(...)`)
- **Resolution:** удалён manual `closeOnClick(event)` с composedPath check (ломался при Teleport). Заменён на Teleport-aware click-outside с `ignore` массивом (trigger) и проверкой снаружи через `composedPath()`. Активируется условно — только когда `eventClose` ∈ `{click, mousedown, mouseup, dblclick, contextmenu}`. Teardown в `onBeforeUnmount` через `stopClickOutside.value()`.
- **Migration (2026-06-14):** `@vueuse/core onClickOutside` → собственный [lib/fixwindow/useClickOutside.ts](../../../lib/fixwindow/useClickOutside.ts) (dependency-free). Контракт тот же (`(target, handler, { ignore })` → `stop()`); слушает именно `eventClose`-событие (`events: [eventClose]`) вместо always-`pointerdown` — outside-`click` закрывает при `eventClose="click"` и т.д. (исправляет Select/Calendar/Menu close-on-outside в их default-конфиге). `@vueuse/core` удалён из `lib/package.json` + root (был единственным консьюмером). +7 тестов ([useClickOutside.test.ts](../../../lib/fixwindow/useClickOutside.test.ts)).

### Acceptance criteria

- [x] Click on trigger не закрывает popover (3 cases в test "Issue 3 — Click-outside via Teleport").
- [x] Click внутри popover-content не закрывает.
- [x] Click outside — закрывает.
- [x] Через Teleport (popover в body) корректно работает.

## ~~Issue 4: Focus trap отсутствует для popover-mode~~ ✅ resolved 2026-05-16

- **Категория:** E29.3
- **Severity:** ~~medium~~
- **Где:** [FixWindow.vue](../../../lib/fixwindow/FixWindow.vue)
- **Resolution:** добавлен `focusTrap?: boolean` prop (default `false`). При `focusTrap: true`:
  - Native реализация (~50 LOC, mirror Dialog precedent — zero new deps for focus-trap, хотя `@vueuse/core` уже added для onClickOutside).
  - `FOCUSABLE_SELECTOR` константа с CSS-селектором focusable элементов (`a[href]`, `button:not([disabled])`, `textarea:not([disabled])`, `input:not([disabled]):not([type="hidden"])`, `select:not([disabled])`, `[tabindex]:not([tabindex="-1"])`).
  - `getFocusable(root)` — фильтрует элементы с `disabled` / `aria-hidden="true"`.
  - `onPopoverKeydown(event)` — `@keydown` listener на popover root: Tab/Shift+Tab циклит focus между first / last focusable.
  - `focusFirst()` — exposed метод, ставит focus на `initialFocus` selector (если задан) или первый focusable. Авто-вызывается при open через `nextTick`.
  - Tabindex `-1` на корневом popover-узле — fallback focus когда внутри нет focusable.

### Acceptance criteria

- [x] Tab из последнего focusable element → возвращается в первый (test "Tab from last focusable cycles to first").
- [x] Shift+Tab из первого → последний (test "Shift+Tab from first focusable cycles to last").
- [x] При open фокус автоматически на первом focusable.
- [x] `initialFocus` selector поддерживается (test "initialFocus selector resolves focus target").
- [x] `focusTrap: false` opt-out (test "focusTrap=false by default").

## ~~Issue 5: Focus return на trigger при close~~ ✅ resolved 2026-05-16

- **Категория:** E29.4
- **Severity:** ~~medium~~
- **Resolution:** при `focusTrap: true` и `isOpen=true` сохраняется `document.activeElement` в `triggerEl: HTMLElement | null` ref. При close, если `returnFocus !== false` (default `true`), через `nextTick` возвращается focus на сохранённый trigger. `returnFocus?: boolean` prop опционально отключает поведение для programmatic flow.

### Acceptance criteria

- [x] Focus return on close, default true (test "returns focus to trigger on close").
- [x] `returnFocus: false` opt-out (test "returnFocus=false skips focus restoration").

## ~~Issue 6: SSR styles + sideEffects/exports map / unstyled~~ ✅ resolved 2026-05-16 (partial)

- **Resolution:**
  - ✅ **`sideEffects: false` per-component** — добавлено в [lib/fixwindow/package.json](../../../lib/fixwindow/package.json) (Dialog precedent: `lib/dialog/package.json` имеет тот же flag). Запрещает tree-shaker удалять FixWindow при чистом импорте.
  - ✅ **Удалён дубликат `FixWindow.initStyle()`** — `Component.__hooks()` ([component/index.ts:79–84](../../../lib/component/index.ts#L79-L84)) уже регистрирует `onServerPrefetch + vueOnMounted → initStyle()` автоматически. Старая SFC line 132 (`onMounted(() => { FixWindow.initStyle(); ... })`) убрана; добавлен comment-marker канона. Wave 2.3 progress: 8/22 → **9/22** SFC чистых. Documentation drift в `issues/component-class.md` Issue 1 (FixWindow был ошибочно в списке "8 SFC не используют initStyle") — исправлен.
  - ✅ **Cross-cutting `unstyled: true`** — Wave 3.1 закрыл через `Component.setStyle` guard (cross-cutting fix во всех 22 компонентах). Regression-тест "respects unstyled: true via Component.setStyle guard" в `FixWindow.test.ts`.
  - ⏸️ **Root `exports` map в `lib/package.json`** — defer to Wave 2.1 (см. [button.md Issue 9](../button.md)). Это repo-wide изменение, не FixWindow-specific.

### Acceptance criteria

- [x] `sideEffects: false` в `lib/fixwindow/package.json` (test "package.json declares sideEffects: false").
- [x] No duplicate `FixWindow.initStyle()` in SFC (test "does NOT contain duplicate FixWindow.initStyle() call in SFC").
- [x] Cross-cutting unstyled regression test (test "respects unstyled: true via Component.setStyle guard").
- [ ] Root exports map (Wave 2.1 — deferred).

## ~~Issue 7: Coverage 77% statements — низкий для критичного компонента~~ ✅ resolved 2026-05-16 (partial)

- **Категория:** J46
- **Severity:** ~~high~~
- **Где:** [FixWindow.test.ts](../../../lib/fixwindow/FixWindow.test.ts) (был 46 кейсов, стал 82)
- **Resolution:** test-файл расширен с 46 до 82 кейсов. Coverage: **88.44% statements / 83.77% branch / 90.66% functions / 91.84% lines** (было 77.27% / 65.36%). Прирост +11.17 / +18.41 пунктов. Старые uncovered lines 568–661 (manual `getPositionAbsolute`) полностью устранены — заменены Floating UI. Новые describe-блоки: Teleport mode (5), Floating UI (5), click-outside (3), focus trap (6), focus return (2), Cross-cutting Issue 6 (3), ARIA role (5), RTL (2), motion-safe + touch (2), Escape (2). Targeted target 92% / 85% — partial; разница в edge-cases (byCursor + scrollableEl combination), не блокирующая.

### Acceptance criteria

- [x] Test count 46 → 82.
- [x] Coverage statements 77.27% → 88.44%.
- [x] Coverage branch 65.36% → 83.77%.
- [x] Старые uncovered lines 568–661 устранены (Floating UI заменил manual position calc).

## ~~Issue 8: ARIA role="tooltip" / "dialog" / "menu" — нет~~ ✅ resolved 2026-05-16

- **Категория:** E29.1
- **Severity:** ~~medium~~
- **Resolution:** добавлен динамический `role` computed:
  ```ts
  const role = computed<FixWindowRole>(() => {
    const r = (props.role as FixWindowRole) ?? options?.role
    if (r) return r
    return eventOpen.value === "hover" ? "tooltip" : "dialog"
  })
  ```

  - `role?: "tooltip" | "dialog" | "menu"` prop с авто-резолвом по `eventOpen`.
  - `aria-label?: string` / `aria-labelledby?: string` / `aria-describedby?: string` forwarding на корневой узел.
  - `resolvedAriaLabel` computed: `ariaLabelledby` имеет приоритет — `aria-label` не render'ится одновременно с `labelledby` (browser-канон).
  - `initialFocus?: string` (CSS-селектор) для focus trap.

### Acceptance criteria

- [x] `role="tooltip"` когда `eventOpen='hover'` (default).
- [x] `role="dialog"` когда `eventOpen='click'` (interactive).
- [x] `role="menu"` через explicit prop.
- [x] `aria-label` / `ariaLabelledby` / `ariaDescribedby` forwarding (test "aria-label, aria-labelledby, aria-describedby forwarded").
- [x] `aria-label` suppressed when `labelledby` present.

## ~~Issue 9: RTL для positions~~ ✅ resolved 2026-05-16

- **Категория:** F31
- **Resolution:** Floating UI's logical `start`/`end` placement обеспечивает корректное RTL-зеркалирование автоматически на `dir="rtl"` documents. FishtVue `position` мапится в Floating UI Placement через `positionToPlacement(...)`:
  - `top-left → top-start` (на LTR — слева; на RTL — справа).
  - `top-right → top-end` (LTR — справа; RTL — слева).
  - И т.д. для `bottom-*`, `left-*`, `right-*`.
- Close-кнопка использует Tailwind logical `end-2` вместо буквального `right-2` (Dialog precedent).
- aria-label close-кнопки локализован через `FixWindow.t("fixwindow.close")` (en: "Close", ru: "Закрыть"). Cross-cutting: добавлены `fixwindow?: { close?: string }` в `DefaultMessages` ([TypesLocale.d.ts](../../../lib/locale/TypesLocale.d.ts)) + ключ `fixwindow.close` в en/ru locales.

### Acceptance criteria

- [x] `position='top-left'` мапится в Floating UI `top-start` (test "position='top-left' maps to Floating UI 'top-start'").
- [x] Close-кнопка использует `end-2` (Tailwind logical), не `right-2` (test "close button uses logical inline-end positioning").

## ~~Issue 10: prefers-reduced-motion / colors / mobile touch~~ ✅ resolved 2026-05-16

- **Cross-cutting motion-safe (E29.7):** ✅ — все transitions через `motion-safe:` префикс. Tailwind транспилирует в `@media (prefers-reduced-motion: no-preference)`. Меняется в:
  - `FixWindow.setStyle("motion-safe:transition-opacity motion-safe:ease-in-out motion-safe:duration-300 opacity-100 opacity-0")` (script level).
  - Template `<transition>` enter/leave classes: все wrapped в `motion-safe:`.
  - Static-source check в test "Issue 10 — motion-safe + touch fallback": classBase / template содержит `motion-safe:transition-opacity`, отсутствует unconditional `transition-opacity ease-in-out duration-300`.
- **Mobile touch:** ✅ — `eventOpen: "hover"` дополнительно регистрирует `touchstart` listener (touch-устройства, где `mouseover` не fires). Cleanup в `removeOpenListener("hover")` — порядок важен (touchstart первый, mouseover последний для preserve regression-теста `lastCall === "mouseover"`).
- **Hardcode цвета (B10):** оставлено — `bg-stone-100 dark:bg-stone-900`, `bg-neutral-200 dark:bg-neutral-900` — это design-system tokens из `lib/theme/themes/Aurora.ts`. Cross-cutting refactor в Wave 3.3 (Theme runtime API).

### Acceptance criteria

- [x] `classBase` / `setStyle` calls содержат `motion-safe:` префикс (test "classBase / setStyle calls include motion-safe: prefix").
- [x] Не содержат unconditional `transition-opacity ease-in-out duration-300`.
- [x] `touchstart` listener регистрируется при `eventOpen='hover'` (test "touchstart listener registered when eventOpen='hover' (touch fallback)").

## Cross-cutting: Configuration support (обновлено 2026-05-16)

| Настройка                     | Поддержано? | Комментарий                                                                                                           |
| ----------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------- |
| `componentsOptions.FixWindow` | ✅          | Расширено 8 ключами: teleport, focusTrap, role, ariaLabel, ariaLabelledby, ariaDescribedby, initialFocus, returnFocus |
| `componentsStyle` global      | ✅          | через `FixWindow.componentsStyle()` в `mode` computed                                                                 |
| `unstyled: true`              | ✅          | Wave 3.1 закрыт cross-cutting'ом через `Component.setStyle` guard                                                     |
| Theme tokens vs hardcode      | ⚠️          | через theme-\* частично; оставшийся hardcode (`bg-stone-*`) — design-tokens, refactor в Wave 3.3                      |
| `t()` для текста              | ✅          | `FixWindow.t("fixwindow.close")` для aria-label close-кнопки (en/ru)                                                  |

## Dual-API gap

Не применимо.

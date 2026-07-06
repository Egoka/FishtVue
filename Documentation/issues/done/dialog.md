---
title: Issues — Dialog (done)
summary: Аудит Dialog закрыт 2026-05-12 — все 9 issues resolved одним fix(dialog) коммитом. Добавлены focus trap (native), reference-counted scroll lock (новый lib/utils/scrollLockHandler.ts), role="dialog"/aria-modal/labelledby/describedby, focus return, motion-safe transitions, RTL close button, aria-live region, sideEffects: false, sr-only live region. Cross-cutting SSR styles + exports map (Issue 6 подпункты) defer to Wave 2.1. Остаточный B10 (structural neutral hardcode) мигрирован на surface token 2026-07-05 (Wave 9 follow-up), матрица не меняется.
updated: 2026-07-05
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/dialog/
related-doc: ../../components/dialog.md
---

# Issues — Dialog (resolved 2026-05-12)

## Сводка

| Severity | Count (open) | Categories |
| -------- | ------------ | ---------- |
| critical | 0            | — (~~E29.3 focus trap, H41 escapeListener leak~~ ✅) |
| high     | 0            | — (~~A2, A4-5, C13, C17, E29.1~~ ✅; cross-cutting SSR/exports → Wave 2.1) |
| medium   | 0            | — (~~E29.4 focus return, E29.5 aria-live, F31 RTL, G34~~ ✅) |
| low      | 0            | — (~~E29.7 motion-safe, B10, N59~~ ✅) |

Все 9 numbered issues закрыты. Файл перенесён в `./done/` 2026-05-12.

## ~~Issue 1: CRITICAL — Нет focus trap внутри dialog~~ ✅ resolved 2026-05-12

- **Категория:** E29.3 (Focus trap в модалках)
- **Severity:** ~~critical~~
- **Где:** [Dialog.vue](../../../lib/dialog/Dialog.vue)
- **Resolution:** реализован native focus trap (~30 LOC, без новых deps): `getFocusable(root)` helper использует selector `a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])`. `onDialogKeydown` перехватывает Tab/Shift+Tab и циклит focus между first / last. На open — `focusFirst()` через `nextTick` ставит focus на `initialFocus` selector (если задан) или первый focusable элемент. Корневой `<div role="dialog">` получает `tabindex="-1"` для fallback focus.

### Acceptance criteria

- [x] Tab из последнего focusable element → возвращается в первый (test D: "Tab from last focusable cycles to first").
- [x] Shift-Tab из первого → последний (test D: "Shift+Tab from first focusable cycles to last").
- [x] При open фокус автоматически на первом focusable (test D: "focuses first focusable element on open").
- [x] `initialFocus` selector поддерживается (test D: "focuses element matching initialFocus selector").

## ~~Issue 2: CRITICAL — escapeListener утекает при unmount-while-open~~ ✅ resolved 2026-05-12

- **Категория:** H41 (memory leaks)
- **Severity:** ~~critical~~
- **Где:** [Dialog.vue](../../../lib/dialog/Dialog.vue)
- **Resolution:** добавлен `onBeforeUnmount` cleanup, который снимает `keydown` listener с `document` и освобождает scroll lock (если этот instance его удерживал). Закрывает scenario «SPA navigation programmatically → Dialog unmount while isOpen=true».

### Acceptance criteria

- [x] Mount Dialog with isOpen=true → unmount → listener removed + body styles restored (test A: "removes keydown listener and unlocks scroll when unmounted while open").
- [x] Escape closes dialog (test A: "closes via Escape keydown when open").

## ~~Issue 3: HIGH — body.style мутация — race condition при multiple Dialog~~ ✅ resolved 2026-05-12

- **Категория:** C13 (утечка структуры)
- **Severity:** ~~high~~
- **Где:** [Dialog.vue](../../../lib/dialog/Dialog.vue), [lib/utils/scrollLockHandler.ts](../../../lib/utils/scrollLockHandler.ts) _(NEW)_
- **Resolution:** создан shared utility `lib/utils/scrollLockHandler.ts` — reference-counted singleton с counter `lockCount`. При первом `lockBodyScroll()` сохраняются оригинальные `body.style.overflow` и `body.style.paddingRight`, выставляется `overflow: hidden` + компенсирующий `padding-right: <scrollbarWidth>px`. Последующие вызовы только инкрементируют counter. `unlockBodyScroll()` декрементирует; при 0 — восстанавливает оригиналы. SSR-safe через `isClient()`. Покрыт 6 unit-тестами в [scrollLockHandler.test.ts](../../../lib/utils/scrollLockHandler.test.ts). Готов к переиспользованию Split (Wave 2.4 roadmap).

### Acceptance criteria

- [x] Nested locks: body locked до полного unlock (test B: "nested Dialogs maintain lock until both close").
- [x] Original `body.style.overflow` восстанавливается (test B: "preserves original body.style.overflow on close").

## ~~Issue 4: HIGH — Нет role="dialog" / aria-modal~~ ✅ resolved 2026-05-12

- **Категория:** E29.1 (ARIA)
- **Severity:** ~~high~~
- **Где:** [Dialog.vue](../../../lib/dialog/Dialog.vue)
- **Resolution:** корневой `<div data-dialog>` теперь получает `role="dialog"`, `aria-modal="true"` всегда; опционально `aria-label`, `aria-labelledby`, `aria-describedby` через одноимённые props (`DialogProps.ariaLabel` / `ariaLabelledby` / `ariaDescribedby`). Computed `resolvedAriaLabel` подавляет `aria-label`, если задан `aria-labelledby` (browser-канон: labelledby имеет приоритет). Tabindex `-1` для fallback focus на корневой узел, если внутри нет focusable.

### Acceptance criteria

- [x] `role="dialog"` + `aria-modal="true"` всегда (test C: "root element has role=...").
- [x] `ariaLabel` / `ariaLabelledby` / `ariaDescribedby` forwarding (test C: 3 кейса).

## ~~Issue 5: MEDIUM — Focus return на trigger при close — нет~~ ✅ resolved 2026-05-12

- **Категория:** E29.4
- **Severity:** ~~medium~~
- **Resolution:** при open сохраняется `document.activeElement` в `triggerEl` (`HTMLElement | null`); при close, если `returnFocus === true` (default), focus возвращается через `nextTick` на сохранённый trigger. Prop `returnFocus?: boolean` (default `true`) опционально отключает поведение для programmatic flow.

### Acceptance criteria

- [x] Focus return on close, default true (test D: "returns focus to trigger element on close").
- [x] `returnFocus=false` opt-out (test D: "does not return focus when returnFocus=false").

## ~~Issue 6: HIGH — SSR styles + sideEffects + unstyled~~ ✅ resolved 2026-05-12 (частично)

- **Resolution:**
  - ✅ `lib/dialog/package.json` — добавлено `"sideEffects": false` (зеркалит Alert pattern).
  - ✅ Wave 3.1 cross-cutting `unstyled: true` — guard в `Component.setStyle` (component/index.ts:138) уже закрыл Issue для всех 22 компонентов 2026-05-12. Regression-тест в Dialog подтверждает (test I).
  - ✅ Wave 2.3 SSR style injection (drop duplicate `onMounted(() => Dialog.initStyle())`) — `Component.__hooks()` уже регистрирует `onServerPrefetch + vueOnMounted → initStyle()`. SFC очищен. Wave 2.3 progress 7/22 → **8/22**.
  - ⏸️ Cross-cutting SSR styles top-level collector + exports map — defer to Wave 2.1 (см. [button.md Issue 1, 9](../button.md)).

### Acceptance criteria

- [x] `sideEffects: false` в lib/dialog/package.json.
- [x] Cross-cutting unstyled regression test (test I: "respects unstyled: true via Component.setStyle guard").
- [x] No duplicate `Dialog.initStyle()` in SFC (test H static-source check).

## ~~Issue 7: MEDIUM — aria-live для dialog content updates~~ ✅ resolved 2026-05-12

- **Категория:** E29.5
- **Severity:** ~~medium~~
- **Resolution:** добавлен `<div data-dialog-live class="sr-only" aria-live="polite" aria-atomic="true">` внутри корневого узла. По default пустой — потребитель через scoped slot или ref может обновлять status text для screen reader (loading state, errors).

### Acceptance criteria

- [x] sr-only `[data-dialog-live][aria-live="polite"][aria-atomic="true"]` присутствует (test G).

## ~~Issue 8: MEDIUM — RTL — `right-2` для close button буквальное~~ ✅ resolved 2026-05-12

- **Категория:** F31
- **Резолюция:** `right-2` → `end-2` (Tailwind logical inline-end). В RTL автоматически свопается на левый край без `dir`-aware JS-логики. Также добавлен `aria-label` через `Dialog.t("dialog.close")` с fallback `"Close dialog"`.

### Acceptance criteria

- [x] Close button использует logical inline-end (test F: "close button uses logical inline-end positioning").

## ~~Issue 9: LOW — prefers-reduced-motion для transitions~~ ✅ resolved 2026-05-12

- **Категория:** E29.7
- **Резолюция:** все transitions обёрнуты в `motion-safe:` префикс — `transition-all ease-in-out duration-500` → `motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500`. Backdrop blur `transition-all duration-200` → `motion-safe:transition-all motion-safe:duration-200`. Tailwind транспилирует `motion-safe:` в `@media (prefers-reduced-motion: no-preference)`. Зеркалит [button.md Issue 10](../button.md) и [aria.md Issue 9](../aria.md) ✅ pattern.

### Acceptance criteria

- [x] All transitions wrapped in `motion-safe:` (test E: "transitions wrapped in motion-safe: prefix" + static-source check).

## ~~B10 — structural neutral hardcode~~ ✅ resolved 2026-07-05

- **Категория:** B10 (semantic tokens вместо hardcoded gray-family classes), Wave 9 follow-up
- **Severity:** ~~low~~
- **Где:** [Dialog.vue](../../../lib/dialog/Dialog.vue)
- **Что было:** `bg-neutral-500/10 dark:bg-neutral-900/10` (overlay background), `dark:bg-neutral-950` (dialog panel, `bg-white` не менялся) и `fill-neutral-500 dark:fill-neutral-500` (close-icon) — хардкоженные Tailwind color-primitive классы вместо semantic design-token. На момент аудита 2026-05-12 (Issue 9 таблица выше) это оставили как **не Dialog-specific issue**, ожидая cross-cutting `surface` token из Wave 9.
- **Resolution:** family rename (тот же numeric tone, значение не менялось) на `surface` semantic-слот, добавленный в [lib/theme/primitive.ts:305-317](../../../lib/theme/primitive.ts#L305-L317) (дефолт — точная копия `gray`-шкалы; `namesColors` union в [Theme.d.ts](../../../lib/theme/Theme.d.ts)):
  - `bg-neutral-500/10 dark:bg-neutral-900/10` → `bg-surface-500/10 dark:bg-surface-900/10` ([Dialog.vue:129](../../../lib/dialog/Dialog.vue#L129))
  - `dark:bg-neutral-950` → `dark:bg-surface-950` ([Dialog.vue:134](../../../lib/dialog/Dialog.vue#L134), `bg-white` не тронут)
  - `fill-neutral-500 dark:fill-neutral-500` → `fill-surface-500 dark:fill-surface-500` ([Dialog.vue:308](../../../lib/dialog/Dialog.vue#L308))

### Acceptance criteria

- [x] Overlay background uses `surface-*` family, not `neutral-*` (test K: "overlay background uses surface-family (not neutral-500/900)").
- [x] Dialog panel keeps `bg-white`, uses `dark:bg-surface-950` (test K: "dialog panel keeps bg-white and uses surface-950 in dark mode (not neutral-950)").
- [x] Close icon uses `fill-surface-*`, not `fill-neutral-*` (test K: "close icon uses surface-family fill (not neutral-500)").

## Cross-cutting: Configuration support (обновлено 2026-07-05)

| Настройка                  | Поддержано? | Комментарий                                                                       |
| -------------------------- | ----------- | --------------------------------------------------------------------------------- |
| `componentsOptions.Dialog` | ✅          | toTeleport, position, sizes, **+ ariaLabel/ariaLabelledby/ariaDescribedby/initialFocus/returnFocus** |
| `componentsStyle` global   | ❌          | Dialog не имеет mode-prop (filled/outlined/underlined неприменимо к modal)        |
| `unstyled: true`           | ✅          | Wave 3.1 закрыт cross-cutting'ом через `Component.setStyle` guard (2026-05-12)    |
| Theme tokens vs hardcode   | ✅          | `surface-*` semantic tokens (B10, ✅ 2026-07-05); `bg-white` (light panel) намеренно не тронут |
| `t()` для текста           | ✅          | `Dialog.t("dialog.close")` для close button aria-label                            |

## Dual-API gap

Не применимо — Dialog single-instance.

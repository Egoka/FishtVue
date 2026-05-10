---
title: Issues — Dialog
summary: Аудит Dialog — отсутствует focus trap (CRITICAL a11y), нет focus return, escapeListener leak при unmount-while-open, body.style мутация без race protection, нет role="dialog"/aria-modal.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/dialog/
related-doc: ../components/dialog.md
---

# Issues — Dialog

## Сводка

| Severity | Count | Categories                                                           |
| -------- | ----- | -------------------------------------------------------------------- |
| critical | 2     | E29.3 (focus trap), H41 (escapeListener leak)                        |
| high     | 5     | A2, A4-5, C13 (body.style mutation), C17, E29.1 (no role/aria-modal) |
| medium   | 4     | E29.4 (focus return), E29.5, F31, G34                                |
| low      | 3     | E29.7, B10, N59                                                      |

## Issue 1: CRITICAL — Нет focus trap внутри dialog

- **Категория:** E29.3 (Focus trap в модалках)
- **Severity:** **critical**
- **Где:** [Dialog.vue](../../lib/dialog/Dialog.vue)

### Что найдено

При `isOpen: true` Dialog рендерится через Teleport, но focus может улететь за пределы dialog'а при Tab. Пользователь screen reader / keyboard-only теряется в DOM позади backdrop'а.

### Почему это проблема

- WCAG 2.1 SC 2.4.3 (Focus Order) — focus должен оставаться в модальном dialog.
- Документация [components/dialog.md](../components/dialog.md) обещает «модальный Dialog», но без focus trap — это не модальный по a11y.
- Industry-standard (Radix, Headless UI, Element Plus) — все имеют focus trap.

### Что нужно сделать

1. Установить `focus-trap-vue` или VueUse `useFocusTrap`:
   ```ts
   import { useFocusTrap } from "@vueuse/integrations/useFocusTrap"
   const { activate, deactivate } = useFocusTrap(dialogContent, { immediate: false })
   watch(isOpen, (val) => (val ? activate() : deactivate()))
   ```
2. На open — focus первого focusable element внутри dialog (или явный `initialFocus` ref).
3. Tab/Shift-Tab — циклит внутри dialog.
4. Escape — close (уже есть ✅).
5. Тест: keyboard navigation в открытом Dialog не выходит за пределы.

### Acceptance criteria

- [ ] Tab из последнего focusable element → возвращается в первый.
- [ ] Shift-Tab из первого → последний.
- [ ] При open фокус автоматически на первом focusable.
- [ ] axe-core проходит для open Dialog.

## Issue 2: CRITICAL — escapeListener утекает при unmount-while-open

- **Категория:** H41 (memory leaks)
- **Severity:** **critical**
- **Где:** [Dialog.vue:155](../../lib/dialog/Dialog.vue#L155)

### Что найдено

```ts
watch(isOpen, (value) => {
  if (value) {
    document.addEventListener("keydown", escapeListener)
  } else {
    if (escapeListener) {
      document.removeEventListener("keydown", escapeListener)
      escapeListener = null
    }
  }
})
```

Listener removed when isOpen→false. **НО** если Dialog unmount'ится во время isOpen=true (parent component unmount, route change), listener остаётся на document навсегда + body имеет `overflow: hidden`.

### Почему это проблема

- Memory leak listener.
- `body.style.overflow = "hidden"` остаётся → весь app non-scrollable.
- Common scenario: open dialog → SPA navigation programmatically → Dialog unmount with isOpen still true.

### Что нужно сделать

1. Добавить `onBeforeUnmount` cleanup:
   ```ts
   onBeforeUnmount(() => {
     if (escapeListener) {
       document.removeEventListener("keydown", escapeListener)
       escapeListener = null
     }
     // Also restore body styles
     const bodyEl = document.querySelector("body")
     if (bodyEl) {
       bodyEl.classList.remove("overflow-hidden")
       bodyEl.setAttribute("style", bodyEl.style.cssText.replace("overflow: hidden;", ""))
     }
   })
   ```
2. Альтернатива — `useEventListener` из VueUse (auto cleanup).

### Acceptance criteria

- [ ] Mount Dialog with isOpen=true → unmount → listener removed + body styles restored.
- [ ] Тест: track listeners count до/после.

## Issue 3: body.style мутация — race condition при multiple Dialog

- **Категория:** C13 (утечка структуры)
- **Severity:** high
- **Где:** [Dialog.vue:147-148](../../lib/dialog/Dialog.vue#L147-L148), [Dialog.vue:157-159](../../lib/dialog/Dialog.vue#L157-L159)

### Что найдено

```ts
bodyEl.classList.add("overflow-hidden")
bodyEl.setAttribute("style", `${bodyEl.style.cssText}overflow: hidden;`)
```

Добавляется class `overflow-hidden` и **inline style** `overflow: hidden`. При множественных Dialog (nested, или toast + dialog):

- Первый Dialog open → `overflow: hidden` set.
- Второй Dialog open → ещё раз `${bodyEl.style.cssText}overflow: hidden;` — string concat дублирует.
- Первый Dialog close → удаляет `overflow: hidden;` (только первое вхождение через `.replace(..., "")`) — второй Dialog ещё открыт, но overflow восстановился.

### Почему это проблема

- Nested dialogs (Dialog внутри Dialog для confirmation) — body scroll lock breaks.
- Toast + Dialog одновременно — body styles растрепаны.

### Что нужно сделать

1. Использовать reference-counted scroll lock (counter):
   ```ts
   // shared singleton
   let lockCount = 0
   function lockBodyScroll() {
     if (lockCount === 0) {
       document.body.style.overflow = "hidden"
       document.body.classList.add("fv-scroll-locked")
     }
     lockCount++
   }
   function unlockBodyScroll() {
     lockCount = Math.max(0, lockCount - 1)
     if (lockCount === 0) {
       document.body.style.overflow = ""
       document.body.classList.remove("fv-scroll-locked")
     }
   }
   ```
2. Или использовать VueUse `useScrollLock(target)` — handles correctly.
3. Сохранять оригинальное значение `body.style.overflow` перед перезаписью, восстанавливать на unlock.

## Issue 4: Нет role="dialog" / aria-modal

- **Категория:** E29.1 (ARIA)
- **Severity:** high
- **Где:** [Dialog.vue:185](../../lib/dialog/Dialog.vue#L185)

### Что найдено

```vue
<div v-if="isOpen" :class="classBase" data-dialog>
```

Корневой `<div data-dialog>` без `role="dialog"`, без `aria-modal="true"`, без `aria-labelledby` (для title) или `aria-describedby` (для content). Screen reader не идентифицирует модальное окно.

### Что нужно сделать

1. ```vue
   <div
     v-if="isOpen"
     :class="classBase"
     data-dialog
     role="dialog"
     aria-modal="true"
     :aria-labelledby="titleId"
     :aria-describedby="descriptionId">
     ...
   </div>
   ```
2. Title slot должен иметь генерированный id, привязанный к `aria-labelledby`.
3. axe-core test для open Dialog.

## Issue 5: Focus return на trigger при close — нет

- **Категория:** E29.4
- **Severity:** medium

После `closeDialog()` focus теряется в начало DOM (или body). Должен возвращаться на trigger.

### Что нужно сделать

См. [fixwindow.md Issue 5](./fixwindow.md) — идентичный fix-план через сохранение `document.activeElement` при open и `.focus()` при close.

## Issue 6: SSR styles + sideEffects + unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 7: aria-live для dialog content updates

- **Категория:** E29.5
- **Severity:** medium

Если Dialog содержит dynamic content (loading state, errors), screen reader не объявит. Add `aria-live="polite"`.

## Issue 8: RTL — `right-2` для close button буквальное

- **Категория:** F31
- **Где:** [Dialog.vue:192](../../lib/dialog/Dialog.vue#L192)

`absolute top-2 right-2` — close button в RTL должен быть слева (`top-2 left-2` или `top-2 inset-inline-end-2`).

## Issue 9: prefers-reduced-motion для transitions

- **Категория:** E29.7
- **Где:** [Dialog.vue:179-184](../../lib/dialog/Dialog.vue#L179-L184)

`transition-all ease-in-out duration-500` — без guard. См. [done/button.md Issue 10](./done/button.md) — там готовый motion-safe pattern.

## Cross-cutting: Configuration support

| Настройка                  | Поддержано? | Комментарий                                         |
| -------------------------- | ----------- | --------------------------------------------------- |
| `componentsOptions.Dialog` | ✅          | toTeleport, position, sizes, и др.                  |
| `componentsStyle` global   | ❌          | Dialog не пересекается с filled/outlined/underlined |
| `unstyled: true`           | ❌          | cross-cutting                                       |
| Theme tokens vs hardcode   | ⚠️          | через theme-\* частично                             |
| `t()` для текста           | N/A         | контент через slot                                  |

## Dual-API gap

Не применимо — Dialog single-instance.

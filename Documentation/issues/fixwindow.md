---
title: Issues — FixWindow
summary: Аудит FixWindow — нет интеграции с Floating UI (manual position calc), не использует Teleport (collision со scroll-parent), нет focus trap для popover-mode, низкий coverage.
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/fixwindow/
related-doc: ../components/fix-window.md
---

# Issues — FixWindow

## Сводка

| Severity | Count | Categories                                                                                   |
| -------- | ----- | -------------------------------------------------------------------------------------------- |
| critical | 0     | —                                                                                            |
| high     | 7     | A2, A4-5, C16 (no Teleport), C17, H39 (Floating UI), H40 (click-outside), J46 (coverage 77%) |
| medium   | 5     | E29.1, E29.3 (focus trap), E29.4 (focus return), F31, G34                                    |
| low      | 3     | E29.7, B10, N57                                                                              |

## Issue 1: Нет Teleport — popover/tooltip overflow обрезается scroll-parent

- **Категория:** C16 (Portal/Teleport)
- **Severity:** high
- **Где:** [FixWindow.vue](../../lib/fixwindow/FixWindow.vue)

### Что найдено

FixWindow рендерится inline (внутри родительского компонента). Если родитель имеет `overflow: hidden`/`auto` — popover обрезается границей.

### Почему это проблема

- Стандартный pattern для popover/tooltip — Teleport в `<body>` (или ancestor с `position: fixed`).
- Использование внутри Table cell, Dialog, Accordion — все часто имеют overflow.
- Documentation [components/fix-window.md](../components/fix-window.md) обещает 12 позиций — но при overflow позиционирование некорректно.

### Что нужно сделать

1. Wrap content в `<Teleport :to="teleportTarget">`:
   ```vue
   <Teleport :to="teleport ?? 'body'" :disabled="!teleport">
     <div ref="popover" :class="classWindow">
       <slot />
     </div>
   </Teleport>
   ```
2. Prop `:teleport?: string | HTMLElement | false` (default `false` для backward compat, рекомендация — `'body'`).
3. Click-outside detection должен учитывать teleport-target (см. Issue 3).

### Acceptance criteria

- [ ] `<FixWindow teleport="body">` — popover рендерится в body, не обрезается.
- [ ] Click-outside работает корректно через teleport.

## Issue 2: Manual position calculation вместо Floating UI

- **Категория:** H39
- **Severity:** high
- **Где:** [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) (position computation)

### Что найдено

Позиционирование рассчитывается вручную через `getBoundingClientRect()`. Не учитывает:

- Auto-flip (если `top` overflow viewport → swap to `bottom`).
- Auto-shift (smart положение в пределах viewport).
- Scroll/resize tracking.
- Frame offset (iframe).

### Что нужно сделать

1. Интегрировать `@floating-ui/vue`:
   ```ts
   import { useFloating, autoUpdate, offset, flip, shift, arrow } from "@floating-ui/vue"
   const { floatingStyles, placement, middlewareData } = useFloating(reference, floating, {
     placement: position.value,
     middleware: [offset(8), flip(), shift()],
     whileElementsMounted: autoUpdate
   })
   ```
2. Cross-cutting: Calendar, Select dropdown, Menu, Dialog (если popover-mode) — все используют ту же логику.

### Acceptance criteria

- [ ] FixWindow auto-flip'ает при near viewport edge.
- [ ] Scroll body — позиция обновляется.

## Issue 3: Click-outside не работает при Teleport / iframe / Shadow DOM

- **Категория:** H40
- **Severity:** high
- **Где:** [FixWindow.vue:230](../../lib/fixwindow/FixWindow.vue) (click-outside через event handler)

### Что найдено

Click-outside detection использует event.composedPath / contains. После Teleport (когда добавим, Issue 1) — element больше не вложен в DOM-родителя → contains() возвращает false → click-outside не срабатывает.

### Что нужно сделать

1. Использовать VueUse `onClickOutside(refs[], callback)` — handles teleport correctly.
2. Pass массив refs (reference + floating element) — click внутри ANY из них не считается outside.
3. Поддержка iframe — composedPath() может пересекать iframe, нужно добавить guard.

## Issue 4: Focus trap отсутствует для popover-mode

- **Категория:** E29.3
- **Severity:** medium
- **Где:** [FixWindow.vue](../../lib/fixwindow/FixWindow.vue)

### Что найдено

Если FixWindow содержит interactive content (form, buttons), focus может улетать за пределы popover при Tab. Нужен focus trap для модальных popovers.

### Что нужно сделать

1. Добавить prop `:focusTrap?: boolean` (default false).
2. Когда `focusTrap: true` — циклить Tab внутри popover.
3. Использовать VueUse `useFocusTrap` или `focus-trap-vue` библиотеку.

## Issue 5: Focus return на trigger при close

- **Категория:** E29.4
- **Severity:** medium

После close popover focus должен возвращаться на trigger element (button). Сейчас не делается.

### Что нужно сделать

```ts
const triggerEl = ref<HTMLElement>()
function open() {
  triggerEl.value = document.activeElement as HTMLElement
  // open popover
}
function close() {
  // close popover
  triggerEl.value?.focus()
}
```

## Issue 6: SSR styles + sideEffects/exports map / unstyled

См. [button.md Issue 1, 8, 9, 14](./button.md).

## Issue 7: Coverage 77% statements — низкий для критичного компонента

- **Категория:** J46
- **Severity:** high
- **Где:** [FixWindow.test.ts](../../lib/fixwindow/FixWindow.test.ts) (46 tests)

### Что найдено

Coverage statements 77.27%, branch 65.36%, **lines 568-661 не покрыты**. FixWindow — основа для Calendar, Select dropdown, Menu — критичный.

### Что нужно сделать

Audit uncovered lines 568-661. Добавить тесты для:

- 12 позиций × open/close events × edge cases.
- Teleport mode (после фикса Issue 1).
- Click-outside через Teleport.
- Keyboard navigation (Esc to close).

## Issue 8: ARIA role="tooltip" / "dialog" / "menu" — нет

- **Категория:** E29.1
- **Severity:** medium

FixWindow не выставляет семантическую роль. Тип контента (tooltip vs dialog vs menu) — определяется через prop, должен влиять на role.

### Что нужно сделать

```ts
const ariaRole = computed(() => {
  if (props.role) return props.role
  if (props.eventOpen === "mouseover") return "tooltip"
  if (slots.default && interactive) return "dialog"
  return "tooltip"
})
```

## Issue 9: RTL для 12 positions

- **Категория:** F31

12 positions использует `top-left`, `top-right`, `bottom-left`, `bottom-right` etc. — буквальные. RTL требует mirror.

## Issue 10: prefers-reduced-motion / colors / mobile touch

Cross-cutting. См. [done/button.md Issue 10](./done/button.md) — там готовый motion-safe pattern, плюс [switch.md Issue 12](./switch.md).

Mobile: `mouseover` event не работает на touch — нужен fallback на `touchstart`.

## Cross-cutting: Configuration support

| Настройка                     | Поддержано? | Комментарий                                                                                     |
| ----------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `componentsOptions.FixWindow` | ✅          | mode, position, padding и др.                                                                   |
| `componentsStyle` global      | ✅          | через `FixWindow.componentsStyle()` ([FixWindow.vue:93](../../lib/fixwindow/FixWindow.vue#L93)) |
| `unstyled: true`              | ❌          | Issue 6                                                                                         |
| Theme tokens vs hardcode      | ⚠️          | через theme-\* частично                                                                         |
| `t()` для текста              | N/A         | контент через slot                                                                              |

## Dual-API gap

Не применимо.

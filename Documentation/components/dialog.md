---
title: Dialog
summary: Модальный диалог с Teleport, focus trap, role="dialog"/aria-modal, reference-counted body scroll lock, motion-safe анимациями, размерами xs–7xl.
updated: 2026-05-12
stability: stable
since: 0.2.11
---

# Dialog

## 1. Overview

`Dialog` — модальное окно. Поддерживает Teleport (рендер в указанный селектор), 11 размеров (`xs`–`7xl`), позиции (center/top/bottom/left/right + комбо), close-кнопку, отключение closeOnBackground, отключение анимации.

Stability: `stable` — 30 кейсов, coverage 94.25%.

Source: [Source](../../lib/dialog/Dialog.vue), [Dialog.d.ts](../../lib/dialog/Dialog.d.ts), [Dialog.test.ts](../../lib/dialog/Dialog.test.ts).

## 2. How it's organized

```
lib/dialog/
├── Dialog.vue
├── Dialog.d.ts        # 193 строки
├── Dialog.test.ts     # 30 кейсов
└── package.json
```

Зависимости: [Button](./button.md), [Icons](./icons.md), [domHandler.isClient](../utilities/domHandler.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили автоматически (никаких `onMounted(() => Dialog.initStyle())` в SFC — Wave 2.3 ✅). Escape-listener и focus-trap управляются через `watch(isOpen, ..., { immediate: true, flush: "post" })`; `onBeforeUnmount` гарантированно снимает listener и освобождает scroll lock при unmount-while-open.
- **Поток данных:** `modelValue` ↔ внутренний `isOpen` через `update:modelValue`. Escape closes (если не `notCloseBackground`).
- **Стили:** через `Dialog.setStyle()` — несколько computed для `classBase`, `classDialog`, `classBodyDialog`, `classPosition`. Все `transition` / `transition-opacity` обёрнуты в `motion-safe:` префикс (Tailwind транспилирует в `@media (prefers-reduced-motion: no-preference)`).
- **Teleport:** при `toTeleport` контент монтируется в указанный селектор. По умолчанию — body.
- **Animation:** Vue `<transition>` с динамическими enter/leave-классами в зависимости от `position`. CSS `motion-safe:transition-all motion-safe:ease-in-out motion-safe:duration-500`. При `notAnimate: true` — без transition. При `prefers-reduced-motion: reduce` все transitions автоматически no-op.
- **Body scroll lock:** через [`lib/utils/scrollLockHandler.ts`](../../lib/utils/scrollLockHandler.ts) — reference-counted singleton. При nested-Dialog или Toast+Dialog body остаётся заблокированным до момента, пока counter не вернётся в 0; оригинальные `body.style.overflow` и `body.style.paddingRight` сохраняются и восстанавливаются.
- **Focus management:** при open сохраняется `document.activeElement` как trigger. Фокус автоматически переходит на `initialFocus` selector или первый focusable элемент внутри dialog. Tab/Shift+Tab циклит внутри dialog (native focus trap, без deps). При close — focus возвращается на trigger (управляется prop `returnFocus`, default `true`).
- **A11y:** корневой узел получает `role="dialog"`, `aria-modal="true"`, опционально `aria-label`/`aria-labelledby`/`aria-describedby` через одноимённые props. Внутри dialog рендерится `<div data-dialog-live class="sr-only" aria-live="polite" aria-atomic="true">` — пустой по default, потребитель может через scoped slot обновлять status text для screen reader.
- **Конфиг:** `componentsOptions.Dialog` — см. §10.
- **Локализация:** локализуется только текст `aria-label` close-button (`Dialog.t("dialog.close")` с fallback на `"Close dialog"`).
- **SSR:** Teleport SSR-friendly; на сервере контент в `<Teleport disabled>`. `isClient` guard перед document-операциями. `lib/dialog/package.json` помечен `sideEffects: false` для tree-shaking.

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Dialog from "fishtvue/dialog"

const open = ref(false)
</script>

<template>
  <button @click="open = true">Open</button>
  <Dialog v-model="open" size="md">
    <template #default="{ closeDialog }">
      <h2>Hello</h2>
      <button @click="closeDialog">Close</button>
    </template>
  </Dialog>
</template>
```

## 5. Props

`DialogProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean` | — | v-model видимость. |
| `size` | `Size` (`xs \| sm \| md \| lg \| xl \| 2xl \| ... \| 7xl`) | — | Ширина диалога. |
| `position` | `PositionShort` | `"center"` | Позиция на экране. |
| `notAnimate` | `boolean` | `false` | Отключить анимацию. |
| `closeButton` | `boolean` | — | Показать `×`-кнопку. |
| `withoutMargin` | `boolean` | — | Убрать padding. |
| `notCloseBackground` | `boolean` | — | Запретить закрытие по клику на background. |
| `toTeleport` | `string` | — | CSS-селектор target'а Teleport. |
| `class`, `classBody` | `StyleClass` | — | CSS классы. |
| `ariaLabel` | `string` | — | `aria-label` для корневого `<div role="dialog">`. Не комбинируется с `ariaLabelledby` — `aria-labelledby` имеет приоритет. |
| `ariaLabelledby` | `string` | — | ID элемента-заголовка внутри slot для связки через `aria-labelledby`. |
| `ariaDescribedby` | `string` | — | ID элемента-описания внутри slot для связки через `aria-describedby`. |
| `initialFocus` | `string` | first focusable | CSS-селектор внутри dialog для autofocus при open. По умолчанию — первый focusable элемент. |
| `returnFocus` | `boolean` | `true` | Возвращать ли focus на trigger element при close. Установи `false` для programmatic flow. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `boolean` | На открытие/закрытие. |

v-model: стандартный `v-model="open"`.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | `{ closeDialog: () => void }` | Контент диалога. `closeDialog` — программное закрытие. |
| `background` | — | Кастомный фон (вместо default backdrop). |

## 8. Exposed methods

`DialogExpose`:

| Name | Type | Description |
|---|---|---|
| `isOpen` | `boolean` | Текущее состояние. |
| `toTeleport` | `string` | Текущий target. |
| `size`, `position` | `string \| PositionShort` | Computed. |
| `isCloseButton`, `notCloseBackground`, `withoutMargin` | `boolean` | Флаги. |
| `classBodyDialog`, `classPosition`, `classBase`, `classDialog` | `StyleClass` | CSS. |
| `triggerEl` | `HTMLElement \| null` | Trigger, который был активен до open. Сохраняется автоматически для focus return. |
| `dialogContentRef` | `HTMLElement \| null` | Reference на корневой `<div role="dialog">` (для тестов и axe-core). |
| `closeDialog()` | function | Программное закрытие. |
| `focusFirst()` | function | Программно ставит focus на `initialFocus` или первый focusable элемент. |

## 9. Examples

### 9.1 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    Dialog: { size: "md", position: "center", closeButton: true }
  }
})
```

### 9.2 Bottom drawer

```vue
<Dialog v-model="open" position="bottom" size="full" without-margin>
  <template #default><DrawerContent /></template>
</Dialog>
```

### 9.3 Без animation

```vue
<Dialog v-model="open" :not-animate="true" not-close-background>
  <p>Required action</p>
</Dialog>
```

### 9.4 С Teleport target

```vue
<Dialog v-model="open" to-teleport="#modal-root">
  <template #default>...</template>
</Dialog>
```

## 10. Configuration & Customization

### 10.1 Global

`DialogOption = Pick<DialogProps, "class" | "classBody" | "size" | "position" | "notAnimate" | "closeButton" | "withoutMargin" | "notCloseBackground" | "toTeleport" | "ariaLabel" | "ariaLabelledby" | "ariaDescribedby" | "initialFocus" | "returnFocus">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Backdrop-color — `bg-black/50` по умолчанию; override через slot `background` или `class`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-dialog`.

## 11. Form integration & validation

Не применимо. Внутри Dialog могут быть [Form](./form.md), [Input](./input.md) и т.д.

## 12. Accessibility & Security

### A11y

- Корневой узел — `<div role="dialog" aria-modal="true">` (выставляются всегда). Опционально `aria-label`, `aria-labelledby`, `aria-describedby` через одноимённые props.
- Focus trap: Tab / Shift+Tab циклит focus внутри dialog (native реализация, без сторонних библиотек). Если внутри dialog нет focusable элементов — focus остаётся на корневом узле (`tabindex="-1"`).
- Focus restore: при open сохраняется `document.activeElement` как trigger; при close — focus возвращается на этот trigger. Управляется prop `returnFocus` (default `true`).
- Initial focus: `initialFocus` selector → первый focusable элемент внутри dialog → корневой узел.
- Keyboard: Escape closes; Tab/Shift+Tab cycling внутри dialog.
- `aria-live="polite"` контейнер для динамического status text — `<div data-dialog-live class="sr-only">` внутри корневого узла.
- `prefers-reduced-motion` учтён через `motion-safe:` префикс на всех transitions (translate, opacity, backdrop blur).
- Close button получает локализованный `aria-label` (`Dialog.t("dialog.close")` с fallback `"Close dialog"`).
- RTL: close button использует Tailwind logical `end-2` вместо `right-2`.

### Security

- Teleport target — DOM селектор; убедись, что у тебя есть control над содержимым (XSS surface через user-content в slot).

## 13. TypeScript

```ts
import type { DialogProps, DialogEmits, DialogSlots, DialogExpose } from "fishtvue/dialog"
import Dialog from "fishtvue/dialog"
import { useTemplateRef } from "vue"

const d = useTemplateRef<InstanceType<typeof Dialog>>("d")
d.value?.closeDialog()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 52 кейса (2026-05-12: +22 audit close-out), пересчитать coverage.
- **Breaking changes:** не зафиксировано. Добавление новых props `ariaLabel`/`ariaLabelledby`/`ariaDescribedby`/`initialFocus`/`returnFocus` — additive.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Dialog from "fishtvue/dialog/Dialog.vue"

describe("Dialog", () => {
  it("emits update:modelValue", () => {
    const wrapper = mount(Dialog, {
      props: { modelValue: true },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Dialog.test.ts](../../lib/dialog/Dialog.test.ts) (30 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Dialog не закрывается на Escape | `notCloseBackground` или другое модальное окно перехватывает event. | Проверь z-stack. |
| Focus вернулся не туда | Между open и close сменился `document.activeElement` (например, programmatic focus). | Передавай явный trigger через wrapper или `returnFocus: false` + ручное управление. |
| Teleport target не найден | DOM не существует или ещё не отрендерился. | Тыпа `<div id="modal-root">` в `App.vue`. |
| Animation выглядит резко | `notAnimate: true`, `transition-duration: 0`, или у пользователя `prefers-reduced-motion: reduce`. | Сними флаг / проверь OS-настройки. |
| `closeDialog()` через ref не работает | `isOpen` уже false. | Проверь state. |
| Nested Dialog ломает scroll lock | Не должен — reference-counted lock через `lib/utils/scrollLockHandler.ts`. | Сообщи bug, если counter рассогласован. |
| `initialFocus` selector не сработал | Селектор не находит элемент внутри dialog. | Используй уникальный CSS-класс. |

## 17. Related

- [Button](./button.md), [Icons](./icons.md).
- [TextEditor](./text-editor.md) — рендерится внутри Dialog.
- [FixWindow](./fix-window.md) — для popover/tooltip (не модальный).
- [Alert](./alert.md), [Menu](./menu.md), [Accordion](./accordion.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-12) комментариев `TODO/FIXME/HACK/XXX` в [Dialog.vue](../../lib/dialog/Dialog.vue) и [Dialog.d.ts](../../lib/dialog/Dialog.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage пересчитать через `pnpm coverage` после audit close-out 2026-05-12 (52 кейса).

### Skipped tests

Нет.

### API inconsistencies

- `enterAndLeaveClass` computed дублирует логику `classPosition` — два computed для одной задачи.
- `position?: PositionShort` — широкий enum, narrow на конкретные значения теряется.

### Behavioral caveats

- При множестве Dialog'ов одновременно — backdrop накладывается; reference-counted scroll lock корректно балансируется, но z-index конфликты возможны (рекомендуется один Dialog за раз).
- `withoutMargin: true` убирает padding — useful для full-screen layouts, но контент должен сам обеспечить inner padding.
- `notAnimate: true` отключает enter/leave transition; close на Escape будет резким.
- `motion-safe:` префикс — Tailwind транспилирует в `@media (prefers-reduced-motion: no-preference)`. У пользователей с `reduce` все transitions no-op.
- `returnFocus: true` сохраняет `document.activeElement` в момент open — если фокус был на body (не на trigger), focus return сработает на body.

### Resolved 2026-05-12

- ~~CRITICAL: focus trap не реализован~~ — добавлен native focus trap (Tab/Shift+Tab cycling); см. [Documentation/issues/done/dialog.md Issue 1](../issues/done/dialog.md).
- ~~CRITICAL: escapeListener leak при unmount-while-open~~ — `onBeforeUnmount` снимает listener + освобождает scroll lock; [Issue 2](../issues/done/dialog.md).
- ~~HIGH: body.style race condition при multiple Dialog~~ — reference-counted singleton в [`lib/utils/scrollLockHandler.ts`](../../lib/utils/scrollLockHandler.ts); [Issue 3](../issues/done/dialog.md).
- ~~HIGH: нет `role="dialog"` / `aria-modal`~~ — выставляются всегда; добавлены props `ariaLabel`/`ariaLabelledby`/`ariaDescribedby`; [Issue 4](../issues/done/dialog.md).
- ~~MEDIUM: focus не возвращается на trigger~~ — реализовано через сохранение `document.activeElement`, prop `returnFocus` (default true); [Issue 5](../issues/done/dialog.md).
- ~~HIGH: нет `sideEffects: false`~~ — `lib/dialog/package.json` помечен; [Issue 6](../issues/done/dialog.md) (cross-cutting SSR styles + exports map — Wave 2.1).
- ~~MEDIUM: нет `aria-live` для dynamic content~~ — добавлен sr-only polite region внутри корневого узла; [Issue 7](../issues/done/dialog.md).
- ~~MEDIUM: RTL close button~~ — `end-2` вместо `right-2`; [Issue 8](../issues/done/dialog.md).
- ~~LOW: prefers-reduced-motion~~ — все transitions обёрнуты в `motion-safe:`; [Issue 9](../issues/done/dialog.md).
- ~~Дубль `onMounted(() => Dialog.initStyle())`~~ — удалён, остался только `Component.__hooks()`-канон (Wave 2.3, 8/22).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

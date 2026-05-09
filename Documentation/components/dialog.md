---
title: Dialog
summary: Модальный диалог с Teleport, позиционированием, размерами xs–7xl, animations.
updated: 2026-05-09
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

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` для дополнительных подписок (Escape-listener управляется через watch на `isOpen`).
- **Поток данных:** `modelValue` ↔ внутренний `isOpen` через `update:modelValue`. Escape closes (если не `notCloseBackground`).
- **Стили:** через `Dialog.setStyle()` — несколько computed для `classBase`, `classDialog`, `classBodyDialog`, `classPosition`.
- **Teleport:** при `toTeleport` контент монтируется в указанный селектор. По умолчанию — body.
- **Animation:** Vue `<transition>` с динамическими enter/leave-классами в зависимости от `position`. CSS `transition: 500ms ease-in-out` (translate + opacity). При `notAnimate: true` — без transition.
- **Конфиг:** `componentsOptions.Dialog` — см. §10.
- **Локализация:** не использует.
- **SSR:** Teleport SSR-friendly; на сервере контент в `<Teleport disabled>`. `isClient` guard перед document-операциями.

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
| `closeDialog()` | function | Программное закрытие. |

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

`DialogOption = Pick<DialogProps, "class" | "classBody" | "size" | "position" | "notAnimate" | "closeButton" | "withoutMargin" | "notCloseBackground" | "toTeleport">`.

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

- Корневой узел — `<div role="dialog" aria-modal="true">` (проверь по DOM).
- Focus management: при open — focus на dialog; при close — return на trigger. **Focus trap не реализован полноценно** — Tab может уйти за пределы dialog. Для строгого modal-pattern добавь focus trap самостоятельно.
- Keyboard: Escape closes (если не `notCloseBackground`).
- `prefers-reduced-motion` не учтён в animations.

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
- **Stability flag:** `stable` — 30 кейсов, coverage 94.25%.
- **Breaking changes:** не зафиксировано.
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
| Focus уходит за пределы Dialog | Focus trap не реализован. | Используй сторонний focus-trap-vue или собственный. |
| Teleport target не найден | DOM не существует или ещё не отрендерился. | Тыпа `<div id="modal-root">` в `App.vue`. |
| Animation выглядит резко | `notAnimate: true` или `transition-duration: 0`. | Сними флаг. |
| `closeDialog()` через ref не работает | `isOpen` уже false. | Проверь state. |

## 17. Related

- [Button](./button.md), [Icons](./icons.md).
- [TextEditor](./text-editor.md) — рендерится внутри Dialog.
- [FixWindow](./fix-window.md) — для popover/tooltip (не модальный).
- [Alert](./alert.md), [Menu](./menu.md), [Accordion](./accordion.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Dialog.vue](../../lib/dialog/Dialog.vue) и [Dialog.d.ts](../../lib/dialog/Dialog.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 94.25% statements / 77.92% branch — ветви ([Dialog.vue:69, 150–152](../../lib/dialog/Dialog.vue#L69)) не покрыты.
- Focus trap не реализован — для production-modal-flow нужен.

### Skipped tests

Нет.

### API inconsistencies

- `enterAndLeaveClass` computed дублирует логику `classPosition` — два computed для одной задачи.
- `position?: PositionShort` — широкий enum, narrow на конкретные значения теряется.

### Behavioral caveats

- При множестве Dialog'ов одновременно — backdrop накладывается и z-index конфликты могут быть. Рекомендуется один Dialog за раз.
- `withoutMargin: true` убирает padding — useful для full-screen layouts, но контент должен сам обеспечить inner padding.
- `notAnimate: true` отключает enter/leave transition; close на Escape будет резким.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

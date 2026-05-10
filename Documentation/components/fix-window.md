---
title: FixWindow
summary: Плавающее окно (popover/tooltip), позиционирование относительно элемента или курсора.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# FixWindow

## 1. Overview

`FixWindow` — плавающее окно: popover, tooltip, attached menu. Позиционируется относительно `el` (DOM-узел или selector) или курсора (`byCursor: true`). 12 позиций (top/bottom/left/right + corners), eventOpen/eventClose (`hover/click/mousedown/mouseup/dblclick/contextmenu/none`), задержка, padding от viewport.

Stability: `stable` — 46 кейсов, coverage 77.27%.

Source: [Source](../../lib/fixwindow/FixWindow.vue), [FixWindow.d.ts](../../lib/fixwindow/FixWindow.d.ts), [FixWindow.test.ts](../../lib/fixwindow/FixWindow.test.ts).

## 2. How it's organized

```
lib/fixwindow/
├── FixWindow.vue
├── FixWindow.d.ts        # 257 строк
├── FixWindow.test.ts     # 46 кейсов
└── package.json
```

Зависимости: [Button](./button.md) (close-кнопка), `@heroicons/vue/20/solid` (XMarkIcon). [domHandler.isClient](../utilities/domHandler.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` подписывается на window-events (`click`, `mousedown`, `mouseup`, `dblclick`, `contextmenu`, `scroll`, `resize`, `wheel`, `touchmove`, `keydown`); `onUnmounted` отписывается.
- **Поток данных:** `el` (или родитель slot) → ресolved DOM-узел → расчёт позиции через `getBoundingClientRect` + `window.innerWidth/Height` → CSS `top`/`left`. `eventOpen`/`eventClose` управляют видимостью.
- **Стили:** `FixWindow.setStyle()`. Опционально close-кнопка через [Button](./button.md).
- **Конфиг:** `componentsOptions.FixWindow` — см. §10.
- **Локализация:** не использует.
- **SSR:** обширный список window-events. **Несовместим с SSR без hydration-skip**. На сервере popover не рендерится.
- **Animation:** CSS transition `opacity ease-in-out duration-300`.

## 4. Quick Start

```vue
<script setup lang="ts">
import FixWindow from "fishtvue/fixwindow"
</script>

<template>
  <button id="trigger">Hover me</button>
  <FixWindow el="#trigger" position="bottom" event-open="hover">
    Tooltip text
  </FixWindow>
</template>
```

## 5. Props

`FixWindowProps` ([FixWindow.d.ts](../../lib/fixwindow/FixWindow.d.ts)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean` | — | v-model видимость. |
| `el` | `RefLink` (string selector \| HTMLElement) | — | Целевой элемент. Если не задан — родитель компонента. |
| `scrollableEl` | `RefLink` | — | Скролл-контейнер (для absolute-positioning). |
| `typePosition` | `"absolute" \| "fixed"` | `"absolute"` если `scrollableEl`, иначе `"fixed"` | Тип позиционирования. |
| `position` | `Position` | — | Позиция (12 опций: `top`, `top-start`, `top-end`, `bottom`, `bottom-start`, `bottom-end`, `left`, `left-start`, `left-end`, `right`, `right-start`, `right-end`). |
| `class` / `classBody` | `StyleClass` | — | Контейнер / тело. |
| `mode` | `StyleMode` | — | Стиль. |
| `eventOpen` | `FixWindowEvent` | `"hover"` | `hover \| click \| mousedown \| mouseup \| dblclick \| contextmenu \| none`. |
| `eventClose` | `FixWindowEvent` | (auto на основе eventOpen) | Аналогично. |
| `delay` | `number \| 100 \| 500 \| 1000 \| 1500 \| 2000` | — | Задержка открытия (ms). |
| `marginPx` | `number \| 2 \| 5 \| 10` | — | Отступ от элемента. |
| `translatePx` | `number \| 2 \| 5 \| 10` | — | Fine-tune смещения. |
| `paddingWindow` | `number \| 2 \| 5 \| 10` | — | Padding от viewport. |
| `byCursor` | `boolean` | — | Позиционировать по курсору. |
| `closeButton` | `boolean` | — | Показать `×`-кнопку. |
| `stopOpenPropagation` | `boolean` | — | `stopPropagation` при открытии. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `boolean` | Видимость изменилась. |
| `open` | `MouseEvent \| undefined` | Окно открыто. |
| `close` | `MouseEvent \| undefined` | Окно закрыто. |

v-model: `v-model="visible"` стандартный.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Контент окна. |

## 8. Exposed methods

`FixWindowExpose`:

| Name | Type | Description |
|---|---|---|
| `x`, `y` | `string` | Текущие координаты (CSS units). |
| `isOpen` | `boolean` | Открыт ли. |
| `position`, `delay`, `marginPx`, `isCloseButton`, `eventOpen`, `eventClose` | derived | Computed. |
| `element` | `HTMLElement` | Резолвленный target. |
| `open()` / `close()` | function | Программный toggle. |
| `updatePosition()` | function | Перерасчёт координат. |

## 9. Examples

### 9.1 Tooltip на hover

```vue
<button ref="btn">Info</button>
<FixWindow :el="btn" event-open="hover" :delay="500">Helpful tip</FixWindow>
```

### 9.2 Context menu

```vue
<FixWindow :el="$el" event-open="contextmenu" position="bottom-start" :close-button="true">
  <ul>
    <li>Cut</li><li>Copy</li><li>Paste</li>
  </ul>
</FixWindow>
```

### 9.3 По курсору

```vue
<FixWindow event-open="mousedown" :by-cursor="true" position="bottom-end">
  Quick action
</FixWindow>
```

### 9.4 Программный open/close

```vue
<script setup lang="ts">
import { ref } from "vue"
import FixWindow from "fishtvue/fixwindow"

const visible = ref(false)
</script>

<template>
  <button @click="visible = true">Open</button>
  <FixWindow v-model="visible" event-open="none" :close-button="true">
    Programmatic
  </FixWindow>
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`FixWindowOption = Pick<FixWindowProps, "typePosition" | "position" | "class" | "classBody" | "mode" | "eventOpen" | "eventClose" | "delay" | "marginPx" | "translatePx" | "paddingWindow" | "byCursor" | "closeButton">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Mode-зависимые стили; цвет background — `theme.semantic.primary` или neutral.

### 10.4 CSS layer override

Root класс — `fv fishtvue-fix-window`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- Корневой DOM — `<div>`. Для tooltip-семантики добавь `role="tooltip"` через `props.class` или wrap.
- Keyboard: Escape для закрытия — есть в keydown handler (проверь). Tab навигация по контенту работает.
- Focus trap внутри окна — НЕ реализован. Если нужен полноценный focus trap (для модалов) — используй [Dialog](./dialog.md).
- `prefers-reduced-motion` не учтён.

### Security

- Нет `v-html`.
- Подписки на window-events — потенциальная утечка memory при rapid mount/unmount; на практике `onUnmounted` отписывается корректно.
- `border` computed как inline style ([FixWindow.d.ts](../../lib/fixwindow/FixWindow.d.ts)) — учитывай в CSP `style-src 'unsafe-inline'`.

## 13. TypeScript

```ts
import type {
  FixWindowProps, FixWindowEmits, FixWindowExpose,
  Position, FixWindowEvent, RefLink
} from "fishtvue/fixwindow"
import FixWindow from "fishtvue/fixwindow"
import { useTemplateRef } from "vue"

const fw = useTemplateRef<InstanceType<typeof FixWindow>>("fw")
fw.value?.open()
fw.value?.updatePosition()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Browser:** evergreen. Использует `getBoundingClientRect`, `window.innerWidth/Height`.
- **Stability flag:** `stable` — 46 кейсов, coverage 77.27%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import FixWindow from "fishtvue/fixwindow/FixWindow.vue"

describe("FixWindow", () => {
  it("mounts", () => {
    const wrapper = mount(FixWindow, {
      props: { eventOpen: "none" },
      slots: { default: "<div>test</div>" },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [FixWindow.test.ts](../../lib/fixwindow/FixWindow.test.ts) (46 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Window не появляется | `el` не резолвится в DOM. | Передай явный `<button ref="...">` или `el="#id"`. |
| Window открывается мимо trigger | `position` некорректен или viewport overflow. | Проверь `paddingWindow` и `marginPx`. |
| Window закрывается на любом клике | `eventClose` ранний. | Установи `event-close="none"` и закрывай программно. |
| `byCursor: true` дёргается | Postion обновляется на каждое движение мыши. | Установи `event-open="click"` для статичной позиции. |
| Memory leak при частом mount/unmount | На теории — потенциально, на практике Vue корректно отписывается. | Если воспроизводится — дай минимальный repro. |
| Window не появляется в Nuxt SSR | Подписки на window не работают на сервере. | Оборачивай в `<ClientOnly>` или используй `import.meta.client` guard. |

## 17. Related

- [Dialog](./dialog.md) — full-screen модал с focus trap.
- [Menu](./menu.md), [Select](./select.md) — потребители FixWindow для popover.
- [Button](./button.md) — `type="icon"` использует FixWindow для tooltip.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [FixWindow.vue](../../lib/fixwindow/FixWindow.vue) и [FixWindow.d.ts](../../lib/fixwindow/FixWindow.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 77.27% statements / 65.36% branch — заметная часть веток ([FixWindow.vue:554, 556, 568–661](../../lib/fixwindow/FixWindow.vue#L554)) не покрыта.
- Focus trap не реализован — для модальных диалогов используй [Dialog](./dialog.md).

### Skipped tests

Нет.

### API inconsistencies

- `delay`, `marginPx`, `translatePx`, `paddingWindow` объявлены как `number | <literal>` open union — narrow не работает.
- `el?: RefLink` — `RefLink = string | HTMLElement | ...` — тип несколько overloaded.
- `position?: Position` — без default; реальный default определяется внутри.

### Behavioral caveats

- Подписки на window-events глобальные — при множестве FixWindow одновременно overhead растёт. Для tooltip-heavy UI оптимизируй mount-graph.
- На SSR не рендерится — оборачивай в ClientOnly в Nuxt.
- При смене `el` (reactive) — позиция пересчитывается через `updatePosition()`, но slot вне нового `el` сохраняет старые координаты.
- `byCursor: true` не учитывает scroll body — может «отставать» при быстром скролле.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

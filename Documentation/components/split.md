---
title: Split
summary: Resizable панели с persistence через localStorage, horizontal/vertical, mouse+touch.
updated: 2026-05-09
stability: beta
since: 0.2.11
---

# Split

## 1. Overview

`Split` — resizable панели с разделителями (separator). Поддерживает horizontal/vertical направление, persistence размеров через `autoSaveName` (localStorage), `min`/`max`/`disabled`/`hidden` per-panel, единицы `percentages` или `pixels`. Динамические slots по `panel.name`.

Stability: `beta` — 7 кейсов, coverage `Split.vue` 60.48% statements / 39.15% branch. Ряд edge cases (touch + быстрый unmount) не покрыт.

Source: [Source](../../lib/split/Split.vue), [Split.d.ts](../../lib/split/Split.d.ts), [Split.test.ts](../../lib/split/Split.test.ts).

## 2. How it's organized

```
lib/split/
├── Split.vue
├── Split.d.ts          # 292 строки
├── Split.test.ts       # 7 кейсов
└── package.json
```

Зависимости: [Icons](./icons.md). [objectHandler.deepCopyObject/deepMergeSoft](../utilities/objectHandler.md), [domHandler.isClient](../utilities/domHandler.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` инициализирует `ResizeObserver` для отслеживания смены размеров контейнера.
- **Поток данных:** `panels` (массив с `name`/`size`/`minSize`/`maxSize`) → reactive `sizePanels` map → CSS `flex-basis` или абсолютные размеры → emits.
- **Persistence:** при `autoSaveName: "myKey"` — размеры пишутся в `localStorage[`fv-split-{key}`]`.
- **Стили:** через `setStyle`. Cursor body classes (`document.body.classList.add("...cursor")`) — для всего body во время drag.
- **Конфиг:** `componentsOptions.Split` — см. §10.
- **Локализация:** не использует.
- **SSR:** `isClient()` guard перед DOM-доступом и `ResizeObserver`. На сервере панели рендерятся с initial sizes; observer не подключается. SSR несовместим с persistence — localStorage недоступен.
- **Animation:** CSS `transition-all` на корневом контейнере.

## 4. Quick Start

```vue
<script setup lang="ts">
import Split from "fishtvue/split"

const panels = [
  { name: "left", size: 30, minSize: 10 },
  { name: "right", size: 70, minSize: 20 }
]
</script>

<template>
  <Split :panels="panels" direction="horizontal" auto-save-name="layout">
    <template #left><div>Left</div></template>
    <template #right><div>Right</div></template>
  </Split>
</template>
```

## 5. Props

`SplitProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `panels` | `MaybeRef<Panel[]>` | — | Декларация панелей. **Обязателен**. |
| `direction` | `"vertical" \| "horizontal"` | — | Направление splitting. |
| `units` | `"percentages" \| "pixels"` | — | Единицы размера. |
| `autoSaveName` | `string` | — | Ключ localStorage. |
| `separatorType` | `"strip" \| "hexagon" \| IconsProps["type"]` | — | Тип разделителя. |
| `separatorNotHoverOpacity` | `boolean` | — | Показывать разделитель только на hover. |
| `class` | `StyleClass` | — | Класс контейнера. |
| `styles` | `ISplitStyles` | — | `{ panel?, separator? }` overrides. |

`Panel`:

| Field | Type | Description |
|---|---|---|
| `name` | `string` | Уникальный id (используется как имя slot). |
| `size` | `number` | Initial size. |
| `maxSize` / `minSize` | `number` | Лимиты. |
| `disabled` | `boolean` | Запретить resize. |
| `hidden` | `boolean` | Скрыть панель. |
| `class` | `StyleClass` | Per-panel class. |
| `[key]: any` | — | Дополнительные пользовательские поля. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `updated-panels` | `Record<Panel["name"], number>` | Все размеры обновлены. |
| `updated-size-panel` | `(size: number, namePanel: string)` | Один panel изменён. |
| `start-resize-panel` | `(event?: PointerEvent, namePanel?: string)` | Начало drag. |
| `stop-resize-panel` | `(event?: PointerEvent, namePanel?: string)` | Конец drag. |
| `move-resize-panel` | `(event: PointerEvent, namePanel: string)` | Во время drag. |
| `out-resize-panel` | `(event: PointerEvent, namePanel: string)` | Указатель вышел за границу. |

v-model contract — не применимо.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `[panelName]` | `{ size: number, panel: Panel }` | Динамический slot — имя совпадает с `panel.name`. |

## 8. Exposed methods

`SplitExpose`:

| Name | Type | Description |
|---|---|---|
| `resizableGroup` | `HTMLElement \| undefined` | DOM root. |
| `resizablePanels` | `Record<string, HTMLElement>` | DOM-узлы панелей. |
| `sizePanels` | `Record<string, number>` | Текущие размеры. |
| `cursorPanels` | `Record<string, CursorType>` | Cursor types per panel. |
| `activeCursorPanel` | `CursorType` | Текущий active. |
| `units`, `panels`, `direction`, `separatorType`, `separatorNotHoverOpacity`, `styles`, `classBase` | Derived. |

## 9. Examples

### 9.1 Horizontal с persistence

```vue
<Split
  :panels="[{ name: 'a', size: 50 }, { name: 'b', size: 50 }]"
  direction="horizontal"
  auto-save-name="my-layout">
  <template #a><div>A</div></template>
  <template #b><div>B</div></template>
</Split>
```

### 9.2 Vertical, pixels

```vue
<Split
  :panels="[{ name: 'top', size: 200, minSize: 100 }, { name: 'bot', size: 300 }]"
  direction="vertical"
  units="pixels">
  <template #top><Header /></template>
  <template #bot><Body /></template>
</Split>
```

### 9.3 Hidden panel

```vue
<Split :panels="[
  { name: 'sidebar', size: 20, hidden: !showSidebar },
  { name: 'main', size: 80 }
]">
  <template #sidebar><Sidebar /></template>
  <template #main><Main /></template>
</Split>
```

### 9.4 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    Split: { separatorType: "strip", separatorNotHoverOpacity: true }
  }
})
```

## 10. Configuration & Customization

### 10.1 Global

`SplitOption = Pick<SplitProps, "separatorType" | "separatorNotHoverOpacity" | "class" | "styles">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Cursor цвета, separator hover-opacity. Custom через `styles.{panel,separator}`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-split`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- Разделители — focusable elements (или должны быть). ARIA `role="separator"` + `aria-orientation` — проверь по DOM.
- Keyboard для resize: ArrowLeft/Right (horizontal), ArrowUp/Down (vertical) — реализуй на стороне SFC, если не присутствует.
- `prefers-reduced-motion` не учитывается.

### Security

- localStorage — только для размеров. Данные не sensitive.

## 13. TypeScript

```ts
import type { SplitProps, SplitEmits, SplitExpose, Panel, ISplitStyles, CursorType } from "fishtvue/split"
import Split from "fishtvue/split"
import { useTemplateRef } from "vue"

const sp = useTemplateRef<InstanceType<typeof Split>>("sp")
sp.value?.sizePanels
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Browser:** evergreen. `ResizeObserver` ≥ Chrome 64 / Firefox 69 / Safari 13.1.
- **Stability flag:** `beta`.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Split from "fishtvue/split/Split.vue"

describe("Split", () => {
  it("рендерит панели", () => {
    const wrapper = mount(Split, {
      props: { panels: [{ name: "a" }, { name: "b" }], direction: "horizontal" },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Split.test.ts](../../lib/split/Split.test.ts) (7 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Размеры не сохраняются | `autoSaveName` не задан или localStorage недоступен. | Проверь `autoSaveName`. |
| Resize рывками | `ResizeObserver` срабатывает на каждое движение. | Это by design; для smoother — debounce на стороне consumer. |
| Cursor не меняется на body | `document.body` недоступен (SSR). | Проверь `isClient()` guard. |
| Sum sizes ≠ 100% (percentages) | Округление + min/max constraints. | Перенормируй на стороне consumer через `updated-panels` event. |
| Touch resize дёргается на iOS | `event.preventDefault()` нужен на native scroll. | Проверь обработчики touch-events в реализации. |

## 17. Related

- [Separator](./separator.md), [FixWindow](./fix-window.md), [Dialog](./dialog.md).
- [Icons](./icons.md) — для separators.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Split.vue](../../lib/split/Split.vue) и [Split.d.ts](../../lib/split/Split.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 60.48% statements / 39.15% branch — большая часть веток ([Split.vue:524, 557–559, 600](../../lib/split/Split.vue#L524)) не покрыта.

### Skipped tests

Нет.

### API inconsistencies

- `Panel: { [key]: any }` — открытое расширение полей; типизация теряется.
- `separatorType: "strip" | "hexagon" | IconsProps["type"]` — open union (через IconsProps["type"]).
- `direction: "vertical" | "horizontal"` — без default; type обязательно требует значения.
- `panels: MaybeRef<Panel[]>` — может быть ref или константа.

### Behavioral caveats

- localStorage недоступен на SSR — persistence не работает на сервере.
- `ResizeObserver` может протекать при быстром unmount — теоретически. На практике v3.5 Vue вызывает `onUnmounted` корректно.
- При `units: "percentages"` сумма sizes должна быть 100; иначе layout «прыгает».
- `disabled: true` не блокирует touch-events на некоторых старых iOS — проверь интеграционно.
- `document.body.classList.add` для cursor type — может конфликтовать с другими global-cursor-mutators.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

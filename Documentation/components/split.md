---
title: Split
summary: Resizable панели с persistence через localStorage, horizontal/vertical, Pointer Events (mouse+touch+pen), keyboard resize и ARIA separator.
updated: 2026-07-05
stability: stable
since: 0.2.11
---

# Split

## 1. Overview

`Split` — resizable панели с разделителями (separator). Поддерживает horizontal/vertical направление, persistence размеров через `autoSaveName` (localStorage), `min`/`max`/`disabled`/`hidden` per-panel, единицы `percentages` или `pixels`. Resize — через Pointer Events (mouse + touch + pen) либо с клавиатуры на focused separator. Динамические slots по `panel.name`.

Stability: `stable` — 44 кейса, coverage `Split.vue` 85.1% statements / 72.3% branch.

Source: [Source](../../lib/split/Split.vue), [Split.d.ts](../../lib/split/Split.d.ts), [Split.test.ts](../../lib/split/Split.test.ts).

## 2. How it's organized

```
lib/split/
├── Split.vue
├── Split.d.ts          # 302 строки
├── Split.test.ts       # 44 кейса
└── package.json        # "sideEffects": false
```

Зависимости: [Icons](./icons.md). [objectHandler.deepCopyObject/deepMergeSoft](../utilities/objectHandler.md), [domHandler.isClient](../utilities/domHandler.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` сам регистрирует `onServerPrefetch + vueOnMounted → initStyle()` — в SFC нет ручного `Split.initStyle()`. `onMounted` инициализирует `ResizeObserver` для отслеживания смены размеров контейнера и восстанавливает сохранённые размеры ([Split.vue:167-180](../../lib/split/Split.vue#L167-L180)).
- **Поток данных:** `panels` (массив с `name`/`size`/`minSize`/`maxSize`) → reactive `sizePanels` map → CSS `flex-basis` или абсолютные размеры → emits.
- **Resize:** Pointer Events (`pointerdown/move/up/cancel` + `setPointerCapture`) покрывают mouse + touch + pen; либо стрелки на focused separator (см. §12). Завершение drag (`stopResizePanel`) подстраховано window-листенерами `pointerup`/`pointercancel`, которые ставятся на `startResizePanel` и снимаются на stop/unmount — поэтому отпускание указателя **вне** компонента (или viewport) корректно гасит overlay, а не оставляет курсор-resize залипшим ([startResizePanel/stopResizePanel — Split.vue:636-685](../../lib/split/Split.vue#L636-L685)).
- **Persistence:** при `autoSaveName: "myKey"` размеры пишутся в `localStorage["fv-split-{key}"]` по окончании resize (pointer и keyboard) и восстанавливаются на mount. Чтение/запись guarded через `isClient()` ([restoreSizes/persistSizes — Split.vue:422-451](../../lib/split/Split.vue#L422-L451)). При повреждённых данных значения игнорируются (остаются initial sizes).
- **Стили:** через `setStyle`. Курсор во время drag задаётся overlay-элементом `<div data-split-drag-overlay class="fixed inset-0">` ([Split.vue:106-108](../../lib/split/Split.vue#L106-L108), [Split.vue:762](../../lib/split/Split.vue#L762)) — `document.body.classList` **не** мутируется (несколько Split на странице не конфликтуют).
- **Конфиг:** `componentsOptions.Split` — см. §10.
- **Локализация:** не использует.
- **SSR:** `isClient()` guard перед DOM-доступом, `ResizeObserver` и persistence. На сервере панели рендерятся с initial sizes; observer не подключается, localStorage не читается.
- **Animation:** `motion-safe:transition-all` на корневом контейнере — анимация отключается при `prefers-reduced-motion: reduce`.

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
| `autoSaveName` | `string` | — | Persistence размеров в `localStorage["fv-split-{name}"]` (save на resize end, restore на mount, isClient-guarded). |
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
| `focus()` | `() => void` | Переводит фокус на первый resize handle (separator). G34. |
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

- Resize handle — `<div role="separator" tabindex="0">` с `aria-orientation` (= `direction`), `aria-valuenow`/`aria-valuemin`/`aria-valuemax` (по размеру и `min`/`max` панели) и `aria-controls`, ссылающимся на `id` управляемой панели ([Split.vue:708-730](../../lib/split/Split.vue#L708-L730)). Disabled-разделитель помечается `aria-disabled="true"`.
- Keyboard для resize на focused separator ([onSeparatorKeydown — Split.vue:479](../../lib/split/Split.vue#L479)): `ArrowRight`/`ArrowLeft` (horizontal) либо `ArrowDown`/`ArrowUp` (vertical) — шаг 10 (с `Shift` — 50); `Home`/`End` — к минимуму/максимуму. В RTL (`dir="rtl"`) стрелки horizontal инвертируются (`ArrowLeft` растит ведущую панель). Размер переносится между смежными панелями с учётом `min`/`max`.
- Resize доступен с touch/pen — через Pointer Events (`touch-none` на разделителе предотвращает scroll-конфликт).
- `prefers-reduced-motion`: transition корня обёрнут в `motion-safe:` ([Split.vue:100](../../lib/split/Split.vue#L100)) — при `reduce` анимации отключаются (WCAG 2.3.3).
- **RTL:** для horizontal direction resize работает в обе стороны — `isRtlHorizontal()` ([Split.vue:412](../../lib/split/Split.vue#L412)) детектит `getComputedStyle(...).direction === "rtl"` и зеркалит pointer-математику и стрелки. Физических `left/right` CSS-offset'ов у Split нет, поэтому логические-классы не требуются.
- **forced-colors (high-contrast):** разделитель несёт `forced-colors:outline` ([Split.vue:83](../../lib/split/Split.vue#L83)) — остаётся видимым в Windows high-contrast, где `bg-*` сбрасывается. Структурная divider-линия использует semantic-токен `bg-surface-200 dark:bg-surface-800` (не hardcode `gray-*`, см. [issues/split.md Issue 10](../issues/split.md)).

### Security

- localStorage — только размеры панелей (числа). Данные не sensitive. Контент панелей приходит через slot — компонент не рендерит HTML из props.

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
- **Browser:** evergreen. `ResizeObserver` ≥ Chrome 64 / Firefox 69 / Safari 13.1. Pointer Events — все evergreen.
- **Stability flag:** `stable`.
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

Реальные тесты — [Split.test.ts](../../lib/split/Split.test.ts) (44 кейса).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Размеры не сохраняются | `autoSaveName` не задан, либо localStorage недоступен (private mode / quota). | Проверь `autoSaveName`; запись isClient-guarded и не падает при ошибке. |
| Resize рывками | `ResizeObserver` срабатывает на каждое движение. | Это by design; для smoother — debounce на стороне consumer. |
| Курсор при drag не на весь экран | overlay `[data-split-drag-overlay]` рендерится только во время drag. | На SSR drag нет; курсор задаётся overlay, а не `document.body`. |
| Курсор-resize залип после drag | Указатель отпущен вне компонента — раньше `stopResizePanel` ждал `@pointerup` только на separator. | Исправлено: drag завершается window-листенерами `pointerup`/`pointercancel` (ставятся на start, снимаются на stop/unmount). |
| Sum sizes ≠ 100% (percentages) | Округление + min/max constraints. | Перенормируй на стороне consumer через `updated-panels` event. |
| Touch resize не работает | Перехвачен браузерным scroll. | Resize идёт через Pointer Events; `touch-none` на разделителе уже отключает scroll-жест. |

## 17. Related

- [Separator](./separator.md), [FixWindow](./fix-window.md), [Dialog](./dialog.md).
- [Icons](./icons.md) — для separators.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-06-06) комментариев `TODO/FIXME/HACK/XXX` в [Split.vue](../../lib/split/Split.vue) и [Split.d.ts](../../lib/split/Split.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 85.1% statements / 72.3% branch (2026-07-05, 44 кейса). Часть ветвей геометрии resize (`resizePanel` math) проверяется через mock'и `getBoundingClientRect`/`ResizeObserver` — реальный pixel-perfect resize валидируется только в браузере.

### Skipped tests

Нет.

### API inconsistencies

- `Panel: { [key]: any }` — открытое расширение полей; типизация теряется.
- `separatorType: "strip" | "hexagon" | IconsProps["type"]` — open union (через IconsProps["type"]).
- `direction: "vertical" | "horizontal"` — без default; type обязательно требует значения.
- `panels: MaybeRef<Panel[]>` — может быть ref или константа.

### Behavioral caveats

- Persistence isClient-guarded: на SSR localStorage не читается/не пишется (no-op), размеры восстанавливаются после hydration в `onMounted`.
- Сохранённые размеры трактуются в тех же `units`, что были при сохранении; смена `units` между сессиями (percentages ↔ pixels) даст неверные значения — сбрось ключ при смене единиц.
- `ResizeObserver` отключается в `onUnmounted` (`unobserve` + `disconnect`).
- При `units: "percentages"` сумма sizes должна быть 100; иначе layout «прыгает».
- Keyboard-resize переносит размер только между двумя смежными панелями (handle ↔ следующая панель), без каскадного распределения как при pointer-drag.

### Deferred (cross-cutting)

Аудит-issues Split закрыты (matrix `0/0/0/0`, см. [issues/split.md](../issues/split.md)): A4-5 exports map (inherited, Wave 2.1 ✅), F31 RTL (dir-aware resize-математика ✅), G34 root-ref expose (`focus()` ✅), B10 resize-handle (`forced-colors:outline` + preset-aware `theme-*` accent ✅ 2026-06-13, структурная divider-линия `surface-*` ✅ 2026-07-05 — B10 для Split закрыт полностью). Split был одним из 8 «residual»-компонентов Wave 9 (accent мигрирован раньше, структурные нейтрали оставались до этого захода) — остальные residual-компоненты и отдельный Alert severity-color эпик остаются cross-cutting, централизованный трекинг — [theme.md Issue 1](../issues/theme.md) / [issues/README.md](../issues/README.md) / Wave 9.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

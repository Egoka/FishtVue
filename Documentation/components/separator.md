---
title: Separator
summary: Разделитель горизонтальный/вертикальный, gradient, depth, контент по логической позиции (start/end/center/full, RTL-aware).
updated: 2026-09-14
stability: stable
since: 0.2.11
---

# Separator

## 1. Overview

`Separator` — визуальный разделитель секций. Поддерживает горизонтальную/вертикальную ориентацию, gradient (плавная прозрачность к краям), depth (глубина теневого эффекта), контент по логической позиции (`start`/`end`/`center`/`full`, RTL-aware). Без emit'ов и v-model.

Stability: `stable` — 45 кейсов, coverage 88.7%.

Source: [Source](../../lib/separator/Separator.vue), [Separator.d.ts](../../lib/separator/Separator.d.ts), [Separator.test.ts](../../lib/separator/Separator.test.ts).

## 2. How it's organized

```
lib/separator/
├── Separator.vue
├── Separator.d.ts        # 205 строк
├── Separator.test.ts     # 45 кейсов
└── package.json
```

Зависимости: только [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** автоматическая инжекция стилей.
- **Поток данных:** props → computed `orientation`, `content` (неизвестное значение сводит к `center`), `gradient`, `gradientLength`, `depth` → `cls(key, …)` через `Separator.resolveClasses<SeparatorClassKey>(props)`.
- **A11y:** корень — `role="separator"` + `aria-orientation` (значение `orientation`); line-сегменты `aria-hidden="true"`. См. §12.
- **Стили:** через `setStyle`. Gradient реализован как два line-сегмента слева/справа от контента с прозрачностью.
- **Конфиг:** `componentsOptions.Separator` — см. §10.
- **Локализация:** не использует.
- **SSR:** SSR-safe.
- **RTL:** `contentPosition` — logical (`start`/`end`); порядок сегментов зеркалится автоматически через flex main-axis при `dir="rtl"` (без `useDirectionality()`), направление градиента — через `rtl:`-вариант. См. §12.
- **Animation:** нет.

## 4. Quick Start

```vue
<script setup lang="ts">
import Separator from "fishtvue/separator"
</script>

<template>
  <Separator />
  <!-- горизонтальная линия -->

  <Separator orientation="vertical" />
  <!-- вертикальная -->

  <Separator content-position="center">OR</Separator>
</template>
```

## 5. Props

`SeparatorProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Ориентация (бывший булев `vertical`). Единое имя с [Menu](./menu.md) и [Split](./split.md); неизвестное значение сводится к дефолту. |
| `contentPosition` | `"start" \| "end" \| "center" \| "full"` | `"center"` | Логическая позиция slot-content (RTL-aware). Физические `"left"`/`"right"` сняты — сводятся к `center`. См. §12, §14. |
| `gradient` | `Gradient \| [Gradient, GradientLength] \| boolean` | — | Плавная прозрачность. `Gradient`/`GradientLength` — `0..100`. |
| `depth` | `Depth` (`0..7`) | `1` | Глубина (толщина линии в px). |
| `class` | `StyleClass` | — | Классы **только корня** `[data-separator]` (dev-patterns §2 A). |
| `classes` | `ClassesMap<SeparatorClassKey>` | — | Карта внутренних элементов. См. §5.1. |

### 5.1 Classes keys

`SeparatorClassKey = "segment" | "segmentStart" | "segmentEnd" | "line" | "lineStart" | "lineEnd" | "content"` ([Separator.d.ts:27–34](../../lib/separator/Separator.d.ts#L27-L34)). Имена логические (`start`/`end`), а не физические: в RTL сегменты зеркалятся flex main-axis'ом.

| Key | Element (`data-*`) | Kind | Default |
| --- | --- | --- | --- |
| `root` | `[data-separator]` | element | `relative flex w-auto justify-center` (+ `flex-col h-full` при `vertical`) |
| `segment` | `[data-separator-start]` **и** `[data-separator-end]` | element | `relative flex items-center w-full` (бывший `classBodyLine`) |
| `segmentStart` / `segmentEnd` | только начальный / конечный сегмент | element | — (бывшие `classBodyLineLeft` / `classBodyLineRight`) |
| `line` | `[data-separator-line]` внутри обоих сегментов | element | `bg-surface-200 dark:bg-surface-800` + gradient-градации (бывший `classLine`) |
| `lineStart` / `lineEnd` | линия конкретного сегмента | element | `rounded-l-[2px]` / `rounded-r-[2px]` (бывшие `classLineLeft` / `classLineRight`) |
| `content` | `[data-separator-content]` (`<span>` со слотом) | element | `relative min-w-max text-sm text-surface-500` |

Пары «общий → частный» собираются одним вызовом `cls(["segment", "segmentStart"], …)`: сегменты потребителя разворачиваются в этом порядке, поэтому при twMerge-конфликте частный ключ выигрывает у общего.

## 6. Events / Emits + v-model contract

`SeparatorEmits = null` — Separator не эмитит.

**v-model contract** — не применимо для этого компонента: у Separator нет собственного
значения, это чисто презентационный разделитель.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Контент по центру/выбранной позиции (например, `"OR"`). |

## 8. Exposed methods

`SeparatorExpose`:

| Name | Type | Description |
|---|---|---|
| `orientation` | `"horizontal" \| "vertical"` | Резолвленная ориентация. |
| `content` | `string` | Текущий contentPosition. |
| `gradient` | `number` | Резолвленный gradient. |
| `gradientLength` | `number` | Длина gradient. |
| `depth` | `number` | Текущий depth. |
| `classBase` | `StyleClass` | Финальный класс контейнера. |
| `classSegmentStart`, `classLineStart`, `classSegmentEnd`, `classLineEnd`, `classContent` | `StyleClass` | Финальные классы сегментов, линий и контента. |

## 9. Examples

### 9.1 С контентом

```vue
<Separator content-position="center" :gradient="true">
  <span>OR</span>
</Separator>
```

### 9.2 Vertical с глубиной

```vue
<div class="flex h-32">
  <div>Left</div>
  <Separator orientation="vertical" :depth="3" />
  <div>Right</div>
</div>
```

### 9.3 Кастомный gradient

```vue
<Separator :gradient="[60, 40]" />
<!-- gradient = 60%, gradient-length = 40% -->
```

### 9.4 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    Separator: { contentPosition: "center", gradient: true, depth: 1 }
  }
})
```

## 10. Configuration & Customization

### 10.1 Global

`SeparatorOption = Pick<SeparatorProps, "orientation" | "contentPosition" | "gradient" | "depth" | "class" | "classes">` ([Separator.d.ts:165–168](../../lib/separator/Separator.d.ts#L165-L168)). Карта `classes` сливается с props **по ключу** (dev-patterns §2 C).

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвет line — semantic-токен `surface-*` (`via-surface-*`/`to-surface-*`/`bg-surface-*`, `dark:`-варианты); дефолт совпадает с прежней `gray`-шкалой, переопределяется глобально через `updateSurfacePalette()` без правки самого компонента (см. [Theme](../architecture/theme.md)).

### 10.4 CSS layer override

Root класс — `fv fishtvue-separator`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- Корневой элемент рендерится с `role="separator"` и `aria-orientation` (значение `orientation`, `"horizontal"` по умолчанию) — screen reader идентифицирует разделитель автоматически.
- Slot-контент (например, `"OR"`) становится accessible name разделителя. Декоративные line-сегменты (`[data-separator-start]` / `[data-separator-end]`) помечены `aria-hidden="true"`.
- Отдельного `decorative` prop нет: разделитель всегда семантический (поведение по умолчанию Radix/shadcn).

### RTL

- `contentPosition` использует logical-значения `"start"`/`"end"` — `"start"` у логического начала строки (слева в LTR, справа в RTL), `"end"` у конца. Порядок line-сегментов зеркалится автоматически: корень — flex, его main-axis следует document `direction`, поэтому при `dir="rtl"` сегменты меняются местами без дополнительного CSS и без `useDirectionality()` (зеркало паттерна Button).
- Направление градиента горизонтальных сегментов несёт `rtl:`-вариант (`rtl:bg-gradient-to-l` / `rtl:bg-gradient-to-r`) — заливка корректно затухает к краю и в RTL.
- Deprecated физические `"left"`/`"right"` не RTL-safe; в dev-режиме выводят `console.warn` с рекомендацией перейти на `start`/`end`.

### Security

- Не рендерит HTML из props.

## 13. TypeScript

```ts
import type { SeparatorProps, SeparatorExpose, Gradient, Depth } from "fishtvue/separator"
import Separator from "fishtvue/separator"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 61 кейс, coverage 88.7%.
- **Breaking changes (1.0.0, редизайн props):**
  - булев `vertical` → `orientation: "horizontal" | "vertical"`.
  - `classBodyLine`/`classBodyLineLeft`/`classBodyLineRight` → `classes.segment`/`segmentStart`/`segmentEnd`; `classLine`/`classLineLeft`/`classLineRight` → `classes.line`/`lineStart`/`lineEnd`; `classContent` → `classes.content`; `class` адресует **только** корень.
  - DOM: `data-separator-left`/`-right` → `data-separator-start`/`-end`.
  - `contentPosition: "left" | "right"` сняты (сводятся к `center`) вместе с их dev-warn'ом.
  - expose: `vertical` → `orientation`, `classBodyLine*`/`classLine*` → `classSegment*`/`classLine*`.
- **Deprecations:** нет — старые имена сняты без алиасов (решения R6/R7).

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Separator from "fishtvue/separator/Separator.vue"

describe("Separator", () => {
  it("renders default", () => {
    const wrapper = mount(Separator, { global: { plugins: [[FishtVue, {}]] } })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Separator.test.ts](../../lib/separator/Separator.test.ts) (61 кейс).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Vertical не растягивается | Родительский контейнер без определённой высоты. | Установи `height` на parent или на `Separator` через `class`. |
| Gradient не виден | `gradient: true` без contentPosition. | Установи `content-position="center"`. |
| Depth выглядит одинаково для 0 и 7 | Эффект subtle. | Используй больше contrast в [Theme](../architecture/theme.md). |
| Контент центрируется не идеально | `contentPosition: "center"` распределяет slot по середине. | Используй `class` для fine-tune padding'ов. |

## 17. Related

- [Split](./split.md) — для resizable панелей.
- [FixWindow](./fix-window.md), [Dialog](./dialog.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Separator.vue](../../lib/separator/Separator.vue) и [Separator.d.ts](../../lib/separator/Separator.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 88.7% (statements) / 89.07% (branch) — финальная ветка `gradientLength` ([Separator.vue:52](../../lib/separator/Separator.vue#L52)) не покрыта.

### Skipped tests

Нет.

### API inconsistencies

- `Gradient` и `GradientLength` — оба `0..100` numeric, функционально эквивалентны. Дублирующие типы.
- `gradient: Gradient | [Gradient, GradientLength] | boolean` — широкий union: number, tuple, boolean.
- ~~ARIA-роль `role="separator"` не выставляется в шаблоне.~~ ✅ resolved 2026-06-06 — корень рендерит `role="separator"` + `aria-orientation`.
- ~~`contentPosition: "left" | "right"` — буквальные направления, не RTL-safe.~~ ✅ resolved 2026-06-14 — мигрировано на logical `start`/`end`, порядок сегментов зеркалится через flex, градиент — `rtl:`-вариант; физические алиасы окончательно сняты в 1.0.0. См. [issues/separator.md Issue 3](../issues/separator.md).
- ~~Булев `vertical` расходился с `orientation` у Menu/Split и не давал третьего значения.~~ ✅ resolved (1.0.0): единый `orientation`.

### Behavioral caveats

- При `orientation="vertical"` родительский flex-контейнер должен иметь определённую высоту. Иначе separator схлопывается до 0.
- Computed `gradient` нормализует input в число — boolean `true` интерпретируется как 0/100 (см. реализацию).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

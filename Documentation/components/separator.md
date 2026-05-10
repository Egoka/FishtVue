---
title: Separator
summary: Разделитель горизонтальный/вертикальный, gradient, depth, контент по центру.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Separator

## 1. Overview

`Separator` — визуальный разделитель секций. Поддерживает горизонтальную/вертикальную ориентацию, gradient (плавная прозрачность к краям), depth (глубина теневого эффекта), контент по центру/слева/справа. Без emit'ов и v-model.

Stability: `stable` — 25 кейсов, coverage 83.92%.

Source: [Source](../../lib/separator/Separator.vue), [Separator.d.ts](../../lib/separator/Separator.d.ts), [Separator.test.ts](../../lib/separator/Separator.test.ts).

## 2. How it's organized

```
lib/separator/
├── Separator.vue
├── Separator.d.ts        # 195 строк
├── Separator.test.ts     # 25 кейсов
└── package.json
```

Зависимости: только [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** автоматическая инжекция стилей.
- **Поток данных:** props → computed `vertical`, `content`, `gradient`, `gradientLength`, `depth` → `Separator.setStyle()`.
- **Стили:** через `setStyle`. Gradient реализован как два line-сегмента слева/справа от контента с прозрачностью.
- **Конфиг:** `componentsOptions.Separator` — см. §10.
- **Локализация:** не использует.
- **SSR:** SSR-safe.
- **Animation:** нет.

## 4. Quick Start

```vue
<script setup lang="ts">
import Separator from "fishtvue/separator"
</script>

<template>
  <Separator />
  <!-- горизонтальная линия -->

  <Separator vertical />
  <!-- вертикальная -->

  <Separator content-position="center">OR</Separator>
</template>
```

## 5. Props

`SeparatorProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `vertical` | `boolean` | `false` | Вертикальная ориентация. |
| `contentPosition` | `"right" \| "left" \| "center" \| "full"` | — | Позиция slot-content. |
| `gradient` | `Gradient \| [Gradient, GradientLength] \| boolean` | — | Плавная прозрачность. `Gradient`/`GradientLength` — `0..100`. |
| `depth` | `Depth` (`0..7`) | — | Глубина (тень). |
| `class` | `StyleClass` | — | Класс контейнера. |
| `classBodyLine`, `classLine` | `StyleClass` | — | Body-line wrapper / line. |
| `classContent` | `StyleClass` | — | Контент. |
| `classBodyLineLeft`, `classLineLeft` | `StyleClass` | — | Левая часть. |
| `classBodyLineRight`, `classLineRight` | `StyleClass` | — | Правая часть. |

## 6. Events / Emits + v-model contract

Не применимо — Separator не эмитит.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Контент по центру/выбранной позиции (например, `"OR"`). |

## 8. Exposed methods

`SeparatorExpose`:

| Name | Type | Description |
|---|---|---|
| `vertical` | `boolean` | Текущий orientation. |
| `content` | `string` | Текущий contentPosition. |
| `gradient` | `number` | Резолвленный gradient. |
| `gradientLength` | `number` | Длина gradient. |
| `depth` | `number` | Текущий depth. |
| `classBase` | `StyleClass` | Финальный класс контейнера. |
| `classBodyLineLeft`, `classLineLeft`, `classBodyLineRight`, `classLineRight`, `classContent` | `StyleClass` | Финальные классы. |

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
  <Separator vertical :depth="3" />
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

`SeparatorOption = Pick<SeparatorProps, "contentPosition" | "gradient" | "depth" | "class" | "classBodyLine" | "classLine" | "classContent" | "classBodyLineLeft" | "classLineLeft" | "classBodyLineRight" | "classLineRight">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвет line — `border-neutral-*` / `dark:border-neutral-*`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-separator`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- Семантика: декоративный разделитель. Для семантической линии используй `<hr>` либо добавь `role="separator"` явно.
- ARIA-роль не выставляется автоматически. См. Known issues.

### Security

- Не рендерит HTML из props.

## 13. TypeScript

```ts
import type { SeparatorProps, SeparatorExpose, Gradient, Depth } from "fishtvue/separator"
import Separator from "fishtvue/separator"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 25 кейсов, coverage 83.92%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

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

Реальные тесты — [Separator.test.ts](../../lib/separator/Separator.test.ts) (25 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Vertical не растягивается | Родительский контейнер без определённой высоты. | Установи `height` на parent или `Separator` через `class`. |
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

- Coverage 83.92% — ветка ([Separator.vue:41](../../lib/separator/Separator.vue#L41)) не покрыта.

### Skipped tests

Нет.

### API inconsistencies

- `Gradient` и `GradientLength` — оба `0..100` numeric, функционально эквивалентны. Дублирующие типы.
- `gradient: Gradient | [Gradient, GradientLength] | boolean` — широкий union: number, tuple, boolean.
- ARIA-роль `role="separator"` не выставляется в шаблоне.

### Behavioral caveats

- При `vertical: true` родительский flex-контейнер должен иметь определённую высоту. Иначе separator схлопывается до 0.
- Computed `gradient` нормализует input в число — boolean `true` интерпретируется как 0/100 (см. реализацию).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

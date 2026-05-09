---
title: Badge
summary: Компактная метка с modes (primary/secondary/outline/neutral), point-индикатором и close-кнопкой.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Badge

## 1. Overview

`Badge` — небольшая метка/тэг для статусов или категорий. Поддерживает 4 mode (`primary`/`secondary`/`outline`/`neutral`), опциональный point (точка-индикатор), close-кнопку с emit'ом `delete`.

Stability: `stable` — 11 кейсов, coverage `Badge.vue` 100%.

Source: [Source](../../lib/badge/Badge.vue), [Badge.d.ts](../../lib/badge/Badge.d.ts), [Badge.test.ts](../../lib/badge/Badge.test.ts).

## 2. How it's organized

```
lib/badge/
├── Badge.vue
├── Badge.d.ts        # 98 строк
├── Badge.test.ts     # 11 кейсов
└── package.json
```

Зависимости: только [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** автоматическая инжекция стилей.
- **Поток данных:** props → computed `mode`/`point`/`closeButton` → `Badge.setStyle()`.
- **Стили:** через `setStyle`.
- **Конфиг:** `componentsOptions.Badge` ключи — `mode`, `class`, `classContent`, `point`, `closeButton`.
- **Локализация:** не использует.
- **SSR:** SSR-safe.

## 4. Quick Start

```vue
<script setup lang="ts">
import Badge from "fishtvue/badge"
</script>

<template>
  <Badge mode="primary">Active</Badge>
</template>
```

## 5. Props

`BadgeProps` ([Badge.d.ts:16–46](../../lib/badge/Badge.d.ts#L16-L46)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `"primary" \| "secondary" \| "outline" \| "neutral"` | (из global config или fallback) | Стилевой режим. |
| `class` | `StyleClass` | — | Класс контейнера. |
| `classContent` | `StyleClass` | — | Класс контента. |
| `point` | `boolean` | — | Показывает точку-индикатор. |
| `closeButton` | `boolean` | — | Показывает `×`-кнопку. |

## 6. Events / Emits + v-model contract

`BadgeEmits` ([Badge.d.ts:53–58](../../lib/badge/Badge.d.ts#L53-L58)):

| Event | Payload | When fired |
|---|---|---|
| `delete` | — | На клик `×`-кнопки (если `closeButton: true`). |

v-model contract — не применимо.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Текст или произвольная разметка badge. |

## 8. Exposed methods

`BadgeExpose` ([Badge.d.ts:62–87](../../lib/badge/Badge.d.ts#L62-L87)):

| Name | Type | Description |
|---|---|---|
| `mode` | `BadgeProps["mode"]` | Текущий mode. |
| `isPoint` | `BadgeProps["point"]` | Computed. |
| `isCloseButton` | `BadgeProps["closeButton"]` | Computed. |
| `deleteBadge()` | `() => void` | Программное удаление — эмитит `delete`. |

## 9. Examples

### 9.1 Базовый

```vue
<Badge>Default</Badge>
<Badge mode="primary">Primary</Badge>
<Badge mode="outline">Outline</Badge>
```

### 9.2 С point-индикатором

```vue
<Badge :point="true" mode="primary">Online</Badge>
```

### 9.3 С close-кнопкой

```vue
<Badge :close-button="true" mode="neutral" @delete="onRemove">
  Removable tag
</Badge>
```

### 9.4 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    Badge: { mode: "secondary", point: true }
  }
})
```

## 10. Configuration & Customization

### 10.1 Global

`BadgeOption = Pick<BadgeProps, "mode" | "class" | "classContent" | "point" | "closeButton">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвета mode'ов — `theme.semantic.primary` (для primary/secondary), `neutral.*` для neutral. Override через `props.class`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-badge`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- Корневой элемент — `<span>` или `<div>`. Семантически — обычный текст.
- Close-кнопка — `<button>` с нативной семантикой; нет `aria-label="Remove"` по умолчанию (см. Known issues).
- `prefers-reduced-motion` не учтён.

### Security

- Не рендерит HTML из props.

## 13. TypeScript

```ts
import type { BadgeProps, BadgeEmits, BadgeExpose } from "fishtvue/badge"
import Badge from "fishtvue/badge"
import { useTemplateRef } from "vue"

const b = useTemplateRef<InstanceType<typeof Badge>>("b")
b.value?.deleteBadge()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 11 кейсов, coverage 100%.
- **Breaking changes:** на 2026-05-09 не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Badge from "fishtvue/badge/Badge.vue"

describe("Badge", () => {
  it("emits delete on close-button click", async () => {
    const wrapper = mount(Badge, {
      props: { closeButton: true },
      global: { plugins: [[FishtVue, {}]] }
    })
    // ... click + emit assert
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Badge.test.ts](../../lib/badge/Badge.test.ts) (11 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Close-кнопка не отображается | `closeButton: false` или `undefined`. | Установи `:close-button="true"`. |
| `delete` event не срабатывает | `closeButton: false` — кнопка не рендерится. | Включи. |
| Цвет не соответствует ожидаемому | `theme.semantic` не настроен. | См. [Theme](../architecture/theme.md). |
| Point-индикатор перекрывает текст | Padding слева недостаточен. | Override через `props.class`. |

## 17. Related

- [Select](./select.md) — использует Badge в multiple-режиме.
- [Table](./table.md) — Badge в ячейках статуса.
- [Icons](./icons.md) — для close-кнопки внутри Badge.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Badge.vue](../../lib/badge/Badge.vue) и [Badge.d.ts](../../lib/badge/Badge.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Нет — coverage 100%.

### Skipped tests

Нет.

### API inconsistencies

- `BadgeProps.point` и `closeButton` — `boolean | undefined`. Default из withDefaults — `undefined` (не `false`). Это может привести к truthy-проверкам, не отличающим «не задано» от «false».
- `BadgeExpose` мапит `point` → `isPoint`, `closeButton` → `isCloseButton` — inconsistent naming с props.

### Behavioral caveats

- Close-кнопка по умолчанию не имеет `aria-label`, screen-reader проговорит как «button» без контекста. Передай свой через `props.class` или wrap в `<span aria-label="Remove tag">`.
- При `point: true` + `closeButton: true` — оба индикатора рисуются по краям; на узком badge может быть тесно.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

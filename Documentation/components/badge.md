---
title: Badge
summary: Компактная метка с modes (primary/secondary/outline/neutral), point-индикатором и close-кнопкой.
updated: 2026-05-10
stability: stable
since: 0.2.11
---

# Badge

## 1. Overview

`Badge` — небольшая метка/тэг для статусов или категорий. Поддерживает 4 mode (`primary`/`secondary`/`outline`/`neutral`), опциональный point (точка-индикатор), close-кнопку с emit'ами `close` (canonical) + `delete` (deprecated alias).

Stability: `stable` — 21 кейс, coverage `Badge.vue` 100%.

Source: [Source](../../lib/badge/Badge.vue), [Badge.d.ts](../../lib/badge/Badge.d.ts), [Badge.test.ts](../../lib/badge/Badge.test.ts).

## 2. How it's organized

```
lib/badge/
├── Badge.vue
├── Badge.d.ts        # 105 строк
├── Badge.test.ts     # 21 кейс
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

| Prop           | Type                                                 | Default                                                                       | Description                                                   |
| -------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `mode`         | `"primary" \| "secondary" \| "outline" \| "neutral"` | `props ?? componentsOptions.Badge.mode ?? maps(componentsStyle) ?? "primary"` | Стилевой режим. Маппинг global `componentsStyle` — см. §10.1. |
| `class`        | `StyleClass`                                         | —                                                                             | Класс контейнера.                                             |
| `classContent` | `StyleClass`                                         | —                                                                             | Класс контента.                                               |
| `point`        | `boolean`                                            | —                                                                             | Показывает точку-индикатор.                                   |
| `closeButton`  | `boolean`                                            | —                                                                             | Показывает `×`-кнопку.                                        |

## 6. Events / Emits + v-model contract

`BadgeEmits` ([Badge.d.ts:53–64](../../lib/badge/Badge.d.ts#L53-L64)):

| Event                  | Payload | When fired                                                               |
| ---------------------- | ------- | ------------------------------------------------------------------------ |
| `close`                | —       | На клик `×`-кнопки (если `closeButton: true`) или вызов `deleteBadge()`. |
| `delete` ⚠️ deprecated | —       | Алиас `close`. Будет удалён в `1.0` — используй `close`.                 |

v-model contract — не применимо.

> **Deprecation note.** Event `delete` сохраняется ради обратной совместимости и эмитится одновременно с `close`. Новый код пиши на `@close`. Codemod для миграции — Wave 12 fix-roadmap.

## 7. Slots

| Slot      | Slot props | Description                            |
| --------- | ---------- | -------------------------------------- |
| `default` | —          | Текст или произвольная разметка badge. |

## 8. Exposed methods

`BadgeExpose` ([Badge.d.ts:68–93](../../lib/badge/Badge.d.ts#L68-L93)):

| Name            | Type                        | Description                                                    |
| --------------- | --------------------------- | -------------------------------------------------------------- |
| `mode`          | `BadgeProps["mode"]`        | Текущий mode.                                                  |
| `isPoint`       | `BadgeProps["point"]`       | Computed.                                                      |
| `isCloseButton` | `BadgeProps["closeButton"]` | Computed.                                                      |
| `deleteBadge()` | `() => void`                | Программное удаление — эмитит `close` (+ `delete` для legacy). |

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
<Badge :close-button="true" mode="neutral" @close="onRemove">
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

### 9.5 Глобальный `componentsStyle`

```ts
app.use(FishtVue, {
  componentsStyle: "outlined" // → Badge.mode === "outline"
})
```

Per-component `componentsOptions.Badge.mode` и явный `props.mode` перебивают global `componentsStyle`.

## 10. Configuration & Customization

### 10.1 Global

`BadgeOption = Pick<BadgeProps, "mode" | "class" | "classContent" | "point" | "closeButton">`.

`mode` резолвится по fallback chain:

1. `props.mode` (явный prop).
2. `componentsOptions.Badge.mode` (per-component option).
3. Маппинг global `componentsStyle` — `"filled" → "primary"`, `"outlined" → "outline"`, `"underlined" → "neutral"`.
4. Default `"primary"`.

См. [Badge.vue:17–23](../../lib/badge/Badge.vue#L17-L23).

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
- **Stability flag:** `stable` — 21 кейс, coverage 100%.
- **Breaking changes:** на 2026-05-10 не зафиксировано.
- **Deprecations:** event `delete` помечен `@deprecated` с 2026-05-10 — используй `close`. Полное удаление — `1.0` через codemod (Wave 12).

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Badge from "fishtvue/badge/Badge.vue"

describe("Badge", () => {
  it("emits close on close-button click", async () => {
    const wrapper = mount(Badge, {
      props: { closeButton: true },
      global: { plugins: [[FishtVue, {}]] }
    })
    await wrapper.find("button").trigger("click")
    expect(wrapper.emitted("close")).toBeTruthy()
    expect(wrapper.emitted("delete")).toBeTruthy() // legacy alias
  })
})
```

Реальные тесты — [Badge.test.ts](../../lib/badge/Badge.test.ts) (21 кейс).

## 16. Troubleshooting / FAQ

| Проблема                              | Причина                                      | Решение                                |
| ------------------------------------- | -------------------------------------------- | -------------------------------------- |
| Close-кнопка не отображается          | `closeButton: false` или `undefined`.        | Установи `:close-button="true"`.       |
| `close`/`delete` event не срабатывает | `closeButton: false` — кнопка не рендерится. | Включи.                                |
| Цвет не соответствует ожидаемому      | `theme.semantic` не настроен.                | См. [Theme](../architecture/theme.md). |
| Point-индикатор перекрывает текст     | Padding слева недостаточен.                  | Override через `props.class`.          |

## 17. Related

- [Select](./select.md) — использует Badge в multiple-режиме.
- [Table](./table.md) — Badge в ячейках статуса.
- [Icons](./icons.md) — для close-кнопки внутри Badge.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-10) комментариев `TODO/FIXME/HACK/XXX` в [Badge.vue](../../lib/badge/Badge.vue) и [Badge.d.ts](../../lib/badge/Badge.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Нет — coverage 100%.

### Skipped tests

Нет.

### API inconsistencies

- `BadgeProps.point` и `closeButton` — `boolean | undefined`. Default из withDefaults — `undefined` (не `false`). Это может привести к truthy-проверкам, не отличающим «не задано» от «false».
- `BadgeExpose` мапит `point` → `isPoint`, `closeButton` → `isCloseButton` — inconsistent naming с props.

### Deprecations

- Event `delete` помечен `@deprecated` ([Badge.d.ts:53–64](../../lib/badge/Badge.d.ts#L53-L64)) с 2026-05-10. Эмитится одновременно с `close` ради backward-compat. Удаление — в `1.0` через codemod (Wave 12 [fix-roadmap](../issues/README.md#-wave-12--migration--dx)).

### Behavioral caveats

- Close-кнопка по умолчанию не имеет `aria-label`, screen-reader проговорит как «button» без контекста. Передай свой через `props.class` или wrap в `<span aria-label="Remove tag">`.
- При `point: true` + `closeButton: true` — оба индикатора рисуются по краям; на узком badge может быть тесно.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

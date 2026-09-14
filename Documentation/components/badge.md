---
title: Badge
summary: Компактная метка с variants (primary/secondary/outline/neutral), point-индикатором и close-кнопкой.
updated: 2026-09-14
stability: stable
since: 0.2.11
---

# Badge

## 1. Overview

`Badge` — небольшая метка/тэг для статусов или категорий. Поддерживает 4 варианта (`variant`: `primary`/`secondary`/`outline`/`neutral`), опциональный point (точка-индикатор) и close-кнопку с единственным событием `close`.

Stability: `stable` — 41 кейс, coverage `Badge.vue` 100%.

Source: [Source](../../lib/badge/Badge.vue), [Badge.d.ts](../../lib/badge/Badge.d.ts), [Badge.test.ts](../../lib/badge/Badge.test.ts).

## 2. How it's organized

```
lib/badge/
├── Badge.vue
├── Badge.d.ts        # BadgeProps, BadgeClassKey, BadgeSlots, BadgeEmits, BadgeExpose, BadgeOption
├── Badge.test.ts     # 41 кейс
└── package.json
```

Зависимости: [Component class](../architecture/component-class.md), [Icons](./icons.md) и [Button](./button.md) (close-кнопка). Внешних — нет.

## 3. How it works

- **Lifecycle:** автоматическая инжекция стилей.
- **Поток данных:** props → computed `variant`/`isPoint`/`isButton` → `cls(key, …)` (собственные элементы) и `raw("close")` (hand-off в корень `Button`).
- **Стили:** через `Badge.resolveClasses<BadgeClassKey>(props)`; порядок склейки — база → variant → state → `options.classes[k]` → `props.classes[k]` → `options.class` → `props.class` (dev-patterns §2 D).
- **Конфиг:** `componentsOptions.Badge` ключи — `variant`, `class`, `classes`, `point`, `closeButton`.
- **Локализация:** не использует.
- **SSR:** SSR-safe.

## 4. Quick Start

```vue
<script setup lang="ts">
  import Badge from "fishtvue/badge"
</script>

<template>
  <Badge variant="primary">Active</Badge>
</template>
```

## 5. Props

`BadgeProps` ([Badge.d.ts:24–57](../../lib/badge/Badge.d.ts#L24-L57)):

| Prop          | Type                                                 | Default                                                                          | Description                                                           |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `variant`     | `"primary" \| "secondary" \| "outline" \| "neutral"` | `props ?? componentsOptions.Badge.variant ?? maps(componentsStyle) ?? "primary"` | Визуальный вариант (бывший `mode`). Маппинг `componentsStyle` — §10.1. |
| `class`       | `StyleClass`                                         | —                                                                                | Классы **только корня** `[data-badge]` (dev-patterns §2 A).           |
| `classes`     | `ClassesMap<BadgeClassKey>`                          | —                                                                                | Карта внутренних элементов: `content`, `point`, `close`. См. §5.1.     |
| `point`       | `boolean`                                            | `false`                                                                          | Показывает точку-индикатор.                                           |
| `closeButton` | `boolean`                                            | `false`                                                                          | Показывает `×`-кнопку.                                                |

Оба булевых объявлены с `undefined`-дефолтом через `withDefaults` ([Badge.vue:13–16](../../lib/badge/Badge.vue#L13-L16)) — иначе Vue скастовал бы отсутствующий prop в `false` и слой `componentsOptions` стал бы недостижим (dev-patterns §2 F).

### 5.1 Classes keys

`BadgeClassKey = "content" | "point" | "close"` ([Badge.d.ts:19](../../lib/badge/Badge.d.ts#L19)).

| Key | Element (`data-*`) | Kind | Default |
| --- | --- | --- | --- |
| `root` | `[data-badge]` | element | `inline-flex items-center w-max … rounded-md forced-colors:outline` + variant |
| `content` | `[data-badge-content]` | element | — (бывший `classContent`) |
| `point` | `[data-badge-point]` (`<svg>`) | element | `h-1.5 w-1.5 mx-1` + `fill-*` варианта |
| `close` | `[data-badge-close]` (= корень [Button](./button.md)) | element | `m-0 rounded-[5px] h-4 w-4 px-0` |

`close` — hand-off в корень вложенного `Button`: сегменты потребителя уходят туда через `raw("close")` без `setStyle`-префикса Badge (компилирует их сам Button).

## 6. Events / Emits + v-model contract

`BadgeEmits` ([Badge.d.ts:64–70](../../lib/badge/Badge.d.ts#L64-L70)):

| Event   | Payload | When fired                                                               |
| ------- | ------- | ------------------------------------------------------------------------ |
| `close` | —       | На клик `×`-кнопки (если `closeButton: true`) или вызов `deleteBadge()`. |

v-model contract — не применимо: Badge не form-control, `change:modelValue` не заводится (dev-patterns §2 H).

> Дубль `delete` снят в major 2026-09-06 (решение R7): два события на одно действие заставляли потребителя гадать, на какое подписываться, а библиотеку — эмитить оба.

## 7. Slots

| Slot      | Slot props | Description                            |
| --------- | ---------- | -------------------------------------- |
| `default` | —          | Текст или произвольная разметка badge. |

## 8. Exposed methods

`BadgeExpose` ([Badge.d.ts:73–108](../../lib/badge/Badge.d.ts#L73-L108)):

| Name            | Type                        | Description                                                    |
| --------------- | --------------------------- | -------------------------------------------------------------- |
| `variant`       | `BadgeProps["variant"]`     | Текущий variant.                                               |
| `isPoint`       | `BadgeProps["point"]`       | Computed.                                                      |
| `isCloseButton` | `BadgeProps["closeButton"]` | Computed.                                                      |
| `classBase`     | `StyleClass`                | Итоговый класс корня `[data-badge]`.                           |
| `classContent`  | `StyleClass`                | Итоговый класс `[data-badge-content]`.                         |
| `deleteBadge()` | `() => void`                | Программное удаление — эмитит `close`.                         |

## 9. Examples

### 9.1 Базовый

```vue
<Badge>Default</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="outline">Outline</Badge>
```

### 9.2 С point-индикатором

```vue
<Badge :point="true" variant="primary">Online</Badge>
```

### 9.3 С close-кнопкой

```vue
<Badge :close-button="true" variant="neutral" @close="onRemove">
  Removable tag
</Badge>
```

### 9.4 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    Badge: { variant: "secondary", point: true }
  }
})
```

### 9.5 Глобальный `componentsStyle`

```ts
app.use(FishtVue, {
  componentsStyle: "outlined" // → Badge.variant === "outline"
})
```

Per-component `componentsOptions.Badge.variant` и явный `props.variant` перебивают global `componentsStyle`.

## 10. Configuration & Customization

### 10.1 Global

`BadgeOption = Pick<BadgeProps, "variant" | "class" | "classes" | "point" | "closeButton">` ([Badge.d.ts:111](../../lib/badge/Badge.d.ts#L111)). Карта `classes` сливается с props **по ключу** (dev-patterns §2 C).

`variant` резолвится по fallback chain:

1. `props.variant` (явный prop).
2. `componentsOptions.Badge.variant` (per-component option).
3. Маппинг global `componentsStyle` — `"filled" → "primary"`, `"outlined" → "outline"`, `"underlined" → "neutral"`.
4. Default `"primary"`.

См. [Badge.vue:20–26](../../lib/badge/Badge.vue#L20-L26).

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвета вариантов — `theme.semantic.primary` (для primary/secondary), `neutral.*` для neutral. Override — `props.class` (корень) или `props.classes.<key>` (внутренние элементы).

### 10.4 CSS layer override

Root класс — `fv fishtvue-badge`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- Корневой элемент — `<span>` или `<div>`. Семантически — обычный текст.
- Close-кнопка — `<button>` с нативной семантикой; нет `aria-label="Remove"` по умолчанию (см. Known issues).
- `prefers-reduced-motion` — N/A: Badge собственных transition/animate-классов не имеет; close-кнопка (`Button`) уже `motion-safe:` на своей стороне.
- **RTL:** отступы point/close-кнопки — логические `ps-1`/`pe-1` (`padding-inline-*`), авто-флип без `dir`-атрибута.
- **Forced-colors:** `forced-colors:outline` на корне держит badge видимым в Windows high-contrast (там `bg-*` сбрасывается).

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
- **Stability flag:** `stable` — 41 кейс, coverage 100%.
- **Breaking changes (1.0.0, редизайн props):**
  - `mode` → `variant` (значения те же); `componentsOptions.Badge.mode` → `.variant`.
  - `classContent` → `classes.content`; добавлены ключи `classes.point` и `classes.close`; `class` адресует **только** корень.
  - событие `delete` снято — остаётся `close`.
  - DOM: `[data-badge-content]`, `[data-badge-point]`, `[data-badge-close]`.
  - expose: `mode` → `variant`, добавлены `classBase`/`classContent`.
- **Deprecations:** нет — старые имена сняты без алиасов (решение R6/R7).

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

На момент ревизии (2026-09-14) комментариев `TODO/FIXME/HACK/XXX` в [Badge.vue](../../lib/badge/Badge.vue) и [Badge.d.ts](../../lib/badge/Badge.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Нет — coverage 100%.

### Skipped tests

Нет.

### API inconsistencies

- ~~`BadgeProps.point` и `closeButton` — `boolean | undefined`; default `undefined` может привести к truthy-проверкам, не отличающим «не задано» от «false».~~ ✅ resolved (1.0.0): `undefined` — осознанный канон (dev-patterns §2 F), именно он делает слой `componentsOptions` достижимым; резолвер сводит значение к литеральному `false`.
- `BadgeExpose` мапит `point` → `isPoint`, `closeButton` → `isCloseButton` — inconsistent naming с props.

### Deprecations

- ~~Event `delete` помечен `@deprecated`, эмитится одновременно с `close`.~~ ✅ resolved: снят в major 2026-09-06 (решение R7).

### Behavioral caveats

- Close-кнопка по умолчанию не имеет `aria-label`, screen-reader проговорит как «button» без контекста. Wrap в `<span aria-label="Remove tag">` либо адресуй её через `classes.close`.
- При `point: true` + `closeButton: true` — оба индикатора рисуются по краям; на узком badge может быть тесно.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

---
title: Icons
summary: Универсальный icon — Heroicons + Iconify, два style (outline/solid).
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Icons

## 1. Overview

`Icons` — универсальный icon-компонент. Принимает `type: string` — имя из [Heroicons](https://heroicons.com) или [Iconify](https://icon-sets.iconify.design). Поддерживает `outline`/`solid` стили (для Heroicons). Style/class — стандартные CSS.

Stability: `stable` — 5 кейсов, coverage `Icons.vue` 93.93%.

Source: [Source](../../lib/icons/Icons.vue), [Icons.d.ts](../../lib/icons/Icons.d.ts), [Icons.test.ts](../../lib/icons/Icons.test.ts).

## 2. How it's organized

```
lib/icons/
├── Icons.vue
├── Icons.d.ts        # 79 строк
├── Icons.test.ts     # 5 кейсов
└── package.json
```

Зависимости:
- `@heroicons/vue` `^2.1.5` — `outline`/`solid`/`24` варианты ([rollup.config.js:54–57](../../lib/rollup.config.js#L54-L57)).
- `@iconify/vue` `^4.1.2` — fallback для всего, чего нет в Heroicons.

Лицензии — MIT (Heroicons), MIT (Iconify) — не копилефт.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили.
- **Поток данных:** `type` → look-up в Heroicons map → если не найдено → fallback на `<Icon icon="iconify:name">` через `@iconify/vue`.
- **Стили:** через `Icons.setStyle()`. Default — `h-5 w-5 text-gray-400 dark:text-gray-600`.
- **Конфиг:** `componentsOptions.Icons` — только `class`.
- **Локализация:** не использует.
- **SSR:** SSR-safe для Heroicons. Iconify тянет иконки lazy с CDN — на сервере initial render может быть placeholder.
- **Animation:** нет (статический SVG).

## 4. Quick Start

```vue
<script setup lang="ts">
import Icons from "fishtvue/icons"
</script>

<template>
  <Icons type="check" stile-icon="solid" />
  <Icons type="mdi:home" />
  <!-- через @iconify/vue -->
</template>
```

## 5. Props

`IconsProps` ([Icons.d.ts:16–43](../../lib/icons/Icons.d.ts#L16-L43)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `string` | — | **Обязателен**. Имя иконки. Heroicons (например, `"check"`, `"x-mark"`) или Iconify (`"mdi:home"`, `"ph:user"`). |
| `stileIcon` | `"outline" \| "solid"` | `"outline"` | Стиль (только Heroicons). |
| `class` | `"h-5 w-5 text-gray-400 dark:text-gray-600" \| StyleClass` | preset | CSS класс. |
| `style` | `CSSProperties` | — | Inline style. |

## 6. Events / Emits + v-model contract

`IconsEmits = null`. v-model — не применимо.

## 7. Slots

`IconsSlots = null`.

## 8. Exposed methods

`IconsExpose`:

| Name | Type | Description |
|---|---|---|
| `type` | `IconsProps["type"]` | Текущий type. |
| `classIcon` | `IconsProps["class"]` | Финальный класс. |
| `style` | `IconsProps["style"]` | Inline style. |

## 9. Examples

### 9.1 Heroicons

```vue
<Icons type="check" stile-icon="solid" class="h-6 w-6 text-green-500" />
<Icons type="x-mark" stile-icon="outline" class="h-4 w-4 text-red-500" />
```

### 9.2 Iconify

```vue
<Icons type="mdi:account" class="h-8 w-8" />
<Icons type="ph:lightning-bold" />
```

### 9.3 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    Icons: { class: "h-5 w-5 text-neutral-700 dark:text-neutral-300" }
  }
})
```

### 9.4 С inline style

```vue
<Icons type="bell" :style="{ color: 'red', transform: 'rotate(15deg)' }" />
```

## 10. Configuration & Customization

### 10.1 Global

`IconsOption = Pick<IconsProps, "class">` — только class. `type` всегда задаётся per-instance.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвет иконок — через CSS `text-*` классы; bind с `theme.semantic`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-icons`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- Декоративные иконки — `aria-hidden="true"` (по конвенции). Реализация в шаблоне.
- Семантические иконки требуют `role="img"` + `aria-label="..."` — добавь сам через `class`/wrap.

### Security

- Heroicons — статические импорты, безопасны.
- Iconify тянет SVG-data с CDN при первом render'е. Если CSP запрещает `connect-src cdn.iconify.design` — иконки не загрузятся. Альтернатива: bundling Iconify-collections локально.

## 13. TypeScript

```ts
import type { IconsProps, IconsExpose } from "fishtvue/icons"
import Icons from "fishtvue/icons"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **@heroicons/vue:** `^2.1.5`.
- **@iconify/vue:** `^4.1.2`.
- **Stability flag:** `stable` — 5 кейсов, coverage 93.93%.
- **Breaking changes:** при апгрейде Heroicons 3.x — возможны переименования иконок.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Icons from "fishtvue/icons/Icons.vue"

describe("Icons", () => {
  it("renders heroicon", () => {
    const wrapper = mount(Icons, {
      props: { type: "check" },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Icons.test.ts](../../lib/icons/Icons.test.ts) (5 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Иконка не отображается | Имя `type` некорректно. | Сверься на heroicons.com / icon-sets.iconify.design. |
| Iconify-иконка медленно загружается | Lazy-load с CDN. | Используй `bundleNames` Iconify для локального кэша. |
| `stileIcon: "solid"` для Iconify не работает | `stileIcon` применяется только к Heroicons. | Используй разные `type` для Iconify-вариантов. |
| Custom class конфликтует с default | Default `h-5 w-5 text-gray-*` имеет ту же специфичность. | Используй `!important` или передавай class явно. |
| CSP блокирует Iconify CDN | `connect-src` запрещает `api.iconify.design`. | Добавь домен в CSP или bundling local. |

## 17. Related

- [Button](./button.md) — использует Icons для иконок-prop.
- [Loading](./loading.md), [Switch](./switch.md), [Alert](./alert.md) — используют Icons.
- [Aria](./aria.md), [Form](./form.md), [Menu](./menu.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Icons.vue](../../lib/icons/Icons.vue) и [Icons.d.ts](../../lib/icons/Icons.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage 93.93% — две строки ([Icons.vue:45, 56](../../lib/icons/Icons.vue#L45)) не покрыты.

### Skipped tests

Нет.

### API inconsistencies

- `class: "h-5 w-5 text-gray-400 dark:text-gray-600" | StyleClass` — литерал среди open StyleClass.
- `stileIcon` — наименование (видимо, опечатка от "styleIcon"). Type-system принимает как есть; backward-compat — переименовать breaking.
- `type: string` — open string, narrow невозможен; имена Heroicons и Iconify не в одном type-namespace.

### Behavioral caveats

- При имени, отсутствующем и в Heroicons, и в Iconify — рендер пустого slot/placeholder (детали — в реализации).
- Iconify первый раз грузится с CDN (ms latency); subsequent рендеры — из кэша.
- `stileIcon` опечатка применяется только к Heroicons; Iconify имеет свой механизм через name suffix.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

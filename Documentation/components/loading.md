---
title: Loading
summary: Лоадер с типами Epic/SVG/simple, configurable size, color, animationDuration.
updated: 2026-05-09
stability: beta
since: 0.2.11
---

# Loading

## 1. Overview

`Loading` — индикатор загрузки. Поддерживает три категории типов: `EpicLoading` (анимированные многокомпонентные), `SvgLoading` (статичные SVG с CSS-анимацией), `"simple"` (минималистичный спиннер). Конфигурируется через `size`, `color`, `animationDuration`.

Stability: `beta` — coverage `Loading.vue` 79.06%, но coverage `loadingTypes.ts` 22.22% statements / 7.97% functions (большая часть type definitions не запускается на тестах).

Source: [Source](../../lib/loading/Loading.vue), [Loading.d.ts](../../lib/loading/Loading.d.ts), [loadingTypes.ts](../../lib/loading/loadingTypes.ts), [Loading.test.ts](../../lib/loading/Loading.test.ts).

## 2. How it's organized

```
lib/loading/
├── Loading.vue
├── Loading.d.ts          # 100 строк
├── loadingTypes.ts       # 131 строка — componentsMapEpic / componentsMapSvg
└── package.json
```

Зависимости: только [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` для дополнительной инициализации.
- **Поток данных:** `type` → resolve в один из мап `componentsMapEpic`/`componentsMapSvg` → рендер компонента-инстанса. `size`/`color`/`animationDuration` управляются как inline-styles.
- **Стили:** через `Loading.setStyle()`. CSS-анимации через `animation-duration` inline.
- **Конфиг:** `componentsOptions.Loading` — см. §10.
- **Локализация:** не использует.
- **SSR:** SSR-safe (CSS-анимации работают и на сервере при initial render).
- **Animation:** CSS keyframes (per-component-type).

## 4. Quick Start

```vue
<script setup lang="ts">
import Loading from "fishtvue/loading"
</script>

<template>
  <Loading type="simple" :size="40" />
</template>
```

## 5. Props

`LoadingProps` ([Loading.d.ts:19–49](../../lib/loading/Loading.d.ts#L19-L49)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `EpicLoading \| SvgLoading \| "simple"` | `"simple"` (или из global) | Тип индикатора. |
| `animationDuration` | `number \| 1000 \| 1200 \| 1500 \| 2000 \| 2500 \| 3000 \| 4000 \| 5000 \| 6000` | — | Длительность (ms). |
| `size` | `number \| 40 \| 50 \| 55 \| 60 \| 64 \| 65 \| 66 \| 70` | — | Размер (px). |
| `color` | `string` | — | CSS color (HEX, hsl, var(...)). |
| `class` | `StyleClass` | — | Класс контейнера. |

`EpicLoading = keyof typeof componentsMapEpic` ([loadingTypes.ts](../../lib/loading/loadingTypes.ts)) — extensive set of named animations.
`SvgLoading = keyof typeof componentsMapSvg` — SVG-вариации.

## 6. Events / Emits + v-model contract

`LoadingEmits = null`. v-model contract — не применимо.

## 7. Slots

`LoadingSlots = null`. Slot'ов нет.

## 8. Exposed methods

`LoadingExpose`:

| Name | Type | Description |
|---|---|---|
| `type`, `animationDuration`, `size`, `color`, `classLoading` | `ReadRef<...>` | Computed (read-only). |

## 9. Examples

### 9.1 Базовый

```vue
<Loading type="simple" />
```

### 9.2 С глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    Loading: { type: "simple", size: 50, color: "var(--theme-500)", animationDuration: 1500 }
  }
})
```

### 9.3 Внутри Button

```vue
<Button :loading="isLoading">Submit</Button>
<!-- Button сам рендерит Loading внутри -->
```

### 9.4 Кастомный цвет

```vue
<Loading type="simple" color="#3b82f6" :size="60" :animation-duration="2000" />
```

## 10. Configuration & Customization

### 10.1 Global

`LoadingOption = Pick<LoadingProps, "animationDuration" | "size" | "color" | "class">`. **`type`** не входит в Option.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвет — через `color` prop, поддерживает CSS-переменные (`var(--theme-500)`).

### 10.4 CSS layer override

Root класс — `fv fishtvue-loading`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- ARIA `role="status"`/`aria-live="polite"` — проверь по DOM. По умолчанию screen-reader может не озвучивать loader.
- Для критичной a11y добавь `aria-label="Loading"` через `props.class` или wrap.
- `prefers-reduced-motion` не учтён.

### Security

- SVG-контент инжектится — но это статические assets из `loadingTypes.ts` (не user input).

## 13. TypeScript

```ts
import type { LoadingProps, LoadingExpose, EpicLoading, SvgLoading } from "fishtvue/loading"
import Loading from "fishtvue/loading"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `beta` — coverage loadingTypes.ts 22.22%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Loading from "fishtvue/loading/Loading.vue"

describe("Loading", () => {
  it("renders simple", () => {
    const wrapper = mount(Loading, {
      props: { type: "simple" },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Тип не отрисовывается | Имя из `EpicLoading`/`SvgLoading`, но typo. | Сверь со списком в [loadingTypes.ts](../../lib/loading/loadingTypes.ts). |
| `color` не применяется | CSS-переменная не определена. | Передай fallback: `color="var(--my-color, #888)"`. |
| Анимация дёргается | `animationDuration` слишком мал. | Увеличь до 1500+. |
| Loading блокирует UI | По дизайну Loading позиционируется как inline — не overlay. | Wrap в overlay сам. |

## 17. Related

- [Button](./button.md), [Alert](./alert.md), [Dialog](./dialog.md) — потребители.
- [Icons](./icons.md), [Aria](./aria.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Loading.vue](../../lib/loading/Loading.vue), [Loading.d.ts](../../lib/loading/Loading.d.ts) и [loadingTypes.ts](../../lib/loading/loadingTypes.ts) не зафиксировано.

### Incomplete or stubbed behavior

- `loadingTypes.ts` coverage 3.12% lines — большая часть named animations не вызывается ни в одном тесте.
- `LoadingOption` не включает `type` — глобально нельзя задать дефолтный тип (только через wrapper).

### Skipped tests

Нет.

### API inconsistencies

- `animationDuration` и `size` open unions с numeric — narrow не работает.
- `LoadingSlots = null`, `LoadingEmits = null` — корректно для статического lottie-style компонента.
- `EpicLoading | SvgLoading | "simple"` — три разных enum-источника соединены через union.

### Behavioral caveats

- `EpicLoading` вариации могут быть тяжёлыми (множественные SVG-узлы, animations) — для critical-path UI используй `"simple"`.
- При SSR initial frame показывается без animation; на клиенте после hydration — анимация запускается.
- `color` — string без валидации. Если значение invalid — браузер игнорирует.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

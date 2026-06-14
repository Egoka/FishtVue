---
title: Loading
summary: Лоадер с типами Epic/SVG/simple, configurable size, color, animationDuration; ARIA status-регион, reduced-motion fallback.
updated: 2026-06-14
stability: beta
since: 0.2.11
---

# Loading

## 1. Overview

`Loading` — индикатор загрузки. Поддерживает три категории типов: `EpicLoading` (анимированные многокомпонентные), `SvgLoading` (статичные SVG с CSS-анимацией), `"simple"` (минималистичный спиннер). Конфигурируется через `size`, `color`, `animationDuration`.

Stability: `beta` — coverage `Loading.vue` ~98% statements / 100% lines, `loadingTypes.ts` 100% (добавлен [Loading.test.ts](../../lib/loading/Loading.test.ts), 145 кейсов, по тесту на каждую Epic/SVG вариацию). `beta` сохраняется до закрытия [Issue 7](../issues/loading.md) (hardcoded HEX в Epic/SVG, Wave 9).

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

- **Lifecycle:** стили инжектит базовый `Component.__hooks()` (`onServerPrefetch + vueOnMounted`) — ручной `onMounted(() => initStyle())` в SFC отсутствует (канон, см. [dev-patterns §2](../dev-patterns.md)).
- **Поток данных:** `resolvedType` (`props.type ?? options?.type ?? "simple"`) → resolve в один из мап `componentsMapEpic`/`componentsMapSvg` → ленивый `defineAsyncComponent`. `size`/`color`/`animationDuration` управляются как inline-styles.
- **Стили:** все Tailwind-классы (контейнер + `sr-only` visually-hidden-лейбл) — только через `Loading.setStyle()` factory: движок генерирует CSS, у потребителя нет рантайм-зависимости от Tailwind. Литеральных `class="…"` в шаблоне нет. Динамические runtime-значения (`size`/`color` → `width`/`height`/`fill`) — inline `:style` (plain CSS, канон всей либы). CSS-анимации через `animation-duration` inline.
- **Конфиг:** `componentsOptions.Loading` (включая `type`) — см. §10.
- **Локализация:** `aria-label` статус-региона через `Loading.t("loading.label")` (ключ `loading.label` в en/ru).
- **SSR:** SSR-safe (CSS-анимации работают и на сервере при initial render).
- **Animation:** CSS keyframes (per-component-type). При `prefers-reduced-motion: reduce` рендерится статичный `simple`-loader вместо анимации (см. §12).

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

`LoadingOption = Pick<LoadingProps, "type" | "animationDuration" | "size" | "color" | "class">`. `type` **входит** в Option — `componentsOptions.Loading.type` задаёт дефолтный тип глобально (Issue 4 закрыт 2026-06-03).

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

- Корень — `<div role="status" aria-live="polite" :aria-label>` + visually-hidden `<span class="sr-only">` с тем же текстом. Screen-reader озвучивает loader.
- `aria-label` локализуется через `Loading.t("loading.label")` (ключ `loading.label`, en `Loading` / ru `Загрузка`); реагирует на runtime locale-switch.
- `prefers-reduced-motion: reduce` — рендерится статичный `simple`-loader (`animation-duration=0`) вместо анимации. Один guard покрывает все 126 вариаций.

### Security

- SVG-контент инжектится — но это статические assets из `loadingTypes.ts` (не user input).

## 13. TypeScript

```ts
import type { LoadingProps, LoadingExpose, EpicLoading, SvgLoading } from "fishtvue/loading"
import Loading from "fishtvue/loading"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `beta` — coverage `loadingTypes.ts` 100%; до `stable` остаётся [Issue 7](../issues/loading.md) (hardcoded HEX, Wave 9). Root exports map (A4-5, Wave 2.1) — ✅ resolved 2026-06-14 (см. [issues/loading.md Issue 5](../issues/loading.md)).
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

- ~~`loadingTypes.ts` coverage 3.12% lines~~ ✅ resolved 2026-06-03 — добавлен [Loading.test.ts](../../lib/loading/Loading.test.ts), coverage 100%.
- ~~`LoadingOption` не включает `type`~~ ✅ resolved 2026-06-03 — `type` добавлен в `Pick`.
- Hardcoded HEX (`#ff1d5e` и т.п.) в 20 `epic/*.vue` + 2 `svg/*.vue` — [Issue 7](../issues/loading.md), отложено в Wave 9 (colors → tokens).

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

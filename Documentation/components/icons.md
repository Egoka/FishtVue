---
title: Icons
summary: Универсальный icon — Heroicons + Iconify, два variant (outline/solid), wrapper-based a11y, narrow IconType union. Heroicons на tree-shakeable const-реестр explicit named-импортов (2026-06-14, Issue 1): bundler оставляет только curated-набор (37 имён ≈ 11 KB) вместо всех 648 (~94 KB); sync lookup сохранён → prod-Vite/SSR-корректность не теряется; имена вне набора → Iconify-fallback.
updated: 2026-07-04
stability: stable
since: 0.2.11
---

# Icons

## 1. Overview

`Icons` — универсальный icon-компонент. Принимает `type: IconType` — имя из [Heroicons](https://heroicons.com) или [Iconify](https://icon-sets.iconify.design). Поддерживает `outline`/`solid` стили (для Heroicons) через `variant`. Опциональный `label` превращает декоративную иконку в семантическую (`role="img"` + `aria-label` на wrapper). Style/class — стандартные CSS.

Stability: `stable` — 101 кейс (incl. tree-shaking it.each 37×2), coverage `Icons.vue` 93.93%+.

Source: [Source](../../lib/icons/Icons.vue), [Icons.d.ts](../../lib/icons/Icons.d.ts), [Icons.test.ts](../../lib/icons/Icons.test.ts).

## 2. How it's organized

```
lib/icons/
├── Icons.vue
├── Icons.d.ts        # 182 строки
├── Icons.test.ts     # 101 кейс
└── package.json
```

Зависимости:

- `@heroicons/vue` `^2.1.5` — `outline`/`solid`/`24` варианты ([rollup.config.js:54–57](../../lib/rollup.config.js#L54-L57)).
- `@iconify/vue` `^4.1.2` — fallback для всего, чего нет в Heroicons.

Лицензии — MIT (Heroicons), MIT (Iconify) — не копилефт.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` (конструктор) регистрирует `onServerPrefetch + vueOnMounted` → `initStyle()`. SFC **не** дублирует `onMounted(() => Icons.initStyle())` — дубль снят в Wave 2.3 (см. [dev-patterns §12](../dev-patterns.md#12-known-deviations-from-this-pattern)).
- **Поток данных:** `type` → **синхронный lookup** heroicon в const-реестре (`HERO_OUTLINE`/`HERO_SOLID[PascalCase(type) + "Icon"]`, Issue 1, tree-shakeable named-импорты) → если имя не в curated-реестре → fallback на `<Icon icon="type">` через `@iconify/vue` (async). Heroicon резолвится синхронно (до первого `await` в immediate-watcher) → попадает в SSR-HTML и на первый paint (см. §12 Bundle).
- **A11y wrapper pattern:** root — `<i data-icon>`. Heroicons render-функции хардкодят `aria-hidden="true"` и не пробрасывают `$attrs`, поэтому role/aria-label применяются к wrapper'у, а SVG внутри остаётся `aria-hidden`. Это валидный screen-reader-pattern: AT читает wrapper как labelled image, внутренний SVG скрыт.
- **Стили:** через `Icons.setStyle()`. Default — `h-5 w-5 text-surface-900 dark:text-surface-100 select-none`.
- **Конфиг:** `componentsOptions.Icons` — `class` и `variant`.
- **Локализация:** не использует.
- **SSR / prod-Vite / bundle (Issue 1 — resolved 2026-06-14, tree-shaking):** heroicons резолвятся из **const-реестра explicit named-импортов** (`HERO_OUTLINE`/`HERO_SOLID` в module-scope `<script>`) + **синхронным** lookup'ом → корректно рендерятся в prod-Vite, SSR (sync — иконка в SSR-HTML) и любом bundler; bundler tree-shake'ит набор до curated-37 (≈11 KB gzip) вместо всех 648 (~94 KB). Ранее (commit `7740c50`) точечный dynamic import с bare-спецификатором `@heroicons/vue/...` не глобился `dynamic-import-vars` → иконки ломались в production (`TypeError: Failed to resolve module specifier`); затем namespace `import *` (prod-корректно, но весь набор в bundle); теперь — const-реестр (prod-корректно + tree-shakeable). Iconify-fallback — lazy с CDN. См. §12 Bundle.
- **Animation:** нет (статический SVG).

## 4. Quick Start

```vue
<script setup lang="ts">
  import Icons from "fishtvue/icons"
</script>

<template>
  <Icons type="check" variant="solid" />
  <Icons type="mdi:home" />
  <!-- через @iconify/vue -->
  <Icons type="trash" label="Delete user" />
  <!-- семантическая иконка с aria-label -->
</template>
```

## 5. Props

`IconsProps` ([Icons.d.ts:80–134](../../lib/icons/Icons.d.ts#L80-L134)):

| Prop        | Type                                                       | Default     | Description                                                                                                                                                                                                                                                                                        |
| ----------- | ---------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type`      | `IconType`                                                 | —           | **Обязателен**. Имя иконки. Heroicons (например, `"check"`, `"x-mark"`) или Iconify (`"mdi:home"`, `"ph:user"`). Поддерживает autocomplete для популярных heroicons (`HeroIconName` subset) и Iconify-паттерн (`${string}:${string}`); любая другая строка валидна через `(string & {})`-fallback. |
| `variant`   | `"outline" \| "solid"`                                     | `"outline"` | Стиль (только Heroicons). Iconify имеет собственный механизм через suffix в `type`.                                                                                                                                                                                                                |
| `label`     | `string`                                                   | —           | Accessible label для семантической иконки. Задан → wrapper получает `role="img"` + `aria-label="<label>"`. Пуст/опущен → wrapper прозрачен, SVG остаётся `aria-hidden="true"` (декоративный режим).                                                                                                |
| `stileIcon` | `"outline" \| "solid"`                                     | —           | **@deprecated**. Используй `variant`. Soft-deprecated в `0.2.x` (dev `console.warn` при использовании без `variant`), будет удалён в `1.0`. Codemod планируется в [Wave 12](../issues/README.md#-wave-12--migration--dx).                                                                          |
| `class`     | `"h-5 w-5 text-surface-900 dark:text-surface-100" \| StyleClass` | preset      | CSS класс.                                                                                                                                                                                                                                                                                         |
| `style`     | `CSSProperties`                                            | —           | Inline style.                                                                                                                                                                                                                                                                                      |

### IconType union

```ts
export declare type HeroIconName =
  | "check"
  | "x-mark"
  | "user"
  | "users"
  | "home"
  | "cog-6-tooth"
  | "bell"
  | "envelope"
  | "magnifying-glass"
  | "plus"
  | "minus"
  | "chevron-up"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "arrow-up"
  | "arrow-down"
  | "arrow-left"
  | "arrow-right"
  | "trash"
  | "pencil"
  | "eye"
  | "eye-slash"
  | "lock-closed"
  | "lock-open"
  | "exclamation-triangle"
  | "information-circle"
  | "question-mark-circle"
  | "check-circle"
  | "x-circle"
  | "arrow-long-right"
  | "arrows-pointing-in"
  | "arrows-pointing-out"
  | "ellipsis-vertical"
  | "exclamation-circle"
  | "funnel"
  | "square-2-stack"
export declare type IconifyIconName = `${string}:${string}`
export declare type IconType = HeroIconName | IconifyIconName | (string & {})
```

`HeroIconName` — curated-набор из 37 имён ([Icons.d.ts:25–62](../../lib/icons/Icons.d.ts#L25-L62)), который **===** runtime const-реестр в [Icons.vue](../../lib/icons/Icons.vue#L97) (Issue 1, tree-shaking): только эти имена бандлятся и резолвятся как heroicon offline (outline + solid). Heroicon вне набора (`"camera"`, `"chart-bar-square"`, …) валиден через `(string & {})` на уровне типа, но в runtime уходит в Iconify-fallback, а не в heroicons. Volar даёт autocomplete для curated-набора + Iconify-паттерна `prefix:name`. 30 публичных + 7 internal (`arrow-long-right`, `arrows-pointing-in`/`-out`, `ellipsis-vertical`, `exclamation-circle`, `funnel`, `square-2-stack` — используются `lib/`-компонентами).

## 6. Events / Emits + v-model contract

`IconsEmits = null`. v-model — не применимо.

## 7. Slots

`IconsSlots = null`.

## 8. Exposed methods

`IconsExpose` ([Icons.d.ts:140–171](../../lib/icons/Icons.d.ts#L140-L171)):

| Name        | Type                   | Description                                                          |
| ----------- | ---------------------- | -------------------------------------------------------------------- |
| `type`      | `IconType`             | Текущий type.                                                        |
| `variant`   | `"outline" \| "solid"` | Резолвленный variant (с учётом `stileIcon`-fallback и options).      |
| `label`     | `string \| undefined`  | Текущий accessible label (или `undefined` для декоративного режима). |
| `classIcon` | `IconsProps["class"]`  | Финальный класс.                                                     |
| `style`     | `IconsProps["style"]`  | Inline style.                                                        |

## 9. Examples

### 9.1 Heroicons

```vue
<Icons type="check" variant="solid" class="h-6 w-6 text-green-500" />
<Icons type="x-mark" variant="outline" class="h-4 w-4 text-red-500" />
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
    Icons: {
      variant: "solid",
      class: "h-5 w-5 text-neutral-700 dark:text-neutral-300"
    }
  }
})
```

### 9.4 С inline style

```vue
<Icons type="bell" :style="{ color: 'red', transform: 'rotate(15deg)' }" />
```

### 9.5 Семантическая иконка (icon-only button)

```vue
<button @click="onDelete">
  <Icons type="trash" label="Delete row" />
</button>
```

Screen reader озвучивает `<i role="img" aria-label="Delete row">`; SVG внутри `aria-hidden="true"`.

## 10. Configuration & Customization

### 10.1 Global

`IconsOption = Pick<IconsProps, "class" | "variant">` ([Icons.d.ts:172](../../lib/icons/Icons.d.ts#L172)). `type` и `label` всегда per-instance.

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

Wrapper-based pattern:

- **Декоративная** (`label` опущен) — wrapper `<i data-icon>` прозрачен (нет role/aria-label). Heroicons SVG имеет встроенный `aria-hidden="true"` в render-функции; Iconify SVG получает `aria-hidden="true"` явно. Screen reader пропускает иконку.
- **Семантическая** (`label="..."`) — wrapper получает `role="img"` + `aria-label="<label>"`. SVG внутри остаётся `aria-hidden="true"` — AT не дублирует. Используй для icon-only buttons, status-индикаторов, иконок-действий, где у пользователя нет иного источника контекста.

Почему wrapper, а не SVG: heroicons render-функции хардкодят `aria-hidden="true"` и не пробрасывают `$attrs` через свой raw render — атрибуты, переданные через `:is`, до SVG не доходят. Wrapper-pattern эквивалентен по семантике и работает универсально (для heroicons и Iconify).

`prefers-reduced-motion` не применим — компонент рендерит статический SVG, transitions/animations нет.

**RTL:** direction-иконки (`chevron-*`, `arrow-*`) визуально направлены и при `<html dir="rtl">` должны зеркалиться. Рецепт — см. §16 FAQ.

### Security

- **Heroicons** — tree-shakeable const-реестр explicit named-импортов из `@heroicons/vue` (Issue 1), безопасны (модули из node_modules, без внешней сети).
- **Iconify CDN risk.** `@iconify/vue` lazy-загружает SVG-data с `https://api.iconify.design` при первом render'е. Это создаёт:
  - **CSP-конфликт.** Strict-CSP `connect-src 'self'` блокирует загрузку — иконки не появятся (тихая ошибка). Multi-tenant SaaS и enterprise обычно имеют такой CSP.
  - **Supply-chain risk.** Зависимость от внешнего CDN; компрометация `api.iconify.design` повлияет на потребителей.
  - **Offline failure.** Без сетевого доступа Iconify-иконки не отрисуются.

  **Mitigation.** Bundling Iconify-collection локально через `@iconify/vue` API:

  ```ts
  import { addCollection } from "@iconify/vue"
  import mdi from "@iconify-json/mdi/icons.json"
  // выполнить ОДИН раз при инициализации приложения
  addCollection(mdi)
  ```

  После `addCollection` Iconify резолвит `"mdi:*"` локально, без сетевого вызова. Доступные JSON-коллекции — `@iconify-json/<collection>` (см. <https://iconify.design/docs/icons/iconify-icon.html#offline-use>). Доп. CSP: ничего не нужно для bundled-варианта.

  **Note.** Prop `:offline?: boolean` (env-detection для CDN fallback) — **declined** (2026-06-14): `addCollection` уже покрывает offline/CSP-сценарий без новой API-поверхности. См. [issues/icons.md](../issues/icons.md) Issue 2.

### Bundle (heroicons tree-shaking)

> **Resolved (2026-06-14, tree-shaking).** Heroicons переведены на **tree-shakeable const-реестр explicit named-импортов** ([Icons.vue module-scope `<script>`](../../lib/icons/Icons.vue#L1)): bundler оставляет только curated-набор (37 имён) вместо всех 648; sync lookup сохранён → prod-Vite/SSR-корректность не теряется. Issue 1 закрыт. [issues/icons.md Issue 1](../issues/icons.md).

Heroicons резолвятся через `import { CheckIcon, XMarkIcon, … } from "@heroicons/vue/24/{outline,solid}"` → реестры `HERO_OUTLINE`/`HERO_SOLID` ([Icons.vue:97](../../lib/icons/Icons.vue#L97), [:136](../../lib/icons/Icons.vue#L136)) + sync lookup `HERO_*[PascalCase(type) + "Icon"]` (Issue 1). Explicit named-импорты статичны → bundler tree-shake'ит набор; `dist/icons/icons.mjs` эмитит named-импорты ровно 37 иконок из outline + 37 из solid, **0** namespace-импортов:

| Вариант                                       | Иконки в bundle           | Bundle (gzip, оценка) | Prod-рендер |
| --------------------------------------------- | ------------------------- | --------------------- | ----------- |
| namespace `import *` (до tree-shaking)        | все 648 (outline+solid)   | ~94 KB                | ✅ ок       |
| dynamic import (`7740c50`)                    | **0** (битый bare-import) | 23.9 KB               | ❌ ломается |
| **const-реестр named (2026-06-14, текущий)**  | **37** (curated, ×2)      | **≈11 KB** (≈ −88%)   | ✅ ок       |

Промежуточный dynamic-import (`7740c50`) давал меньший bundle, но это была **не экономия**: Vite-плагин `dynamic-import-vars` глобит только относительные (`./`/`../`) спецификаторы, а bare `@heroicons/vue/...` **игнорировал** → в выходном chunk оставался буквальный `import("@heroicons/vue/...")`, а в `dist/index.html` нет import map → `TypeError: Failed to resolve module specifier`, иконки не рендерились в prod (видны только в `vite dev` / Vitest). const-реестр снимает и regression, и bundle-weight.

**Trade-off.** Реестр покрывает 37 имён (= `HeroIconName` union: 30 публичных + 7 internal, используемых `lib/`-компонентами). Heroicon **вне** набора (`"camera"`, `"chart-bar-square"`, …) больше не резолвится как heroicon → уходит в Iconify-fallback (offline недоступно без `addCollection`). Это осознанная цена tree-shaking: bundler не может предугадать произвольное runtime-имя. Расширить набор — добавить имя в `HeroIconName` ([Icons.d.ts:25](../../lib/icons/Icons.d.ts#L25)) И импорт в оба реестра [Icons.vue](../../lib/icons/Icons.vue#L97). Альтернатива для полного набора без curated-ограничения — compile-time [`unplugin-icons`](https://github.com/unplugin/unplugin-icons) (inline SVG, требует build-плагина у потребителя).

## 13. TypeScript

```ts
import type { IconsProps, IconsExpose, IconType, HeroIconName, IconifyIconName } from "fishtvue/icons"
import Icons from "fishtvue/icons"

// autocomplete для популярных heroicons
const name: HeroIconName = "check"
// Iconify pattern
const iconify: IconifyIconName = "mdi:home"
// open fallback — любая строка валидна
const unknown: IconType = "some-custom-name"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **@heroicons/vue:** `^2.1.5`.
- **@iconify/vue:** `^4.1.2`.
- **Stability flag:** `stable` — 101 кейс, coverage 93.93%+.
- **Breaking changes:** при апгрейде Heroicons 3.x — возможны переименования иконок.
- **Behavior change (2026-06-14, Issue 1 tree-shaking):** heroicon-имя вне curated-набора (37, см. `HeroIconName`) больше не резолвится как heroicon → уходит в Iconify-fallback. Потребителям, использовавшим произвольные heroicon-имена (`"camera"`, `"credit-card"`, …): добавь имя в curated-набор (PR) либо перейди на Iconify (`addCollection` / CDN). Документированные 30 `HeroIconName` + 7 internal не затронуты.
- **Deprecations:**
  - `stileIcon` (`0.2.x`) — soft-deprecated, replaced by `variant`. Эмитит dev `console.warn` при использовании без `variant`. Будет удалён в `1.0`. Codemod — Wave 12.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it, vi } from "vitest"
import FishtVue from "fishtvue/config"
import Icons from "fishtvue/icons/Icons.vue"

describe("Icons", () => {
  it("renders heroicon with variant", () => {
    const wrapper = mount(Icons, {
      props: { type: "check", variant: "solid" },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.find("svg").attributes("fill")).toBe("currentColor")
  })

  it("applies semantic label to wrapper", () => {
    const wrapper = mount(Icons, {
      props: { type: "trash", label: "Delete row" }
    })
    const root = wrapper.find("[data-icon]")
    expect(root.attributes("role")).toBe("img")
    expect(root.attributes("aria-label")).toBe("Delete row")
  })

  it("warns when stileIcon used without variant", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    mount(Icons, { props: { type: "check", stileIcon: "solid" } })
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/stileIcon.*deprecated/i))
    warn.mockRestore()
  })
})
```

Реальные тесты — [Icons.test.ts](../../lib/icons/Icons.test.ts) (101 кейс).

## 16. Troubleshooting / FAQ

| Проблема                                   | Причина                                                  | Решение                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Иконка не отображается                     | Имя `type` некорректно.                                  | Сверься на heroicons.com / icon-sets.iconify.design.                                                                                                                                                                                                                                                          |
| Iconify-иконка медленно загружается        | Lazy-load с CDN.                                         | Используй `addCollection` для локального bundle (см. §12 Security).                                                                                                                                                                                                                                           |
| `variant: "solid"` для Iconify не работает | `variant` применяется только к Heroicons.                | Используй разные `type` для Iconify-вариантов (`mdi:home` vs `mdi:home-outline`).                                                                                                                                                                                                                             |
| `stileIcon` теперь warning                 | Soft deprecation.                                        | Замени на `variant`; codemod в Wave 12.                                                                                                                                                                                                                                                                       |
| Custom class конфликтует с default         | Default `h-5 w-5 text-gray-*` имеет ту же специфичность. | Передавай `class` явно или конфигурируй `componentsOptions.Icons.class`.                                                                                                                                                                                                                                      |
| CSP блокирует Iconify CDN                  | `connect-src` запрещает `api.iconify.design`.            | Bundle Iconify-collection локально (`addCollection`), см. §12.                                                                                                                                                                                                                                                |
| Direction-иконка в RTL смотрит не туда     | `arrow-right`, `chevron-*` буквально направлены.         | Зеркаль через CSS: `[dir="rtl"] [data-rtl-mirror] { transform: scaleX(-1); }` — оберни иконку: `<span data-rtl-mirror><Icons type="arrow-right" /></span>`. Или per-instance: `:style="{ transform: dir === 'rtl' ? 'scaleX(-1)' : undefined }"`. Дизайн-системы (Material, Fluent) рекомендуют этот pattern. |
| Screen reader не озвучивает иконку         | По умолчанию — декоративная.                             | Задай `label` для семантического режима: `<Icons type="trash" label="Delete user" />`.                                                                                                                                                                                                                        |

## 17. Related

- [Button](./button.md) — использует Icons для иконок-prop.
- [Loading](./loading.md), [Switch](./switch.md), [Alert](./alert.md) — используют Icons.
- [Aria](./aria.md), [Form](./form.md), [Menu](./menu.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-10) комментариев `TODO/FIXME/HACK/XXX` в [Icons.vue](../../lib/icons/Icons.vue) и [Icons.d.ts](../../lib/icons/Icons.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage `Icons.vue` ~93%+ — две строки исторически не покрыты.
- `:offline` prop / env-detection для Iconify CDN fallback — **declined** (2026-06-14): `addCollection` покрывает offline/CSP без новой API-поверхности (см. [issues/icons.md](../issues/icons.md) Issue 2).
- **Heroicon вне curated-набора (37 имён) не резолвится как heroicon** → уходит в Iconify-fallback (Issue 1 tree-shaking trade-off): `<Icons type="camera" />` без `addCollection`/CDN не отрисуется. Расширить — добавить имя в `HeroIconName` + оба реестра `Icons.vue` (см. §12 Bundle). Closed issue [icons.md Issue 1](../issues/icons.md).

### Skipped tests

Нет.

### API inconsistencies

- `stileIcon` (опечатка от «styleIcon») сохранён как deprecated alias `variant`. Удаление в `1.0` + codemod в Wave 12.
- `HeroIconName` — curated-набор из 37 имён, === runtime const-реестр (Issue 1 tree-shaking): это и autocomplete, и фактическая граница offline-резолва heroicons. Полный набор (~280 имён) тянул бы весь heroicons-bundle (или требовал build-script `unplugin-icons`) — компромисс между bundle-size и покрытием. См. §12 Bundle.

### Behavioral caveats

- При имени, отсутствующем и в Heroicons, и в Iconify — wrapper `<i data-icon>` рендерится пустым.
- Iconify первый раз грузится с CDN (ms latency); subsequent рендеры — из кэша.
- `variant` применяется только к Heroicons; Iconify имеет свой механизм через name suffix.
- `label=""` (пустая строка) трактуется как «не задан» — wrapper остаётся прозрачным.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

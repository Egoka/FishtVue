---
title: VirtualScroller
summary: Низкоуровневый windowing-примитив (variable-height, lazy, grid) + headless composable useVirtualScroll + enhanced-native macOS-скроллбар.
updated: 2026-06-13
stability: stable
since: 0.2.12
---

# VirtualScroller

## 1. Overview

`VirtualScroller` рендерит только видимое подмножество большого списка внутри скролл-контейнера (windowing) — DOM-узлов остаётся ровно столько, сколько помещается в viewport плюс overscan-буфер. Применяй для списков от сотен элементов, где полный рендер лагает. Отличие от `Table` — это **универсальный примитив без табличной семантики**: оборачивает любой контент через scoped-slot, поддерживает переменную высоту элементов, infinite-scroll (`lazy`) и grid-раскладку. Аналог [PrimeVue VirtualScroller](https://primevue.org), адаптированный под канон FishtVue. `stability: stable` (≥30 тестов, публичный API без `any` в сигнатурах, нет TODO/BREAKING), `since: 0.2.12`. [Source](../../lib/virtualscroller/VirtualScroller.vue).

Математика виртуализации вынесена в headless composable [`useVirtualScroll`](../../lib/virtualscroller/useVirtualScroll.ts) — его можно переиспользовать вне SFC (планируется в `Table`/`Select`/`Menu`).

## 2. How it's organized

Файлы в `lib/virtualscroller/`:

- `VirtualScroller.vue` — SFC: overflow-контейнер, spacer-разметка, слоты, emits, expose, инъекция скроллбара.
- `useVirtualScroll.ts` — headless ядро: offset-модель (prefix-sum), binary search, `measure`/`refresh`, `scrollOffsetForIndex`.
- `VirtualScroller.d.ts` — типы `VirtualScrollerProps/Slots/Emits/Expose/Option` + вспомогательные (`VirtualScrollerItemSize`, `VirtualScrollerScrollbar`, …).
- `VirtualScroller.test.ts` + `useVirtualScroll.test.ts` — Vitest 4.
- `package.json` — точечный импорт `fishtvue/virtualscroller`.

**Зависимости от библиотеки:** базовый класс [`Component<T>`](../architecture/component-class.md) (стили, `getOptions`, `t`), [`useStyle`](../architecture/theme.md) из `fishtvue/theme` (raw-CSS скроллбара), `isClient` из `fishtvue/utils/domHandler`. Компонент **ни от каких других SFC не зависит** и сам пока не используется внутри `lib/` (интеграция в Select/Table/Menu — отдельный этап).

**Внешние зависимости:** нет (dependency-free; canon-запрет на runtime-deps соблюдён).

**Tree-shaking & bundle:** `import VirtualScroller from "fishtvue/virtualscroller"` тянет только этот компонент + базовый класс. `import { VirtualScroller } from "fishtvue"` — через root barrel ([lib/index.ts](../../lib/index.ts)), бандлер обязан tree-shake'ить остальное. Composable доступен как `import { useVirtualScroll } from "fishtvue/virtualscroller"`.

## 3. How it works

- **Lifecycle:** стили инициализируются авто-хуком `Component.__hooks()` ([component/index.ts:79](../../lib/component/index.ts#L79)) — ручного `onMounted(() => initStyle())` в SFC нет. В `onMounted` — измерение viewport, `ResizeObserver`, разовая инъекция скроллбара.
- **Поток данных:** `props` → resolved computeds (`props ?? options ?? defaults`) → composable `useVirtualScroll` считает `range`/`topPad`/`bottomPad` → `visibleItems` → scoped-slot. Scroll-обработчик ([VirtualScroller.vue:227](../../lib/virtualscroller/VirtualScroller.vue#L227)) пишет `scrollTop`/`scrollLeft`/измеренный viewport в `ref`, остальное реактивно. `watch` на `range` эмитит `scroll-index-change`; `watch` на `items.length` сбрасывает lazy-гейт.
- **Окно:** O(log n) binary search по prefix-sum `offsets` на каждый scroll; тяжёлая O(n) перестройка `offsets` живёт в computed и **не** триггерится скроллом ([useVirtualScroll.ts:117](../../lib/virtualscroller/useVirtualScroll.ts#L117)).
- **Стили:** базовый класс — `VirtualScroller.setStyle(["relative"])` → `@layer fishtvue`. Скроллбар — raw CSS через `useStyle()` (см. §12), не через `setStyle` (псевдоэлементы не выразимы Tailwind-утилитами).
- **Конфиг (`getOptions`):** `itemSize`, `estimatedItemSize`, `orientation`, `overscan`, `threshold`, `delay`, `scrollbar`, `class`, `classContent`.
- **Локализация:** `VirtualScroller.t("virtualScroller.loading")` ([VirtualScroller.vue:177](../../lib/virtualscroller/VirtualScroller.vue#L177)) — aria-label loader'а (en `Loading…` / ru `Загрузка…`).
- **SSR / hydration:** компонент SSR-совместим. На сервере viewport неизвестен → первый кадр рендерит slice `[0, min(n, threshold)]` без window-обрезки; реальное окно считается после mount (`mounted` + измеренный `clientHeight`/`clientWidth`). `useStyle` — no-op без `document`. Hydration-mismatch исключён: серверный и первый клиентский кадр одинаковы (оба до измерения), окно появляется уже после hydration.
- **Animation / transitions:** только CSS-transition fade/толщины скроллбара, обёрнут в `@media (prefers-reduced-motion: no-preference)`. JS-анимаций нет.

## 4. Quick Start

```vue
<script setup lang="ts">
  import VirtualScroller from "fishtvue/virtualscroller"

  const items = Array.from({ length: 100000 }, (_, i) => ({ id: i, label: `Row ${i}` }))
</script>

<template>
  <VirtualScroller :items="items" :item-size="40" :scroll-height="400" style="width: 320px">
    <template #item="{ item, index }">
      <div :style="{ height: '40px' }">#{{ index }} — {{ item.label }}</div>
    </template>
  </VirtualScroller>
</template>
```

## 5. Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `any[]` | `[]` | исходный массив данных |
| `itemSize` | `number \| ((index: number, item: any) => number) \| "auto"` | `"auto"` (from global config) | размер элемента вдоль оси (для `horizontal` — ширина) |
| `estimatedItemSize` | `number` | `40` | оценка размера незамеренных элементов |
| `orientation` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | ось виртуализации; `"both"` — grid |
| `scrollHeight` | `string \| number` | — | высота viewport (число → px) |
| `scrollWidth` | `string \| number` | — | ширина viewport (число → px) |
| `overscan` | `number` | `6` | буфер элементов вне viewport с каждой стороны |
| `threshold` | `number` | `100` | при `items.length <= threshold` виртуализация выключена (рендер всех) |
| `delay` | `number` | `0` | throttle эмита scroll-события, мс (`0` — синхронно) |
| `lazy` | `boolean` | `false` | infinite-scroll: догрузка по событию `lazy-load` |
| `appendOnly` | `boolean` | `false` | для `lazy`: `start` фиксируется на 0 (лента только растёт) |
| `loading` | `boolean` | `false` | внешний флаг загрузки (гейтит повторный `lazy-load`) |
| `showLoader` | `boolean` | `false` | показывать встроенный loader при `loading` |
| `scrollbar` | `"macos" \| "thin" \| "native" \| "hidden"` | `"macos"` | стиль полосы прокрутки (см. §10.3) |
| `class` | `StyleClass` | — | классы корневого контейнера |
| `classContent` | `StyleClass` | — | классы окна с элементами |

Резолв по канону: `props ?? componentsOptions.VirtualScroller ?? default` через `??`. `itemSize` без явного значения резолвится в `"auto"` (замер через `ResizeObserver`) — мягче, чем required в PrimeVue.

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `scroll` | `{ scrollTop: number; scrollLeft: number; direction: "up" \| "down" \| "left" \| "right" }` | на каждый (throttled при `delay > 0`) scroll |
| `scroll-index-change` | `{ first: number; last: number }` | при смене видимого диапазона |
| `lazy-load` | `{ first: number; last: number }` | хвост достигнут и `lazy = true` (не повторяется, пока `loading = true` либо длина данных не изменилась) |

**v-model contract.** Не применимо для этого компонента — VirtualScroller не form-control, `modelValue` не использует.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `item` | `{ item: any; index: number; active: boolean }` | основной шаблон одного элемента; `index` — абсолютный, `active` — внутри viewport (не overscan) |
| `content` | `{ items: any[]; first: number; last: number; styleContent: CSSProperties; getItemOptions: (i: number) => { index; active } }` | полный контроль над разметкой окна; **отключает** loop по `item` |
| `loader` | `{ index: number }` | кастомный skeleton (default — пустой плейсхолдер) |
| `header` | — | контент над областью виртуализации (вне scroll-окна) |
| `footer` | — | контент под областью виртуализации |

## 8. Exposed methods

| Name | Type | Description |
|---|---|---|
| `isVirtual` | `boolean` | включена ли виртуализация (`items.length > threshold`) |
| `orientation` | `VirtualScrollerOrientation` | resolved ось |
| `scrollbar` | `VirtualScrollerScrollbar` | resolved режим скроллбара |
| `overscan` / `threshold` / `delay` / `estimatedItemSize` | `number` | resolved опции |
| `classBase` | `StyleClass` | класс корня (`""` при `unstyled`) |
| `viewportRef` | `Ref<HTMLElement \| undefined>` | template-ref на скролл-контейнер |
| `scrollTo` | `(options: ScrollToOptions) => void` | нативный scroll контейнера |
| `scrollToIndex` | `(index: number, behavior?: ScrollBehavior) => void` | прокрутка к элементу (выравнивание к началу) |
| `scrollInView` | `(index: number, to?: "to-start" \| "to-end" \| "auto", behavior?) => void` | прокрутка в зону видимости |
| `getRenderedRange` | `() => { first: number; last: number }` | текущий отрендеренный диапазон |
| `refresh` | `() => void` | сброс кэша измеренных размеров (после смены `itemSize`) |

```ts
import { useTemplateRef } from "vue"
import type VirtualScroller from "fishtvue/virtualscroller"

const vsRef = useTemplateRef<InstanceType<typeof VirtualScroller>>("vsRef")
// vsRef.value?.scrollToIndex(500)
```

## 9. Examples

**1. Базовый (fixed-height):**

```vue
<template>
  <VirtualScroller :items="items" :item-size="32" :scroll-height="300">
    <template #item="{ item }">{{ item.label }}</template>
  </VirtualScroller>
</template>
```

**2. С глобальной конфигурацией:**

```ts
import { createApp } from "vue"
import FishtVue from "fishtvue/config"

createApp(App).use(FishtVue, {
  componentsOptions: {
    VirtualScroller: { overscan: 10, scrollbar: "thin", estimatedItemSize: 48 }
  }
})
```

**3. Variable height + infinite scroll (lazy):**

```vue
<script setup lang="ts">
  import { ref } from "vue"
  import VirtualScroller from "fishtvue/virtualscroller"

  const items = ref<Array<{ id: number; text: string }>>([])
  const loading = ref(false)

  async function onLazyLoad() {
    if (loading.value) return
    loading.value = true
    const next = await fetchPage(items.value.length) // ваша загрузка
    items.value = items.value.concat(next)
    loading.value = false
  }
</script>

<template>
  <VirtualScroller
    :items="items"
    item-size="auto"
    :estimated-item-size="56"
    :scroll-height="500"
    lazy
    append-only
    :loading="loading"
    show-loader
    @lazy-load="onLazyLoad">
    <template #item="{ item }">
      <div class="p-3 border-b">{{ item.text }}</div>
    </template>
  </VirtualScroller>
</template>
```

**4. Grid (`orientation="both"`) + Pinia:**

```vue
<script setup lang="ts">
  import { storeToRefs } from "pinia"
  import VirtualScroller from "fishtvue/virtualscroller"
  import { useGalleryStore } from "@/stores/gallery"

  const { photos } = storeToRefs(useGalleryStore())
</script>

<template>
  <VirtualScroller :items="photos" :item-size="120" orientation="both" :scroll-height="600" style="width: 100%">
    <template #item="{ item }">
      <img :src="item.thumb" :alt="item.title" width="120" height="120" />
    </template>
  </VirtualScroller>
</template>
```

## 10. Configuration & Customization

### 10.1 Global (через `app.use`)

```ts
app.use(FishtVue, {
  componentsOptions: {
    VirtualScroller: {
      itemSize: 40,
      estimatedItemSize: 40,
      orientation: "vertical",
      overscan: 6,
      threshold: 100,
      delay: 0,
      scrollbar: "macos",
      class: "rounded-lg border",
      classContent: ""
    }
  }
})
```

Источник полей — `VirtualScrollerOption` (`Pick` от `VirtualScrollerProps`) + [config/FishtVue.d.ts](../../lib/config/FishtVue.d.ts).

### 10.2 Per-instance (через props)

Те же значения переопределяются point-of-use. Приоритет: `props` > `global config` > `defaults`.

### 10.3 Theming

Цвет thumb скроллбара — CSS-переменная `--vs-thumb` (default `rgba(120,120,120,.5)`). Override — на корне или через `class`:

```vue
<VirtualScroller :items="items" :item-size="40" style="--vs-thumb: rgb(59 130 246 / .6)" />
```

Режимы скроллбара (`scrollbar` prop), различаются **только в неактивном состоянии** — активное (`:hover` контейнера ИЛИ идёт scroll) идентично:

| Состояние | `"macos"` (default) | `"thin"` | `"native"` | `"hidden"` |
|---|---|---|---|---|
| idle | скрыт | тонкий, виден | системный | скрыт |
| active | появляется + толще | толще (как macos) | системный | скрыт |

Firefox: auto-hide невозможен → `"macos"` деградирует до thin-always (`scrollbar-width: thin`).

### 10.4 CSS layer override

Базовый класс инжектится в `@layer fishtvue`. Override — позднее объявленным layer (`@layer fishtvue, app;`) либо вне layer'ов. Скроллбар инжектится **вне layer'ов** (raw `useStyle`), поэтому его легко перекрыть собственным `[data-vs-viewport]::-webkit-scrollbar`-правилом.

## 11. Form integration & validation

Не применимо для этого компонента — VirtualScroller не form-control.

## 12. Accessibility & Security

### A11y

- VirtualScroller — низкоуровневый примитив; роль списка (`listbox`/`menu`/`grid`) задаёт **потребитель**. Scoped-slot `item` отдаёт `index` (абсолютный) — потребитель проставляет `aria-setsize` (= `items.length`) и `aria-posinset` (= `index + 1`).
- Spacer'ы (`[data-vs-spacer]`) — `aria-hidden="true"` ([VirtualScroller.vue:408](../../lib/virtualscroller/VirtualScroller.vue#L408)); технические обёртки — `role="presentation"`.
- Компонент **не трогает** `tabindex`/`focus` потребителя (focus-management — на стороне Select/Menu при интеграции).
- Loader — `role="status"` + локализованный `aria-label`.
- **Reduced motion:** transition скроллбара под `@media (prefers-reduced-motion: no-preference)`.

### Security

- Контент рендерится **только** через scoped-slots — `v-html` не используется, XSS-поверхности нет.
- **CSP:** скроллбар инжектится через `useStyle()` (inline `<style>`). `useStyle` **не пробрасывает** `nonce` ([Theme.d.ts](../../lib/theme/Theme.d.ts) `StyleOptions.nonce` есть, но пайплайн его не использует — library-wide ограничение). Под строгим CSP без `'unsafe-inline'` стилизация скроллбара не применится; функциональность скролла не страдает. См. §18.

## 13. TypeScript

```ts
import type {
  VirtualScrollerProps,
  VirtualScrollerEmits,
  VirtualScrollerSlots,
  VirtualScrollerExpose
} from "fishtvue/virtualscroller"
import { useVirtualScroll } from "fishtvue/virtualscroller"
```

```ts
import { useTemplateRef } from "vue"
import type VirtualScroller from "fishtvue/virtualscroller"

const vsRef = useTemplateRef<InstanceType<typeof VirtualScroller>>("vsRef")
function goTo(i: number) {
  vsRef.value?.scrollToIndex(i, "smooth")
}
```

## 14. Compatibility & Stability

- **Минимальные версии:** Vue 3.5+, TypeScript 5.9+, Node 18+.
- **Nuxt:** 3.x поддерживается (авто-импорт через `FISHT_VUE_COMPONENTS`, [module/nuxt.ts](../../lib/module/nuxt.ts)); Nuxt 4 — экспериментально.
- **Браузеры:** evergreen. Полный двухрежимный скроллбар — WebKit/Blink; Firefox — упрощённо (thin); прочие движки игнорируют стилизацию (скролл работает).
- **Stability flag:** `stable` — публичный API типизирован без `any` в сигнатурах, ≥30 тестов, нет TODO/FIXME.
- **Breaking changes:** нет (новый компонент).
- **Deprecations:** нет.

## 15. Testing recipes

```bash
pnpm test -- lib/virtualscroller/VirtualScroller.test.ts
pnpm test -- lib/virtualscroller/useVirtualScroll.test.ts
```

```ts
import { mount } from "@vue/test-utils"
import FishtVue from "fishtvue/config"
import VirtualScroller from "fishtvue/virtualscroller/VirtualScroller.vue"

const wrapper = mount(VirtualScroller, {
  props: { items, itemSize: 20 },
  global: { plugins: [[FishtVue, {}]] }
})
```

В jsdom layout не вычисляется (`clientHeight === 0`) — для проверки windowing подменяй `clientHeight`/`scrollTop` через `Object.defineProperty` и диспатчи `scroll`-событие на `[data-vs-viewport]` (см. helper `drive` в `VirtualScroller.test.ts`). `afterEach` чистит `window.FishtVue` (singleton протекает между файлами Vitest).

## 16. Troubleshooting / FAQ

- **«Ничего не скроллится / виден только 1 элемент»** → контейнеру нужна высота. Передай `scroll-height` или задай height родителю/`class`.
- **«Рендерятся все элементы, виртуализации нет»** → `items.length <= threshold` (default 100). Уменьши `threshold` или увеличь данные.
- **«Скачет при scroll вверх в `itemSize="auto"`»** → anti-jump митигирует, но не устраняет на 100%; задай `estimatedItemSize` ближе к реальному среднему.
- **«Сменил `itemSize` — окно не пересчиталось»** → вызови `refresh()` через template-ref.
- **«Скроллбар не стилизуется»** → Firefox/не-WebKit движок (ожидаемо), либо строгий CSP без `'unsafe-inline'` (см. §12).
- **«Стили компонента не применились»** → забыт `app.use(FishtVue, {})` в `main.ts`.

## 17. Related

- [Table](./table.md) — табличная виртуализация (fixed-height, `<tr>`-спейсеры); кандидат на переход к `useVirtualScroll`.
- [Select](./select.md) — кандидат на виртуализацию длинных списков опций ([issues/select.md Issue 7](../issues/select.md)).
- [Menu](./menu.md) — кандидат на `virtual` для длинных меню.
- [Component class](../architecture/component-class.md), [Theme](../architecture/theme.md).

## 18. Known issues & limitations

На момент ревизии (2026-06-13) известных багов нет; ниже — задокументированные ограничения v1.

### Behavioral caveats

- **`"auto"`-режим:** до первого замера `total` оценивается по `estimatedItemSize`; нативная полоса может слегка «дрожать» при коррекции (митигируется anti-jump, [VirtualScroller.vue:270](../../lib/virtualscroller/VirtualScroller.vue#L270)).
- **Смена `itemSize` на лету** требует `refresh()` — кэш измеренных размеров не сбрасывается автоматически.
- **`orientation="both"` (grid):** только сеточные раскладки с равными ячейками; для grid `itemSize` должен быть числом (иначе fallback на `estimatedItemSize`); по горизонтали виртуализации нет (все колонки строки рендерятся). Masonry — вне scope.
- **`delay`:** при `delay = 0` обработчик scroll работает синхронно (без `requestAnimationFrame`); внутренние scroll-`ref`'ы всегда обновляются сразу, throttle (`delay > 0`) откладывает только эмит события `scroll`.

### API / CSP

- **Скроллбар стилизуется через `useStyle()`** (inline `<style>`), который **не пробрасывает `nonce`** (library-wide ограничение, [Theme.d.ts](../../lib/theme/Theme.d.ts) `StyleOptions.nonce`). Под строгим CSP без `'unsafe-inline'` стилизация скроллбара не применяется — сам скролл и виртуализация работают.
- **Firefox:** auto-hide полосы недоступен → `"macos"` ведёт себя как `"thin"` (без анимации толщины).
- Стилизация скроллбара завязана на `::-webkit-scrollbar` / `scrollbar-*` — иные движки игнорируют.

### Skipped tests

Нет.

### Bug report format

- версии: `vue`, `nuxt`, `fishtvue`, `node`, OS, browser;
- минимальный repro (StackBlitz / ветка в `sandbox/`);
- ожидаемое vs фактическое поведение, скриншот для UI;
- console output.

---
title: Pagination
summary: Пейджер с size-selector, info-text, кастомизируемым числом видимых страниц.
updated: 2026-06-13
stability: stable
since: 0.2.11
---

# Pagination

## 1. Overview

`Pagination` — навигатор по страницам данных. Поддерживает selector размера страницы (через [Select](./select.md)), info-text (`X of Y items`), 5–11 видимых номеров страниц, опциональное скрытие navigation-кнопок.

Stability: `stable` — 40 кейсов, coverage `Pagination.vue` 98.42%.

Source: [Source](../../lib/pagination/Pagination.vue), [Pagination.d.ts](../../lib/pagination/Pagination.d.ts), [Pagination.test.ts](../../lib/pagination/Pagination.test.ts).

## 2. How it's organized

```
lib/pagination/
├── Pagination.vue
├── Pagination.d.ts        # 223 строки
├── Pagination.test.ts     # 40 кейсов
└── package.json
```

Зависимости: [Select](./select.md) для page-size selector, [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** автоматическая инжекция стилей через `Component.__hooks()` (конструктор `Component`) — без ручного `initStyle()` в SFC.
- **Поток данных:** `total` + `sizePage` → расчёт количества страниц → массив `pages` для отображения. `modelValue` — текущая активная страница.
- **v-model contract:** стандартный для `update:modelValue` + `update:sizePage`.
- **Стили:** через `Pagination.setStyle()` (учитывает `unstyled: true`).
- **Конфиг:** `componentsOptions.Pagination` — ключи см. §10.
- **Локализация:** через `t("of")`, `t("items")`, `t("show")`, `t("previous")`, `t("next")`, `t("pagination.label")`, `t("pagination.page")`.
- **SSR:** SSR-safe (критический CSS через `onServerPrefetch`).

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Pagination from "fishtvue/pagination"

const page = ref(1)
</script>

<template>
  <Pagination v-model="page" :total="200" :size-page="20" />
</template>
```

## 5. Props

`PaginationProps` ([Pagination.d.ts:17–80](../../lib/pagination/Pagination.d.ts#L17-L80)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `number` | — | Активная страница (1-indexed). |
| `mode` | `StyleMode` | — | Визуальный режим. |
| `sizePage` | `number \| 5 \| 15 \| 20 \| 50 \| 100 \| 150` | — | Размер страницы. |
| `sizesSelector` | `[5,15,20,50,100,150] \| Array<number>` | — | Список доступных размеров. |
| `visibleNumberPages` | `5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11` | — | Сколько номеров страниц отображать. |
| `total` | `number` | — | Общее количество элементов. |
| `isInfoText` | `boolean` | — | Показывать «X of Y items». |
| `isPageSizeSelector` | `boolean` | — | Показывать select размера. |
| `isHiddenNavigationButtons` | `boolean` | — | Скрыть Previous/Next. |
| `class` | `StyleClass` | — | Класс контейнера. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `number` | На клик по странице или Previous/Next. |
| `update:sizePage` | `number` | На смену размера страницы через select. |

v-model: стандартный `v-model:modelValue`. Для size-page — `v-model:sizePage`.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Нестандартный rendering (используется редко). |

## 8. Exposed methods

`PaginationExpose` ([Pagination.d.ts:108–214](../../lib/pagination/Pagination.d.ts#L108-L214)):

| Name | Type | Description |
|---|---|---|
| `paginationRef` | `Readonly<Ref<HTMLElement \| undefined>>` | Ref на корневой `<nav>`. Для programmatic `.focus()` / `.scrollIntoView()`. |
| `selectPageSize` | `SelectExpose \| undefined` | Ссылка на встроенный Select. |
| `sizePage` | `number \| undefined` | Текущий размер. |
| `visibleNumberPages`, `total`, `isInfoText`, `isPageSizeSelector`, `isNavigationButtons`, `arraySizesSelector`, `pages`, `activePage`, `mode`, `modeStyleSelect`, `paramsSelect` | Derived/computed. |
| `switchPage(value)` | `(value: number \| Array<number>) => void` | Программное переключение страницы. |
| `switchSizePage(value)` | `(value: number) => void` | Программная смена size. |
| `focus(options?)` | `(options?: FocusOptions) => void` | Фокусирует корневой `<nav>`. |

## 9. Examples

### 9.1 Базовый

```vue
<Pagination v-model="page" :total="100" :size-page="10" />
```

### 9.2 С selector'ом размера

```vue
<Pagination
  v-model="page"
  :total="500"
  :size-page="20"
  :sizes-selector="[10, 20, 50, 100]"
  :is-page-size-selector="true"
  :is-info-text="true" />
```

### 9.3 Глобальная конфигурация

```ts
app.use(FishtVue, {
  componentsOptions: {
    Pagination: {
      visibleNumberPages: 7,
      isInfoText: true,
      isPageSizeSelector: true
    }
  }
})
```

### 9.4 Привязка к Pinia

```vue
<script setup lang="ts">
import { storeToRefs } from "pinia"
import Pagination from "fishtvue/pagination"
import { useTableStore } from "@/stores/table"

const store = useTableStore()
const { page, total, pageSize } = storeToRefs(store)
</script>

<template>
  <Pagination
    v-model="page"
    v-model:size-page="pageSize"
    :total="total"
    :is-page-size-selector="true" />
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`PaginationOption = Pick<PaginationProps, "mode" | "sizePage" | "sizesSelector" | "visibleNumberPages" | "total" | "isInfoText" | "isPageSizeSelector" | "isHiddenNavigationButtons" | "class">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвета active-страницы — через `theme.semantic.primary`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-pagination`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

- **Landmark:** корневой `<nav role="navigation" :aria-label>` ([Pagination.vue:292–297](../../lib/pagination/Pagination.vue#L292-L297)) — единственный navigation landmark; `aria-label` локализуется через `t("pagination.label")`.
- **Page buttons:** `:aria-label="${t('pagination.page')} ${page}"` ([Pagination.vue:372](../../lib/pagination/Pagination.vue#L372)) + `aria-current="page"` на активной ([Pagination.vue:371](../../lib/pagination/Pagination.vue#L371)).
- **aria-live:** sr-only `role="status" aria-live="polite"` region ([Pagination.vue:298–307](../../lib/pagination/Pagination.vue#L298-L307)) — при смене страницы screen reader объявляет «Page X of Y».
- **RTL:** порядок prev/next зеркалится `inline-flex` нативно; directional иконки — `rtl:-scale-x-100`, отступы — logical `ms-3` ([Pagination.vue:182–183](../../lib/pagination/Pagination.vue#L182-L183)).
- **prefers-reduced-motion:** собственных transitions нет; анимации дочерних `<Button>`/`<Select>` — `motion-safe:`.
- **print / forced-colors:** style-for-print монохром (`print:*`) + `forced-colors:outline` на активной странице ([Pagination.vue:199–201](../../lib/pagination/Pagination.vue#L199-L201)).
- **Keyboard:** Tab по страницам и кнопкам, Enter/Space для активации (нативные `<button>`).
- **Programmatic focus:** через exposed `paginationRef` / `focus()`.

### Security

- Не рендерит HTML из props.

## 13. TypeScript

```ts
import type { PaginationProps, PaginationEmits, PaginationExpose } from "fishtvue/pagination"
import Pagination from "fishtvue/pagination"
import { useTemplateRef } from "vue"

const p = useTemplateRef<InstanceType<typeof Pagination>>("p")
p.value?.switchPage(1)
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 40 кейсов, coverage 98.42%.
- **Breaking changes:** 2026-06-13 — корневой DOM-узел `<div data-pagination>` → `<nav data-pagination>` (navigation landmark, a11y). `data-pagination` и публичный API (`Props`/`Emits`/`Slots`) без изменений; внутренний `<nav data-pagination-nav>` понижен до `<div>`.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Pagination from "fishtvue/pagination/Pagination.vue"

describe("Pagination", () => {
  it("emits update:modelValue", async () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 1, total: 50, sizePage: 10 },
      global: { plugins: [[FishtVue, {}]] }
    })
    // ... interaction + emit assert
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Pagination.test.ts](../../lib/pagination/Pagination.test.ts) (40 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Pagination отображает только одну страницу | `total` ≤ `sizePage`. | Передай реальный `total`. |
| Selector size не показывается | `isPageSizeSelector: false`. | Установи `true`. |
| Number of pages не растёт | Проверь `visibleNumberPages` (5–11). | Установи большее значение. |
| `modelValue: 0` отображается странно | 1-indexed. | Используй `1` как первую страницу. |
| Locale-keys не локализованы | `setActiveLocale` не вызван. | См. [Locale](../architecture/locale.md). |

## 17. Related

- [Table](./table.md) — основной потребитель.
- [Select](./select.md) — встроенный для size-selector.
- [architecture/locale.md](../architecture/locale.md) — `of`/`items`/`show`/`previous`/`next` + namespace `pagination.label`/`pagination.page` (a11y).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Pagination.vue](../../lib/pagination/Pagination.vue) и [Pagination.d.ts](../../lib/pagination/Pagination.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- `ResizeObserver`-callback для short-navigation ([Pagination.vue:282-283](../../lib/pagination/Pagination.vue#L282-L283)) зависит от layout (`offsetWidth`) — ветвь не воспроизводится в jsdom, покрыта частично.
- `ResizeObserver`'ы для short-navigation сохраняются в локальный массив `navigationObservers` и отключаются в `onBeforeUnmount` ([Pagination.vue:237-241](../../lib/pagination/Pagination.vue#L237-L241)) — утечки памяти при unmount нет (regression-тесты в [Pagination.test.ts](../../lib/pagination/Pagination.test.ts)).

### Skipped tests

Нет.

### API inconsistencies

- `sizePage?: number | 5 | 15 | 20 | 50 | 100 | 150` — open union с literal-вариантами; narrow не работает.
- `sizesSelector?: [5,15,20,50,100,150] | Array<number>` — кортеж + open array; обычно используется как `Array<number>`.
- `visibleNumberPages?: 5 | 6 | 7 | 8 | 9 | 10 | 11` — strict union (без `number` open) — единственное narrow-поле.
- `update:sizePage` payload — `PaginationProps["modelValue"]` (т.е. `number | undefined`) — но фактически всегда `number`. Type шире необходимого.
- `PaginationExpose.isNavigationButtons` соответствует props `isHiddenNavigationButtons` — инвертировано без явной маркировки.

### Behavioral caveats

- При смене `sizePage` — текущая `modelValue` не сбрасывается. Если новая `total / sizePage < modelValue` — может быть «несуществующая страница». Сбрасывай в parent через `@update:size-page`.
- `arraySizesSelector` ([Pagination.d.ts:160–164](../../lib/pagination/Pagination.d.ts#L160-L164)) формирует `{ key, value }` объекты для Select — кастомизация лимитирована.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

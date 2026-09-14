---
title: Pagination
summary: Пейджер с size-selector, info-text, кастомизируемым числом видимых страниц.
updated: 2026-09-14
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
- **Поток данных:** `total` + `pageSize` → расчёт количества страниц → массив `pages` для отображения. `modelValue` — текущая активная страница.
- **v-model contract:** стандартный для `update:modelValue` + `update:pageSize`.
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
| `pageSize` | `number \| 5 \| 15 \| 20 \| 50 \| 100 \| 150` | `5` | Размер страницы. Бывший `sizePage`. |
| `pageSizes` | `[5,15,20,50,100,150] \| Array<number>` | — | Список доступных размеров. Бывший `sizesSelector`. |
| `visiblePages` | `5 \| 6 \| 7 \| 8 \| 9 \| 10 \| 11` | `5` | Сколько номеров страниц отображать. Бывший `visibleNumberPages`. |
| `total` | `number` | — | Общее количество элементов. |
| `infoText` | `boolean` | `false` | Показывать «X of Y items». Бывший `isInfoText`. |
| `pageSizeSelector` | `boolean` | `false` | Показывать select размера. Бывший `isPageSizeSelector`. |
| `navigationButtons` | `boolean` | `true` | Показывать Previous/Next. Positive-инверсия снятого `isHiddenNavigationButtons`. |
| `class` | `StyleClass` | — | Классы корня `<nav data-pagination>` (dev-patterns §2 A). |
| `selectProps` | `PaginationSelectProps` | — | Props селектора размера страницы (dev-patterns §2 G). Раньше было expose-only `paramsSelect`. |

Ключей `classes` у Pagination нет — единственный стилизуемый узел это корень, поэтому карта не заводилась (Table передаёт свой сегмент через `class`).

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `number` | На клик по странице или Previous/Next. |
| `update:pageSize` | `number` | На смену размера страницы через select. Бывший `update:sizePage` — **silent break**: старые обработчики просто перестают вызываться. |

**v-model contract:** активная страница — стандартный `v-model`, размер страницы — именованный
канал `v-model:page-size`. Оба payload'а — `number` (до 1.0 `update:pageSize` был типизирован
через `PaginationProps["modelValue"]`, то есть ссылался на активную страницу и допускал
`undefined`).

`change:modelValue` у Pagination **не заводится**: это не form-control, а канал несёт номер
страницы — у него нет момента «значение устоялось», отличного от самого обновления
(dev-patterns §2 H). Для тяжёлых операций подписывайся на `update:modelValue` напрямую.

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
| `pageSize` | `number \| undefined` | Текущий размер. |
| `visiblePages`, `total`, `isInfoText`, `isPageSizeSelector`, `isNavigationButtons`, `arrayPageSizes`, `pages`, `activePage`, `mode`, `modeStyleSelect`, `selectProps`, `classBase` | Derived/computed. |
| `switchPage(value)` | `(value: number \| Array<number>) => void` | Программное переключение страницы. |
| `switchPageSize(value)` | `(value: number) => void` | Программная смена размера страницы. |
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
      visiblePages: 7,
      infoText: true,
      pageSizeSelector: true
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

`PaginationOption = Pick<PaginationProps, "mode" | "pageSize" | "pageSizes" | "visiblePages" | "total" | "infoText" | "pageSizeSelector" | "navigationButtons" | "class" | "selectProps">`.

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
- **Stability flag:** `stable` — 71 кейс, coverage 98.42%.
- **Breaking changes (1.0.0, редизайн props):**
  - `sizePage` → `pageSize`, `sizesSelector` → `pageSizes`, `visibleNumberPages` → `visiblePages`.
  - булевы: `isInfoText` → `infoText`, `isPageSizeSelector` → `pageSizeSelector`, `isHiddenNavigationButtons` → `navigationButtons` (смысл инвертирован, default `true`).
  - событие `update:sizePage` → `update:pageSize` — **silent break**: старые обработчики перестают вызываться.
  - expose-only `paramsSelect` стал prop'ом `selectProps` (тип `PaginationSelectProps`); expose `arraySizesSelector` → `arrayPageSizes`, `switchSizePage` → `switchPageSize`, `sizePage` → `pageSize`, `visibleNumberPages` → `visiblePages`, добавлен `classBase`.
  - корень стал реактивным (был нереактивный `ref(setStyle(...))`) — смена `class`/`mode` после mount теперь пересчитывается.
  - `pageSizes` из `componentsOptions` больше не сортируется на месте (frozen-снимок давал `TypeError`).
  - Ранее (2026-06-13): корневой DOM-узел `<div data-pagination>` → `<nav data-pagination>` (navigation landmark).
- **Deprecations:** нет — старые имена сняты без алиасов (решение R6).

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Pagination from "fishtvue/pagination/Pagination.vue"

describe("Pagination", () => {
  it("emits update:modelValue", async () => {
    const wrapper = mount(Pagination, {
      props: { modelValue: 1, total: 50, pageSize: 10 },
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
| Pagination отображает только одну страницу | `total` ≤ `pageSize`. | Передай реальный `total`. |
| Selector size не показывается | `pageSizeSelector: false`. | Установи `true`. |
| Number of pages не растёт | Проверь `visiblePages` (5–11). | Установи большее значение. |
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

- `pageSize?: number | 5 | 15 | 20 | 50 | 100 | 150` — open union с literal-вариантами; narrow не работает.
- `pageSizes?: [5,15,20,50,100,150] | Array<number>` — кортеж + open array; обычно используется как `Array<number>`.
- `visiblePages?: 5 | 6 | 7 | 8 | 9 | 10 | 11` — strict union (без `number` open) — единственное narrow-поле.
- `update:pageSize` payload — `PaginationProps["modelValue"]` (т.е. `number | undefined`) — но фактически всегда `number`. Type шире необходимого.
- ~~`PaginationExpose.isNavigationButtons` соответствует props `isHiddenNavigationButtons` — инвертировано без явной маркировки.~~ ✅ resolved (1.0.0): prop называется `navigationButtons` и имеет ту же полярность, что и expose.

### Behavioral caveats

- При смене `pageSize` — текущая `modelValue` не сбрасывается. Если новая `total / pageSize < modelValue` — может быть «несуществующая страница». Сбрасывай в parent через `@update:page-size`.
- `arrayPageSizes` формирует `{ key, value }` объекты для Select — кастомизация лимитирована (но сам Select теперь настраивается через `selectProps`).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

---
title: Table
summary: Полнофункциональная таблица: sort/filter/group/search/pagination, edit, summary, asyncData (4 режима).
updated: 2026-06-11
stability: stable
since: 0.2.11
---

# Table

## 1. Overview

`Table` — самый объёмный компонент библиотеки (~1900 LOC SFC + 1471 LOC `.d.ts`). Поддерживает: sort, filter, search, grouping, summary rows, inline edit (Input/Select/Calendar editors), 4 режима асинхронной загрузки данных (`true`-flag, URL string, config object, custom function), column resizing, кастомные cell templates, dynamic slots по `dataField`.

Stability: `stable` — 119 кейсов (66 базовых + 18 audit + 7 virtualization + 19 coverage + 5 motion/print/forced-colors + 4 RTL). Branch coverage `Table.vue` 80%+ / statements 92%+. Тесты покрывают core flow + security/a11y/virtualization/edit-cells/asyncData + reduced-motion/print/RTL.

Source: [Source](../../lib/table/Table.vue), [Table.d.ts](../../lib/table/Table.d.ts), [Table.test.ts](../../lib/table/Table.test.ts).

## 2. How it's organized

```
lib/table/
├── Table.vue            # SFC ~2200 строк
├── Table.d.ts           # типы Table + Column/ColumnGroup
├── Column.vue           # renderless descriptor (compound API, §10.6)
├── ColumnGroup.vue      # renderless descriptor (multi-level headers, §10.6)
├── index.ts             # runtime barrel: default Table + named Column/ColumnGroup
├── Table.test.ts        # 110 кейсов
├── Column.test.ts       # 14 кейсов (compound API)
└── package.json
```

Точечные импорты: `import Table from "fishtvue/table"`, `import { Column, ColumnGroup } from "fishtvue/table"`. В Nuxt — auto-import глобально (см. §10.6).

Зависимости:

- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md) — для filter и edit ячеек.
- [Pagination](./pagination.md) — нижний пейджер.
- [Component class](../architecture/component-class.md).
- [arrayHandler](../utilities/arrayHandler.md), [objectHandler](../utilities/objectHandler.md) — для sort/filter/get.
- [stringHandler](../utilities/stringHandler.md), [numberHandler](../utilities/numberHandler.md), [dateHandler](../utilities/dateHandler.md) — для типизированных filter editors.

Внешних UI-зависимостей нет (всё своё).

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили; `onMounted` запускает asyncData (если включено).
- **Поток данных:**
  1. `dataSource` (или результат asyncData) → `allData`.
  2. На client-side применяются: `filterColumns`, `sortColumns`, `queryTable`, `pageTable`/`sizeTable`. (При `asyncData: true` — отключено, обработка на стороне пользователя через events.)
  3. Результат — `resultData`-payload, эмитится events `result-data`.
  4. `dataSource` рендерится с поддержкой `IColumn[]` определения колонок (auto-detect если опущено или `true`).
- **AsyncData (4 режима):**
  - `true` — async-mode, client-side processing выключен; пользователь сам обрабатывает sort/filter/search/pagination через events и обновляет `dataSource`.
  - `string` — URL для одноразового fetch на mount. Все client-side фичи активны.
  - `IAsyncDataConfig` — `{ url, headers?, query? }` — то же, с доп. опциями fetch.
  - `(params: IAsyncDataParams) => Promise<IAsyncDataResult>` — function mode: callback вызывается на mount + при изменении filters/sort/search/pagination. Возвращает `{ dataSource, totalCount }`.
- **Virtualization:** большие client-side таблицы по умолчанию рендерят только видимое окно строк (auto при `> threshold`); выключается `:virtual="false"`. См. §10.5.
- **Стили:** через `Table.setStyle()` для контейнера; кастомизация — через `styles: ITableStyles`.
- **Конфиг:** `componentsOptions.Table` — см. §10.
- **Локализация:** `Table.t()` для default messages (`noData`, `noColumn`, `noDataForQuery`, `clearAllFilters`, `find`, `of`, `items`).
- **SSR:** SSR-safe в client-side mode; для asyncData function mode на сервере — нужен fallback `dataSource`.
- **Animation:** transitions на open/close edit; sort-icon rotate.

## 4. Quick Start

```vue
<script setup lang="ts">
  import { ref } from "vue"
  import Table from "fishtvue/table"

  const data = ref([
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 25 }
  ])
</script>

<template>
  <Table :data-source="data" />
</template>
```

Без `columns` — auto-detect из объекта первой строки.

## 5. Props

`TableProps` ([Table.d.ts:688–860](../../lib/table/Table.d.ts#L688-L860)):

| Prop                  | Type                                                                            | Default  | Description                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                | `StyleMode`                                                                     | —        | Визуальный режим.                                                                                                                                                |
| `dataSource`          | `MaybeRef<Array<any>>`                                                          | —        | Массив строк. Может быть ref или константой.                                                                                                                     |
| `toolbar`             | `MaybeRef<IToolbar \| boolean>`                                                 | —        | Конфиг toolbar или `true/false`.                                                                                                                                 |
| `edit`                | `boolean`                                                                       | `false`  | Inline-редактирование.                                                                                                                                           |
| `sort`                | `MaybeRef<ISort \| boolean>`                                                    | —        | Sort-конфиг.                                                                                                                                                     |
| `filter`              | `MaybeRef<IFilter \| boolean>`                                                  | —        | Filter-конфиг.                                                                                                                                                   |
| `grouping`            | `MaybeRef<IGrouping \| string>`                                                 | —        | Группировка по полю.                                                                                                                                             |
| `resizedColumns`      | `boolean`                                                                       | —        | Resize колонок.                                                                                                                                                  |
| `pagination`          | `MaybeRef<TablePagination \| boolean>`                                          | —        | Pagination-конфиг.                                                                                                                                               |
| `search`              | `boolean`                                                                       | —        | Поиск во всех колонках.                                                                                                                                          |
| `columns`             | `MaybeRef<boolean \| Array<IColumn>>`                                           | auto     | Конфиг колонок.                                                                                                                                                  |
| `summary`             | `MaybeRef<boolean \| Array<ISummary>>`                                          | —        | Summary rows (sum/min/max/avg/count).                                                                                                                            |
| `countVisibleRows`    | `number`                                                                        | —        | Лимит видимых строк.                                                                                                                                             |
| `sizeLoadingRows`     | `number`                                                                        | —        | Сколько skeleton-строк показывать.                                                                                                                               |
| `noData` / `noColumn` | `string`                                                                        | (locale) | Сообщения пустых состояний (рендерятся как текст; HTML — через slot `empty`/`empty-columns`).                                                                    |
| `caption`             | `string`                                                                        | —        | Accessible `<caption>` (sr-only) для screen reader. HTML — через slot `caption`.                                                                                 |
| `virtual`             | `boolean \| { rowHeight?, overscan?, threshold? }`                              | auto     | Виртуализация строк. `undefined` — auto при `> threshold` (client-side, без grouping/pagination); `false` — выключить; `true`/object — форс + config. См. §10.5. |
| `countDataOnLoading`  | `number`                                                                        | —        | Симулированное количество строк при loading.                                                                                                                     |
| `totalCount`          | `number`                                                                        | —        | Общий count для server-side pagination.                                                                                                                          |
| `asyncData`           | `true \| string \| IAsyncDataConfig \| ((params) => Promise<IAsyncDataResult>)` | —        | См. §3.                                                                                                                                                          |
| `class`               | `StyleClass`                                                                    | —        | Класс контейнера.                                                                                                                                                |
| `styles`              | `MaybeRef<ITableStyles>`                                                        | —        | Полный override стилей.                                                                                                                                          |

`IColumn` ([Table.d.ts:228–388](../../lib/table/Table.d.ts#L228-L388)) — большой объект на колонку: `dataField`, `name`, `caption`, `visible`, `width`/`minWidth`/`maxWidth`, `isFilter`, `isSort`, `isResized`, `defaultFilter`, `defaultSort`, `mask`, `cellTemplate`, `setCellValue`, `onClick`, `class.{th,colFilter,colText,td,cellText,tf,sumText}`, `type` (`string`/`number`/`select`/`date`), `paramsFilter` (для filter editor), `edit` (`boolean | EditInput | EditSelect | EditDate`).

## 6. Events / Emits + v-model contract

| Event                                  | Payload                                                       | When fired                    |
| -------------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| `sort`                                 | `{ dataColumns, sortedFields }`                               | На toggle sort.               |
| `filter`                               | `{ dataColumns, filteredFields }`                             | На filter input change.       |
| `search`                               | `Search` (string)                                             | На toolbar search.            |
| `result-data`                          | `ResultData`                                                  | После client-side processing. |
| `switch-page`                          | `Page`                                                        | При смене страницы.           |
| `switch-size-page`                     | `Page`                                                        | При смене page-size.          |
| `before-edit-cell` / `after-edit-cell` | `{ newValue, oldValue, _key, column }`                        | До/после inline-edit.         |
| `before-edit-row` / `after-edit-row`   | `{ newValue, oldValue, _key }`                                | Row-level edit.               |
| `add-row`                              | `{ value, index, _key }`                                      | При добавлении.               |
| `delete-row`                           | `{ value, index, _key }`                                      | При удалении.                 |
| `click-row`                            | `{ eventEl, data, indexRow }`                                 | На клик строки.               |
| `click-cell`                           | `{ eventEl, column, value, valueWithMarker, data, indexRow }` | На клик ячейки.               |
| `loading`                              | `boolean`                                                     | Loading on/off.               |
| `clear-filter`                         | —                                                             | На clear all.                 |

v-model contract — не применимо: Table не имеет одного `modelValue`.

## 7. Slots

| Slot            | Slot props                                                                   | Description                                                                                         |
| --------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `toolbar`       | —                                                                            | Override toolbar.                                                                                   |
| `header`        | —                                                                            | Слот выше table (под toolbar).                                                                      |
| `footer`        | —                                                                            | Слот ниже table (над pagination).                                                                   |
| `caption`       | —                                                                            | HTML-контент для `<caption>` (sr-only). Переопределяет prop `caption`.                              |
| `group`         | `{ item, length }`                                                           | Override row группы.                                                                                |
| `empty`         | —                                                                            | Override пустого состояния «нет данных» (`noData`).                                                 |
| `empty-columns` | —                                                                            | Override пустого состояния «нет колонок» (`noColumn`).                                              |
| `empty-filter`  | —                                                                            | Override пустого состояния «фильтр без результатов» (`noFilter`).                                   |
| `[dataField]`   | `{ key, column, rowData, value, valueWithMarker, isCloseEditor, editValue }` | Dynamic slot — кастомная отрисовка ячейки в колонке `dataField`. Имя slot'а = значение `dataField`. |

> Per-column slot'ы можно описывать и через compound `<Column>` (`#cell`/`#header`/`#filter`) — см. [§10.6 Compound API](#106-compound-api-column--columngroup).

Пример dynamic slot:

```vue
<Table :data-source="data">
  <template #status="{ value }">
    <span :class="value === 'active' ? 'text-green-600' : 'text-red-600'">
      {{ value }}
    </span>
  </template>
</Table>
```

## 8. Exposed methods

`TableExpose` ([Table.d.ts:1056–1480](../../lib/table/Table.d.ts#L1056-L1480)) — большой:

| Name                                                                                                                                                                                               | Description     |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `activeRow`, `sortColumns`, `filterColumns`, `widthsColumns`, `queryTable`, `pageTable`, `sizeTable`, `allData`, `isLoading`, `resizableColumn`                                                    | Reactive state. |
| Программные методы: `switchPage`, `switchSizePage`, `setQuery`, `clearFilter`, `addRow`, `deleteRow`, `editRow`, `editCell`, `setColumnWidth`, `reloadData()` (только для function-mode asyncData) | Управление.     |

См. полный список в [Table.d.ts:1056–1480](../../lib/table/Table.d.ts#L1056-L1480).

## 9. Examples

### 9.1 Базовый

```vue
<Table :data-source="rows" />
```

### 9.2 С filter/sort/search/pagination

```vue
<Table
  :data-source="rows"
  :columns="[
    { dataField: 'name', caption: 'Name', isSort: true, isFilter: true },
    { dataField: 'age', caption: 'Age', type: 'number', isSort: true }
  ]"
  :toolbar="{ visible: true, search: true }"
  :pagination="{ visible: true, sizePage: 20 }" />
```

### 9.3 AsyncData (function mode)

```vue
<script setup lang="ts">
  import Table from "fishtvue/table"
  import type { IAsyncDataParams, IAsyncDataResult } from "fishtvue/table"
  import { api } from "@/api"

  async function load(params: IAsyncDataParams): Promise<IAsyncDataResult> {
    const { dataSource, totalCount } = await api.users.list(params)
    return { dataSource, totalCount }
  }
</script>

<template>
  <Table :async-data="load" :pagination="{ visible: true, sizePage: 20 }" />
</template>
```

### 9.4 Edit с типизированными editors

```vue
<Table
  :data-source="users"
  :edit="true"
  :columns="[
    { dataField: 'name', edit: { editorOptions: { autoFocus: true } } },
    { dataField: 'role', type: 'select', edit: { editorOptions: { dataSelect: roles } } },
    { dataField: 'birthday', type: 'date', edit: true }
  ]"
  @after-edit-cell="(p) => api.update(p._key, { [p.column.dataField]: p.newValue })" />
```

## 10. Configuration & Customization

### 10.1 Global

`TableOption = Pick<TableProps, "mode" | "toolbar" | "edit" | "sort" | "filter" | "grouping" | "resizedColumns" | "pagination" | "search" | "countVisibleRows" | "sizeLoadingRows" | "noData" | "noColumn" | "countDataOnLoading" | "class" | "styles">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

- Цвета через `theme.semantic`.
- Custom borders: `styles.border` ([Table.d.ts:532–585](../../lib/table/Table.d.ts#L532-L585)).
- Custom classes per-section: `styles.class.{toolbar, table, thead, tbody, tfoot, group, pagination, ...}`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-table`. См. [01-getting-started §10.4](../01-getting-started.md#104-css-layer-override).

### 10.5 Virtualization

Большие client-side таблицы рендерят только видимое «окно» строк (+ overscan), а место остальных занимают spacer-`<tr>` — это держит DOM компактным и устраняет лаги scroll на тысячах строк.

- **Auto по умолчанию.** Включается автоматически, когда строк больше порога (`threshold`, default `100`) — только для client-side flat-режима: **не** применяется при `grouping`, активной `pagination`, `asyncData: true`/function.
- **Opt-out:** `:virtual="false"` — рендерить все строки (legacy).
- **Force + config:** `:virtual="true"` или `:virtual="{ rowHeight, overscan, threshold }"`.
  - `rowHeight` — фиксированная высота строки в px (default `heightCell + 9`). **Fixed-height**: multi-line содержимое клипается до `rowHeight`.
  - `overscan` — сколько строк дорисовывать сверху/снизу окна (default `6`).
  - `threshold` — порог auto-включения (default `100`).

```vue
<!-- auto: включится само на больших данных -->
<Table :data-source="rows" />
<!-- форс + фиксированная высота 40px -->
<Table :data-source="rows" :virtual="{ rowHeight: 40 }" />
<!-- выключить -->
<Table :data-source="rows" :virtual="false" />
```

ARIA: при активной виртуализации `<table>` получает `aria-rowcount` (полное число строк), а строки — `aria-rowindex` (абсолютный, 1-based). Виртуализация заменяет lazy-load через `countVisibleRows`/`lastRowVisibleObserver`.

**Limitations (v1):** virtual + `grouping`, dynamic (измеряемая) высота строк, и оптимизация edit-mode в окне — отдельным заходом. SSR рендерит первое окно от начала; client догоняет при hydration.

### 10.6 Compound API (`<Column>` / `<ColumnGroup>`)

Параллельно schema-driven `:columns` Table поддерживает **compound API** — колонки описываются декларативно дочерними компонентами. Это даёт co-location per-column slot'ов и HTML-IntelliSense (в отличие от `cellTemplate`-by-name). Механизм — VNode-walk default-slot'а (`<Column>`/`<ColumnGroup>` — renderless, своего DOM не рендерят; `<Table>` читает их props/slots и строит шапку/ячейки сам).

```vue
<script setup lang="ts">
  import { Table, Column, ColumnGroup } from "fishtvue/table"
  // В Nuxt компоненты auto-import'ятся глобально — импорт не нужен (как и Table).
</script>

<template>
  <Table :data-source="rows">
    <ColumnGroup caption="Личное">
      <Column data-field="name" caption="Имя" is-sort>
        <template #cell="{ rowData }"
          ><strong>{{ rowData.name }}</strong></template
        >
      </Column>
      <Column data-field="age" caption="Возраст" type="number" is-filter />
    </ColumnGroup>
    <Column data-field="email" caption="E-mail" />
    <!-- override встроенных Pagination/Loading -->
    <Pagination :sizes-selector="[10, 25, 50]" is-info-text />
    <Loading type="simple" />
  </Table>
</template>
```

**`<Column>`** ([Column.vue](../../lib/table/Column.vue)) — props идентичны элементу `IColumn` (`data-field`, `caption`, `is-sort`, `is-filter`, `is-resized`, `type`, `params-filter`, `edit`, `width`/`min-width`/`max-width`, `visible`, …). Scoped-slots:

| Slot     | Slot props                                                              | Описание                                                                            |
| -------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `cell`   | `{ rowData, value, valueWithMarker, column, isCloseEditor, editValue }` | Кастомная отрисовка ячейки (замена дефолтного safe-`<mark>`-рендера).               |
| `header` | `{ column }`                                                            | Кастомный заголовок (замена `caption`-текста).                                      |
| `filter` | `{ column }`                                                            | Кастомный фильтр (замена Input/Select/Calendar; рендерится только при `is-filter`). |

**`<ColumnGroup caption="…">`** ([ColumnGroup.vue](../../lib/table/ColumnGroup.vue)) — multi-level header: оборачивает несколько `<Column>` и рендерит над ними верхний ряд `<th scope="colgroup" :colspan>` с `caption`. Колонки вне групп получают пустой групповой `<th>` (span 1).

**`<Pagination>` / `<Loading>`-дети** — переопределяют конфиг встроенных пейджера/лоадера (props ребёнка мёржатся в конфигурацию; data-binding — total/page/события/isLoading — остаётся за Table).

**Precedence (backward compat):** если явно передан `:columns` (массив или `false`) — он **выигрывает**, `<Column>`-дети игнорируются. Аналогично явный `:pagination` бьёт `<Pagination>`-child. Так существующие schema-driven таблицы не ломаются.

**Registration:** `import { Column, ColumnGroup } from "fishtvue/table"` (Vite) либо глобально без импорта (Nuxt auto-import) — точно как `Table`.

## 11. Form integration & validation

Не применимо в стандартном смысле. Edit-mode принимает `editorOptions` для Input/Select/Calendar — туда можно передать `rules` для валидации значения ячейки.

## 12. Accessibility & Security

### A11y

- Семантика `<table>`/`<thead>`/`<tbody>`/`<tfoot>` нативная.
- `<caption>` (sr-only): prop `caption` или slot `#caption` — объявляет назначение таблицы screen reader'у.
- `<th scope="col">` на заголовках, `scope="colgroup"` на group-строках, `scope="col"` в tfoot — связь header↔column для SR.
- aria-live: sr-only `[data-table-aria-live]` (`aria-live="polite"`, `aria-atomic="true"`) озвучивает количество строк после filter/search/sort (локаль `table.resultsCount*`).
- При виртуализации (§10.5): `<table aria-rowcount>` (полное число строк) + строки `aria-rowindex` (абсолютный, 1-based) — screen reader корректно объявляет позицию в неполном DOM.
- `aria-sort` на колонках с sort'ом — проверь по DOM.
- Keyboard: Tab/Shift+Tab по интерактивным элементам; ArrowKeys для sort-икон не привязаны.
- Focus management в edit-mode: при открытии cell editor — focus автоматический.
- `prefers-reduced-motion`: все transitions завязаны на `motion-safe:` (канон FishtVue) — под `prefers-reduced-motion: reduce` анимации отключаются.
- Print (`@media print`): loading-overlay и resize-handle скрыты (`print:hidden`) — печатается чистая таблица без интерактивного chrome.
- Forced-colors (Windows high-contrast): active-row сохраняет выделение через `forced-colors:outline` (где OS подменяет background-цвета).
- RTL (`dir="rtl"`): resize-handle живёт на логическом trailing-крае (`pe-2` + `rtl:`-override inset), `resizeColumn` считает ширину от правого края под RTL; group-label sticky-offset/padding — логические (`start-*`/`ps-*`). Включается ambient-атрибутом `dir="rtl"` (на любом предке) — отдельный prop не нужен. Scroll-shadow в Table нет (`overflow-x-auto` уважает `dir` нативно).

### Security

- **Нет `v-html`.** Содержимое ячеек рендерится как текст; search-highlight — через `<mark>` + `<template v-for>` (`markerParts`), не через `v-html`. Summary, `noData`/`noColumn`/`noFilter` — тоже текст. Payload вида `<img src=x onerror=...>` не исполняется (см. [issues/table.md Issue 1](../issues/table.md)).
- Кастомный HTML — только через явные slot'ы (`#empty`, `#empty-columns`, `#empty-filter`, `#caption`, per-column slot). Ответственность за sanitization — на потребителе slot'а.
- `cellTemplate` рендерит подстановку через template-string (не v-html). Безопасно для plain text.
- `setCellValue` — пользовательский callback. Если возвращает HTML — он рендерится как текст (не исполняется); для HTML используй slot.
- `asyncData` URL/config — fetch на стороне клиента; не передавай credentials в URL.

## 13. TypeScript

```ts
import type {
  TableProps,
  TableEmits,
  TableSlots,
  TableExpose,
  IColumn,
  ISummary,
  ITableStyles,
  IAsyncDataParams,
  IAsyncDataResult,
  Sorted,
  Filters,
  Search,
  Page
} from "fishtvue/table"
import Table from "fishtvue/table"
import { useTemplateRef } from "vue"

const t = useTemplateRef<InstanceType<typeof Table>>("t")
t.value?.reloadData()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable`.
- **Breaking changes:** на 2026-05-09 не зафиксировано.
- **Deprecations:** нет.
- В commit `7393c9a` (`fix(table): repair asyncData tests and behavior`) были стабилизированы asyncData-тесты — учитывай при ревизии.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Table from "fishtvue/table/Table.vue"

describe("Table", () => {
  it("рендерит data", () => {
    const wrapper = mount(Table, {
      props: { dataSource: [{ id: 1, name: "A" }] },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.text()).toContain("A")
  })
})
```

Реальные тесты — [Table.test.ts](../../lib/table/Table.test.ts) (119 кейсов).

## 16. Troubleshooting / FAQ

| Проблема                                      | Причина                                                  | Решение                                                                 |
| --------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| Колонки не появляются                         | Не указаны `columns` и `dataSource[0]` пуст.             | Передай `columns` явно.                                                 |
| Sort/filter не работают при `asyncData: true` | По дизайну: client-side processing выключен.             | Подпишись на events `sort`/`filter`/`search` и обновляй dataSource сам. |
| `reloadData()` не работает                    | Метод доступен только при `asyncData` в function-режиме. | Используй function-mode.                                                |
| Custom slot per-column не рендерится          | Имя slot'а должно совпадать с `dataField`.               | Проверь spelling: `<template #fieldName>`.                              |
| `summary` показывает ошибку формата           | `displayFormat` ожидает `{0}` plaхolder.                 | Используй `"Sum: {0}"` или custom `customizeText`.                      |
| `edit` не активирует editor                   | `edit: true` нужно на TableProps **и** на column.        | Передай оба.                                                            |

## 17. Related

- [Pagination](./pagination.md) — встроенная.
- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md) — editors для ячеек.
- [Badge](./badge.md), [Loading](./loading.md), [Icons](./icons.md).
- [utilities/arrayHandler.md](../utilities/arrayHandler.md), [utilities/objectHandler.md](../utilities/objectHandler.md), [utilities/dateHandler.md](../utilities/dateHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Table.vue](../../lib/table/Table.vue) и [Table.d.ts](../../lib/table/Table.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Coverage: branch 80.01% / statements 92.57% ([Table.vue](../../lib/table/Table.vue)), цель >80% достигнута (см. [issues/table.md Issue 7 ✅](../issues/table.md)). Покрыты edit-cell editors, asyncData (4 режима), masks, summary/filter type-branches, loading-timeout, virtualization, security/a11y.
- `IColumnPrivate.isEdit: boolean` ([Table.d.ts:393](../../lib/table/Table.d.ts#L393)) — внутренний флаг, expose'ится через TableExpose.
- Virtualization (§10.5) — v1: только flat client-side (не grouping), **fixed** `rowHeight` (multi-line ячейки клипаются), edit-mode в окне работает, но не оптимизирован. Dynamic-height и virtual+grouping — отдельным заходом.

### Skipped tests

Нет.

### API inconsistencies

- `Filters = Record<DataField, any>` ([Table.d.ts:25](../../lib/table/Table.d.ts#L25)) — `any` в публичном типе.
- `IColumn.defaultFilter?: any` ([Table.d.ts:293](../../lib/table/Table.d.ts#L293)) — `any`.
- `IColumn.setCellValue(column, value: any, data?: any): any` — `any`-цепочка.
- `dataSource?: MaybeRef<Array<any> | []>` — `Array<any>` нивелирует TS-проверки на форму строк.
- `class.colFilterClass: StyleClass | "border-none font-normal"` — литерал среди свободных классов в нескольких полях `IColumn.class.*` — путаница.
- `TableOption` **не включает** `dataSource`, `columns`, `summary`, `asyncData`, `totalCount`, `countDataOnLoading` — глобальная конфигурация ограничена визуальными настройками.

### Behavioral caveats

- `MaybeRef` повсюду — `dataSource`, `toolbar`, `sort`, `filter`, `grouping`, `pagination`, `columns`, `summary`, `styles`. Может быть ref или константа. Type-system не отличит, какое поведение применяется в данный момент — потребитель должен помнить о реактивности.
- `asyncData: true` отключает client-side processing; большинство ивентов всё равно эмитится — пользователь должен обработать.
- `grouping` отключает pagination и sort на сгруппированных полях (поведение определено в реализации).
- `summary` суммирует только числовые поля; для типов `string`/`date` — count единственная разумная опция.
- При `pagination.startPage` — соглашение «1-indexed», не 0.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

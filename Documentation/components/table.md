---
title: Table
summary: Полнофункциональная таблица: sort/filter/group/search/pagination, edit, summary, asyncData (4 режима).
updated: 2026-09-14
stability: stable
since: 0.2.11
---

# Table

## 1. Overview

`Table` — самый объёмный компонент библиотеки (~1900 LOC SFC + 1471 LOC `.d.ts`). Поддерживает: sort, filter, search, grouping, summary rows, inline edit (Input/Select/Calendar editors), 4 режима асинхронной загрузки данных (`true`-flag, URL string, config object, custom function), column resizing, кастомные cell templates, dynamic slots по `dataField`.

Stability: `stable` — 122 кейса (66 базовых + 18 audit + 7 virtualization + 19 coverage + 5 motion/print/forced-colors + 4 RTL + 3 filter-popover). Branch coverage `Table.vue` 80%+ / statements 92%+. Тесты покрывают core flow + security/a11y/virtualization/edit-cells/asyncData + reduced-motion/print/RTL + floating filter-popovers.

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
  4. `dataSource` рендерится с поддержкой `TableColumn[]` определения колонок (auto-detect если опущено или `true`).
- **AsyncData (4 режима):**
  - `true` — async-mode, client-side processing выключен; пользователь сам обрабатывает sort/filter/search/pagination через events и обновляет `dataSource`.
  - `string` — URL для одноразового fetch на mount. Все client-side фичи активны.
  - `TableAsyncDataConfig` — `{ url, headers?, query? }` — то же, с доп. опциями fetch.
  - `(params: TableAsyncDataParams) => Promise<TableAsyncDataResult>` — function mode: callback вызывается на mount + при изменении filters/sort/search/pagination. Возвращает `{ dataSource, total }`.
- **Virtualization:** большие client-side таблицы по умолчанию рендерят только видимое окно строк (auto при `> threshold`); выключается `:virtual="false"`. См. §10.5.
- **Стили:** через `Table.resolveClasses<TableClassKey>(props)` — `cls(key, …)` для собственных элементов, `pick(key, default)` для aspect-ключей. Bag `styles` растворён: классы → `classes`, остальное → top-level props (§5).
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

`TableProps` ([Table.d.ts:519–744](../../lib/table/Table.d.ts#L519-L744)):

| Prop                  | Type                                                                            | Default  | Description                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mode`                | `StyleMode`                                                                     | —        | Визуальный режим.                                                                                                                                                |
| `dataSource`          | `MaybeRef<Array<any>>`                                                          | —        | Массив строк. Может быть ref или константой.                                                                                                                     |
| `toolbar`             | `MaybeRef<TableToolbar \| boolean>`                                             | —        | Конфиг toolbar или `true/false`.                                                                                                                                 |
| `editable`            | `boolean`                                                                       | `false`  | Inline-редактирование. Бывший `edit`.                                                                                                                            |
| `sort`                | `MaybeRef<TableSort \| boolean>`                                                | —        | Sort-конфиг.                                                                                                                                                     |
| `filter`              | `MaybeRef<TableFilter \| boolean>`                                              | —        | Filter-конфиг.                                                                                                                                                   |
| `grouping`            | `MaybeRef<TableGrouping \| string>`                                             | —        | Группировка по полю.                                                                                                                                             |
| `resizableColumns`    | `boolean`                                                                       | `false`  | Resize колонок. Бывший `resizedColumns`.                                                                                                                         |
| `pagination`          | `MaybeRef<TablePagination \| boolean>`                                          | —        | Pagination-конфиг.                                                                                                                                               |
| `searchable`          | `boolean`                                                                       | `false`  | Поиск во всех колонках. Бывший `search`.                                                                                                                          |
| `columns`             | `MaybeRef<boolean \| Array<TableColumn>>`                                       | auto     | Конфиг колонок.                                                                                                                                                  |
| `summary`             | `MaybeRef<boolean \| Array<TableSummary>>`                                      | —        | Summary rows (sum/min/max/avg/count).                                                                                                                            |
| `visibleRows`         | `number`                                                                        | `0`      | Лимит видимых строк. Бывший `countVisibleRows`.                                                                                                                   |
| `loadingRows`         | `number`                                                                        | `5`      | Сколько skeleton-строк показывать. Бывший `sizeLoadingRows`.                                                                                                      |
| `emptyText` / `emptyColumnsText` | `string`                                                             | (locale) | Сообщения пустых состояний (текст; HTML — через slot `empty`/`empty-columns`). Бывшие `noData`/`noColumn`.                                                        |
| `caption`             | `string`                                                                        | —        | Accessible `<caption>` (sr-only) для screen reader. HTML — через slot `caption`.                                                                                 |
| `virtual`             | `boolean \| { rowHeight?, overscan?, threshold? }`                              | auto     | Виртуализация строк. `undefined` — auto при `> threshold` (client-side, без grouping/pagination); `false` — выключить; `true`/object — форс + config. См. §10.5. |
| `loadingThreshold`    | `number`                                                                        | `1000`   | Симулированное количество строк при loading. Бывший `countDataOnLoading`.                                                                                         |
| `total`               | `number`                                                                        | —        | Общий count для server-side pagination. Бывший `totalCount`.                                                                                                      |
| `asyncData`           | `true \| string \| TableAsyncDataConfig \| ((params) => Promise<TableAsyncDataResult>)` | — | См. §3.                                                                                                                                              |
| `class`               | `StyleClass`                                                                    | —        | Классы **только корня** `[data-table]` (dev-patterns §2 A).                                                                                                       |
| `classes`             | `ClassesMap<TableClassKey>`                                                     | —        | Карта внутренних элементов и aspect-ключей. См. §5.1.                                                                                                             |
| `width` / `height`    | `TWidth` / `THeight`                                                            | —        | Размеры таблицы (число → px). Бывшие `styles.width`/`styles.height`.                                                                                              |
| `stripedRows`         | `boolean`                                                                       | `false`  | Чередующаяся заливка строк. Бывший `styles.isStripedRows`.                                                                                                        |
| `horizontalLines`     | `boolean`                                                                       | `true`   | Линии между строками. Бывший `styles.horizontalLines`.                                                                                                            |
| `verticalLines`       | `boolean`                                                                       | `false`  | Линии между колонками. Бывший `styles.verticalLines`.                                                                                                             |
| `filterLines`         | `boolean`                                                                       | `false`  | Линии вокруг строки фильтров. Бывший `styles.filterLines`.                                                                                                        |
| `cellHeight`          | `number`                                                                        | `50`     | Высота ячейки в px. Бывший `styles.heightCell`.                                                                                                                   |
| `borderRadius`        | `number`                                                                        | `7` / `0` при `underlined` | Радиус скругления. Бывший `styles.borderRadiusPx`.                                                                                              |
| `defaultColumnWidth`  | `string`                                                                        | `max-width: 600px;min-width:100px;width:auto` | Ширина колонки по умолчанию. Бывший `styles.defaultWidthColumn`.                                                            |

`TableColumn` ([Table.d.ts:242–371](../../lib/table/Table.d.ts#L242-L371)) — объект на колонку: `dataField`, `name`, `caption`, `visible`, `width`/`minWidth`/`maxWidth`, `filterable`, `sortable`, `resizable`, `defaultFilter`, `defaultSort`, `mask`, `cellTemplate`, `setCellValue`, `onClick`, `classes.{th,headerText,filter,td,cellText,summary,summaryText}`, `type` (`string`/`number`/`select`/`date`), `filterProps` (props фильтр-контрола), `editable` (`boolean | EditInput | EditSelect | EditDate`, внутри — `editorProps`).

### 5.1 Classes keys

`TableClassKey` ([Table.d.ts:470–498](../../lib/table/Table.d.ts#L470-L498)). Bag `styles` растворён: классы уехали сюда, остальное — в top-level props выше.

**Element-ключи** (аддитивные, склеиваются с базой через twMerge):

| Key | Element (`data-*`) | Было |
| --- | --- | --- |
| `root` | `[data-table]` | `styles.class.body` + `class` |
| `toolbar` | `[data-table-toolbar]` | `styles.class.toolbar` |
| `header` / `footer` | `[data-table-header]` / `[data-table-footer]` | `styles.class.slotHeader` / `slotFooter` |
| `body` | `[data-table-body]` | — (новый) |
| `viewport` | `[data-table-viewport]` | `styles.class.bodyTable` |
| `table` | `[data-table-element]` (`<table>`) | `styles.class.table` |
| `thead` / `tbody` / `tfoot` | одноимённые секции | `styles.class.thead` / `tbody` / `tfoot` |
| `th` | `[data-table-thead-col]` | — (новый) |
| `td` | `[data-table-tbody-td]` | `styles.class.cellText` (вопреки имени шёл на `<td>`) |
| `cell` | контент ячейки | — (новый) |
| `group` / `groupText` | строка группировки и её текст | `styles.class.group` / `groupText` |
| `pagination` | корень [Pagination](./pagination.md) | `styles.class.pagination` |

**Aspect-ключи** (заменяющие: `props ?? options ?? default`, `""` отключает):

| Key | Default | Было |
| --- | --- | --- |
| `mark` | `font-bold text-theme-700 dark:text-theme-400` | `styles.maskQuery` |
| `rowActive` | `bg-surface-100/90 dark:bg-surface-900/50` | `styles.activeRow` |
| `rowHover` | `hover:bg-surface-100/90 dark:hover:bg-surface-900/50` | `styles.hoverRows` |
| `animation` | `motion-safe:transition-all motion-safe:duration-500` | `styles.animation` |
| `border` | `border-surface-200 dark:border-surface-800` | `styles.border` (строка) / `styles.border.default` |
| `borderTable`, `borderHeader`, `borderFilter`, `borderHead`, `borderCell`, `borderSummary`, `borderPagination`, `borderFooter` | падают на `border` | `styles.border.{table,header,filter,head,cell,summary,pagination,footer}` |

Булевы `activeRow`/`hoverRows` больше не принимают `true` — вместо них передаётся сам класс (или дефолт остаётся, если ключ не задан).

## 6. Events / Emits + v-model contract

| Event                                  | Payload                                                       | When fired                    |
| -------------------------------------- | ------------------------------------------------------------- | ----------------------------- |
| `sort`                                 | `{ dataColumns, sortedFields }`                               | На toggle sort.               |
| `filter`                               | `{ dataColumns, filteredFields }`                             | На filter input change.       |
| `search`                               | `Search` (string)                                             | На toolbar search.            |
| `result-data`                          | `ResultData`                                                  | После client-side processing. |
| `switch-page`                          | `Page`                                                        | При смене страницы.           |
| `switch-page-size`                     | `Page`                                                        | При смене page-size. Бывший `switch-size-page` — **silent break**. |
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
    { dataField: 'name', caption: 'Name', sortable: true, filterable: true },
    { dataField: 'age', caption: 'Age', type: 'number', sortable: true }
  ]"
  :toolbar="{ visible: true, search: true }"
  :pagination="{ visible: true, sizePage: 20 }" />
```

### 9.3 AsyncData (function mode)

```vue
<script setup lang="ts">
  import Table from "fishtvue/table"
  import type { TableAsyncDataParams, TableAsyncDataResult } from "fishtvue/table"
  import { api } from "@/api"

  async function load(params: TableAsyncDataParams): Promise<TableAsyncDataResult> {
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
    { dataField: 'name', editable: { editorProps: { autoFocus: true } } },
    { dataField: 'role', type: 'select', editable: { editorProps: { options: roles } } },
    { dataField: 'birthday', type: 'date', edit: true }
  ]"
  @after-edit-cell="(p) => api.update(p._key, { [p.column.dataField]: p.newValue })" />
```

> **Floating popovers (filter + editor).** Dropdown'ы `type: "select"`/`"date"` (и в фильтре, и в cell-editor) плавают через `FixWindow` (собственный dependency-free движок позиционирования — flip/shift). Таблица передаёт им `fixWindowProps.scrollableEl = tableBody`, поэтому popover трекает скролл-контейнер (`absolute`-стратегия) и не «отрывается» при прокрутке. Переопределить позицию/teleport на колонку: `filterProps: { fixWindowProps: { position, teleport } }` (фильтр) или `editable.editorProps.fixWindowProps` (редактор) — override выигрывает над дефолтом.

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

**`<Column>`** ([Column.vue](../../lib/table/Column.vue)) — props идентичны элементу `TableColumn` (`data-field`, `caption`, `sortable`, `filterable`, `resizable`, `type`, `filter-props`, `editable`, `width`/`min-width`/`max-width`, `visible`, …). Scoped-slots:

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

Не применимо в стандартном смысле. Edit-mode принимает `editorProps` для Input/Select/Calendar — туда можно передать `rules` для валидации значения ячейки.

## 12. Accessibility & Security

### A11y

- Семантика `<table>`/`<thead>`/`<tbody>`/`<tfoot>` нативная.
- `<caption>` (sr-only): prop `caption` или slot `#caption` — объявляет назначение таблицы screen reader'у.
- `<th scope="col">` на заголовках, `scope="colgroup"` на group-строках, `scope="col"` в tfoot — связь header↔column для SR.
- aria-live: sr-only `[data-table-aria-live]` (`aria-live="polite"`, `aria-atomic="true"`) озвучивает количество строк после filter/search/sort через единый pluralized-ключ `Table.t("table.resultsCount", { count })` (Wave 3.5: CLDR-формы активной локали, `Intl.PluralRules`; `resultsCountOne`/`resultsCountNone` — `@deprecated`).
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
  TableColumn,
  TableSummary,
  TableClassKey,
  TableAsyncDataParams,
  TableAsyncDataResult,
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
- **Stability flag:** `stable` — 179 кейсов (`Table.test.ts` + `Column.test.ts`).
- **Breaking changes (1.0.0, редизайн props):**
  - bag `styles` снят целиком: классы → `classes` (см. §5.1), остальное → top-level props
    (`width`, `height`, `stripedRows`, `horizontalLines`, `verticalLines`, `filterLines`,
    `cellHeight`, `borderRadius`, `defaultColumnWidth`). Типы `ITableStyles`, `ITableStylesClass`,
    `ITableStylesBorder` и `type border` удалены.
  - `class` теперь адресует **только** корень `[data-table]`.
  - булевы: `edit` → `editable`, `search` → `searchable` (в том числе `TableToolbar.search`),
    `resizedColumns` → `resizableColumns`; Column `isFilter`/`isSort`/`isResized` →
    `filterable`/`sortable`/`resizable`; `EditorCell.isEdit` → `editable`;
    `TableFilter.isClearAllFilter` → `clearAll`.
  - имена: `totalCount` → `total` (и в `TableAsyncDataResult`), `countVisibleRows` → `visibleRows`,
    `sizeLoadingRows` → `loadingRows`, `countDataOnLoading` → `loadingThreshold`,
    `noData`/`noColumn` → `emptyText`/`emptyColumnsText`, `TableFilter.noFilter` → `emptyFilterText`.
  - Column: вложенный `class`-объект → `classes` (`th`, `headerText`, `filter`, `td`, `cellText`,
    `summary`, `summaryText`); `colFilterClass` → `filterProps.classes.base`, `colFilterClassBody`
    → `filterProps.class`; `paramsFilter` → `filterProps`, `editorOptions` → `editorProps`.
  - событие `switch-size-page` → `switch-page-size` — **silent break**: старые обработчики
    перестают вызываться.
  - типы: `IColumn(Private)`, `ISummary(Private)`, `IToolbar`, `ISort`, `IFilter`, `IGrouping`,
    `IAsyncData*` → `Table*`.
  - DOM: корень `data-table-component` → `data-table`; `<table>` получил `data-table-element`;
    `data-table-scroll` → `data-table-viewport`; маркеры `data-table-header`/`-footer` переехали
    на визуальные полосы слотов (внешние обёртки их больше не несут).
  - expose: `styles` → `settings` (только не-классовые настройки), `classMaskQuery` → `classMark`,
    `switchSizePage` → `switchPageSize`, `sizePage` → `pageSize`,
    `isHiddenNavigationButtons` → `isNavigationButtons`.
- **Deprecations:** нет — старые имена сняты без алиасов (решение R6).
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

Реальные тесты — [Table.test.ts](../../lib/table/Table.test.ts) (122 кейса).

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
- `TableColumnPrivate.hasEditor: boolean` — внутренний резолвленный гейт «у ячеек есть редактор»; сам `editable` несёт конфиг.
- Virtualization (§10.5) — v1: только flat client-side (не grouping), **fixed** `rowHeight` (multi-line ячейки клипаются), edit-mode в окне работает, но не оптимизирован. Dynamic-height и virtual+grouping — отдельным заходом.

### Skipped tests

Нет.

### API inconsistencies

- `Filters = Record<DataField, any>` ([Table.d.ts:25](../../lib/table/Table.d.ts#L25)) — `any` в публичном типе.
- `TableColumn.defaultFilter?: any` ([Table.d.ts:293](../../lib/table/Table.d.ts#L293)) — `any`.
- `TableColumn.setCellValue(column, value: any, data?: any): any` — `any`-цепочка.
- `dataSource?: MaybeRef<Array<any> | []>` — `Array<any>` нивелирует TS-проверки на форму строк.
- ~~`class.colFilterClass` — литерал среди свободных классов в полях `IColumn.class.*`.~~ ✅ resolved (1.0.0): карта колонки — `classes.{th,headerText,filter,td,cellText,summary,summaryText}`, а классы самого фильтр-контрола переехали внутрь `filterProps` (`classes.base` / `class`).
- `TableOption` **не включает** `dataSource`, `columns`, `summary`, `asyncData`, `totalCount`, `countDataOnLoading` — глобальная конфигурация ограничена визуальными настройками.

### Behavioral caveats

- `MaybeRef` повсюду — `dataSource`, `toolbar`, `sort`, `filter`, `grouping`, `pagination`, `columns`, `summary`, `styles`. Может быть ref или константа. Type-system не отличит, какое поведение применяется в данный момент — потребитель должен помнить о реактивности.
- `asyncData: true` отключает client-side processing; большинство ивентов всё равно эмитится — пользователь должен обработать.
- `grouping` отключает pagination и sort на сгруппированных полях (поведение определено в реализации).
- `summary` суммирует только числовые поля; для типов `string`/`date` — count единственная разумная опция.
- При `pagination.startPage` — соглашение «1-indexed», не 0.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

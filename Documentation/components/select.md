---
title: Select
summary: Single/multiple select с фильтрацией (Intl.Collator), schema (`options`) + compound API (<SelectItem>/<SelectGroup>), виртуализацией списка опций, RTL (logical props), keyboard nav (Arrow/Home/End/typeahead), slot'ами values/item/marker/empty. С 1.0.0: `class` — корень `[data-select]`, внутренние элементы — карта `classes` (`control`/`list`/`option`/aspect `mark`), `searchable`/`emptyText`/`badgeCloseButton`/`fixWindowProps`.
updated: 2026-09-14
stability: stable
since: 0.2.11
---

# Select

## 1. Overview

`Select` — выпадающий список одиночного или multiple-выбора. Поддерживает кастомные ключи `keySelect`/`valueSelect` для произвольной формы данных, поиск по списку (`searchable`), `badgeCloseButton` для multiple через [Badge](./badge.md), позиционирование через `fixWindowProps`. Реализует v-model contract FishtVue.

Stability: `stable` (88 кейсов; coverage `Select.vue` 81.81%).

Source: [Source](../../lib/select/Select.vue), [Select.d.ts](../../lib/select/Select.d.ts), [Select.test.ts](../../lib/select/Select.test.ts).

## 2. How it's organized

```
lib/select/
├── Select.vue
├── SelectItem.vue     # renderless compound-дитя (Issue 3; до 1.0.0 — SelectOption.vue)
├── SelectGroup.vue    # renderless compound-дитя (Issue 3)
├── index.ts           # runtime barrel (default Select + named SelectItem/SelectGroup)
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
- **Поток данных:** `options` (`MaybeRef<Array<BaseDataItem>>`, читается через `toValue`) + `keySelect`/`valueSelect` → reactive `dataList` → user query фильтрует через `Intl.Collator(locale, { sensitivity: "base" })` (diacritic + case insensitive) → emit'ы.
- **v-model contract:** стандартный, см. §6.
- **Стили:** `Select.setStyle()` в computed. При `app.use(FishtVue, { unstyled: true })` все стили отключены (см. [Component class](../architecture/component-class.md)).
- **Конфиг:** `componentsOptions.Select` + global `componentsStyle` fallback chain (`props ?? options ?? Select.componentsStyle() ?? "outlined"`) — см. §10.
- **Локализация:** `emptyText` prop — сообщение, когда массив пуст. Live-region для filtered results count берёт один pluralized-ключ `select.resultsCount` через `Select.t("select.resultsCount", { count })` (Wave 3.5: CLDR-формы активной локали, `Intl.PluralRules`; `=0`/`one`/`other` для en, 4 формы для ru). Старые `resultsCountOne` / `resultsCountNone` — `@deprecated` (формы кодируются в `resultsCount`).
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
    :options="countries"
    label="Country"
    placeholder="Select..." />
</template>
```

## 5. Props

`SelectProps extends Omit<InputLayoutProps, "value" | "hasValue" | "classes">, Partial<BaseSelectProps>` ([Select.d.ts:103-124](../../lib/select/Select.d.ts#L103-L124)).

`BaseSelectProps` ([Select.d.ts:36-98](../../lib/select/Select.d.ts#L36-L98)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `MaybeRef<Array<BaseDataItem>>` | — | Источник данных (бывший `dataSelect`). `BaseDataItem = string \| number \| SelectDataItem`. Выигрывает над compound `<SelectItem>`. |
| `autoFocus` | `boolean` | `false` | Фокус на mount. |
| `keySelect` | `string` | `"id"` | Поле-идентификатор. |
| `valueSelect` | `string` | `"value"` | Поле для отображения. |
| `multiple` | `boolean` | `false` | Multiple selection. |
| `maxVisible` | `number` | — | Макс отображаемых badges в multiple. |
| `badgeCloseButton` | `BadgeProps["closeButton"]` | `false` | `×`-кнопка на каждом badge (бывший `closeButtonBadge`). |
| `emptyText` | `string` | (locale) | Текст при пустом списке (бывший `noData`). |
| `searchable` | `boolean` | `true` | Поиск по списку. `false` — чистый listbox с first-char typeahead (инверсия бывшего `noQuery`). |
| `fixWindowProps` | `Omit<FixWindowProps, "modelValue">` | (позиция `bottom-left`) | Конфиг позиционирования дропдауна (бывший `paramsFixWindow`). |

Свои поля Select:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | — | id триггера. |
| `modelValue` | `number \| string \| {} \| null \| Array<...>` | — | Single — id; multiple — массив id. |
| `class` | `StyleClass` | — | Классы корня (он же корень `InputLayout`, `[data-select]`). |
| `classes` | `ClassesMap<SelectClassKey>` | — | Карта классов внутренних элементов — см. §5.2. |

### 5.2 Classes keys

`SelectClassKey = InputLayoutClassKey | "control" | "list" | "option" | "mark"` ([Select.d.ts:31](../../lib/select/Select.d.ts#L31)).

| Key | Element (`data-*`) | Kind | Default |
| --- | --- | --- | --- |
| `root` | `[data-select]` (корень layout'а) | element | `relative rounded-md` + фон режима |
| `base` | `[data-input-layout-base]` | element | рамка поля + `cursor-pointer` + focus-ring |
| `control` | `[data-select-control]` (`role="combobox"`) | element | `w-46 min-h-[36px] … flex overflow-auto cursor-pointer` (бывший `classSelect`) |
| `list` | `[data-select-list]` | element | `min-w-[10rem] mt-1 max-h-60 …` + mode (бывший `classSelectList`) |
| `option` | `[data-select-list-item]` | element | `text-surface-900 … h-9 mt-2 mx-2 ps-8 pe-4` + hover/focus |
| `label` / `help` / `message` / `before` / `after` | см. [InputLayout §5.1](./input-layout.md) | element | — |
| `mark` | `<mark>` внутри опции | **aspect** | `font-bold text-theme-700 dark:text-theme-300` (бывший `classMaskQuery`; `""` отключает подсветку) |
| `animation` | корень + `base` | **aspect** | `motion-safe:transition-all motion-safe:duration-550` |

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `update:modelValue` | `(selectValue, selectItem?: Array<any>)` | На каждом select. `selectItem` — полный объект из `options` (для удобства). |
| `change:modelValue` | то же | На закрытии дропдауна (`closeSelect`) — момент «выбор завершён». |
| `update:invalid` | `boolean` (всегда `false`) | Выбор значения — reset-сигнал (`v-model:invalid`). |
| `active` | `boolean` | Открытие/закрытие списка (бывший `isActive`). |

**v-model contract** (form-control): стандартный `v-model` идёт через `update:modelValue` —
на каждый выбор; парный `change:modelValue` — «значение устоялось», у Select это закрытие
списка, а не blur. В multiple-режиме поэтому приходит один `change:` на всю серию кликов.
`update:modelValue` подписывай для realtime, `change:modelValue` — для тяжёлых side-effect'ов
(server sync). Валидность — отдельный канал `v-model:invalid`.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Альтернатива стандартному отображению. |
| `before` | — | Контент слева. |
| `after` | — | Контент справа. |
| `values` | `{ selected, key?, deleteSelect? }` | Кастомное отображение выбранных значений (single или multiple). |
| `item` | `{ item, key, isQuery }` | Кастомный rendering каждого элемента списка (включает корневой DOM `<li>`). |
| `marker` | `{ item, query, isQuery, valueKey }` | Кастомный рендер подсветки совпадения query внутри значения. По умолчанию рендерит `<mark>`-теги через text-interpolation (без `v-html`); класс `<mark>` — aspect-ключ `classes.mark`. См. §12 Security. |
| `empty` | `{ emptyText, query, hasData }` | Кастомный рендер «нет данных». По умолчанию — text-node с `emptyText`. `hasData=true` означает: `options` не пустой, но фильтр без совпадений; `hasData=false` — `options` пустой изначально. |

## 8. Exposed methods

`SelectExpose`:

| Name | Description |
|---|---|
| `layout`, `selectListWindow`, `selectBody`, `selectList`, `selectSearch`, `selectItems`, `activeItem`, `query`, `isOpenList`, `inputLayout`, `value` | Reactive state (`inputLayout` — итоговый hand-off в `InputLayout`, заменил `classLayout`). |
| `visibleValue`, `valueKeys`, `keySelect`, `valueSelect`, `dataSelect`, `autoFocus`, `mode`, `isDisabled`, `isLoading`, `isInvalid`, `isClearable`, `messageInvalid`, `isValue`, `isMultiple`, `maxVisible`, `emptyText`, `isSearchable`, `classMark`, `dataList`, `fixWindowProps`, `classControl`, `classList` | Derived computed. |
| `focusSelect(isFocus)` | Программный focus. |
| `openSelect()` / `closeSelect(event)` | Open/close. |
| `select(selectValue \| null)` | Программный выбор. |

## 9. Examples

### 9.1 Single select

```vue
<Select v-model="city" :options="cities" label="City" />
```

### 9.2 Multiple с custom badge close

```vue
<Select
  v-model="tags"
  :options="tagOptions"
  :multiple="true"
  :badge-close-button="{ icon: 'x-mark', color: 'destructive' }"
  :max-visible="3"
  label="Tags" />
```

### 9.3 Custom rendering

```vue
<Select v-model="user" :options="users" key-select="userId" value-select="email">
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
    :options="store.users"
    label="User"
    @change:model-value="(v) => store.persist({ assignee: v })" />
</template>
```

### 9.5 Compound API (`<SelectItem>` / `<SelectGroup>`)

Параллельно schema-driven `:options` поддерживается декларативный compound-API (canon: VNode-walk
`slots.default()`, зеркало `<Form><FormField>` / `<Table><Column>`). Если заданы **и** `:options`,
**и** дети — **schema выигрывает** (backward compat).

```vue
<Select v-model="x">
  <SelectItem value="a">Apple</SelectItem>
  <SelectItem value="b" disabled>Banana (locked)</SelectItem>
  <SelectGroup title="Citrus">
    <SelectItem value="c" label="Orange" />
    <SelectItem value="d">Lemon</SelectItem>
  </SelectGroup>
</Select>
```

- `<SelectItem>` props (`SelectItemProps`, [Select.d.ts:436-454](../../lib/select/Select.d.ts#L436-L454)): `value` (required — становится `modelValue` при выборе и identity-ключом),
  `label?` (display-текст; перекрывает текст default-slot), `disabled?` (не выбирается, `aria-disabled`).
  Текст опции берётся из `label` → текста default-slot → `String(value)`.
- `<SelectGroup>` props (`SelectGroupProps`): `title` (required) — рендерит non-selectable header-строку
  (`[data-select-group]`, `role="presentation"`) над вложенными `<SelectItem>`. Пустой `title` — header
  не рендерится, группировка опций сохраняется. С 1.0.0 это единственный prop заголовка: прежняя пара
  `label` + алиас `title` схлопнута в `title` (зеркало `FormSectionProps.title` / `MenuGroupData.title`),
  иначе `label` читался двусмысленно рядом с `SelectItemProps.label`.
- `value` сохраняет тип: `<SelectItem :value="42">` → `modelValue === 42` (number).
- В Nuxt оба компонента авто-импортируются; для explicit-import — `import { SelectItem, SelectGroup } from "fishtvue/select"`.
- Ограничение: rich per-option контент (иконки и т.п.) compound-API не рендерит — для этого используй
  scoped slot `#item` или schema-driven `:options` с `#item`.

См. [Select.vue](../../lib/select/Select.vue) (helpers `compoundParsed`/`renderRows`),
[SelectItem.vue](../../lib/select/SelectItem.vue), [SelectGroup.vue](../../lib/select/SelectGroup.vue).

## 10. Configuration & Customization

### 10.1 Global

`SelectOption = Pick<SelectProps, "autoFocus" | "multiple" | "maxVisible" | "badgeCloseButton" | "emptyText" | "searchable" | "fixWindowProps" | "class" | "classes" | keyof InputLayoutOption>` ([Select.d.ts:410-422](../../lib/select/Select.d.ts#L410-L422)).

Имя options-типа `SelectOption` осталось прежним (конвенция `XOption` для `componentsOptions`) — это и есть причина, по которой renderless-компонент переименован в `SelectItem` (решение 8 редизайна props 1.0).

```ts
app.use(FishtVue, {
  componentsOptions: {
    Select: {
      searchable: false,
      badgeCloseButton: true,
      classes: { control: "justify-end", list: "min-w-[12rem]", mark: "underline" }
    }
  }
})
```

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
- `invalid` отображается через [InputLayout](./input-layout.md) (`v-model:invalid` — двусторонний канал).
- При reset формы — установить `modelValue: null` (single) или `[]` (multiple).

## 12. Accessibility & Security

### A11y

- **Trigger:** `<div data-select role="combobox">` с `:aria-expanded` (реактивен по `isOpenList`) и `:aria-labelledby`, указывающим на id `<Label>` (Wave 4, 2026-06-19) — screen reader озвучивает метку и состояние раскрытия. Связка id↔label обеспечивается [InputLayout](./input-layout.md) (single source, `useId()`); явный `id` prop выигрывает. См. [inputlayout.md Issue 10](../issues/inputlayout.md).
- **Listbox (2026-09-06):** `<ul data-select-list-items role="listbox">` с `aria-multiselectable` в multiple-режиме; каждая опция — `role="option"` + `aria-selected`. До этого захода ролей у списка не было вовсе, и связка combobox → listbox держалась только на визуальной вложенности.
- **`aria-setsize` / `aria-posinset` на каждой опции** — обязательны из-за виртуализации (§3.1): в DOM лежит только окно, и без них скринридер объявил бы его размер вместо реальной длины списка. `aria-posinset` — абсолютная позиция в `dataList`, а не позиция в окне.
- Полная APG-обвязка combobox (`aria-controls`, `aria-activedescendant`) пока не реализована — см. Known issues.
- Keyboard (Wave 4.3, 2026-06-20): **ArrowDown/Up** — навигация по опциям (roving tabindex), **Enter** — выбор, **Escape** — закрытие, **Home/End** — прыжок к первой/последней опции, **first-char typeahead** — печать буквы фокусирует первую опцию, начинающуюся с неё; повтор той же буквы (в пределах 500 мс) циклически перебирает совпадения. В режиме с поиском (default) печать символа фокусит search-поле → фильтрация работает как typeahead; чистый listbox (`searchable: false`) использует встроенный first-char typeahead. Когда фокус в search-поле, Home/End сохраняют нативное поведение курсора.
- Focus management: при открытии — focus на input query, при закрытии — на trigger.
- **Live-region**: hidden `<div data-select-aria-live aria-live="polite" aria-atomic="true">` объявляет количество отфильтрованных результатов при печати в search-поле. Скриноридер озвучивает `Results: N` / `1 result` / `No results` (en) — локализовано и плюрализовано через единый ключ `Select.t("select.resultsCount", { count })` (Wave 3.5).
- `motion-safe:` префикс на Tailwind-переходах respects `prefers-reduced-motion: reduce` пользовательских настроек. **GSAP-анимация раскрытия списка** не учитывает это media-query — см. Known issues.

### Security

- **XSS guard by default**: `emptyText` prop и подсветка совпадения никогда не рендерятся через `v-html` — только через text-interpolation. Substring highlighting реализован через VNode-структуру `<mark>`-тегов, не через string concatenation HTML.
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
- **Stability flag:** `stable` — 88 кейсов (включая XSS-guard, memory-leak cleanup, Intl.Collator, aria-live, unstyled, componentsStyle fallback, блок props 1.0), coverage 79.65% statements / 67.55% branch.
- **Breaking changes (1.0.0, редизайн props):**
  - `dataSelect` → `options`, `noData` → `emptyText`, `closeButtonBadge` → `badgeCloseButton`, `paramsFixWindow` → `fixWindowProps`.
  - `noQuery: true` → `searchable: false` (инверсия смысла, default `searchable: true`).
  - `classSelect` → `classes.control`, `classSelectList` → `classes.list`, `classMaskQuery` → `classes.mark`; `classBody` → `class`, прежний `class` → `classes.base`.
  - компонент `<SelectOption>` → `<SelectItem>` (`SelectItemProps`/`SelectItemSlots`); options-тип `SelectOption` не тронут.
  - `<SelectGroup>`: пара `label` (required) + алиас `title` схлопнута в один `title` (required).
  - тип `IDataItem` → `SelectDataItem`.
  - emits: `update:isInvalid` → `update:invalid`, `isActive` → `active` (silent break).
  - `data-select` теперь на корне; триггер-combobox — `[data-select-control]`.
- **Deprecations:** нет — старые имена сняты без алиасов (решение R6/R7).

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Select from "fishtvue/select/Select.vue"

describe("Select", () => {
  it("renders options items", () => {
    const wrapper = mount(Select, {
      props: { options: [{ id: 1, value: "A" }, { id: 2, value: "B" }] },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Select.test.ts](../../lib/select/Select.test.ts) (88 кейсов: базовые, audit-fix набор, compound-API, RTL, keyboard, B10-токены и блок «props 1.0») + [SelectVirtual.test.ts](../../lib/select/SelectVirtual.test.ts).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| `options` items не отображаются | `keySelect`/`valueSelect` не совпадают с реальной формой объектов. | Передай корректные ключи. |
| Фильтр не работает | `searchable: false` отключает поиск. | Установи `searchable` (или не передавай его — default `true`). |
| `update:modelValue` payload — массив, ожидал id | `multiple: true` → массив. | Используй `multiple: false` или обработай массив. |
| Список открывается мимо trigger | `fixWindowProps.position` некорректен. | Передай `fixWindowProps: { position: "bottom-left" }`. |
| Badge `×` не удаляет | `badgeCloseButton` не задан. | Передай `badge-close-button` (boolean или конфиг). |
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
- ~~**Виртуализация dropdown** не реализована — при `options.length > 500` рендер всех items в DOM ощутимо лагает. Roadmap: Wave 7 (`@tanstack/vue-virtual`)~~ ✅ resolved 2026-09-06 — реализована на собственном `useVirtualScroll`, без `@tanstack/vue-virtual` и любых других внешних пакетов. См. [§3.1](#31-виртуализация-списка-опций) и [issues/select.md Issue 7](../issues/select.md).
- **Полная APG-обвязка combobox не реализована.** Список получил `role="listbox"` и `role="option"` (2026-09-06), но `aria-controls` с trigger'а на список и `aria-activedescendant` вместо roving tabindex — нет. Навигация работает через реальный фокус на опции, что для скринридеров корректно, но отличается от эталонного APG-паттерна.
- ~~**Compound `<Select><SelectItem>` API** отсутствует — только schema-driven~~ ✅ resolved 2026-06-13 — реализовано через VNode-walk, см. [§9.5](#95-compound-api-selectoption--selectgroup) выше и [issues/select.md Issue 3](../issues/select.md). Строка противоречила собственному §9.5 этого же документа; исправлено doc-sync'ом 2026-09-05.
- **Ограничение compound-API:** rich per-option контент (иконки, сложная разметка) через `<SelectItem>` не рендерится — используй `#item`-слот или schema-driven `:options`.

### Skipped tests

Нет.

### API inconsistencies

- `BaseDataItem` слабо типизирован — `string | number | SelectDataItem` (где `SelectDataItem` — open объект) ([Select.d.ts:17-20](../../lib/select/Select.d.ts#L17-L20)).
- `modelValue` в multiple-режиме — `Array<number | string | null>`. `null` в массиве — странность.
- `classSelect: StyleClass | "justify-end"` — литерал `"justify-end"` среди свободных классов — странный narrow.
- Slot `values` payload `{ selected, key?, deleteSelect? }` — все три опциональны, что усложняет типизацию.
- Нет событий `focus` / `blur` — они есть только у [Input](./input.md) и [Textarea](./textarea.md). Асимметрия осознанная: major 1.0.0 переименовывал события, но новых не добавлял (dev-patterns §7). Фокус-состояние доступно через `active`.

### Behavioral caveats

- При смене `options` с открытым списком — query не сбрасывается; selection может стать невалидным.
- `multiple` + `modelValue: null` → отображается как пустой массив. Передавай `[]`, не `null`.
- **GSAP-анимация** открытия списка не отключается через `prefers-reduced-motion` (Tailwind transitions — уже да). Override через CSS `[data-select-list] * { transition: none !important; }`. Полная интеграция — Wave 10.1 follow-up.
- **GSAP — optional peer (Wave 2.1).** `gsap` больше не runtime-dependency; грузится lazy (`await import("gsap")`, кэшируется при первой анимации). Без установленного `gsap` список открывается/закрывается мгновенно (без анимации), но функционально полностью рабочий — анимация деградирует gracefully. Установка плавности: `pnpm add gsap`.
- При `searchable: false` search-input **не рендерится** (`v-if="isSearchable"`) — компонент работает как чистый listbox; навигация по опциям доступна через ArrowDown/Up, Home/End и first-char typeahead (Wave 4.3).
- **RTL** (`<html dir="rtl">`): поддержан через логические Tailwind-классы (`ps-`/`pe-`/`start-`/`me-`/`ms-[...]` + `rtl:text-right`) — авто-флип отступов, check-иконки и dropdown-оффсета (Issue 9 / F31, resolved 2026-06-13).
- **Виртуализация не работает со сгруппированными списками** (`<SelectGroup>`) — намеренно, см. [§3.1](#31-виртуализация-списка-опций). Сгруппированный список из тысяч опций отрендерится целиком и будет тормозить так же, как до 2026-09-06. Обходной путь — плоский `:options` с сортировкой вместо групп.
- **Модель окна — fixed-size (44 px).** Кастомный `#item`-слот с высотой, отличной от штатной, на длинном списке даст рассинхрон spacer'ов и позиции скролла. Для нестандартной высоты строк используй списки короче порога либо собственную обёртку над [VirtualScroller](./virtualscroller.md).
- **Смена набора опций сбрасывает позицию скролла в начало.** Ввод в поле поиска меняет длину `dataList`, окно пересчитывается от нуля — это осознанный выбор: сохранять офсет между разными наборами данных бессмысленно.
- **`IDataItem.marker` deprecated** (2026-05-11): передача поля игнорируется + `console.warn`. Используй `#marker` scoped slot.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

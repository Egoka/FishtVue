---
title: Select
summary: Single/multiple select с фильтрацией (Intl.Collator), кастомным dataSelect, slot'ами values/item/marker/empty.
updated: 2026-05-11
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
├── Select.d.ts        # 410 строк
├── Select.test.ts     # 11 кейсов
└── package.json
```

Зависимости:
- [InputLayout](./input-layout.md), [Badge](./badge.md), [FixWindow](./fix-window.md).
- [Component class](../architecture/component-class.md).
- `lodash-es` (debounce, get) ([lib/package.json:52](../../lib/package.json#L52)).
- `gsap` (анимация раскрытия списка) ([lib/package.json:51](../../lib/package.json#L51)).

## 3. How it works

- **Lifecycle:** `Component.__hooks()` (auto-init styles через `onServerPrefetch + vueOnMounted`). `onMounted` инициализирует ResizeObserver + auto-focus. `onBeforeUnmount` отключает observer и убирает document keydown listeners.
- **Поток данных:** `dataSelect` (массив) + `keySelect`/`valueSelect` → reactive `dataList` → user query фильтрует через `Intl.Collator(locale, { sensitivity: "base" })` (diacritic + case insensitive) → emit'ы.
- **v-model contract:** стандартный, см. §6.
- **Стили:** `Select.setStyle()` в computed. При `app.use(FishtVue, { unstyled: true })` все стили отключены (см. [Component class](../architecture/component-class.md)).
- **Конфиг:** `componentsOptions.Select` + global `componentsStyle` fallback chain (`props ?? options ?? Select.componentsStyle() ?? "outlined"`) — см. §10.
- **Локализация:** `noData` prop — сообщение, когда массив пуст. Live-region для filtered results count берёт ключи `select.resultsCount` / `select.resultsCountOne` / `select.resultsCountNone` через `Select.t(...)`.
- **SSR:** `isClient()` guard перед DOM-работой [FixWindow](./fix-window.md). Hydration mismatch нет — initial state совпадает.
- **Animation:** Tailwind-переходы обёрнуты в `motion-safe:` префикс (CSS variant `@media (prefers-reduced-motion: no-preference)`). GSAP-анимация раскрытия списка пока не учитывает `prefers-reduced-motion` — см. §18.

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
      <span class="text-gray-500">({{ item.role }})</span>
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

- ARIA-атрибуты `role="combobox"`/`role="listbox"`/`role="option"` — проверь по DOM (см. Known issues).
- Keyboard: ArrowDown/Up для навигации, Enter для выбора, Escape для закрытия.
- Focus management: при открытии — focus на input query, при закрытии — на trigger.
- **Live-region**: hidden `<div data-select-aria-live aria-live="polite" aria-atomic="true">` объявляет количество отфильтрованных результатов при печати в search-поле. Скриноридер озвучивает `Results: N` / `1 result` / `No results` (локализовано через `Select.t("select.resultsCount*")`).
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

## 17. Related

- [InputLayout](./input-layout.md), [Badge](./badge.md), [FixWindow](./fix-window.md), [Icons](./icons.md).
- [Input](./input.md), [Calendar](./calendar.md), [TextEditor](./text-editor.md), [Switch](./switch.md).
- [Form](./form.md), [utilities/rulesHandler.md](../utilities/rulesHandler.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-11) комментариев `TODO/FIXME/HACK/XXX` в [Select.vue](../../lib/select/Select.vue) и [Select.d.ts](../../lib/select/Select.d.ts) не зафиксировано (один inline `// todo need to switch to absolute` в `classGradientSelectList` — будет адресован в follow-up).

### Incomplete or stubbed behavior

- Coverage 79.65% statements / 67.55% branch — несколько ветвей в interaction-логике (keydown nav) не покрыты.
- **Виртуализация dropdown** не реализована — при `dataSelect.length > 500` рендер всех items в DOM ощутимо лагает. Roadmap: Wave 7 (`@tanstack/vue-virtual`) — см. [issues/select.md Issue 7](../issues/select.md).
- **Compound `<Select><SelectOption>` API** отсутствует — только schema-driven. Roadmap: Wave 6.3 — см. [issues/select.md Issue 3](../issues/select.md).

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
- При `noQuery: true` — input для query всё равно рендерится (или нет — проверь поведение в текущей версии).
- **RTL** (`<html dir="rtl">`) не поддерживается на уровне dropdown позиционирования — Wave 8.1.
- **`IDataItem.marker` deprecated** (2026-05-11): передача поля игнорируется + `console.warn`. Используй `#marker` scoped slot.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

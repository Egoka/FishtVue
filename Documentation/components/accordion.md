---
title: Accordion
summary: Аккордеон с multiple раскрытием, кастомными иконками, WAI-ARIA disclosure pattern, keyboard navigation, dual-API (schema + compound <AccordionItem>), RTL и motion-safe.
updated: 2026-06-14
stability: stable
since: 0.2.11
---

# Accordion

## 1. Overview

`Accordion` — раскрывающиеся секции. Поддерживает single или multiple раскрытие, выбор иконки (`ChevronDown`/`ArrowDownCircle`/`Plus` или custom через [Icons](./icons.md)), настраиваемую длительность анимации.

**Dual-API:** секции задаются либо schema-массивом `:data-source`, либо декларативно через compound-дочерний компонент `<AccordionItem>` (`<Accordion><AccordionItem>…</AccordionItem></Accordion>`). При наличии `:data-source` schema выигрывает (backward compat). Реализовано через VNode-walk (zerkalo [Menu](./menu.md)/`Table`), без provide/inject.

Stability: `stable` — 38 кейсов (`Accordion.test.ts`) + 3 (`AccordionItem.test.ts`) = 41, coverage `Accordion.vue` 100% (Security/A11y/Animation/Dual-API/RTL+motion блоки покрыты).

Source: [Source](../../lib/accordion/Accordion.vue), [Accordion.d.ts](../../lib/accordion/Accordion.d.ts), [Accordion.test.ts](../../lib/accordion/Accordion.test.ts).

## 2. How it's organized

```
lib/accordion/
├── Accordion.vue
├── Accordion.d.ts          # ~220 строк
├── Accordion.test.ts       # 38 кейсов (Security / A11y / Animation / Dual-API / RTL+motion покрыты)
├── AccordionItem.vue       # renderless descriptor для compound-API
├── AccordionItem.d.ts
├── AccordionItem.test.ts   # 3 кейса (renderless)
├── index.ts                # runtime barrel (default Accordion + named AccordionItem)
└── package.json
```

Зависимости: `@heroicons/vue/20/solid` (`ChevronDownIcon`, `ArrowDownCircleIcon`), [Icons](./icons.md), [objectHandler.fieldsOmit](../utilities/objectHandler.md).

**Сборка:** `accordion` — compound-entry (`lib/rollup.config.js`: `COMPOUND_ENTRIES` + `addEntry("accordion", "index.ts", "accordion")`); `accordion.mjs` бандлит `Accordion` + renderless `AccordionItem` как named-экспорты.

## 3. How it works

- **Lifecycle:** `Component.__hooks()` инжектит стили (без дублирующего `onMounted` в SFC).
- **Поток данных:** `dataSource: AccordionItem[]` **или** compound `<AccordionItem>`-дети (VNode-walk → `compoundItems`) → `sourceItems` (schema побеждает) → reactive `dataItems` → toggle меняет `open`-флаги → `toggle` event. В compound-режиме open-state сохраняется по индексу при re-render (slots дают свежие объекты).
- **Стили:** через `Accordion.setStyle()` (~8 вызовов в computed).
- **Конфиг:** `componentsOptions.Accordion` — см. §10.
- **Локализация:** не использует (нет статичных текстовых лейблов).
- **SSR:** SSR-safe. Стабильные id для ARIA-связки header↔panel генерируются через `useId()`.
- **Animation:** иконки/панель — `motion-safe:transition…` (под `prefers-reduced-motion: reduce` переходы выключаются); inline `transition-duration` на content (управляется через `animationDuration`). Root обёрнут в `<Transition :css="false">` с JS `@leave` hook, который держит DOM смонтированным `animationDuration` ms — это устраняет flash при unmount во время collapse; при reduced-motion `@leave` размонтирует мгновенно (без таймера).
- **RTL:** логические утилиты — `text-start` (выравнивание заголовка), `ms-8` (отступ иконки). Вертикальная keyboard-навигация (Arrow Up/Down) направление-нейтральна.
- **A11y:** WAI-ARIA disclosure pattern — `<button aria-controls aria-expanded>` ↔ `<div role="region" aria-labelledby>`. Roving tabindex + ArrowUp/Down/Home/End навигация между header'ами.

## 4. Quick Start

```vue
<script setup lang="ts">
import Accordion from "fishtvue/accordion"

const items = [
  { key: "a", title: "Section A", subtitle: "Detail A" },
  { key: "b", title: "Section B", subtitle: "Detail B" }
]
</script>

<template>
  <Accordion :data-source="items" />
</template>
```

## 5. Props

`AccordionProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `dataSource` | `MaybeRef<AccordionItem[]>` | — | Список секций. |
| `multiple` | `boolean` | `false` | Несколько секций открыты одновременно. |
| `animationDuration` | `100 \| 200 \| 300 \| 500 \| 1000 \| 3000 \| number` | — | Длительность (ms). |
| `icon` | `"ChevronDown" \| "ArrowDownCircle" \| "Plus" \| string` | `"ChevronDown"` | Иконка trigger'а. |
| `class`, `classItem`, `classTitle`, `classSubtitle` | `StyleClass` | — | CSS классы. |

`AccordionItem` (schema-тип секции): `{ key: string | number, title: string, subtitle?: string, template?: string, open?: boolean, [key: string]: any }`.

### 5.1 Compound `<AccordionItem>` (descriptor)

Renderless дочерний компонент для compound-API. `AccordionItemProps`:

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `""` | Заголовок секции (в `<button>`). |
| `subtitle` | `string` | — | Plain-text fallback содержимого, когда default slot пуст. |
| `open` | `boolean` | `false` | Initial open-state секции. |

Содержимое секции — **default slot** компонента `<AccordionItem>` (имеет приоритет над `subtitle`). Эмитов нет (`AccordionItemEmits = null`). Импорт: `import { AccordionItem } from "fishtvue/accordion"`.

## 6. Events / Emits + v-model contract

| Event | Payload | When fired |
|---|---|---|
| `toggle` | `AccordionItem[]` | На открытие/закрытие — payload содержит обновлённые items. |

v-model contract — не применимо.

## 7. Slots

| Slot | Slot props | Description |
|---|---|---|
| `title` | `{ title: string }` | Кастомный заголовок секции. |
| `item-subtitle` | `{ ...AccordionItem без template и open }` | Контент subtitle при отсутствии `item.template`. Default fallback — `<p>{{ subtitle }}</p>` (auto-escape). Override для произвольного markup'а; consumer ответственен за санитизацию входных данных. |
| `[template]` | `{ ...AccordionItem без template и open }` | Динамический slot — имя совпадает с `item.template`. Контент секции. |

## 8. Exposed methods

`AccordionExpose`:

| Name | Type | Description |
|---|---|---|
| `dataItems` | `ReadRef<AccordionItem[]>` | Текущее состояние (с `open`-флагами). |
| `multiple`, `animationDuration`, `icon` | derived | Computed. |
| `classBody`, `classItem`, `classTitle`, `classSubtitle` | derived | Computed CSS. |
| `rootRef` | `Ref<HTMLElement \| null>` | Ref на корневой `[data-accordion]` элемент (`null`, пока секций нет — root под `v-if`). |
| `toggle(key)` | `(key: string \| number) => void` | Программный toggle. |
| `focus(index)` | `(index: number) => void` | Программно фокусирует header указанного индекса и обновляет roving tabindex. |

## 9. Examples

### 9.1 Базовый

```vue
<Accordion :data-source="[{ key: 1, title: 'Q1', subtitle: 'A1' }]" />
```

### 9.2 Multiple + custom icon

```vue
<Accordion
  :data-source="items"
  :multiple="true"
  icon="Plus"
  :animation-duration="500" />
```

### 9.3 Custom content через template-slot

```vue
<script setup lang="ts">
const items = [
  { key: 1, title: "Profile", template: "profile" },
  { key: 2, title: "Settings", template: "settings" }
]
</script>

<template>
  <Accordion :data-source="items">
    <template #profile>
      <p>Profile detail content</p>
    </template>
    <template #settings>
      <p>Settings panel</p>
    </template>
  </Accordion>
</template>
```

### 9.4 Compound `<Accordion><AccordionItem>`

```vue
<script setup lang="ts">
import Accordion, { AccordionItem } from "fishtvue/accordion"
</script>

<template>
  <Accordion :multiple="true">
    <AccordionItem title="Profile" :open="true">
      <RichProfileCard />
    </AccordionItem>
    <AccordionItem title="Settings" subtitle="Plain-text fallback без слота" />
  </Accordion>
</template>
```

> При одновременном `:data-source` и `<AccordionItem>`-детях — выигрывает `:data-source` (backward compat).

### 9.5 Программный toggle

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue"
import Accordion from "fishtvue/accordion"

const a = useTemplateRef<InstanceType<typeof Accordion>>("a")
function openSection2() {
  a.value?.toggle("b")
}
</script>

<template>
  <Accordion ref="a" :data-source="items" />
  <button @click="openSection2">Open B</button>
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`AccordionOption = Pick<AccordionProps, "multiple" | "animationDuration" | "icon" | "class" | "classItem" | "classTitle" | "classSubtitle">`.

### 10.2 Per-instance

Через props.

### 10.3 Theming

Цвет фона/border — `theme.semantic.primary` или `neutral.*`. Override через `classItem`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-accordion`.

## 11. Form integration & validation

Не применимо.

## 12. Accessibility & Security

### A11y

WAI-ARIA disclosure pattern реализован полностью:

- Каждый header — `<button :aria-expanded :aria-controls>` со стабильным `id` (через `useId()`).
- Каждый panel — `<div role="region" :aria-labelledby>` ссылается на id header'а.
- **Keyboard:**
  - `Enter`/`Space` на header — toggle (нативное поведение button'а).
  - `ArrowDown` / `ArrowUp` — переход фокуса между header'ами.
  - `Home` / `End` — переход на первый / последний header.
  - Roving tabindex — только header в focus получает `tabindex="0"`, остальные `-1`.
- `aria-hidden="true"` на иконках trigger'а — корректно для декоративного SVG.
- **Motion:** переходы иконок/панели гейтятся через `motion-safe:` — под `prefers-reduced-motion: reduce` анимации выключены, а `<Transition>` `@leave` размонтирует панель мгновенно.
- **RTL:** логические утилиты `text-start` / `ms-8` — корректное зеркалирование в `dir="rtl"`.

### Security

- `item.subtitle` рендерится через interpolation `{{ }}` (auto-escape). XSS-payloads типа `<img src=x onerror=alert(1)>` отображаются как plain text, не исполняются.
- Override через slot `#item-subtitle` — opt-in для произвольного markup'а. Consumer **обязан** санитизировать любой HTML, который попадает в этот слот.
- Динамический `#[template]`-slot — та же модель: HTML внутри рендерится напрямую, ответственность санитизации на consumer'е.

## 13. TypeScript

```ts
import type { AccordionProps, AccordionEmits, AccordionExpose, AccordionItem } from "fishtvue/accordion"
import type { AccordionItemProps, AccordionItemSlots } from "fishtvue/accordion/AccordionItem"
import Accordion, { AccordionItem as AccordionItemComponent } from "fishtvue/accordion"
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 38 + 3 = 41 кейс, coverage 100%.
- **Breaking changes:** не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Accordion from "fishtvue/accordion/Accordion.vue"

describe("Accordion", () => {
  it("toggle event", async () => {
    const wrapper = mount(Accordion, {
      props: { dataSource: [{ key: 1, title: "A" }] },
      global: { plugins: [[FishtVue, {}]] }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
```

Реальные тесты — [Accordion.test.ts](../../lib/accordion/Accordion.test.ts) (38 кейсов) + [AccordionItem.test.ts](../../lib/accordion/AccordionItem.test.ts) (3 кейса).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Multiple открытых секций при `multiple: false` | Initial `open: true` для нескольких items в dataSource. | Один true в initial state. |
| Custom slot не работает | `item.template` имя не совпадает со slot-name. | Совпадай 1:1. |
| Иконка не появляется | `icon` некорректное значение. | Используй `"ChevronDown"`/`"ArrowDownCircle"`/`"Plus"` или имя из [Icons](./icons.md). |
| Анимация дёргается | CSS conflict с другими transitions. | Override `animationDuration`. |
| `toggle()` не работает | `key` не существует в dataSource. | Проверь `dataSource[i].key`. |

## 17. Related

- [Icons](./icons.md), [Dialog](./dialog.md), [Menu](./menu.md), [Alert](./alert.md).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Accordion.vue](../../lib/accordion/Accordion.vue) и [Accordion.d.ts](../../lib/accordion/Accordion.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Branch coverage <100% для редких иконных ветвей внутри `<slot name="title">` fallback'а (`Plus` / `ChevronDown` / `ArrowDownCircle` / `Icons`). Не блокирует stable.

### Skipped tests

Нет.

### API inconsistencies

- `AccordionItem` имеет `[key: string]: any` — открытое расширение полей.
- `animationDuration` open union с numeric — narrow не работает.
- `icon` open union со `string` — narrow не работает.

### Behavioral caveats

- Динамические slot'ы по `template` — имя должно совпадать; ошибки при опечатке тихие.
- При смене `dataSource` (reactive, schema-режим) — open-флаги сбрасываются. В compound-режиме open-state сохраняется по индексу секции при re-render.
- Compound-`<AccordionItem :open>` — `open` это **initial** state; после первого рендера управление переходит к внутреннему состоянию (последующие реактивные изменения prop `open` не пробрасываются). Для управляемого сценария используйте schema-`:data-source`.
- `<Transition>` `@leave` использует `setTimeout(animationDuration)` — реальный CSS transition end не отслеживается (jsdom не эмитит `transitionend`); в браузере анимация и таймер совпадают, расхождения нет.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

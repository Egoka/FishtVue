---
title: Label
summary: Label с пятью режимами (dynamic/static/offset*/vanishing/none) и required-маркером.
updated: 2026-05-09
stability: stable
since: 0.2.11
---

# Label

## 1. Overview

`Label` — текстовая метка для form-controls. Поддерживает пять режимов поведения относительно фокуса связанного `<input>`/`<select>`/`<textarea>`: `dynamic` (плавающий), `offsetDynamic`, `offsetStatic`, `static` (фиксированный), `vanishing`, `none`. Управляется через `peer-focus:` Tailwind-стили — должен находиться рядом с `peer`-элементом.

Stability: `stable`.

Source: [Source](../../lib/label/Label.vue), [Label.d.ts](../../lib/label/Label.d.ts), [Label.test.ts](../../lib/label/Label.test.ts).

## 2. How it's organized

```
lib/label/
├── Label.vue           # SFC, 67 строк
├── Label.d.ts          # LabelProps, LabelSlots=null, LabelEmits=null, LabelExpose, LabelOption
├── Label.test.ts       # 18 кейсов
└── package.json
```

Зависимости: только базовый [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** автоматическая инжекция стилей через `Component.__hooks()`. Дополнительно `onMounted(() => Label.initStyle())` ([Label.vue:57](../../lib/label/Label.vue#L57)) — дубль (см. [dev-patterns §12](../dev-patterns.md#12-known-deviations-from-this-pattern)).
- **Поток данных:** props + `Label.getOptions()` → computed `mode`/`type`/`translateX`/`maxWidth` → `classBase` (через `Label.setStyle`) и `classContent`. Resolve: `props ?? options ?? Label.componentsStyle() ?? "outlined"`.
- **Стили:** transform-классы зависят от `type`. Для `dynamic`: `peer-focus:-translate-y-[60px] peer-focus:translate-x-4 -translate-y-7` ([Label.vue:28](../../lib/label/Label.vue#L28)). Required-маркер `*` через `after:content-['*']` ([Label.vue:35–37](../../lib/label/Label.vue#L35-L37)).
- **Конфиг:** `componentsOptions.Label` ключи — `mode`, `type`, `translateX`, `maxWidth`, `class`, `classBody`.
- **Локализация:** не использует.
- **SSR:** SSR-safe.
- **Animation:** `transition-all duration-200` ([Label.vue:27](../../lib/label/Label.vue#L27)). `prefers-reduced-motion` не учтён.

## 4. Quick Start

```vue
<script setup lang="ts">
import Label from "fishtvue/label"
</script>

<template>
  <div class="relative">
    <input class="peer ..." />
    <Label title="Email" type="dynamic" />
  </div>
</template>
```

`<Label>` должен быть siblings с `peer`-элементом для срабатывания `peer-focus:` стилей.

## 5. Props

`LabelProps` ([Label.d.ts:18–66](../../lib/label/Label.d.ts#L18-L66)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Текст метки. |
| `isRequired` | `boolean` | `undefined` | Показывает `*` справа. |
| `type` | `"offsetDynamic" \| "offsetStatic" \| "dynamic" \| "static" \| "vanishing" \| "none"` | `"dynamic"` | Поведение метки. |
| `mode` | `StyleMode` (`"filled" \| "outlined" \| "underlined"`) | `"outlined"` (или из `Label.componentsStyle()`) | Связь с input-mode. |
| `translateX` | `number` | `0` | Горизонтальный сдвиг (px). |
| `maxWidth` | `number` | `0` | Макс. ширина (px). При значении применяется `max-width: ${maxWidth - 38}px`. |
| `classBody` | `StyleClass` | — | Класс контейнера label. |
| `class` | `StyleClass` | — | Класс текста. |

## 6. Events / Emits + v-model contract

`LabelEmits = null` ([Label.d.ts:70](../../lib/label/Label.d.ts#L70)). v-model contract — не применимо.

## 7. Slots

`LabelSlots = null` ([Label.d.ts:68](../../lib/label/Label.d.ts#L68)). Slot'ов нет — текст передаётся через `title` prop.

## 8. Exposed methods

`LabelExpose` ([Label.d.ts:75–100](../../lib/label/Label.d.ts#L75-L100)):

| Name | Type | Description |
|---|---|---|
| `mode` | `LabelProps["mode"]` | Текущий mode. |
| `type` | `LabelProps["type"]` | Текущий type. |
| `classBase` | `LabelProps["classBody"]` | Финальный класс контейнера. |
| `classContent` | `LabelProps["class"]` | Финальный класс текста. |

```ts
const labelRef = useTemplateRef<InstanceType<typeof Label>>("lbl")
labelRef.value?.type
```

## 9. Examples

### 9.1 Dynamic floating label

```vue
<template>
  <div class="relative">
    <input class="peer focus:outline-none border-b" placeholder=" " />
    <Label title="Email" type="dynamic" :is-required="true" />
  </div>
</template>
```

### 9.2 Static label с глобальной конфигурацией

```ts
app.use(FishtVue, {
  componentsOptions: {
    Label: { type: "static", mode: "filled", maxWidth: 200 }
  }
})
```

### 9.3 Vanishing — скрывается при фокусе

```vue
<Label title="Search..." type="vanishing" />
```

### 9.4 С привязкой к Pinia store

Label не имеет state — статичен. Биндинг к store на стороне родителя:

```vue
<script setup lang="ts">
import { useFormStore } from "@/stores/form"
const store = useFormStore()
</script>

<template>
  <div class="relative">
    <input class="peer" v-model="store.email" />
    <Label :title="store.emailLabel" :is-required="store.isEmailRequired" />
  </div>
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`LabelOption = Pick<LabelProps, "type" | "mode" | "translateX" | "maxWidth" | "class" | "classBody">` ([Label.d.ts:101](../../lib/label/Label.d.ts#L101)).

### 10.2 Per-instance

Любое поле — через props.

### 10.3 Theming

- Цвет текста по умолчанию — `text-gray-400 dark:text-gray-500` ([Label.vue:43](../../lib/label/Label.vue#L43)). Required-маркер — `text-red-500 dark:text-red-800` ([Label.vue:35](../../lib/label/Label.vue#L35)).
- Hard-coded — не подхватывает `theme.semantic.primary`.

### 10.4 CSS layer override

Root класс — `fv fishtvue-label`. Override как обычно (см. [01-getting-started §10.4](../01-getting-started.md#104-css-layer-override)).

## 11. Form integration & validation

Label не валидируется. Используется как декоративная метка — связь с input через `peer`-классы Tailwind, не через `for=`/`<label for=>` (см. Known issues).

Visual `*`-маркер для `required` — чисто косметический, без a11y-связи.

## 12. Accessibility & Security

### A11y

- **Семантика:** Корневой узел — `<div data-label>`, **не `<label>`**. Ассоциации с input через `for`/`id` нет ([Label.vue:60–66](../../lib/label/Label.vue#L60-L66)). Screen-reader не свяжет label с input по нативным правилам.
- **Required-индикатор:** `*` через CSS `after:content-['*']` — не озвучивается screen-reader'ом. Добавь `aria-label`/`aria-describedby` на input самостоятельно.
- **Focus management:** не применимо — Label не focusable.
- **Reduced motion:** анимации не реагируют на `prefers-reduced-motion`.

### Security

- Чистый шаблон, без HTML-рендеринга из props.

## 13. TypeScript

```ts
import type { LabelProps, LabelMode, LabelExpose } from "fishtvue/label"
import Label from "fishtvue/label"
import { useTemplateRef } from "vue"

const lbl = useTemplateRef<InstanceType<typeof Label>>("lbl")
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — 18 кейсов, `Label.vue` coverage 94.44%.
- **Breaking changes:** на 2026-05-09 не зафиксировано.
- **Deprecations:** нет.

## 15. Testing recipes

```ts
import { mount } from "@vue/test-utils"
import { describe, expect, it } from "vitest"
import FishtVue from "fishtvue/config"
import Label from "fishtvue/label/Label.vue"

describe("Label", () => {
  it("renders title", () => {
    const wrapper = mount(Label, { props: { title: "Hello" } })
    expect(wrapper.text()).toContain("Hello")
  })
})
```

Реальные тесты — [Label.test.ts](../../lib/label/Label.test.ts) (18 кейсов).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Label не двигается на focus у соседнего input | input не имеет класса `peer`. | Добавь `class="peer"` на input. |
| `*`-маркер не отображается | `isRequired` не передан или передан `undefined`. | `:is-required="true"`. |
| `maxWidth` не работает на узких контейнерах | `max-width: ${maxWidth - 38}px` — формула вычитает 38. | Учитывай при выборе значения. |
| Screen-reader не озвучивает label | Это `<div>`, не `<label for>`. | Добавь `aria-label`/`aria-describedby` на input. |
| Label перекрывает input в dynamic-режиме | По дефолту labels translate `-y-7` от base. Нужно соответствие input padding. | Используй [InputLayout](./input-layout.md) — он задаёт корректный layout. |

## 17. Related

- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [Switch](./switch.md), [TextEditor](./text-editor.md) — потребители label.
- [InputLayout](./input-layout.md) — оборачивает Label + input + сообщения об ошибках.

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-09) комментариев `TODO/FIXME/HACK/XXX` в [Label.vue](../../lib/label/Label.vue) и [Label.d.ts](../../lib/label/Label.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Дублирующий `onMounted(() => Label.initStyle())` ([Label.vue:57](../../lib/label/Label.vue#L57)) — `Component.__hooks()` уже инициализирует.
- Coverage 94.44% — одна строка ([Label.vue:14](../../lib/label/Label.vue#L14)) не покрыта тестами.

### Skipped tests

Нет.

### API inconsistencies

- Корневой узел — `<div data-label>`, не `<label>`. Это препятствует нативной form-ассоциации. Имя компонента вводит в заблуждение.
- `LabelExpose.classBase` соответствует `LabelProps.classBody` — поля переименованы при exposing, что не очевидно.
- `maxWidth: number` — единица «px» закодирована в шаблоне ([Label.vue:62](../../lib/label/Label.vue#L62)). Для `rem`/`em` — не подходит.

### Behavioral caveats

- `peer-focus:` стили требуют, чтобы Label был sibling после `peer`-элемента в DOM.
- Если input оборачивается в дополнительный контейнер — `peer` теряет связь с label. Используй `peer/group`-класс для именованных peer'ов.
- Required-маркер цвет (`text-red-500`) не зависит от темы — для customisation override через `props.classBody`.

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).

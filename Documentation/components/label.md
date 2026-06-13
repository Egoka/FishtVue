---
title: Label
summary: Label с пятью режимами (dynamic/static/offset*/vanishing/none), required-маркером, нативной for-связкой с input, default-слотом для кастомного контента и prop `animate` (mount-tick gate против «переезда» позиции).
updated: 2026-06-14
stability: stable
since: 0.2.11
---

# Label

## 1. Overview

`Label` — текстовая метка для form-controls. Корневой узел — нативный `<label>`, что позволяет связать метку с input через `for-id` (WCAG 2.1 SC 1.3.1). Поддерживает пять режимов поведения относительно фокуса связанного `<input>`/`<select>`/`<textarea>`: `dynamic` (плавающий), `offsetDynamic`, `offsetStatic`, `static` (фиксированный), `vanishing`, `none`. Управляется через `peer-focus:` Tailwind-стили — должен находиться рядом с `peer`-элементом.

Stability: `stable`.

Source: [Source](../../lib/label/Label.vue), [Label.d.ts](../../lib/label/Label.d.ts), [Label.test.ts](../../lib/label/Label.test.ts).

## 2. How it's organized

```
lib/label/
├── Label.vue           # SFC, 77 строк
├── Label.d.ts          # LabelProps, LabelSlots, LabelEmits=null, LabelExpose, LabelOption
├── Label.test.ts       # audit-driven coverage (a11y, typing, slot, motion-safe, unstyled)
└── package.json
```

Зависимости: только базовый [Component class](../architecture/component-class.md). Внешних — нет.

## 3. How it works

- **Lifecycle:** автоматическая инжекция стилей через `Component.__hooks()` (`onServerPrefetch + vueOnMounted -> initStyle`). SFC не дублирует вызов — см. [dev-patterns §2](../dev-patterns.md) decision row 1.
- **Поток данных:** props + `Label.getOptions()` → computed `mode`/`type`/`translateX`/`maxWidth` → `classBase` (через `Label.setStyle`) и `classContent`. Resolve: `props ?? options ?? Label.componentsStyle() ?? "outlined"`.
- **Стили:** transform-классы зависят от `type`. Для `dynamic`: `peer-focus:-translate-y-[60px] peer-focus:translate-x-4 -translate-y-7` ([Label.vue:37](../../lib/label/Label.vue#L37)). Required-маркер `*` через `after:content-['*']` ([Label.vue:43-45](../../lib/label/Label.vue#L43-L45)).
- **For-id association:** при заданном `forId` корневой `<label>` получает нативный `for="<id>"` ([Label.vue:71](../../lib/label/Label.vue#L71)) — браузер автоматически связывает label и input, click фокусирует input, screen-reader озвучивает связку.
- **Конфиг:** `componentsOptions.Label` ключи — `mode`, `type`, `translateX`, `maxWidth`, `class`, `classBody`.
- **Локализация:** не использует.
- **SSR:** SSR-safe (Component.__hooks регистрирует `onServerPrefetch`).
- **Animation:** `motion-safe:transition-all motion-safe:duration-200` ([Label.vue:36](../../lib/label/Label.vue#L36)) — анимации отключаются при `prefers-reduced-motion: reduce`.

## 4. Quick Start

```vue
<script setup lang="ts">
import Label from "fishtvue/label"
</script>

<template>
  <div class="relative">
    <input id="email-input" class="peer ..." />
    <Label for-id="email-input" title="Email" type="dynamic" />
  </div>
</template>
```

`<Label>` должен быть siblings с `peer`-элементом для срабатывания `peer-focus:` стилей. `for-id` должен совпадать с `id` целевого input для нативной a11y-связки.

## 5. Props

`LabelProps` ([Label.d.ts:19-87](../../lib/label/Label.d.ts#L19-L87)):

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Текст метки (используется как fallback default-слота). |
| `isRequired` | `boolean` | `undefined` | Показывает `*` справа. |
| `type` | `"offsetDynamic" \| "offsetStatic" \| "dynamic" \| "static" \| "vanishing" \| "none"` | `"dynamic"` | Поведение метки. |
| `mode` | `StyleMode` (`"filled" \| "outlined" \| "underlined"`) | `"outlined"` (или из `Label.componentsStyle()`) | Связь с input-mode. |
| `translateX` | `number \| string` | `0` | Горизонтальный сдвиг. `number` → `${n}px`; строка передаётся as-is (`"1rem"`, `"50%"`, `"var(--x)"`). |
| `maxWidth` | `number \| string` | `0` | Макс. ширина. `number` → `${n - 38}px`; строка оборачивается в `calc(<value> - 38px)` (`"100%"`, `"5rem"`, `var()`). |
| `forId` | `string` | — | `id` целевого form-control. Устанавливает нативный `for` атрибут — клик на label фокусирует input, screen-reader озвучивает связку (WCAG 2.1 SC 1.3.1). |
| `classBody` | `StyleClass` | — | Класс контейнера label. |
| `class` | `StyleClass` | — | Класс текста. |
| `animate` | `boolean` | `true` | Включает CSS-transition позиционирования метки. `InputLayout` передаёт сюда mount-tick (`isTick`): `false` на первом кадре — floating-label сразу рисуется в нужной позиции без «переезда» из исходной точки, `true` после mount — переход при focus / изменении value анимируется. |

## 6. Events / Emits + v-model contract

`LabelEmits = null` ([Label.d.ts:91](../../lib/label/Label.d.ts#L91)). v-model contract — не применимо.

## 7. Slots

`LabelSlots` ([Label.d.ts:83-89](../../lib/label/Label.d.ts#L83-L89)):

| Slot | Bindings | Description |
|---|---|---|
| `default` | — | Контент метки. Если не передан — используется `title` prop. Полезно для вставки `<strong>`, иконок, или другой inline-разметки. |

```vue
<Label for-id="email-input" title="Email"><strong>Email</strong> *</Label>
```

## 8. Exposed methods

`LabelExpose` ([Label.d.ts:96-121](../../lib/label/Label.d.ts#L96-L121)):

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

### 9.1 Dynamic floating label с for-связкой

```vue
<template>
  <div class="relative">
    <input id="email" class="peer focus:outline-none border-b" placeholder=" " />
    <Label for-id="email" title="Email" type="dynamic" :is-required="true" />
  </div>
</template>
```

Click на label фокусирует input, screen-reader озвучивает «Email, edit text».

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

### 9.4 Custom-разметка через default-слот

```vue
<Label for-id="amount">
  <Icons type="CurrencyDollar" /> <strong>Сумма</strong>
</Label>
```

### 9.5 Responsive maxWidth с CSS unit

```vue
<Label for-id="comment" title="Комментарий" max-width="100%" translate-x="1rem" />
```

`max-width` рендерится как `calc(100% - 38px)`, `--fv-translate-x: 1rem` — масштабируется с font-size.

### 9.6 С привязкой к Pinia store

Label не имеет state — статичен. Биндинг к store на стороне родителя:

```vue
<script setup lang="ts">
import { useFormStore } from "@/stores/form"
const store = useFormStore()
</script>

<template>
  <div class="relative">
    <input id="email" class="peer" v-model="store.email" />
    <Label for-id="email" :title="store.emailLabel" :is-required="store.isEmailRequired" />
  </div>
</template>
```

## 10. Configuration & Customization

### 10.1 Global

`LabelOption = Pick<LabelProps, "type" | "mode" | "translateX" | "maxWidth" | "class" | "classBody">` ([Label.d.ts:122](../../lib/label/Label.d.ts#L122)).

### 10.2 Per-instance

Любое поле — через props.

### 10.3 Theming

- Цвет текста по умолчанию — `text-gray-400 dark:text-gray-500` ([Label.vue:52](../../lib/label/Label.vue#L52)). Required-маркер — `text-red-500 dark:text-red-800` ([Label.vue:44](../../lib/label/Label.vue#L44)).
- Hard-coded — не подхватывает `theme.semantic.primary`. CSS custom properties для px-смещений — Wave 3.3 (Theme runtime API, см. [issues/label.md Issue 5](../issues/label.md)).

### 10.4 CSS layer override

Root класс — `fv fishtvue-label`. Override как обычно (см. [01-getting-started §10.4](../01-getting-started.md#104-css-layer-override)).

### 10.5 `unstyled: true`

Глобальный `app.use(FishtVue, { unstyled: true })` — `Label.setStyle()` возвращает пустую строку, классы Tailwind не применяются. Inline `:style` (translate / max-width) остаются для геометрии — Label остаётся функциональным `<label for>`.

## 11. Form integration & validation

Label не валидируется. Связь с input — нативная через `for-id` (если задан) + визуальная через `peer`-классы Tailwind.

Visual `*`-маркер для `required` — чисто косметический, без a11y-связки; на input самостоятельно ставь `aria-required="true"` (или используй InputLayout, который это делает).

## 12. Accessibility & Security

### A11y

- **Семантика:** Корневой узел — нативный `<label data-label>` ([Label.vue:71](../../lib/label/Label.vue#L71)). При заданном `for-id` атрибут `for` устанавливается и работает нативная браузерная связка: click на label фокусирует input, screen-reader озвучивает «{title}, edit text» при focus на input.
- **Required-индикатор:** `*` через CSS `after:content-['*']` — не озвучивается screen-reader'ом. Добавь `aria-required="true"` на input самостоятельно или используй InputLayout-обёртку.
- **Focus management:** не применимо — сам Label не focusable.
- **Reduced motion:** анимации помечены `motion-safe:` ([Label.vue:36](../../lib/label/Label.vue#L36)) — отключаются при `prefers-reduced-motion: reduce`.

### Security

- Чистый шаблон, без `v-html` / innerHTML. Default-slot контент рендерится Vue compiler-safe.

## 13. TypeScript

```ts
import type { LabelProps, LabelMode, LabelSlots, LabelExpose } from "fishtvue/label"
import Label from "fishtvue/label"
import { useTemplateRef } from "vue"

const lbl = useTemplateRef<InstanceType<typeof Label>>("lbl")
```

## 14. Compatibility & Stability

- **Vue:** `^3.5.x`.
- **Stability flag:** `stable` — audit-driven coverage (a11y, typing, slot, motion-safe, unstyled, mode/type variants).
- **Breaking changes:** на 2026-05-11 не зафиксировано. Type `translateX`/`maxWidth` расширен с `number` до `number | string` — backwards-compatible.
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

  it("emits native for-attribute when forId is provided", () => {
    const wrapper = mount(Label, { props: { forId: "x", title: "X" } })
    expect(wrapper.find("label").attributes("for")).toBe("x")
  })
})
```

Реальные тесты — [Label.test.ts](../../lib/label/Label.test.ts) (a11y, typing, slot, motion-safe, unstyled, mode/type variants).

## 16. Troubleshooting / FAQ

| Проблема | Причина | Решение |
|---|---|---|
| Label не двигается на focus у соседнего input | input не имеет класса `peer`. | Добавь `class="peer"` на input. |
| `*`-маркер не отображается | `isRequired` не передан или передан `undefined`. | `:is-required="true"`. |
| Click на label не фокусирует input | `for-id` не задан или не совпадает с `id` input. | Передай `<Label :for-id="inputId">` с совпадающим `id` на input. |
| `maxWidth` не работает в percentage | Передан `number` — формула `n - 38px`. | Передавай строку: `max-width="100%"` → `calc(100% - 38px)`. |
| Label перекрывает input в dynamic-режиме | По дефолту labels translate `-y-7` от base. Нужно соответствие input padding. | Используй [InputLayout](./input-layout.md) — он задаёт корректный layout. |

## 17. Related

- [Input](./input.md), [Select](./select.md), [Calendar](./calendar.md), [Switch](./switch.md), [TextEditor](./text-editor.md) — потребители label.
- [InputLayout](./input-layout.md) — оборачивает Label + input + сообщения об ошибках. Auto-passthrough `for-id` от input в Label — Wave 3.x (см. [issues/inputlayout.md](../issues/inputlayout.md)).

## 18. Known issues & limitations

### TODO / FIXME / HACK / XXX

На момент ревизии (2026-05-11) комментариев `TODO/FIXME/HACK/XXX` в [Label.vue](../../lib/label/Label.vue) и [Label.d.ts](../../lib/label/Label.d.ts) не зафиксировано.

### Incomplete or stubbed behavior

- Cross-cutting packaging (`sideEffects`, `exports` map) — Wave 2.1, см. [issues/label.md Issue 3](../issues/label.md).
- CSS custom properties для px-смещений (`60px`/`48px`/`28px` хардкодны в Tailwind arbitrary values) — Wave 3.3 (Theme runtime API), см. [issues/label.md Issue 5](../issues/label.md).
- RTL — `translate-x-4` / `after:ml-0.5` ([Label.vue:44](../../lib/label/Label.vue#L44)) буквальны; logical properties — отдельная RTL-волна, см. [issues/label.md Issue 9](../issues/label.md).

### Skipped tests

Нет.

### API inconsistencies

- `LabelExpose.classBase` соответствует `LabelProps.classBody` — поля переименованы при exposing.

### Behavioral caveats

- `peer-focus:` стили требуют, чтобы Label был sibling после `peer`-элемента в DOM.
- Если input оборачивается в дополнительный контейнер — `peer` теряет связь с label. Используй `peer/group`-класс для именованных peer'ов.
- Required-маркер цвет (`text-red-500`) не зависит от темы — для customisation override через `props.classBody`.
- `for-id` указывает на `id` целевого input — на стороне потребителя нужно гарантировать уникальность id (например, через `useId()` Vue 3.5+).

### Bug report format

См. [01-getting-started §18](../01-getting-started.md#18-known-issues--limitations).
